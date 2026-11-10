import json
import asyncio
import logging
import random
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from ..config import settings
from ..schemas.study import (
    SummaryResponse,
    ExplainResponse,
    QuizResponse,
    QuizQuestionItem,
    DefinitionItem,
    ChatMessageItem
)
from .prompt_service import (
    build_chat_prompt,
    SUMMARY_SYSTEM_PROMPT,
    EXPLAIN_SYSTEM_PROMPT,
    QUIZ_SYSTEM_PROMPT
)

logger = logging.getLogger("gemini_service")


class GeminiService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if not settings.is_gemini_configured():
            raise HTTPException(
                status_code=503,
                detail="Gemini API key is not configured. Please add your GEMINI_API_KEY to backend/.env."
            )

        model_name = settings.get_model_name()
        if not model_name or not model_name.startswith("gemini-"):
            raise HTTPException(
                status_code=503,
                detail="Gemini model is not configured correctly. Set GEMINI_MODEL to a valid Gemini model such as gemini-2.5-flash."
            )

        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI client: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Could not initialize Google GenAI SDK: {str(e)}"
                )
        return self._client

    def _should_retry(self, exc: Exception) -> bool:
        message = str(exc).lower()
        retryable_markers = [
            "429", "rate limit", "temporarily unavailable", "timeout",
            "timed out", "service unavailable", "internal error", "500",
            "503", "network", "connection", "unavailable"
        ]
        return any(marker in message for marker in retryable_markers)

    async def _generate_with_retry(self, *, model: str, contents, config=None, retries: int = 3):
        client = self._get_client()
        last_error = None

        for attempt in range(retries):
            try:
                if config is not None:
                    response = await asyncio.to_thread(
                        client.models.generate_content,
                        model=model,
                        contents=contents,
                        config=config,
                    )
                else:
                    response = await asyncio.to_thread(
                        client.models.generate_content,
                        model=model,
                        contents=contents,
                    )
                return response
            except Exception as exc:
                last_error = exc
                logger.warning("Gemini request failed on attempt %s/%s: %s", attempt + 1, retries, exc)
                if not self._should_retry(exc) or attempt == retries - 1:
                    break
                delay = (2 ** attempt) + random.uniform(0.5, 1.5)
                await asyncio.sleep(delay)

        if last_error is not None:
            message = str(last_error)
            lowered = message.lower()
            if "api key" in lowered or "authentication" in lowered or "permission" in lowered or "forbidden" in lowered:
                raise HTTPException(status_code=401, detail="Gemini API key is invalid or unauthorized for this project.")
            if "not found" in lowered or "model" in lowered:
                raise HTTPException(
                    status_code=400,
                    detail=f"Gemini model '{model}' is unavailable for this account. Update GEMINI_MODEL to a supported model such as gemini-2.5-flash."
                )
            if "429" in lowered or "rate limit" in lowered:
                raise HTTPException(status_code=429, detail="Gemini API rate limit reached. Please wait a moment and retry.")
            if "timeout" in lowered or "timed out" in lowered:
                raise HTTPException(status_code=504, detail="Gemini request timed out while processing the study material.")
            if "503" in lowered or "service unavailable" in lowered or "temporarily unavailable" in lowered:
                raise HTTPException(status_code=503, detail="Gemini service is temporarily unavailable. Please retry in a moment.")
            raise HTTPException(status_code=502, detail=f"Gemini AI processing failed: {message}")

        raise HTTPException(status_code=502, detail="Gemini AI processing failed without a specific error response.")

    def _prepare_multimodal_part(self, material: dict):
        """Prepare multimodal content part for Google GenAI SDK."""
        from google.genai import types
        file_path = Path(material["saved_path"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Material file not found on disk.")

        mime_type = material.get("mime_type", "application/octet-stream")

        try:
            with open(file_path, "rb") as f:
                file_bytes = f.read()

            if not file_bytes:
                raise HTTPException(status_code=400, detail="Uploaded material is empty and cannot be processed.")

            return types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error loading file bytes for material {material.get('material_id')}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process study material file for AI: {str(e)}"
            )

    def _clean_json_text(self, text: str) -> str:
        """Strip markdown ticks if AI wraps JSON in ```json ... ```."""
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    async def chat(self, material: dict, question: str, history: Optional[List[ChatMessageItem]] = None) -> str:
        part = self._prepare_multimodal_part(material)
        prompt = build_chat_prompt(question, history)

        try:
            response = await self._generate_with_retry(
                model=settings.get_model_name(),
                contents=[part, prompt],
            )
            if not getattr(response, "text", None):
                raise HTTPException(status_code=502, detail="Received empty response from Gemini API.")
            return response.text
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Gemini API chat error: {e}")
            raise HTTPException(
                status_code=502,
                detail=f"Gemini AI processing error: {str(e)}"
            )

    async def generate_summary(self, material: dict, focus_area: Optional[str] = None) -> SummaryResponse:
        part = self._prepare_multimodal_part(material)
        from google.genai import types

        prompt = SUMMARY_SYSTEM_PROMPT
        if focus_area:
            prompt += f"\n\nSpecial Student Focus Area: Pay extra attention to: {focus_area}"

        try:
            response = await self._generate_with_retry(
                model=settings.get_model_name(),
                contents=[part, prompt],
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )

            raw_text = self._clean_json_text(response.text or "{}")
            data = json.loads(raw_text)

            defs = []
            for d in data.get("important_definitions", []):
                if isinstance(d, dict) and "term" in d and "definition" in d:
                    defs.append(DefinitionItem(term=str(d["term"]), definition=str(d["definition"])))
                elif isinstance(d, str) and ":" in d:
                    parts = d.split(":", 1)
                    defs.append(DefinitionItem(term=parts[0].strip(), definition=parts[1].strip()))

            return SummaryResponse(
                material_id=material["material_id"],
                main_topic=data.get("main_topic", material.get("original_name", "Study Topic")),
                important_concepts=data.get("important_concepts", []),
                key_points=data.get("key_points", []),
                important_definitions=defs,
                examples=data.get("examples", []),
                short_revision_notes=data.get("short_revision_notes", "Review key terms and core concepts before the exam."),
                raw_markdown=response.text
            )
        except HTTPException:
            raise
        except json.JSONDecodeError as jde:
            logger.error("Gemini returned malformed summary JSON: %s", jde)
            raise HTTPException(status_code=502, detail="Gemini returned an invalid summary format. Please retry.")
        except Exception as e:
            logger.error(f"Gemini API summary error: {e}")
            raise HTTPException(
                status_code=502,
                detail=f"Gemini AI summary generation error: {str(e)}"
            )

    async def explain_topic(self, material: dict, topic: Optional[str] = None) -> ExplainResponse:
        part = self._prepare_multimodal_part(material)
        from google.genai import types

        prompt = EXPLAIN_SYSTEM_PROMPT
        if topic:
            prompt += f"\n\nStudent requested explanation specifically for the topic: '{topic}'"
        else:
            prompt += "\n\nExplain the primary core topic covered in this material."

        try:
            response = await self._generate_with_retry(
                model=settings.get_model_name(),
                contents=[part, prompt],
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )

            raw_text = self._clean_json_text(response.text or "{}")
            data = json.loads(raw_text)

            return ExplainResponse(
                material_id=material["material_id"],
                topic=data.get("topic", topic or material.get("original_name", "Study Concept")),
                simple_explanation=data.get("simple_explanation", ""),
                step_by_step_breakdown=data.get("step_by_step_breakdown", []),
                practical_example=data.get("practical_example", ""),
                key_takeaways=data.get("key_takeaways", [])
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Gemini API explain error: {e}")
            raise HTTPException(
                status_code=502,
                detail=f"Gemini AI explanation error: {str(e)}"
            )

    async def generate_quiz(self, material: dict, difficulty: str = "medium") -> QuizResponse:
        part = self._prepare_multimodal_part(material)
        from google.genai import types

        prompt = QUIZ_SYSTEM_PROMPT + f"\nDifficulty Level: {difficulty}."

        try:
            response = await self._generate_with_retry(
                model=settings.get_model_name(),
                contents=[part, prompt],
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )

            raw_text = self._clean_json_text(response.text or "{}")
            data = json.loads(raw_text)

            raw_questions = data.get("questions", [])
            validated_questions: List[QuizQuestionItem] = []

            for idx, q in enumerate(raw_questions[:5]):
                options = q.get("options", [])
                if not isinstance(options, list) or len(options) != 4 or not all(isinstance(x, str) and x.strip() for x in options):
                    raise HTTPException(status_code=502, detail=f"Gemini returned invalid options for quiz question {idx + 1}.")

                correct = q.get("correct_answer", options[0])
                if correct not in options:
                    matched = False
                    for opt in options:
                        if correct.strip().startswith(opt[:2]):
                            correct = opt
                            matched = True
                            break
                    if not matched:
                        raise HTTPException(status_code=502, detail=f"Gemini returned an invalid correct answer for quiz question {idx + 1}.")

                validated_questions.append(QuizQuestionItem(
                    id=idx + 1,
                    question=q.get("question", f"Question {idx+1}"),
                    options=options,
                    correct_answer=correct,
                    explanation=q.get("explanation", "Correct based on the material.")
                ))

            if len(validated_questions) != 5:
                raise HTTPException(status_code=502, detail="Gemini did not return exactly five quiz questions. Please retry.")

            return QuizResponse(
                material_id=material["material_id"],
                topic=data.get("topic", material.get("original_name", "Study Quiz")),
                questions=validated_questions[:5]
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Gemini API quiz generation error: {e}")
            raise HTTPException(
                status_code=502,
                detail=f"Gemini AI quiz generation error: {str(e)}"
            )


gemini_service = GeminiService()


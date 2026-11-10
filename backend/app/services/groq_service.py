
import asyncio
import json
import logging
from pathlib import Path
from typing import Optional, List

from fastapi import HTTPException
from groq import Groq

from ..config import settings
from ..schemas.study import (
    SummaryResponse,
    ExplainResponse,
    QuizResponse,
    QuizQuestionItem,
    DefinitionItem,
    ChatMessageItem,
)
from .prompt_service import (
    build_chat_prompt,
    SUMMARY_SYSTEM_PROMPT,
    EXPLAIN_SYSTEM_PROMPT,
    QUIZ_SYSTEM_PROMPT,
)

logger = logging.getLogger("groq_service")

class GroqService:

    def __init__(self):
        self._client = None

    def _get_client(self):
        if not settings.is_groq_ready():
            raise HTTPException(
                status_code=503,
                detail="Groq API is not configured. Check GROQ_API_KEY in backend/.env."
            )

        if self._client is None:
            try:
                self._client = Groq(
                    api_key=settings.GROQ_API_KEY,
                    timeout=90.0,
                    max_retries=2,
                )
            except Exception as exc:
                logger.exception("Could not initialize Groq client")
                raise HTTPException(
                    status_code=500,
                    detail="Could not initialize Groq API client."
                ) from exc

        return self._client

    def _clean_json(self, text: str) -> str:
        text = text.strip()

        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]

        if text.endswith("```"):
            text = text[:-3]

        return text.strip()

    def _extract_material_text(self, material: dict) -> str:
        """
        Extract readable text from PDF, image or audio.
        """

        file_path = Path(material["saved_path"])

        if not file_path.is_file():
            raise HTTPException(
                status_code=404,
                detail="Uploaded study material was not found."
            )

        file_type = material.get("file_type")

        try:
            if file_type == "pdf":
                return self._extract_pdf(file_path)

            if file_type == "image":
                return self._extract_image(file_path)

            if file_type == "audio":
                return self._transcribe_audio(file_path)

            raise HTTPException(
                status_code=400,
                detail="Unsupported study material type."
            )

        except HTTPException:
            raise
        except Exception as exc:
            logger.exception("Material extraction failed")
            raise HTTPException(
                status_code=422,
                detail=f"Could not extract content from the uploaded file: {str(exc)}"
            ) from exc

    def _extract_pdf(self, file_path: Path) -> str:
        import fitz

        extracted_pages = []

        with fitz.open(file_path) as document:
            for page_number, page in enumerate(document):
                text = page.get_text("text").strip()

                # OCR scanned PDF pages when normal extraction is empty.
                if not text:
                    try:
                        import pytesseract
                        from PIL import Image

                        pytesseract.pytesseract.tesseract_cmd = (
                            settings.TESSERACT_CMD
                        )

                        pix = page.get_pixmap(
                            matrix=fitz.Matrix(2, 2),
                            alpha=False
                        )

                        image = Image.frombytes(
                            "RGB",
                            [pix.width, pix.height],
                            pix.samples
                        )

                        text = pytesseract.image_to_string(image).strip()

                    except Exception as exc:
                        logger.warning(
                            "OCR failed on PDF page %s: %s",
                            page_number + 1,
                            exc
                        )

                if text:
                    extracted_pages.append(text)

        result = "\n\n".join(extracted_pages).strip()

        if not result:
            raise HTTPException(
                status_code=422,
                detail="No readable text was found in this PDF."
            )

        return result[:30000]

    def _extract_image(self, file_path: Path) -> str:
        import pytesseract
        from PIL import Image

        pytesseract.pytesseract.tesseract_cmd = (
            settings.TESSERACT_CMD
        )

        with Image.open(file_path) as image:
            image = image.convert("RGB")
            text = pytesseract.image_to_string(image).strip()

        if not text:
            raise HTTPException(
                status_code=422,
                detail="No readable text was detected in this image."
            )

        return text[:30000]

    def _transcribe_audio(self, file_path: Path) -> str:
        client = self._get_client()

        with open(file_path, "rb") as audio_file:
            result = client.audio.transcriptions.create(
                file=(file_path.name, audio_file.read()),
                model=settings.GROQ_AUDIO_MODEL,
                response_format="text",
            )

        if isinstance(result, str):
            text = result.strip()
        else:
            text = getattr(result, "text", "").strip()

        if not text:
            raise HTTPException(
                status_code=422,
                detail="No speech could be transcribed from this audio."
            )

        return text[:30000]

    def _generate_text(self, prompt: str) -> str:
        client = self._get_client()

        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=4096,
            )

            text = response.choices[0].message.content

            if not text or not text.strip():
                raise ValueError("Groq returned an empty response.")

            return text.strip()

        except Exception as exc:
            logger.exception("Groq text generation failed")

            message = str(exc).lower()

            if "401" in message or "authentication" in message:
                raise HTTPException(
                    status_code=401,
                    detail="Groq API key is invalid or unauthorized."
                ) from exc

            if "429" in message or "rate limit" in message:
                raise HTTPException(
                    status_code=429,
                    detail="Groq rate limit reached. Please try again later."
                ) from exc

            if "timeout" in message:
                raise HTTPException(
                    status_code=504,
                    detail="Groq request timed out. Please retry."
                ) from exc

            raise HTTPException(
                status_code=502,
                detail=f"Groq AI request failed: {str(exc)}"
            ) from exc

    async def _generate(self, prompt: str) -> str:
        return await asyncio.to_thread(
            self._generate_text,
            prompt
        )

    async def chat(
        self,
        material: dict,
        question: str,
        history: Optional[List[ChatMessageItem]] = None
    ) -> str:

        material_text = await asyncio.to_thread(
            self._extract_material_text,
            material
        )

        prompt = build_chat_prompt(question, history)

        full_prompt = f"""
{prompt}

UPLOADED STUDY MATERIAL:
-----------------------
{material_text}
-----------------------

Answer using the uploaded study material.
If the answer is not covered, clearly say so.
"""

        return await self._generate(full_prompt)

    async def generate_summary(
        self,
        material: dict,
        focus_area: Optional[str] = None
    ) -> SummaryResponse:

        material_text = await asyncio.to_thread(
            self._extract_material_text,
            material
        )

        prompt = SUMMARY_SYSTEM_PROMPT

        if focus_area:
            prompt += f"\nPay special attention to: {focus_area}"

        prompt += f"""

STUDY MATERIAL:
{material_text}

Return only the JSON object.
"""

        raw = await self._generate(prompt)

        try:
            data = json.loads(self._clean_json(raw))

            definitions = []

            for item in data.get("important_definitions", []):
                if isinstance(item, dict):
                    definitions.append(
                        DefinitionItem(
                            term=str(item.get("term", "")),
                            definition=str(item.get("definition", ""))
                        )
                    )

            return SummaryResponse(
                material_id=material["material_id"],
                main_topic=data.get(
                    "main_topic",
                    material.get("original_name", "Study Topic")
                ),
                important_concepts=data.get("important_concepts", []),
                key_points=data.get("key_points", []),
                important_definitions=definitions,
                examples=data.get("examples", []),
                short_revision_notes=data.get(
                    "short_revision_notes",
                    "Review the key concepts before your exam."
                ),
                raw_markdown=raw
            )

        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            logger.exception("Invalid summary JSON from Groq")
            raise HTTPException(
                status_code=502,
                detail="Groq returned an invalid summary format. Please retry."
            ) from exc

    async def explain_topic(
        self,
        material: dict,
        topic: Optional[str] = None
    ) -> ExplainResponse:

        material_text = await asyncio.to_thread(
            self._extract_material_text,
            material
        )

        prompt = EXPLAIN_SYSTEM_PROMPT

        if topic:
            prompt += f"\nExplain this specific topic: {topic}"

        prompt += f"""

STUDY MATERIAL:
{material_text}

Return only the JSON object.
"""

        raw = await self._generate(prompt)

        try:
            data = json.loads(self._clean_json(raw))

            return ExplainResponse(
                material_id=material["material_id"],
                topic=data.get(
                    "topic",
                    topic or material.get("original_name", "Study Concept")
                ),
                simple_explanation=data.get("simple_explanation", ""),
                step_by_step_breakdown=data.get(
                    "step_by_step_breakdown", []
                ),
                practical_example=data.get("practical_example", ""),
                key_takeaways=data.get("key_takeaways", [])
            )

        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            logger.exception("Invalid explanation JSON from Groq")
            raise HTTPException(
                status_code=502,
                detail="Groq returned an invalid explanation format."
            ) from exc

    async def generate_quiz(
        self,
        material: dict,
        difficulty: str = "medium"
    ) -> QuizResponse:

        material_text = await asyncio.to_thread(
            self._extract_material_text,
            material
        )

        prompt = f"""
{QUIZ_SYSTEM_PROMPT}

Difficulty: {difficulty}

STUDY MATERIAL:
{material_text}

Return only the JSON object.
"""

        raw = await self._generate(prompt)

        try:
            data = json.loads(self._clean_json(raw))

            questions = []

            for index, question in enumerate(
                data.get("questions", [])[:5]
            ):
                options = question.get("options", [])

                if (
                    not isinstance(options, list)
                    or len(options) != 4
                    or not all(
                        isinstance(option, str) and option.strip()
                        for option in options
                    )
                ):
                    raise ValueError(
                        f"Invalid options in question {index + 1}"
                    )

                correct = question.get("correct_answer", "")

                if correct not in options:
                    raise ValueError(
                        f"Invalid correct answer in question {index + 1}"
                    )

                questions.append(
                    QuizQuestionItem(
                        id=index + 1,
                        question=question.get("question", ""),
                        options=options,
                        correct_answer=correct,
                        explanation=question.get(
                            "explanation",
                            "Correct answer based on the study material."
                        )
                    )
                )

            if len(questions) != 5:
                raise ValueError("Exactly five questions are required.")

            return QuizResponse(
                material_id=material["material_id"],
                topic=data.get(
                    "topic",
                    material.get("original_name", "Study Quiz")
                ),
                questions=questions
            )

        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            logger.exception("Invalid quiz JSON from Groq")
            raise HTTPException(
                status_code=502,
                detail="Groq returned an invalid quiz. Please retry."
            ) from exc

groq_service = GroqService()

from typing import List, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "ok"
    groq_configured: bool
    groq_ready: bool = False
    model: str
    max_upload_mb: int
    version: str = "1.0.0"

class MaterialItem(BaseModel):
    material_id: str
    filename: str
    original_name: str
    file_type: str
    mime_type: str
    size_bytes: int
    size_formatted: str
    created_at: str
    processing_status: str = "ready"
    file_url: Optional[str] = None
    extracted_text_preview: Optional[str] = None

class ChatMessageItem(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    material_id: str = Field(min_length=1)
    question: str = Field(min_length=1, max_length=5000)
    history: List[ChatMessageItem] = Field(default_factory=list)

class ChatResponse(BaseModel):
    material_id: str
    answer: str
    model: str

class SummaryRequest(BaseModel):
    material_id: str = Field(min_length=1)
    focus_area: Optional[str] = None

class DefinitionItem(BaseModel):
    term: str
    definition: str

class SummaryResponse(BaseModel):
    material_id: str
    main_topic: str
    important_concepts: List[str] = Field(default_factory=list)
    key_points: List[str] = Field(default_factory=list)
    important_definitions: List[DefinitionItem] = Field(default_factory=list)
    examples: List[str] = Field(default_factory=list)
    short_revision_notes: str
    raw_markdown: Optional[str] = None

class ExplainRequest(BaseModel):
    material_id: str = Field(min_length=1)
    topic: Optional[str] = None

class ExplainResponse(BaseModel):
    material_id: str = Field(min_length=1)
    topic: str
    simple_explanation: str
    step_by_step_breakdown: List[str] = Field(default_factory=list)
    practical_example: str
    key_takeaways: List[str] = Field(default_factory=list)

class QuizRequest(BaseModel):
    material_id: str = Field(min_length=1)
    difficulty: Optional[str] = "medium"

class QuizQuestionItem(BaseModel):
    id: int
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_answer: str
    explanation: str

class QuizResponse(BaseModel):
    material_id: str = Field(min_length=1)
    topic: str
    questions: List[QuizQuestionItem] = Field(
        ...,
        min_length=5,
        max_length=5
    )
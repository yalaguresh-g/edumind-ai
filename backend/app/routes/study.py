
from pathlib import Path
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from ..schemas.study import (
    MaterialItem,
    ChatRequest,
    ChatResponse,
    SummaryRequest,
    SummaryResponse,
    ExplainRequest,
    ExplainResponse,
    QuizRequest,
    QuizResponse,
)
from ..services.file_service import FileService
from ..services.groq_service import groq_service
from ..config import settings

router = APIRouter(prefix="/api/study", tags=["study"])

@router.post("/upload", response_model=MaterialItem)
async def upload_material(file: UploadFile = File(...)):
    """Upload PDF, image or audio study material."""
    return await FileService.save_uploaded_file(file)

@router.get("/materials", response_model=List[MaterialItem])
async def list_materials():
    return FileService.list_materials()

@router.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    success = FileService.delete_material(material_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Material not found."
        )

    return {
        "message": "Material removed successfully",
        "material_id": material_id
    }

@router.get("/files/{material_id}/content")
async def get_material_content(material_id: str):
    material = FileService.get_material(material_id)

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found."
        )

    file_path = Path(material["saved_path"])

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found on disk."
        )

    return FileResponse(
        path=file_path,
        media_type=material.get(
            "mime_type",
            "application/octet-stream"
        ),
        filename=material.get("original_name")
    )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_material(request: ChatRequest):
    material = FileService.get_material(request.material_id)

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Selected study material not found."
        )

    answer = await groq_service.chat(
        material=material,
        question=request.question,
        history=request.history
    )

    return ChatResponse(
        material_id=request.material_id,
        answer=answer,
        model=settings.GROQ_MODEL
    )

@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    material = FileService.get_material(request.material_id)

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Selected study material not found."
        )

    return await groq_service.generate_summary(
        material=material,
        focus_area=request.focus_area
    )

@router.post("/explain", response_model=ExplainResponse)
async def explain_topic(request: ExplainRequest):
    material = FileService.get_material(request.material_id)

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Selected study material not found."
        )

    return await groq_service.explain_topic(
        material=material,
        topic=request.topic
    )

@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    material = FileService.get_material(request.material_id)

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Selected study material not found."
        )

    return await groq_service.generate_quiz(
        material=material,
        difficulty=request.difficulty or "medium"
    )
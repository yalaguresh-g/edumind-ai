
from fastapi import APIRouter

from ..config import settings
from ..schemas.study import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health", response_model=HealthResponse)
async def check_health():
    return HealthResponse(
        status="ok",
        groq_configured=settings.is_groq_configured(),
        groq_ready=settings.is_groq_ready(),
        model=settings.GROQ_MODEL,
        max_upload_mb=settings.MAX_UPLOAD_MB,
        version=settings.VERSION,
    )
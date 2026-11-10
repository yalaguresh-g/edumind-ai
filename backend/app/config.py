import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env", override=True)
load_dotenv(BASE_DIR.parent / ".env")

class Settings:
    PROJECT_NAME = "EduMind AI Lite"
    VERSION = "1.0.0"

    # Groq configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL = os.getenv(
        "GROQ_MODEL",
        "openai/gpt-oss-120b"
    ).strip()

    GROQ_AUDIO_MODEL = os.getenv(
        "GROQ_AUDIO_MODEL",
        "whisper-large-v3-turbo"
    ).strip()

    # OCR configuration
    TESSERACT_CMD = os.getenv(
        "TESSERACT_CMD",
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

    # CORS
    FRONTEND_ORIGIN = os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173"
    ).strip()

    # Upload configuration
    MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "20"))
    MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

    UPLOAD_DIR = BASE_DIR / "uploads"
    DATABASE_PATH = BASE_DIR / "materials.db"

    @classmethod
    def is_groq_configured(cls):
        return bool(
            cls.GROQ_API_KEY
            and not cls.GROQ_API_KEY.startswith("your_groq_api_key")
        )

    @classmethod
    def is_groq_ready(cls):
        return (
            cls.is_groq_configured()
            and bool(cls.GROQ_MODEL)
        )


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
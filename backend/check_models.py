import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.config import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)
try:
    print("Listing available models for API key:")
    for model in client.models.list():
        if "gemini" in model.name.lower():
            print(f"  {model.name} (methods: {model.supported_actions if hasattr(model, 'supported_actions') else 'N/A'})")
except Exception as e:
    print("Error listing models:", e)


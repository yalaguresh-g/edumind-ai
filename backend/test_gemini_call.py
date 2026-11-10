import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.config import settings
from google import genai

client = genai.Client(api_key=settings.GEMINI_API_KEY)
models_to_test = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"]

for m in models_to_test:
    print(f"\nTesting model: {m}...", flush=True)
    try:
        response = client.models.generate_content(
            model=m,
            contents="Say 'OK' if you can hear me."
        )
        print(f"SUCCESS with {m}! Response: {response.text.strip()}", flush=True)
        break
    except Exception as e:
        print(f"Failed with {m}: {e}", flush=True)

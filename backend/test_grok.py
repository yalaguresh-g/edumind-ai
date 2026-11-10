
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI, APIStatusError

# Find .env in backend or project root
backend_env = Path(__file__).resolve().parent / ".env"
root_env = Path(__file__).resolve().parent.parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env, override=True)
elif root_env.exists():
    load_dotenv(root_env, override=True)

api_key = os.getenv("XAI_API_KEY")

if not api_key:
    print("ERROR: XAI_API_KEY not found.")
    print("Check your .env file location.")
    raise SystemExit(1)

print("API key loaded successfully.")
print("Testing connection to xAI...")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.x.ai/v1",
    timeout=60
)

try:
    response = client.responses.create(
        model="grok-4.7",
        input="Explain TCP three-way handshake in simple language."
    )

    print("\nSUCCESS! Grok API is working.")
    print(response.output_text)

except APIStatusError as e:
    print("\nAPI ERROR")
    print("Status code:", e.status_code)
    print("Error details:", e.response.text)

except Exception as e:
    print("\nCONNECTION ERROR")
    print(type(e).__name__, str(e))

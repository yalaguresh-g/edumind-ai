
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

# Load the .env file located in the backend directory
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH, override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# Initialize the client only when an API call is needed
_client = None


def get_client():
    global _client

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Check your backend/.env file."
        )

    if _client is None:
        _client = Groq(
            api_key=GROQ_API_KEY,
            timeout=60.0,
            max_retries=2
        )

    return _client


def generate_response(prompt: str) -> str:
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    try:
        client = get_client()

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.5,
            max_tokens=2048
        )

        result = response.choices[0].message.content

        if not result or not result.strip():
            raise ValueError("Groq returned an empty response.")

        return result.strip()

    except Exception as error:
        print(f"Groq API error: {type(error).__name__}: {error}")
        raise

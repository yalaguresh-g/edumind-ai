"""Comprehensive API Test Suite for EduMind AI Lite Backend.
Tests:
- /api/health
- /api/study/upload (PDF, Image, Audio)
- File validation (empty, oversized, unsupported format)
- /api/study/materials list
- /api/study/files/{id}/content serving
- /api/study/materials/{id} deletion
- Setup state handling when GEMINI_API_KEY is missing
"""

import io
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_health():
    print("Testing GET /api/health...")
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "ok"
    assert "gemini_configured" in data
    assert "model" in data
    assert "max_upload_mb" in data
    print(f"  [PASS] Health check ok! Gemini configured: {data['gemini_configured']}, Model: {data['model']}")


def test_file_validation_errors():
    print("Testing File Validation...")

    # 1. Empty file
    empty_file = io.BytesIO(b"")
    res = client.post(
        "/api/study/upload",
        files={"file": ("empty.pdf", empty_file, "application/pdf")}
    )

    assert res.status_code == 400, (
        f"Expected 400 for empty file, got {res.status_code}"
    )
    print("  [PASS] Empty file correctly rejected (400)")

    # 2. Unsupported format
    unsupported_file = io.BytesIO(b"dummy binary")
    res = client.post(
        "/api/study/upload",
        files={"file": ("malware.exe", unsupported_file,
                        "application/x-msdownload")}
    )

    assert res.status_code == 400, (
        f"Expected 400 for unsupported format, got {res.status_code}"
    )
    print("  [PASS] Unsupported format correctly rejected (400)")

    # 3. Oversized file
    original_bytes = settings.MAX_UPLOAD_BYTES

    try:
        settings.MAX_UPLOAD_BYTES = 500

        oversized_file = io.BytesIO(b"A" * 1000)

        res = client.post(
            "/api/study/upload",
            files={"file": ("large.pdf", oversized_file, "application/pdf")}
        )

        # HTTP 413 is the correct response for oversized uploads.
        assert res.status_code == 413, (
            f"Expected 413 for oversized file, got {res.status_code}"
        )

        print("  [PASS] Oversized file correctly rejected (413)")

    finally:
        settings.MAX_UPLOAD_BYTES = original_bytes


def test_multimodal_uploads():
    print("Testing Multimodal Uploads (PDF, Image, Audio)...")

    # 1. Upload dummy PDF
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Title (Biology Lecture 101) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
    res_pdf = client.post(
        "/api/study/upload",
        files={"file": ("Biology_Notes.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    )
    assert res_pdf.status_code == 200, f"Expected 200 for PDF upload, got {res_pdf.status_code}"
    pdf_data = res_pdf.json()
    assert pdf_data["file_type"] == "pdf"
    pdf_id = pdf_data["material_id"]
    print(f"  [PASS] PDF upload success: ID={pdf_id}, name={pdf_data['original_name']}")

    # 2. Upload dummy Image
    img_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    res_img = client.post(
        "/api/study/upload",
        files={"file": ("Cell_Diagram.png", io.BytesIO(img_bytes), "image/png")}
    )
    assert res_img.status_code == 200, f"Expected 200 for Image upload, got {res_img.status_code}"
    img_data = res_img.json()
    assert img_data["file_type"] == "image"
    img_id = img_data["material_id"]
    print(f"  [PASS] Image upload success: ID={img_id}, name={img_data['original_name']}")

    # 3. Upload dummy Audio
    audio_bytes = b"ID3\x03\x00\x00\x00\x00\x00\x00" + b"\x00" * 200
    res_audio = client.post(
        "/api/study/upload",
        files={"file": ("Lecture_Recording.mp3", io.BytesIO(audio_bytes), "audio/mp3")}
    )
    assert res_audio.status_code == 200, f"Expected 200 for Audio upload, got {res_audio.status_code}"
    audio_data = res_audio.json()
    assert audio_data["file_type"] == "audio"
    audio_id = audio_data["material_id"]
    print(f"  [PASS] Audio upload success: ID={audio_id}, name={audio_data['original_name']}")

    # 4. List Materials
    res_list = client.get("/api/study/materials")
    assert res_list.status_code == 200
    mats = res_list.json()
    assert len(mats) >= 3
    print(f"  [PASS] Materials listed successfully: count={len(mats)}")

    # 5. Serve File Content
    res_content = client.get(f"/api/study/files/{img_id}/content")
    assert res_content.status_code == 200
    assert res_content.headers["content-type"].startswith("image/png")
    print("  [PASS] File content streaming endpoint works!")

    # 6. Delete Material
    res_del = client.delete(f"/api/study/materials/{pdf_id}")
    assert res_del.status_code == 200
    print(f"  [PASS] Material deleted successfully: {pdf_id}")

    return img_id

def test_missing_api_key_handling(material_id: str):
    print("Testing Missing / Unconfigured API Key Graceful Response...")
    # When API key is not set or placeholder, verify it returns 503 with clear message instead of crashing
    if not settings.is_gemini_configured():
        res = client.post("/api/study/chat", json={
            "material_id": material_id,
            "question": "What is this material about?"
        })
        assert res.status_code == 503, f"Expected 503 when API key missing, got {res.status_code}"
        assert "Gemini API key is not configured" in res.json()["detail"]
        print("  [PASS] Missing API key cleanly handled with informative HTTP 503!")

if __name__ == "__main__":
    print("=== Starting EduMind AI Lite Backend Test Suite ===")
    test_health()
    test_file_validation_errors()
    img_id = test_multimodal_uploads()
    test_missing_api_key_handling(img_id)
    print("=== All Backend Core Tests Passed Successfully! ===")


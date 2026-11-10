"""Persistent material metadata and safe local file storage."""
import os
import sqlite3
import uuid
import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException
from ..config import settings
from ..schemas.study import MaterialItem

DB_PATH = settings.DATABASE_PATH
ALLOWED_EXTENSIONS = {
    "pdf": [".pdf"],
    "image": [".png", ".jpg", ".jpeg", ".webp"],
    "audio": [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".aac", ".flac"],
}
MIME_TYPE_MAPPING = {
    ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg",
    ".wav": "audio/wav", ".m4a": "audio/mp4", ".ogg": "audio/ogg",
    ".webm": "audio/webm", ".aac": "audio/aac", ".flac": "audio/flac",
}


def _connect():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def format_size(size: int) -> str:
    if size < 1024: return f"{size} B"
    if size < 1024 * 1024: return f"{size / 1024:.1f} KB"
    return f"{size / (1024 * 1024):.1f} MB"


def detect_file_type(filename: str, content_type: Optional[str]) -> str:
    ext = Path(filename).suffix.lower()
    for kind, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions: return kind
    if content_type:
        if content_type == "application/pdf": return "pdf"
        if content_type.startswith("image/"): return "image"
        if content_type.startswith("audio/"): return "audio"
    raise HTTPException(status_code=400, detail="Unsupported file format. Upload a PDF, PNG/JPG/WEBP image, or supported audio file.")


def _to_item(row) -> MaterialItem:
    return MaterialItem(
        material_id=row["material_id"], filename=row["stored_filename"],
        original_name=row["original_name"], file_type=row["file_type"],
        mime_type=row["mime_type"], size_bytes=row["size_bytes"],
        size_formatted=format_size(row["size_bytes"]), created_at=row["created_at"],
        processing_status=row["processing_status"],
        file_url=f"/api/study/files/{row['material_id']}/content",
        extracted_text_preview=row["extracted_text_preview"],
    )


class FileService:
    @staticmethod
    def initialize():
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        with _connect() as conn:
            conn.execute("""CREATE TABLE IF NOT EXISTS materials (
                material_id TEXT PRIMARY KEY, original_name TEXT NOT NULL,
                stored_filename TEXT NOT NULL UNIQUE, file_type TEXT NOT NULL,
                mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL,
                created_at TEXT NOT NULL, processing_status TEXT NOT NULL,
                extracted_text_preview TEXT, storage_path TEXT NOT NULL
            )""")
            # One-time safe migration: preserve UUID-named files already present on disk.
            known = {r[0] for r in conn.execute("SELECT material_id FROM materials")}
            for path in settings.UPLOAD_DIR.iterdir():
                if not path.is_file() or path.name.startswith("."): continue
                try: uuid.UUID(path.stem)
                except ValueError: continue
                if path.stem in known: continue
                ext = path.suffix.lower()
                try: kind = detect_file_type(path.name, None)
                except HTTPException: continue
                stat = path.stat()
                conn.execute("""INSERT OR IGNORE INTO materials
                    (material_id, original_name, stored_filename, file_type, mime_type,
                     size_bytes, created_at, processing_status, extracted_text_preview, storage_path)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'ready', NULL, ?)""",
                    (path.stem, path.name, path.name, kind, MIME_TYPE_MAPPING.get(ext, "application/octet-stream"),
                     stat.st_size, datetime.datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"), str(path.resolve())))

    @staticmethod
    async def save_uploaded_file(file: UploadFile) -> MaterialItem:
        if not file.filename: raise HTTPException(status_code=400, detail="Uploaded file must have a filename.")
        original_name = Path(file.filename).name
        ext = Path(original_name).suffix.lower()
        kind = detect_file_type(original_name, file.content_type)
        content = await file.read(settings.MAX_UPLOAD_BYTES + 1)
        if not content: raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        if len(content) > settings.MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail=f"File exceeds the {settings.MAX_UPLOAD_MB} MB upload limit.")
        material_id = str(uuid.uuid4())
        stored_filename = f"{material_id}{ext}"
        path = (settings.UPLOAD_DIR / stored_filename).resolve()
        try:
            path.write_bytes(content)
            preview = None
            if kind == "pdf":
                try:
                    import fitz
                    with fitz.open(path) as doc:
                        preview = "\n".join(page.get_text() for page in list(doc)[:3]).strip()[:400] or None
                except Exception:
                    preview = None
            created = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
            with _connect() as conn:
                conn.execute("""INSERT INTO materials VALUES (?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)""",
                    (material_id, original_name, stored_filename, kind,
                     MIME_TYPE_MAPPING.get(ext, file.content_type or "application/octet-stream"),
                     len(content), created, preview, str(path)))
            return FileService.get_material_item(material_id)
        except Exception:
            path.unlink(missing_ok=True)
            raise

    @staticmethod
    def get_material(material_id: str) -> Optional[dict]:
        with _connect() as conn:
            row = conn.execute("SELECT * FROM materials WHERE material_id = ?", (material_id,)).fetchone()
        if row is None: return None
        record = dict(row)
        record["saved_path"] = record.pop("storage_path")
        record["filename"] = record["stored_filename"]
        record["size_formatted"] = format_size(record["size_bytes"])
        record["file_url"] = f"/api/study/files/{material_id}/content"
        path = Path(record["saved_path"])
        if not path.is_file():
            raise HTTPException(status_code=500, detail=f"Material record exists but its stored file is missing: {record['stored_filename']}")
        return record

    @staticmethod
    def get_material_item(material_id: str) -> Optional[MaterialItem]:
        with _connect() as conn:
            row = conn.execute("SELECT * FROM materials WHERE material_id = ?", (material_id,)).fetchone()
        return _to_item(row) if row else None

    @staticmethod
    def list_materials() -> List[MaterialItem]:
        with _connect() as conn:
            rows = conn.execute("SELECT * FROM materials ORDER BY created_at DESC, rowid DESC").fetchall()
        return [_to_item(row) for row in rows]

    @staticmethod
    def delete_material(material_id: str) -> bool:
        with _connect() as conn:
            row = conn.execute("SELECT storage_path FROM materials WHERE material_id = ?", (material_id,)).fetchone()
            if row is None: return False
            conn.execute("DELETE FROM materials WHERE material_id = ?", (material_id,))
        Path(row["storage_path"]).unlink(missing_ok=True)
        return True


FileService.initialize()

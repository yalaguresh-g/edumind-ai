# EduMind AI Lite – Repair and Test Report

Date: 2026-11-01

## Confirmed issue

The original `FileService` kept material metadata in a process-local `_materials_store` dictionary. Uploaded bytes were written to disk, but the metadata needed to resolve a `material_id` disappeared when the FastAPI process restarted and was not shared between worker processes.

## Implemented repairs

- Replaced the in-memory metadata dictionary with SQLite at `backend/materials.db`.
- Added a startup migration that registers existing UUID-named files in `backend/uploads/` without changing their UUIDs.
- Centralized material lookup, listing, content serving, and deletion through the same SQLite-backed service.
- Missing metadata returns 404; an existing record with a missing physical file returns 500 rather than being misreported as a missing material.
- Added safe basename handling, unique IDs, upload size checks, and persistent file metadata.
- Kept the existing study API paths and response models.
- Added request constraints and removed fabricated fallback quiz questions / summary results when Gemini returns malformed data.
- Moved synchronous Gemini SDK generation calls to a worker thread.
- Repaired CORS to use the configured local origins rather than wildcard origins with credentials.
- Added light/dark theme persistence, OS preference fallback, an early theme bootstrap, and a responsive navigation drawer.
- Changed fixed-width layout behavior to prevent the main content from expanding beneath the fixed sidebar.
- Replaced many hard-coded light surfaces with semantic CSS variables.
- Sanitized `backend/.env.example`; the real `backend/.env` is excluded from the delivery archive.

## Backend verification

**15/15 checks passed** using FastAPI `TestClient`: health, legacy material migration, legacy file content, PDF upload, UUID response, listing, content retrieval, persistence after service reinitialization, 404 handling for chat/summary/explain/quiz with unknown IDs, unsupported extension rejection, deletion, and post-delete 404.

The legacy ID `e0e7b978-faea-4c5a-8714-57f6de4fb6ce` was found in the migrated SQLite index and its file content endpoint returned HTTP 200.

## Not tested / blocked in this environment

- **Gemini live requests: NOT TESTED.** The project environment has a configured key, but the `google.genai` Python package is not installed in this execution environment. The Gemini methods were checked against the official Google Gen AI SDK documentation; `client.models.generate_content` and `types.Part.from_bytes` are documented interfaces. Install backend requirements and run with a newly rotated key to verify live chat, summary, explanation, and quiz generation.
- **Frontend production build: NOT TESTED.** The uploaded `node_modules` tree contains the Windows Rollup optional binary but not the Linux binary required by this execution environment. Installing the missing npm optional dependency timed out, so a Vite build could not be completed here.
- **Browser E2E and visual responsive checks: NOT TESTED.** No browser automation runtime was available. CSS breakpoints and layout rules were updated, but widths 1920, 1440, 1024, 768, and 375 were not visually exercised.

## Start commands (Windows PowerShell)

Backend (PowerShell window 1):

```powershell
cd .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env   # only if backend/.env does not already exist
# Set GEMINI_API_KEY and GEMINI_MODEL in backend/.env
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend (PowerShell window 2):

```powershell
cd .\frontend
npm install
npm run dev
```

Open `http://localhost:5173`; Swagger is at `http://127.0.0.1:8000/docs`.

## Security action required

A Gemini API credential was present in the uploaded environment files, including the example file. Treat that credential as exposed: revoke it in Google AI Studio and create a new key. Never share or commit `backend/.env`; only the placeholder `.env.example` is included in the repaired archive.

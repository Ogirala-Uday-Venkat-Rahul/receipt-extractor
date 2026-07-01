"""FastAPI service around the fine-tuned receipt extractor.

`POST /extract` takes raw receipt text and returns the parsed, schema-validated
JSON plus a flag for whether the model's output was valid on the first try. The
root path serves a single-page UI that calls the same endpoint.
"""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.model import MODEL_FILE, MODEL_PATH, MODEL_REPO, extract
from src.schema import parse_receipt

logger = logging.getLogger("uvicorn.error")
_STATIC = Path(__file__).parent / "static"

app = FastAPI(title="Receipt Extractor", description="Fine-tuned Qwen2.5-7B -> structured JSON")


class ExtractRequest(BaseModel):
    text: str


class ExtractResponse(BaseModel):
    valid: bool
    receipt: dict | None
    raw: str


@app.get("/health", include_in_schema=False)
def health() -> dict:
    available = Path(MODEL_PATH).exists() or bool(MODEL_REPO)
    source = MODEL_PATH if Path(MODEL_PATH).exists() else (f"{MODEL_REPO}/{MODEL_FILE}" if MODEL_REPO else None)
    return {"status": "ok", "model": source, "available": available}


@app.get("/", include_in_schema=False)
def root() -> FileResponse:
    return FileResponse(_STATIC / "index.html")


@app.post("/extract", response_model=ExtractResponse)
def extract_receipt(req: ExtractRequest) -> ExtractResponse:
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        raw = extract(req.text)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    # Validate the model's output against the schema. Reporting validity is honest
    # about what the fine-tune buys you: it should produce parseable JSON nearly
    # every time, which the base model does not.
    try:
        receipt = parse_receipt(raw)
        return ExtractResponse(valid=True, receipt=receipt.model_dump(mode="json"), raw=raw)
    except Exception:
        return ExtractResponse(valid=False, receipt=None, raw=raw)

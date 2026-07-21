"""
Taniva AI Service — FastAPI Application

Vision service for tomato quality detection using YOLOv8.
Exposes POST /predict endpoint matching ARCHITECTURE.md §8.

Run:
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"""

import uuid
from contextlib import asynccontextmanager
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import (
    CLAHE_ENABLED,
    MAX_UPLOAD_MB,
    RESULTS_DIR,
)
from app.detector.tomato import TomatoDetector
from app.preprocessing.clahe import apply_clahe

# ─── Globals ──────────────────────────────────────────────

detector = TomatoDetector()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIMETYPES = {"image/jpeg", "image/png", "image/webp"}


# ─── Lifespan ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ensure results directory exists on startup."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[taniva-vision] Results dir: {RESULTS_DIR}")
    print(f"[taniva-vision] CLAHE: {'enabled' if CLAHE_ENABLED else 'disabled'}")

    # Try to warm up the model
    try:
        detector._load_model()
        print("[taniva-vision] YOLOv8 model loaded successfully")
    except FileNotFoundError as e:
        print(f"[taniva-vision] WARNING: {e}")
        print("[taniva-vision] Service will start but /predict will fail until model is provided")

    yield


# ─── App ──────────────────────────────────────────────────

app = FastAPI(
    title="Taniva Vision Service",
    description="YOLOv8 tomato quality detection API for Taniva — BYTESFEST 2026",
    version="0.1.0",
    lifespan=lifespan,
)

# Serve annotated images as static files
app.mount("/results", StaticFiles(directory=str(RESULTS_DIR)), name="results")


# ─── Endpoints ────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check for the vision service."""
    model_loaded = detector._model is not None
    return {
        "status": "ok",
        "service": "taniva-vision",
        "model_loaded": model_loaded,
    }


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    """
    Analyze a tomato image for quality grading.

    Accepts: multipart/form-data with `image` field.
    Returns: quality score, label, detection counts, and annotated image URL.

    Response contract matches ARCHITECTURE.md §8.
    """

    # ─── Validate file ────────────────────────────────

    if image.content_type not in ALLOWED_MIMETYPES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_FILE_TYPE",
                "message": f"Accepted types: {', '.join(ALLOWED_MIMETYPES)}",
            },
        )

    contents = await image.read()

    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(
            status_code=413,
            detail={
                "error": "FILE_TOO_LARGE",
                "message": f"Max upload size is {MAX_UPLOAD_MB}MB, got {size_mb:.1f}MB",
            },
        )

    # ─── Decode image ─────────────────────────────────

    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_IMAGE",
                "message": "Could not decode the uploaded image.",
            },
        )

    # ─── Preprocess (CLAHE) ───────────────────────────

    processed = apply_clahe(img) if CLAHE_ENABLED else img

    # ─── Inference ────────────────────────────────────

    try:
        result = detector.predict(processed)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "MODEL_NOT_LOADED",
                "message": str(e),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INFERENCE_FAILED",
                "message": f"Inference error: {str(e)}",
            },
        )

    # ─── Handle no detection ──────────────────────────

    if not result.get("success"):
        return JSONResponse(status_code=422, content=result)

    # ─── Annotate and save ────────────────────────────

    annotated_img = detector.annotate(img, result["detections"])

    result_filename = f"result-{uuid.uuid4().hex[:12]}.jpg"
    result_path = RESULTS_DIR / result_filename

    cv2.imwrite(str(result_path), annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 90])

    result["annotatedImageUrl"] = f"/results/{result_filename}"

    return result

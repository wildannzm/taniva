"""
Taniva AI Service — Configuration

Loads settings from environment variables with sensible defaults.
"""

import os
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"

# ─── Model ────────────────────────────────────────────────

YOLO_MODEL_PATH = os.getenv(
    "YOLO_MODEL_PATH",
    str(MODELS_DIR / "best.pt"),
)

YOLO_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.25"))
YOLO_IOU_THRESHOLD = float(os.getenv("YOLO_IOU_THRESHOLD", "0.45"))

# Class names expected from the trained YOLOv8 model
CLASS_FRESH = "fresh"
CLASS_ROTTEN = "rotten"
VALID_CLASSES = {CLASS_FRESH, CLASS_ROTTEN}

# ─── Quality Labels ──────────────────────────────────────

QUALITY_THRESHOLDS = {
    "fresh": (80, 100),
    "mixed": (50, 79),
    "rotten": (0, 49),
}

# ─── Preprocessing ───────────────────────────────────────

CLAHE_ENABLED = os.getenv("CLAHE_ENABLED", "true").lower() == "true"
CLAHE_CLIP_LIMIT = float(os.getenv("CLAHE_CLIP_LIMIT", "2.0"))
CLAHE_TILE_GRID_SIZE = int(os.getenv("CLAHE_TILE_GRID_SIZE", "8"))

# ─── Server ──────────────────────────────────────────────

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "8"))

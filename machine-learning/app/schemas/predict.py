"""
Taniva AI Service — Pydantic Schemas

Response models matching the ARCHITECTURE.md §8 contract.
"""

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    class_name: str = Field(alias="class")
    confidence: float
    bbox: BoundingBox

    class Config:
        populate_by_name = True


class PredictResponse(BaseModel):
    """Successful prediction response — ARCHITECTURE.md §8."""

    success: bool = True
    qualityScore: int = Field(ge=0, le=100)
    qualityLabel: str = Field(pattern="^(segar|campuran|busuk)$")
    freshCount: int = Field(ge=0)
    rottenCount: int = Field(ge=0)
    totalDetected: int = Field(ge=1)
    annotatedImageUrl: str
    inferenceTimeMs: int = Field(ge=0)
    detections: list[Detection] = []


class ErrorResponse(BaseModel):
    """Error response when no tomatoes detected."""

    success: bool = False
    error: str
    message: str
    freshCount: int = 0
    rottenCount: int = 0
    totalDetected: int = 0
    inferenceTimeMs: int = Field(ge=0)
    detections: list = []


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "taniva-vision"
    model_loaded: bool

"""
Taniva AI Service — YOLOv8 Tomato Detector

Wraps Ultralytics YOLOv8 model for fresh/rotten tomato detection.
Returns structured detection results matching the ARCHITECTURE.md contract.
"""

import time
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

from app.config import (
    CLASS_FRESH,
    CLASS_ROTTEN,
    QUALITY_THRESHOLDS,
    VALID_CLASSES,
    YOLO_CONFIDENCE,
    YOLO_IOU_THRESHOLD,
    YOLO_MODEL_PATH,
)


class TomatoDetector:
    """
    Singleton-ish YOLOv8 detector for tomato quality classification.

    Loads the model once, reuses across requests.
    """

    def __init__(self, model_path: str | None = None):
        self._model_path = model_path or YOLO_MODEL_PATH
        self._model: YOLO | None = None

    def _load_model(self) -> YOLO:
        """Lazy-load the YOLO model on first inference call."""
        if self._model is None:
            path = Path(self._model_path)
            if not path.exists():
                raise FileNotFoundError(
                    f"YOLOv8 model not found at {path}. "
                    f"Place your trained best.pt in the models/ directory."
                )
            self._model = YOLO(str(path))
        return self._model

    def predict(
        self,
        image: np.ndarray,
        confidence: float | None = None,
        iou_threshold: float | None = None,
    ) -> dict:
        """
        Run YOLOv8 inference on a BGR image.

        Parameters
        ----------
        image : np.ndarray
            BGR image (preprocessed or raw).
        confidence : float, optional
            Override default confidence threshold.
        iou_threshold : float, optional
            Override default IoU threshold.

        Returns
        -------
        dict
            Detection result matching ARCHITECTURE.md response contract:
            {
                "success": bool,
                "qualityScore": int,
                "qualityLabel": str,
                "freshCount": int,
                "rottenCount": int,
                "totalDetected": int,
                "inferenceTimeMs": int,
                "detections": list[dict],
            }
        """
        model = self._load_model()
        conf = confidence or YOLO_CONFIDENCE
        iou = iou_threshold or YOLO_IOU_THRESHOLD

        start_time = time.perf_counter()

        results = model.predict(
            source=image,
            conf=conf,
            iou=iou,
            verbose=False,
        )

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)

        # ─── Parse detections ─────────────────────────────

        fresh_count = 0
        rotten_count = 0
        detections = []

        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes

            if boxes is not None:
                for i in range(len(boxes)):
                    cls_id = int(boxes.cls[i].item())
                    cls_name = model.names.get(cls_id, "unknown")
                    conf_score = float(boxes.conf[i].item())

                    # Skip unexpected classes
                    if cls_name not in VALID_CLASSES:
                        continue

                    xyxy = boxes.xyxy[i].cpu().numpy().tolist()

                    if cls_name == CLASS_FRESH:
                        fresh_count += 1
                    elif cls_name == CLASS_ROTTEN:
                        rotten_count += 1

                    detections.append({
                        "class": cls_name,
                        "confidence": round(conf_score, 4),
                        "bbox": {
                            "x1": round(xyxy[0], 1),
                            "y1": round(xyxy[1], 1),
                            "x2": round(xyxy[2], 1),
                            "y2": round(xyxy[3], 1),
                        },
                    })

        total_detected = fresh_count + rotten_count

        # ─── Quality score ────────────────────────────────

        if total_detected == 0:
            return {
                "success": False,
                "error": "NO_TOMATO_DETECTED",
                "message": "Tidak ada tomat yang terdeteksi pada gambar.",
                "freshCount": 0,
                "rottenCount": 0,
                "totalDetected": 0,
                "inferenceTimeMs": elapsed_ms,
                "detections": [],
            }

        quality_score = round((fresh_count / total_detected) * 100)
        quality_label = self._score_to_label(quality_score)

        return {
            "success": True,
            "qualityScore": quality_score,
            "qualityLabel": quality_label,
            "freshCount": fresh_count,
            "rottenCount": rotten_count,
            "totalDetected": total_detected,
            "inferenceTimeMs": elapsed_ms,
            "detections": detections,
        }

    def annotate(self, image: np.ndarray, detections: list[dict]) -> np.ndarray:
        """
        Draw bounding boxes and labels on the image.

        Parameters
        ----------
        image : np.ndarray
            Original BGR image.
        detections : list[dict]
            Detection list from predict().

        Returns
        -------
        np.ndarray
            Annotated BGR image.
        """
        annotated = image.copy()

        colors = {
            CLASS_FRESH: (0, 200, 0),    # green
            CLASS_ROTTEN: (0, 0, 200),   # red
        }

        for det in detections:
            bbox = det["bbox"]
            cls_name = det["class"]
            conf = det["confidence"]

            x1, y1 = int(bbox["x1"]), int(bbox["y1"])
            x2, y2 = int(bbox["x2"]), int(bbox["y2"])

            color = colors.get(cls_name, (200, 200, 200))
            label = f"{cls_name} {conf:.2f}"

            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

            # Label background
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(annotated, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
            cv2.putText(
                annotated, label, (x1 + 2, y1 - 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1,
            )

        return annotated

    @staticmethod
    def _score_to_label(score: int) -> str:
        """Map quality score (0-100) to quality label."""
        for label, (low, high) in QUALITY_THRESHOLDS.items():
            if low <= score <= high:
                return label
        return "busuk"

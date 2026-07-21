"""
Taniva AI Service — CLAHE Preprocessing

Applies Contrast Limited Adaptive Histogram Equalization to improve
tomato visibility under varying lighting conditions.
"""

import cv2
import numpy as np

from app.config import CLAHE_CLIP_LIMIT, CLAHE_TILE_GRID_SIZE


def apply_clahe(image: np.ndarray) -> np.ndarray:
    """
    Apply CLAHE to the L-channel of a LAB-converted image.

    Parameters
    ----------
    image : np.ndarray
        BGR image (as read by OpenCV).

    Returns
    -------
    np.ndarray
        BGR image with enhanced contrast.
    """
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=CLAHE_CLIP_LIMIT,
        tileGridSize=(CLAHE_TILE_GRID_SIZE, CLAHE_TILE_GRID_SIZE),
    )
    l_enhanced = clahe.apply(l_channel)

    merged = cv2.merge([l_enhanced, a_channel, b_channel])
    result = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    return result

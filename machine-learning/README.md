# Taniva Vision Service — Machine Learning

**FastAPI + YOLOv8** service untuk deteksi kualitas tomat (fresh/rotten) pada proyek Taniva — BYTESFEST 2026.

Service ini terpisah dari aplikasi utama SvelteKit dan dikelola oleh **AI/ML Engineer**.

> ⚠️ Service ini **tidak mengakses database Taniva** secara langsung. Komunikasi dilakukan melalui HTTP API yang dipanggil oleh SvelteKit backend.

---

## Arsitektur

```text
SvelteKit Backend
       │
       ▼ POST /predict (multipart image)
┌──────────────────────────────┐
│   Taniva Vision Service      │
│   FastAPI + YOLOv8           │
│                              │
│   1. Validasi file           │
│   2. CLAHE preprocessing     │
│   3. YOLOv8 inference        │
│   4. Hitung qualityScore     │
│   5. Annotate bounding box   │
│   6. Return JSON response    │
└──────────────────────────────┘
```

---

## Stack

| Layer         | Teknologi            |
| ------------- | -------------------- |
| Framework     | FastAPI              |
| ML Model      | YOLOv8 (Ultralytics) |
| Preprocessing | OpenCV (CLAHE)       |
| Language      | Python ≥ 3.10        |
| Server        | Uvicorn              |

---

## Instalasi

```bash
# 1. Masuk ke folder machine-learning
cd machine-learning

# 2. Buat virtual environment
python -m venv venv

# 3. Aktifkan virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Buat file environment
cp .env.example .env

# 6. Letakkan model YOLOv8
#    Salin file best.pt hasil training ke folder models/
#    models/best.pt

# 7. Jalankan server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Endpoint

### `GET /health`

Health check.

```json
{
  "status": "ok",
  "service": "taniva-vision",
  "model_loaded": true
}
```

### `POST /predict`

Analisis kualitas tomat dari gambar.

**Request:** `multipart/form-data` dengan field `image`.

**Response (sukses):**

```json
{
  "success": true,
  "qualityScore": 92,
  "qualityLabel": "fresh",
  "freshCount": 18,
  "rottenCount": 2,
  "totalDetected": 20,
  "annotatedImageUrl": "/results/result-abc123.jpg",
  "inferenceTimeMs": 1250,
  "detections": [
    {
      "class": "fresh",
      "confidence": 0.9512,
      "bbox": { "x1": 100.0, "y1": 50.0, "x2": 300.0, "y2": 250.0 }
    }
  ]
}
```

**Response (tidak ada tomat):** `422`

```json
{
  "success": false,
  "error": "NO_TOMATO_DETECTED",
  "message": "No tomatoes were detected in the image."
}
```

---

## Quality Score Formula

```text
qualityScore = round((freshCount / totalDetected) × 100)

Label:
  80–100 = fresh
  50–79  = mixed
  0–49   = rotten
```

---

## Struktur Folder

```text
machine-learning/
├── app/
│   ├── __init__.py
│   ├── main.py                ← FastAPI app + /predict endpoint
│   ├── config.py              ← environment config
│   ├── detector/
│   │   ├── __init__.py
│   │   └── tomato.py          ← YOLOv8 wrapper
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── clahe.py           ← CLAHE enhancement
│   └── schemas/
│       ├── __init__.py
│       └── predict.py         ← Pydantic response models
├── models/
│   ├── .gitkeep
│   └── best.pt                ← YOLOv8 weights (tidak di-commit)
├── results/
│   └── .gitkeep               ← annotated images (generated)
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

| Variable               | Default          | Deskripsi                    |
| ---------------------- | ---------------- | ---------------------------- |
| `YOLO_MODEL_PATH`      | `models/best.pt` | Path ke model YOLOv8         |
| `YOLO_CONFIDENCE`      | `0.25`           | Confidence threshold         |
| `YOLO_IOU_THRESHOLD`   | `0.45`           | IoU threshold untuk NMS      |
| `CLAHE_ENABLED`        | `true`           | Aktifkan CLAHE preprocessing |
| `CLAHE_CLIP_LIMIT`     | `2.0`            | CLAHE clip limit             |
| `CLAHE_TILE_GRID_SIZE` | `8`              | CLAHE tile grid size         |
| `HOST`                 | `0.0.0.0`        | Server host                  |
| `PORT`                 | `8000`           | Server port                  |
| `MAX_UPLOAD_MB`        | `8`              | Max upload file size (MB)    |

---

## Integrasi dengan SvelteKit

SvelteKit backend memanggil service ini via:

```text
POST {AI_SERVICE_URL}/predict
```

Default `AI_SERVICE_URL` = `http://localhost:8000`

Konfigurasi di `.env` aplikasi SvelteKit:

```dotenv
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT_MS=15000
```

---

## ⚠️ Peringatan

- **Jangan** menyimpan model weights (`.pt`) di repository. Gunakan `.gitkeep` sebagai placeholder.
- **Jangan** mengakses database Taniva dari service ini.
- **Jangan** mengimplementasikan business logic (matching, reputasi, certificate) di sini.
- Service ini hanya bertanggung jawab untuk **deteksi dan grading kualitas tomat**.

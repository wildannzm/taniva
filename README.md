# Taniva — BYTESFEST 2026

**Taniva** adalah platform penghubung petani tomat dan UMKM kuliner di kawasan Surakarta dan sekitarnya.

Sistem ini membantu petani mendapatkan pembeli yang tepat berdasarkan kualitas hasil panen (dianalisis AI) dan kedekatan lokasi, sekaligus membantu UMKM menemukan pasokan tomat berkualitas dengan harga transparan.

---

## Struktur Repository

```text
Solo/
├── application/          ← SvelteKit web app + backend API
├── machine-learning/     ← FastAPI + YOLOv8 vision service
└── context/              ← dokumentasi proyek bersama
```

| Folder              | Teknologi             | Dikelola Oleh           |
| ------------------- | --------------------- | ----------------------- |
| `application/`      | SvelteKit, Prisma, PG | Backend & Frontend Lead |
| `machine-learning/` | FastAPI, YOLOv8       | AI/ML Engineer          |
| `context/`          | Markdown docs         | Seluruh tim             |

---

## Quick Start

### 1. Application (SvelteKit)

```bash
cd application
npm install
cp .env.example .env
# Isi DATABASE_URL di .env
npm run db:generate
npm run db:migrate -- --name init
npm run dev
# → http://localhost:5173
```

### 2. Machine Learning (FastAPI + YOLOv8)

```bash
cd machine-learning
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env
# Letakkan best.pt di models/
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000
```

---

## Arsitektur

```text
Browser / Frontend
       │
       ▼
SvelteKit Server (+server.js)
       │
  ┌────┼──────────────────────────┐
  ▼    ▼                          ▼
PostgreSQL    FastAPI/YOLOv8     External APIs
Prisma ORM    (machine-learning)  OpenRouter, ORS
```

---

## Dokumentasi

| File                         | Isi                             |
| ---------------------------- | ------------------------------- |
| `context/PRD.md`             | Product requirements            |
| `context/ARCHITECTURE.md`    | Arsitektur dan keputusan teknis |
| `context/SCHEMA.md`          | Database schema dan formula     |
| `context/API.md`             | Kontrak API endpoint            |
| `context/RULES.md`           | Aturan coding dan implementasi  |
| `application/README.md`      | Setup guide aplikasi SvelteKit  |
| `machine-learning/README.md` | Setup guide AI vision service   |

---

## Tim

| Peran                    | Tanggung Jawab                  |
| ------------------------ | ------------------------------- |
| Backend Lead             | API, service, business logic    |
| Frontend Lead            | UI/UX, halaman, komponen Svelte |
| AI/ML Engineer           | YOLOv8, FastAPI vision service  |
| Full-stack / Koordinator | Integrasi, constraint panitia   |

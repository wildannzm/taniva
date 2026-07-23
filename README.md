# Taniva — BYTESFEST 2026 🍅

> **Taniva** adalah platform cerdas yang menghubungkan petani tomat dan UMKM kuliner di kawasan Surakarta dan sekitarnya. Proyek ini dikembangkan untuk kompetisi **BYTESFEST 2026 — Hackathon Day** (Tim WindTech, Universitas Majalengka) dengan fokus pada **SDG 2 — Zero Hunger**.

Sistem ini membantu petani mendapatkan pembeli yang tepat berdasarkan kualitas hasil panen (dianalisis oleh AI) dan kedekatan lokasi. Di sisi lain, sistem membantu UMKM menemukan pasokan tomat berkualitas dengan harga transparan melalui pencocokan berbasis NLP (*Natural Language Processing*).

---

## 🚀 Tutorials: Quick Start

Berikut adalah panduan langkah demi langkah untuk menjalankan platform Taniva di lingkungan lokal Anda. Sistem ini terbagi menjadi dua servis utama.

### 1. Web Application & Backend (SvelteKit)

Servis ini menangani antarmuka pengguna (Frontend) dan logika bisnis utama (Backend API) menggunakan SvelteKit, Prisma, dan PostgreSQL.

```bash
cd application

# 1. Install dependensi
npm install

# 2. Siapkan environment variables
cp .env.example .env
# WAJIB: Isi DATABASE_URL dan API Keys (OpenRouter/Groq) di dalam file .env

# 3. Setup Database (Prisma)
npm run db:generate
npm run db:migrate -- --name init

# 4. Jalankan development server
npm run dev
# Aplikasi dapat diakses di http://localhost:5173
```

### 2. AI Vision Service (FastAPI + YOLOv8)

Servis *microservice* ini bertanggung jawab penuh untuk melakukan *grading* (penilaian kualitas) gambar tomat menggunakan model YOLOv8.

```bash
cd machine-learning

# 1. Buat dan aktifkan virtual environment
python -m venv venv
venv\Scripts\activate          # Untuk Windows
# source venv/bin/activate     # Untuk Mac/Linux

# 2. Install dependensi
pip install -r requirements.txt

# 3. Siapkan environment variables dan model
cp .env.example .env
# WAJIB: Letakkan file model YOLOv8 (best.pt) ke dalam folder models/

# 4. Jalankan FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# API dapat diakses di http://localhost:8000
```

---

## 🛠️ How-To Guides

Bagian ini memandu Anda melalui alur penggunaan platform utama.

### Bagaimana cara kerja sistem *Grading* Tomat?
1. Petani mengunggah foto *batch* panen tomat melalui antarmuka web.
2. SvelteKit Server mengunggah foto tersebut ke **AI Vision Service (FastAPI)**.
3. Model YOLOv8 mendeteksi jumlah tomat yang `fresh` dan `rotten`.
4. Backend menyimpan hasil penilaian dan menerbitkan **Sertifikat Digital (QR Code)** dengan *hash* SHA-256 sebagai jaminan integritas kualitas data.

### Bagaimana UMKM mencari suplai tomat?
1. UMKM memasukkan kebutuhan pasokan menggunakan bahasa natural di kolom pencarian (contoh: *"Saya butuh 50kg tomat segar untuk besok pagi"*).
2. Sistem NLP mengekstrak teks tersebut menjadi parameter pencarian terstruktur (JSON).
3. Backend melakukan kalkulasi *Weighted Matching* (Kualitas 40%, Reputasi 35%, Logistik 25%) untuk mengembalikan rekomendasi *batch* tomat yang paling optimal.

---

## 🧠 Explanation: Arsitektur Sistem

Taniva mengadopsi pendekatan arsitektur *microservices-lite*. Hal ini memisahkan beban kerja berat (Inferensi AI Image Processing) dari server utama, memastikan aplikasi web tetap responsif.

```text
        Browser / Frontend (Petani & UMKM)
                         │
                         ▼
           SvelteKit Server (+server.js)
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
 MySQL (DB)       FastAPI/YOLOv8       External APIs
 Prisma ORM     (AI Vision Service)   OpenRouter, ORS
```

**Alur Transaksi Utama (MVP):**
Unggah Foto → Grading AI → Sertifikat QR → Input NLP UMKM → Ekstraksi Data JSON → Weighted Matching → Estimasi Logistik → Verifikasi → Transaksi Selesai → Pemberian Rating & Reputasi.

---

## 📖 Reference

Informasi teknis dan referensi lengkap dokumen sistem.

### Struktur Repository

```text
taniva-v1/
├── application/          ← SvelteKit web app + Backend API (Node.js/Prisma)
└── machine-learning/     ← FastAPI + YOLOv8 vision service (Python)
```


### Tim Pengembang
| Anggota Tim | Peran | Tanggung Jawab Utama |
|---|---|---|
| **Abrar Wahid** | Ketua / AI-ML Engineer | Model YOLOv8, formula kualitas, pipeline FastAPI *vision service*. |
| **Ahmad Nur Ain** | Backend Lead | Arsitektur DB, integrasi API NLP/Peta, algoritma *Matching* Reputasi. |
| **Zacky Hafsari** | Frontend Lead | Pembuatan komponen UI/UX SvelteKit, konsumsi API, *state management*. |
| **Wildan Zhilal Manafi** | Full-stack / Koordinator | Integrasi akhir (E2E), *deployment*, pengujian sistem, dan *hackathon constraints*. |

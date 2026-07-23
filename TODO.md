# To-Do List & Alur Implementasi — Taniva (Tim WindTech)

> Catatan: repositori GitHub bersifat privat sehingga breakdown ini disusun berdasarkan PRD/BRD dan pembagian peran pada proposal, bukan hasil audit kode aktual. Sesuaikan checklist dengan progres yang sudah ada di repo.
>
> Konteks waktu (mengikuti Guidebook BYTESFEST 2026, sistem Split-Phase):
>
> - **10-22 Juli** — pengembangan produk mandiri (di luar hari lomba)
> - **22 Juli (hari ini, H-1)** — sprint terakhir menuntaskan MVP sebelum Hackathon Day
> - **23 Juli** — Hackathon Day, khusus integrasi 2 constraint kejutan dari panitia
> - **24 Juli** — Pitching Day
> - **25 Juli** — Awarding

---

## 1. Pembagian Peran dan Kepemilikan Modul

| Anggota                  | Peran (Proposal)                    | Modul yang Dipegang (PRD)                                                                                                        |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Abrar Wahid**          | Ketua Tim / AI-ML Engineer          | Trust Layer (FR-04 s.d. FR-09): CLAHE, YOLOv8, skor kualitas, sertifikat QR                                                      |
| **Ahmad Nur Ain**        | Backend Lead                        | Intelligence Layer, Feedback Layer, basis data, seluruh endpoint FastAPI (FR-10, FR-11, FR-12, FR-16, FR-17)                     |
| **Zacky Hafsari**        | Frontend Lead                       | Seluruh antarmuka SvelteKit (konsumsi API dari FR-01 s.d. FR-19)                                                                 |
| **Wildan Zhilal Manafi** | Full-stack & Koordinator Constraint | NLP Bridge (FR-02, FR-03), Action Layer (FR-14, FR-15), integrasi API key, repo/DevOps, dan koordinasi respons constraint hari-H |

---

## 2. To-Do List Sprint Akhir — Hari Ini (22 Juli)

### Abrar Wahid — AI/ML Engineer

- [x] Finalisasi subset dataset fresh/rotten tomat (Kaggle/Roboflow Universe), buang gambar noise/ambigu
- [x] Latih atau fine-tune ulang YOLOv8 khusus 2 kelas (fresh, rotten), simpan bobot model final
- [x] Implementasikan pra-pemrosesan CLAHE sebelum inferensi (FR-05)
- [x] Bungkus inferensi model menjadi fungsi/endpoint yang menerima gambar dan mengembalikan bounding box + confidence
- [x] Implementasikan kalkulasi Skor Kualitas Agregat 0-100 dari hasil deteksi (FR-07)
- [ ] Ekspor model ke format ringan (ONNX/FP16) agar inferensi < 3 detik sesuai NFR
- [x] Serahkan fungsi inferensi ke Ahmad untuk dibungkus jadi endpoint `/api/harvest/upload`
- [ ] Siapkan 5-10 sampel foto teruji (fresh & rotten) sebagai bahan demo cadangan

### Ahmad Nur Ain — Backend Lead

- [x] Finalisasi skema database PostgreSQL: Farmer, UMKM, HarvestBatch, Order, MatchResult, Rating (Bagian 10 PRD)
- [x] Implementasikan endpoint `POST /api/harvest/upload` (integrasi fungsi CV dari Abrar + generate hash SHA-256 + QR code) — FR-04, FR-08
- [x] Implementasikan endpoint `GET /api/harvest/{batch_id}/verify` — FR-09
- [x] Implementasikan algoritma Weighted Scoring (kualitas 40%, reputasi 35%, logistik 25%) di endpoint `POST /api/matching/search` — FR-10, FR-11, FR-12
- [ ] Implementasikan endpoint `POST /api/feedback/rating` dan logika update reputasi otomatis — FR-16, FR-17
- [ ] Implementasikan endpoint `GET /api/farmer/{id}/reputation`
- [ ] Buat seed data dummy (beberapa petani, UMKM, batch panen) untuk kebutuhan demo dan testing
- [ ] Tulis dokumentasi ringkas kontrak API (request/response) agar Zacky bisa integrasi tanpa menunggu

### Zacky Hafsari — Frontend Lead

- [x] Setup project SvelteKit final (struktur folder, routing, layout dasar mobile-first)
- [x] Halaman unggah foto panen (petani) + tampilan hasil skor kualitas dan QR code — FR-04, FR-08
- [x] Halaman input permintaan bahasa natural (UMKM) + tampilan hasil ekstraksi untuk dikonfirmasi — FR-01, FR-03
- [x] Halaman hasil matching (daftar petani terurut + breakdown skor) — FR-12
- [x] Halaman pindai ulang QR Code untuk validasi saat barang tiba — FR-09
- [x] Halaman form rating 1-5 — FR-16
- [x] Dashboard ringkas status transaksi per role (opsional, Could Have) — FR-19
- [ ] Pastikan seluruh state loading/error ditangani dengan baik agar tidak "blank" saat demo

### Wildan Zhilal Manafi — Full-stack & Koordinator Constraint

- [x] Implementasikan wrapper pemanggilan OpenRouter/Groq API untuk ekstraksi intent (prompt engineering agar output JSON konsisten) — FR-02
- [x] Implementasikan endpoint `POST /api/nlp/extract-intent`, hubungkan ke frontend Zacky
- [x] Implementasikan estimasi rute/biaya via OpenRouteService — endpoint `POST /api/logistics/route` — FR-14
- [x] Amankan seluruh API key (OpenRouter/Groq, OpenRouteService) sebagai environment variable, pastikan `.env` masuk `.gitignore`
- [ ] Siapkan hotspot/koneksi internet cadangan untuk mengantisipasi kegagalan API cloud saat demo (mitigasi risiko Bagian 13 PRD)
- [ ] Siapkan fallback respons NLP statis (contoh hasil ekstraksi) untuk skenario darurat jika API cloud down saat demo
- [ ] Jalankan uji integrasi end-to-end penuh (Fase 1 s.d. Fase 5 pada Bagian 8 PRD) bersama seluruh anggota
- [ ] Rapikan struktur repository dan README agar siap dinilai/diverifikasi juri

---

## 3. To-Do Bersama — Malam Ini (Sebelum Hackathon Day)

- [ ] Jalankan demo end-to-end penuh sebagai satu tim, catat semua bug yang muncul
- [ ] Prioritaskan perbaikan hanya untuk fitur **Must Have** (FR-01, 02, 04, 06, 07, 08, 10, 11, 12, 16, 17); tunda fitur Could Have jika waktu sempit
- [ ] Rekam video demo cadangan (screen recording) sebagai jaring pengaman bila terjadi kegagalan teknis saat live demo
- [ ] Tentukan pembagian peran saat Hackathon Day: siapa memegang laptop demo utama, siapa mencatat instruksi constraint, siapa eksekusi kode
- [ ] Cek ulang seluruh API key & kuota (OpenRouter/Groq, OpenRouteService) masih aktif dan cukup untuk sesi lomba
- [ ] Push seluruh progres ke branch utama, pastikan repository dalam kondisi bisa langsung dijalankan (`git clone` -> jalan)

---

## 4. Protokol Hackathon Day (23 Juli — Gedung G FKIP UNS)

| Waktu                 | Aktivitas                                                                           | Penanggung Jawab Utama                          |
| --------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| 07.30 - 09.30         | Setup laptop, jalankan backend & frontend lokal, verifikasi API key masih berfungsi | Wildan (koordinasi), semua anggota              |
| 09.30                 | Terima **Constraint 1** (teknis-fungsional)                                         | Wildan mencatat & memetakan ke modul terkait    |
| 09.30 - 13.00         | Integrasi Constraint 1 ke modul yang relevan (kemungkinan Trust Layer/Backend)      | PIC ditentukan sesuai isi constraint saat itu   |
| 13.00                 | Terima **Constraint 2** (kontekstual)                                               | Wildan mencatat & memetakan ulang asumsi solusi |
| 13.00 - 16.00         | Integrasi Constraint 2                                                              | PIC ditentukan sesuai isi constraint saat itu   |
| 16.00 - 17.00         | Stabilisasi, uji ulang alur end-to-end, perbaikan bug prioritas tinggi              | Semua anggota                                   |
| Menjelang batas akhir | Push final ke GitHub, submit output sesuai media panitia                            | Wildan                                          |

Karena isi kedua constraint baru diketahui saat hari-H, PIC eksekusi ditentukan langsung berdasarkan modul mana yang terdampak, mengikuti prinsip pada Bagian 8 PRD: arsitektur modular (microservices-lite) memungkinkan perubahan diisolasi ke lapisan yang relevan tanpa merombak sistem utama.

---

## 5. To-Do Pitching Day (24 Juli)

- [ ] Susun storyline presentasi mengikuti alur end-to-end (Bagian 8 PRD): masalah → Trust Layer → NLP Bridge → Matching → Audit QR → Feedback Layer
- [ ] Tentukan pembicara per bagian (masalah/bisnis, demo teknis, penutup/dampak)
- [ ] Siapkan jawaban untuk potensi pertanyaan juri: justifikasi penggantian Frontend ke SvelteKit, justifikasi NLP Engine ke OpenRouter/Groq, cara kerja Weighted Scoring, cara kerja Self-Correcting Reputation System
- [ ] Latihan demo dengan batas waktu presentasi, termasuk rencana cadangan bila jaringan bermasalah (gunakan video rekaman dari Bagian 3)
- [ ] Siapkan slide ringkas (bukan padat teks) yang menonjolkan diferensiasi produk (Bagian 4.6 pada proposal)

---

## 6. Alur Implementasi Keseluruhan (Dependency Flow)

```
Tahap 0  Kontrak API & Skema Data
         (Ahmad + Wildan menyepakati bentuk request/response tiap endpoint
          dan skema database lebih dulu, agar tim lain tidak saling menunggu)
              |
              v
Tahap 1  Pengembangan Paralel
   +----------------------+----------------------+----------------------+
   |  Abrar               |  Zacky                |  Wildan               |
   |  Model YOLOv8 +       |  Skeleton SvelteKit + |  NLP wrapper          |
   |  CLAHE + skor         |  seluruh halaman UI   |  (OpenRouter/Groq) +  |
   |  kualitas             |  (memakai data dummy) |  Action Layer rute    |
   +----------------------+----------------------+----------------------+
              |                      |                       |
              v                      v                       v
Tahap 2  Ahmad merakit seluruh endpoint backend (menyatukan fungsi CV
         dari Abrar, logika matching, feedback, dan memanggil wrapper
         NLP/rute dari Wildan)
              |
              v
Tahap 3  Zacky menyambungkan frontend ke API asli (mengganti data dummy)
              |
              v
Tahap 4  Wildan menjalankan uji integrasi end-to-end penuh, seluruh tim
         memperbaiki bug bersama
              |
              v
Tahap 5  Hackathon Day: integrasi Constraint 1 & Constraint 2 pada modul
         yang terdampak, tanpa mengubah struktur inti
              |
              v
Tahap 6  Submission (push GitHub) -> Pitching Day -> Awarding
```

Prinsip kunci: **Tahap 0 tidak boleh dilewati.** Selama kontrak API dan skema data belum disepakati, Zacky (frontend) berisiko membangun UI yang tidak cocok dengan struktur data asli dari Ahmad, dan Wildan berisiko membangun wrapper NLP dengan format output yang tidak sinkron dengan kebutuhan matching engine.

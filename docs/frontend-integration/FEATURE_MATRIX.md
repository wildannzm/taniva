# Feature Matrix Integration

| Fitur | Backend endpoint | Status backend | Halaman frontend | Status frontend | Gap |
|---|---|---|---|---|---|
| health | `GET /api/health` | Tersedia | - | N/A | Tidak memerlukan halaman khusus |
| harvest upload | `POST /api/harvest/upload` | Tersedia | `/petani` (PhotoUploader) | Ada (mungkin Mock) | Belum dikoneksikan 100% ke real endpoint |
| harvest detail | `GET /api/harvest/[batchId]` | Tersedia | `/petani` (List Panen) | Belum dipetakan spesifik | Perlu integrasi fetch detail panen dari DB |
| certificate verify | `POST /api/harvest/[batchId]/verify` | Tersedia | `QRScanner.svelte` / `QRCertificate.svelte` | Komponen Tersedia | Belum disambungkan dengan route halaman verifikasi publik |
| NLP extract | `POST /api/nlp/extract-intent` | Tersedia | `/umkm` (NaturalLanguageInput) | Ada (mungkin Mock) | Integrasi interaktif dengan chat/input NLP belum tersambung |
| create order | `POST /api/orders` | Tersedia | `/umkm` | Draft | Perlu disambungkan otomatis setelah NLP extract terkonfirmasi |
| get order | `GET /api/orders/[orderId]` | Tersedia | `/umkm` | Draft | Perlu implementasi *fetch* status pesanan aktif |
| matching search | `GET /api/matching/search` | Tersedia | `/umkm` (FarmerMatchCard) | Komponen Tersedia | Perlu me-render hasil perankingan (Single/Split) algoritma dari API |
| route | `POST /api/logistics/route` | Tersedia | `RouteEstimate.svelte` | Komponen Tersedia | Menampilkan peta *Leaflet* dengan garis rute GeoJSON dari database |
| select option | `POST /api/orders/[orderId]/select` | Tersedia | `/umkm` | Draft | Fungsi klik tombol 'Pilih Opsi' pada *matching list* belum *hit* API |
| rating | `POST /api/feedback/rating` | Tersedia | `/umkm` (RatingForm) | Komponen Tersedia | Memunculkan form ulasan dan menembak API setelah logistik selesai |
| farmer reputation | `GET /api/farmer/[id]/reputation` | Tersedia | `/umkm` / `/petani` | Komponen Tersedia | *Fetch* reputasi bintang terbaru (QualityScoreCard/dsb) |

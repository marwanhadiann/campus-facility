🚀 Campus Facility (Backend API)

RESTful API backend service untuk Campus Room, Facility & Schedule Management System — sistem operasional kampus terpadu yang memfokuskan layanan pada pengelolaan katalog ruangan, inventaris fasilitas, penanganan pengaduan kerusakan, serta evaluasi perubahan jadwal kuliah.

⚙️ Tech Stack & Arsitektur

Runtime & Framework: Node.js, Express.js

Database & ORM: PostgreSQL, Drizzle ORM

Otentikasi & Keamanan: JSON Web Token (JWT) dalam HttpOnly Cookies, Bcrypt Password Hashing

File Processing: Multer (Upload Bukti Foto Kerusakan)

Arsitektur Project: Feature-Based Modular Architecture

📌 Aturan Bisnis & Validasi Sistem (Business Rules)

Backend ini mengimplementasikan logika & aturan validasi operasional:

Pencegahan Pengaduan Duplikat: API secara otomatis menolak pembuatan laporan pengaduan baru jika fasilitas di ruangan yang dipilih masih memiliki laporan aktif berstatus OPEN, VERIFIED, atau IN_PROGRESS.

Zero Room Conflict Validation: Algoritma pemvalidasi ketersediaan ruangan saat Staff menyetujui pengajuan pergantian jadwal dosen untuk mencegah bentrok jadwal pada slot waktu dan lokasi yang sama.

Pencatatan Penanganan Transparan: Setiap perubahan status perbaikan (OPEN ➔ VERIFIED ➔ IN_PROGRESS ➔ RESOLVED) mencatat identitas staff penanggung jawab dan catatan teknis penyelesaian.

Batasan Operasional: Layanan API berfokus penuh pada operasional fasilitas dan jadwal, serta secara eksplisit tidak memproses KRS, nilai, presensi, maupun pembayaran akademik.

🗄️ Skema Basis Data (ERD)

Relasi antar entitas database yang dikelola melalui Drizzle ORM:

[ users ] ───────────< [ pengaduan ] >─────────── [ fasilitas_ruang ]
    │                                                     │
    ├─────────< [ pengajuan_jadwal ] >────────┐            │
    │                                         │            │
[ jadwal ] >────────────────────────────── [ ruang ] <─────┘
    │
[ mata_kuliah ]


Entitas Utama:

users: Data pengguna (NIM/NIP/NIK, nama, email, password_hash, role: mahasiswa, dosen, staff).

ruang: Master data ruangan (kode ruang, nama ruang, lantai, status ketersediaan).

fasilitas_ruang: Data inventaris fasilitas per ruangan (NORMAL, RUSAK_RINGAN, RUSAK_BERAT).

mata_kuliah: Data mata kuliah dan bobot SKS.

jadwal: Jadwal perkuliahan utama (dosen pengampu, mata kuliah, lokasi ruang, hari, jam mulai/selesai).

pengaduan: Data laporan kerusakan (foto bukti, status perbaikan, pelapor_id, staff_id, catatan penanganan).

pengajuan_jadwal: Pengajuan ganti jadwal/ruang dosen (status: PENDING, APPROVED, REJECTED, alasan).

🔌 API Endpoints Ringkas

🔐 Auth (/api/auth)

POST /api/auth/login — Autentikasi user & set HttpOnly Cookie JWT

POST /api/auth/logout — Clear session cookie

GET /api/auth/me — Ambil data profil user yang sedang login

🏫 Katalog Ruang & Fasilitas (/api/ruangan)

GET /api/ruangan — Menampilkan daftar semua ruangan

GET /api/ruangan/:id/fasilitas — Menampilkan fasilitas per ruangan beserta kondisi & status pengaduan aktif

POST /api/ruangan — (Staff Only) Tambah data ruangan baru

🛠️ Pengaduan Kerusakan (/api/pengaduan)

GET /api/pengaduan — Menampilkan daftar pengaduan (filter status)

POST /api/pengaduan — (Mahasiswa/Dosen) Buat laporan kerusakan baru (+ foto)

PATCH /api/pengaduan/:id/status — (Staff Only) Update status (VERIFIED, IN_PROGRESS, RESOLVED) & catatan teknis

GET /api/pengaduan/riwayat — Menampilkan rekam jejak fasilitas selesai diperbaiki

📅 Jadwal & Pengajuan Ganti Jadwal (/api/jadwal & /api/pengajuan-jadwal)

GET /api/jadwal — Filter jadwal kuliah (per kelas, ruang, atau hari)

POST /api/pengajuan-jadwal — (Dosen Only) Mengajukan ganti jadwal/ruang

PATCH /api/pengajuan-jadwal/:id/evaluasi — (Staff Only) Persetujuan/Penolakan ganti jadwal dengan pengecekan bentrok ruangan

💻 Panduan Jalankan Project (Development Setup)

Prasyarat

Node.js v18+

PostgreSQL Database Server aktif

Langkah Installasi

Clone Repository

git clone https://github.com/marwanhadiann/campus-facility.git
cd campus-facility


Install Dependencies

npm install


Konfigurasi Environment Variables (.env)
Buat file .env di folder utama backend (campus-facility/):

PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/campus_facility_db
JWT_SECRET=rahasia_jwt_super_aman_123
NODE_ENV=development
CLIENT_URL=http://localhost:5173


Migrasi Database (Drizzle ORM)

# Generate berkas migrasi
npm run db:generate

# Push schema ke database PostgreSQL
npm run db:push


Jalankan Server API

# Mode Development
npm run dev

# Mode Production
npm run build
npm start


📂 Struktur Folder Project

campus-facility/
├── src/
│   ├── config/         # Konfigurasi database & environment variables
│   ├── controllers/    # Route handler controllers
│   ├── db/             # Schema Drizzle ORM & SQL migrations
│   ├── middlewares/    # Auth middleware & Role Guard
│   ├── routes/         # Express Router endpoints
│   ├── services/       # Core business logic (Validasi duplikat & bentrok jadwal)
│   └── index.js        # Entry point Express App
├── .env.example
├── drizzle.config.ts
├── package.json
└── README.md
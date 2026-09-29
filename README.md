# Smart Motorcycle Health & Maintenance System

Aplikasi manajemen kesehatan dan jadwal perawatan sepeda motor berbasis web yang dirancang khusus untuk mempermudah pemilik motor dalam memantau kilometer (odometer), riwayat servis, jadwal servis berkala suku cadang, skor kesehatan motor secara transparan (*Motorcycle Health Score*), serta panduan rekomendasi awal berbasis keluhan motor (*Rule-Based Recommendation*).

Project ini dikembangkan sebagai tugas besar mata kuliah **Rekayasa Perangkat Lunak (RPL) - Semester 3**.

---

## 1. Fitur Utama

1. **Manajemen Profil Motor (Motor Saya)**: Tambah, ubah, hapus, dan pilih motor aktif yang sedang dipantau. Mendukung multi-motor.
2. **Pencatatan Kilometer (Odometer)**: Catat riwayat penambahan kilometer dengan validasi logis (kilometer baru tidak boleh lebih rendah dari kilometer saat ini) dan update otomatis status motor.
3. **Pencatatan Riwayat Servis**: Catat transaksi servis bengkel (jenis servis, tanggal, odometer, biaya, catatan bengkel). Sistem secara otomatis menyinkronkan dan memperbarui interval pada jadwal maintenance yang sesuai.
4. **Jadwal & Pengingat Maintenance Berkala**: Monitor interval jarak tempuh (KM) dan interval waktu (hari) untuk setiap suku cadang (misal: Oli Mesin, CVT, Busi, Kampas Rem) dengan visual progress bar dinamis.
5. **Dynamic Maintenance Status**: Status dihitung secara *real-time* (tidak disimpan mati di database) menjadi:
   - `UPCOMING` (Kondisi aman)
   - `DUE SOON` (Mendekati jadwal dalam rentang 10% interval atau 7 hari)
   - `DUE` (Mencapai batas dalam rentang 5% interval atau 3 hari)
   - `OVERDUE` (Melewati batas kilometer atau batas hari)
6. **Explainable Motorcycle Health Score (0 - 100)**: Kalkulasi kesehatan motor berbasis aturan yang mudah dijelaskan saat presentasi ujian tanpa ketergantungan model AI gelap/black-box.
7. **Rule-Based Recommendation**: Memberikan rekomendasi awal komponen yang perlu dicek berdasarkan deskripsi keluhan pengguna (misal: "motor susah dinyalakan", "motor bergetar/gredek", "rem kurang pakem", "mesin cepat panas"). Dilengkapi peringatan/disclaimer medis kendaraan.
8. **Dashboard Ringkas & Responsif**: Menampilkan semua metrik vital dalam 1 halaman dengan aksi cepat (*Quick Actions*), tampilan modern bernuansa otomotif (dark charcoal & emerald green), dan adaptif di layar smartphone maupun laptop.

---

## 2. Tech Stack

- **Frontend**:
  - React 19
  - TypeScript
  - Vite 8
  - Tailwind CSS v4
  - Lucide React (automotive & modern icons)
- **Backend**:
  - Node.js (ESM)
  - TypeScript
  - Express.js 5
  - Prisma ORM 5
  - Zod (Request validation)
  - CORS & Dotenv
- **Database & DevOps**:
  - MySQL 8.0 (Containerized via Docker Compose)
  - Docker Desktop

---

## 3. Struktur Project

```
Project-Rekayasa-Perangkat-Lunak/
├── Project-FullAi/
│   ├── docker-compose.yml          # Konfigurasi container MySQL 8.0
│   ├── apps/
│   │   ├── api/                    # Backend Express + Prisma
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma   # Skema 4 tabel database MySQL
│   │   │   │   └── seed.ts         # Script demo seed data
│   │   │   ├── src/
│   │   │   │   ├── controllers/    # Handler request API
│   │   │   │   ├── middleware/     # Centralized error handler
│   │   │   │   ├── routes/         # Express router endpoints
│   │   │   │   ├── schemas/        # Zod input validation
│   │   │   │   ├── services/       # Business logic (Health Score, Calculation, Rules)
│   │   │   │   ├── utils/          # Prisma client & response envelope
│   │   │   │   └── server.ts       # Entry point Express API
│   │   │   ├── .env.example
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   └── web/                    # Frontend React + Vite + Tailwind
│   │       ├── index.html          # File index tepat di apps/web/index.html
│   │       ├── src/
│   │       │   ├── components/     # Navbar, Sidebar, Modal, Badge, Toast, Skeleton, EmptyState
│   │       │   ├── context/        # MotorcycleContext state motor aktif
│   │       │   ├── pages/          # 6 Halaman utama aplikasi
│   │       │   │   ├── DashboardPage.tsx
│   │       │   │   ├── MotorcyclesPage.tsx
│   │       │   │   ├── MileagePage.tsx
│   │       │   │   ├── ServicesPage.tsx
│   │       │   │   ├── MaintenancePage.tsx
│   │       │   │   └── RecommendationPage.tsx
│   │       │   ├── services/       # API client fetcher
│   │       │   ├── types/          # Shared TypeScript interfaces
│   │       │   ├── App.tsx         # Main layout & subpage switcher
│   │       │   ├── main.tsx
│   │       │   └── index.css       # Tailwind v4 styles & keyframe animations
│   │       ├── package.json
│   │       └── vite.config.ts
└── README.md
```

---

## 4. Skema Database (MySQL + Prisma)

Menggunakan 4 tabel utama terelasi:
1. `motorcycles`:
   - `id` (Int, Primary Key, Auto-increment)
   - `brand` (String)
   - `model` (String)
   - `year` (Int)
   - `currentMileage` (Int)
   - `createdAt` (DateTime)
2. `mileage_records`:
   - `id` (Int, Primary Key, Auto-increment)
   - `motorcycleId` (Int, Foreign Key ke motorcycles)
   - `mileage` (Int)
   - `recordedAt` (DateTime)
3. `service_histories`:
   - `id` (Int, Primary Key, Auto-increment)
   - `motorcycleId` (Int, Foreign Key ke motorcycles)
   - `serviceType` (String)
   - `serviceDate` (DateTime)
   - `mileage` (Int)
   - `cost` (Float)
   - `notes` (Text, nullable)
   - `createdAt` (DateTime)
4. `maintenance_schedules`:
   - `id` (Int, Primary Key, Auto-increment)
   - `motorcycleId` (Int, Foreign Key ke motorcycles)
   - `maintenanceType` (String)
   - `intervalKm` (Int)
   - `intervalDays` (Int)
   - `lastServiceMileage` (Int)
   - `lastServiceDate` (DateTime)
   - `createdAt` (DateTime)

---

## 5. Cara Menjalankan Project

### Langkah 1: Pastikan Docker MySQL Berjalan
Buka terminal di dalam folder `Project-FullAi`:
```bash
cd Project-FullAi
docker compose up -d
```
Container `smart-motorcycle-mysql` akan berjalan di port `3306` dengan:
- Database: `smart_motorcycle`
- User: `motorcycle_user`
- Password: `motorcycle_password`

### Langkah 2: Setup Environment & Database Backend
Masuk ke direktori `apps/api`:
```bash
cd apps/api
```
Pastikan file `.env` sudah ada (dapat disalin dari `.env.example`):
```env
PORT=3000
DATABASE_URL="mysql://motorcycle_user:motorcycle_password@localhost:3306/smart_motorcycle"
```

Jalankan sinkronisasi database dan seed data demo:
```bash
npx prisma db push
npm run prisma:seed
```
*Catatan: Seed script akan membuat 1 unit motor Honda Vario 160 (2023) lengkap dengan riwayat kilometer, servis, dan jadwal maintenance.*

### Langkah 3: Menjalankan Backend API
Dari folder `apps/api`:
```bash
npm run dev
```
Backend berjalan pada: `http://localhost:3000`.
Endpoint root `GET http://localhost:3000/` akan mengembalikan:
```json
{
  "message": "Smart Motorcycle API is running"
}
```

### Langkah 4: Menjalankan Frontend Web
Buka terminal baru, masuk ke direktori `apps/web`:
```bash
cd apps/web
npm run dev
```
Frontend berjalan pada: `http://localhost:5173`.
Buka browser dan akses URL tersebut untuk melihat aplikasi secara interaktif.

---

## 6. Penjelasan Logika Bisnis (Untuk Presentasi Ujian)

### A. Dynamic Maintenance Status
Status tidak disimpan mati di database untuk mencegah data usang (*stale data*). Setiap kali data diminta, backend menghitung:
- `nextMileage = lastServiceMileage + intervalKm`
- `nextDate = lastServiceDate + intervalDays`
- `remainingKm = nextMileage - currentMileage`
- `remainingDays = ceil((nextDate - now) / 1 hari)`

**Aturan Penentuan Status:**
- `OVERDUE`: Jika `remainingKm <= 0` ATAU `remainingDays <= 0`.
- `DUE`: Jika `remainingKm <= 5% intervalKm` ATAU `remainingDays <= 3 hari`.
- `DUE SOON`: Jika `remainingKm <= 10% intervalKm` ATAU `remainingDays <= 7 hari`.
- `UPCOMING`: Jika belum mencapai batas di atas.

### B. Motorcycle Health Score (0 - 100)
- **Jika belum ada jadwal maintenance**: Mengembalikan status `INSUFFICIENT_DATA` ("Belum cukup data").
- **Jika ada jadwal maintenance**:
  - Skor awal = 100 poin.
  - Setiap jadwal berstatus `OVERDUE` atau `DUE`: **-25 poin**.
  - Setiap jadwal berstatus `DUE SOON`: **-10 poin**.
  - Batas nilai: Minimal `0`, Maksimal `100`.
- **Kategori Skor**:
  - `80 - 100`: **GOOD** (Kondisi prima)
  - `60 - 79`: **FAIR** (Cukup baik, ada servis mendekati batas)
  - `0 - 59`: **NEEDS ATTENTION** (Memerlukan servis segera karena ada jadwal terlewat)
- Dilengkapi **penjelasan transparan (reasons)**, misalnya: *"1 perawatan sudah terlambat: Ganti Busi (-25 poin)"*.

### C. Rule-Based Recommendation
Sistem mencocokkan kata kunci keluhan pengguna secara case-insensitive ke 7 aturan umum otomotif:
1. **Motor Susah Dinyalakan / Starter Berat** (kata kunci: *nyala, starter, aki, mati, mogok*) -> Cek aki/accu, celah busi, filter & fuel pump, saklar standar samping.
2. **Motor Bergetar / Gredek di Kecepatan Rendah** (kata kunci: *getar, gredek, vibrasi, goyang*) -> Cek kampas ganda CVT, keausan roller, bearing roda, tapak ban.
3. **Rem Kurang Pakem / Berdecit** (kata kunci: *rem, pakem, decit, blong, kampas*) -> Cek ketebalan kampas rem, permukaan cakram/tromol, minyak rem, debu kaliper.
4. **Tarikan Berat / Tenaga Ngempos** (kata kunci: *berat, loyo, ngempos, tenaga, lelet*) -> Cek tekanan angin ban, saringan udara mesin, v-belt CVT, kekentalan oli mesin.
5. **Suara Mesin Kasar / Berisik** (kata kunci: *kasar, berisik, ngelitik, klotok*) -> Cek volume & kondisi oli mesin, celah klep, rantai keteng (tensioner), oli gardan matik.
6. **Stang Kemudi Oleng / Tidak Stabil** (kata kunci: *oleng, stabil, stang, komstir*) -> Cek bearing leher komstir, shockbreaker (kebocoran seal), tekanan ban seimbang.
7. **Mesin Cepat Panas / Overheat** (kata kunci: *panas, overheat, radiator, coolant*) -> Cek cairan radiator coolant, kipas pendingin otomatis, sirip radiator, sirkulasi oli.
- **Fallback**: Jika keluhan tidak dikenali, sistem mengembalikan pesan sopan untuk memeriksakan fisik kendaraan secara langsung ke teknisi bengkel terpercaya.
- **Disclaimer**: Seluruh rekomendasi ditandai sebagai rekomendasi awal panduan mandiri, bukan diagnosis teknis pasti.

---

## 7. Ringkasan Endpoint REST API

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | Root health check API |
| `GET` | `/api/motorcycles` | Ambil daftar semua motor |
| `POST` | `/api/motorcycles` | Daftarkan profil motor baru |
| `GET` | `/api/motorcycles/:id` | Ambil detail 1 motor |
| `PUT` | `/api/motorcycles/:id` | Perbarui data profil motor |
| `DELETE` | `/api/motorcycles/:id` | Hapus profil motor & data terkait |
| `GET` | `/api/motorcycles/:id/mileage` | Ambil riwayat kilometer motor |
| `POST` | `/api/motorcycles/:id/mileage` | Catat kilometer baru |
| `GET` | `/api/motorcycles/:id/services` | Ambil daftar riwayat servis motor |
| `POST` | `/api/motorcycles/:id/services` | Catat servis baru (+ auto-sync jadwal maintenance) |
| `PUT` | `/api/services/:id` | Perbarui data catatan servis |
| `DELETE` | `/api/services/:id` | Hapus catatan servis |
| `GET` | `/api/motorcycles/:id/maintenance` | Ambil jadwal maintenance (+ kalkulasi status dinamis) |
| `POST` | `/api/motorcycles/:id/maintenance` | Tambah jadwal maintenance baru |
| `PUT` | `/api/maintenance/:id` | Perbarui jadwal maintenance |
| `DELETE` | `/api/maintenance/:id` | Hapus jadwal maintenance |
| `GET` | `/api/motorcycles/:id/health-score` | Ambil Motorcycle Health Score motor |
| `POST` | `/api/motorcycles/:id/recommendation` | Evaluasi keluhan & ambil rekomendasi |
| `GET` | `/api/motorcycles/:id/dashboard` | Ambil data komprehensif dashboard dalam 1 request |

---

## 8. Panduan Build & Pengujian

- **Test Build Backend**:
  ```bash
  cd apps/api
  npm run build
  ```
- **Test Build Frontend**:
  ```bash
  cd apps/web
  npm run build
  ```
- **Prisma Studio (Opsional Visual Database GUI)**:
  ```bash
  cd apps/api
  npx prisma studio
  ```
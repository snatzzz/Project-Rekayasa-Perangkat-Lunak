# Smart Motorcycle Health & Maintenance System

Aplikasi web komprehensif untuk pemantauan kondisi motor, pencatatan odometer, riwayat servis bengkel, jadwal servis suku cadang otomatis, perhitungan *Motorcycle Health Score*, dan rekomendasi tindakan awal berbasis keluhan.

Dibuat untuk tugas besar mata kuliah **Rekayasa Perangkat Lunak (RPL) - Semester 3**.

---

## 1. Ringkasan Proyek & Fitur MVP

1. **Manajemen Profil Motor (Motor Saya):** Registrasi motor (merk, model, tahun, kilometer awal), pemilihan motor aktif, pembaruan profil, dan penghapusan unit.
2. **Pencatatan Kilometer (Odometer):** Riwayat penambahan kilometer dengan validasi logis (angka baru tidak boleh lebih rendah dari angka saat ini).
3. **Pencatatan Riwayat Servis:** Catatan transaksi bengkel (tanggal, jenis servis, biaya, odometer, catatan) dan sinkronisasi otomatis ke jadwal servis suku cadang terkait.
4. **Jadwal & Pengingat Maintenance Berkala:** Pemantauan interval jarak tempuh (KM) dan interval waktu (hari) dengan visual progress bar.
5. **Dynamic Maintenance Status:** Status dihitung *real-time* saat data diminta (`UPCOMING`, `DUE SOON`, `DUE`, `OVERDUE`).
6. **Explainable Motorcycle Health Score (0 - 100):** Skor transparan dengan penalti poin terukur (misal: -10 poin untuk item mendekati jadwal, -25 poin untuk item terlambat), dan status `INSUFFICIENT_DATA` jika belum ada jadwal.
7. **Rule-Based Recommendation:** Rekomendasi mandiri awal berbasis kata kunci keluhan otomotif (susah nyala, getar CVT, rem kurang pakem, tarikan berat, mesin kasar, stang oleng, overheat) lengkap dengan disclaimer.
8. **Dashboard Ringkas & Responsif:** Metrik utama dalam satu layar adaptif (mobile & desktop) dengan aksi cepat (*Quick Actions*).

---

## 2. Arsitektur Sistem & Tech Stack

```
[ Browser / Frontend: React 19 + Vite 8 + Tailwind CSS v4 ]
                          │
                   HTTP REST API (JSON)
                          ▼
       [ Backend: Node.js 24 + Express 5 + TypeScript ]
                          │
             [ Zod Schema & Validation Layer ]
                          │
             [ Prisma ORM 5.22 (Parameterized) ]
                          ▼
            [ Database: MySQL 8.0 in Docker ]
```

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React.
- **Backend:** Node.js 24 (ESM), Express 5, TypeScript, Zod, Prisma ORM 5.
- **Database:** MySQL 8.0 (Containerized via Docker Compose).
- **Testing:** Node.js Built-in Test Runner + `tsx`.

---

## 3. Prasyarat Sistem (Prerequisites)

Versi yang telah diverifikasi pada repositori ini:
- **Node.js:** `v24.21.0` (Minimal `v20.x`)
- **npm:** `11.19.0` (Minimal `v10.x`) — *Gunakan `npm.cmd` di Windows PowerShell jika policy skrip dibatasi*.
- **Git:** `2.55.0` atau versi stabil terbaru.
- **Docker & Docker Compose:** Docker Desktop (Engine `29.x` / Compose `v5.x` atau kompatibel).
- **Web Browser:** Google Chrome, Edge, Firefox, atau browser modern lainnya.

---

## 4. Panduan Fresh Clone & Struktur Direktori

Kloning repositori ke folder baru di komputer Anda menggunakan terminal PowerShell:

```powershell
git clone https://github.com/snatzzz/Project-Rekayasa-Perangkat-Lunak.git
cd Project-Rekayasa-Perangkat-Lunak
```

> **Catatan Struktur Folder:**  
> Seluruh kode aplikasi web dan backend berada di dalam subdirektori **`Project-FullAi`**:
> ```powershell
> cd Project-FullAi
> ```
> *Fresh clone tidak menyertakan folder `node_modules` atau file rahasia `.env`. Anda harus menginstal dependensi dan menyiapkan `.env` sesuai langkah berikut.*

---

## 5. Instalasi Dependensi

Instalasi dilakukan secara terpisah untuk backend dan frontend menggunakan lockfile yang kompatibel:

### A. Backend (`apps/api`)
```powershell
cd apps/api
npm.cmd ci
```

### B. Frontend (`apps/web`)
Buka terminal baru atau kembali ke direktori web:
```powershell
cd ../web
npm.cmd ci
```

---

## 6. Konfigurasi Environment (`.env`)

Backend memerlukan konfigurasi database dan port. Salin template `.env.example`:

```powershell
cd ../api
Copy-Item .env.example .env
```

Isi file `apps/api/.env`:
```env
PORT=3000
DATABASE_URL="mysql://motorcycle_user:motorcycle_password@localhost:3306/smart_motorcycle"
```
*Frontend terhubung ke `http://localhost:3000/api` secara default untuk pengembangan lokal.*

---

## 7. Menjalankan Database MySQL & Migrasi Prisma

Dari direktori `Project-FullAi`:

1. **Jalankan Kontainer MySQL:**
   ```powershell
   cd "c:\path\to\Project-Rekayasa-Perangkat-Lunak\Project-FullAi"
   docker compose up -d
   ```

2. **Pastikan Port Database Siap:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 3306
   ```

3. **Generate Prisma Client & Terapkan Migrasi (Non-Destruktif):**
   ```powershell
   cd apps/api
   npm.cmd run prisma:generate
   npx.cmd prisma migrate deploy
   ```

4. **Isi Data Awal / Seed Demo (Opsional namun Disarankan):**
   ```powershell
   npm.cmd run prisma:seed
   ```
   *Seed akan membuat motor contoh Honda Vario 160 lengkap dengan riwayat servis dan jadwal perawatan.*

---

## 8. Menjalankan Backend & Frontend

### Menjalankan Backend API:
```powershell
cd Project-FullAi/apps/api
npm.cmd run dev
```
- Berjalan pada: `http://localhost:3000`
- **Health Check Endpoint:** Buka browser atau uji via terminal:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/"
  # Output: {"message": "Smart Motorcycle API is running"}
  ```

### Menjalankan Frontend Web:
Buka terminal baru:
```powershell
cd Project-FullAi/apps/web
npm.cmd run dev
```
- Vite akan menampilkan URL aktif (biasanya `http://localhost:5173`). Buka URL tersebut di browser Anda.

---

## 9. Menjalankan Seluruh Unit Test

Backend dilengkapi dengan pengujian unit otomatis mencakup validasi schema dan kalkulasi logika bisnis:

```powershell
cd Project-FullAi/apps/api
npm.cmd test
```

### Cakupan Test Suite:
1. `src/schemas/maintenance.schema.test.ts`: Validasi tipe servis, interval KM/hari positif, format tanggal.
2. `src/schemas/mileage.schema.test.ts`: Validasi angka kilometer, penolakan nilai negatif, string kosong, atau tipe salah.
3. `src/schemas/motorcycle.schema.test.ts`: Validasi merk, model, tahun, odometer awal motor.
4. `src/schemas/service.schema.test.ts`: Validasi jenis servis, biaya non-negatif, catatan opsional.
5. `src/services/maintenanceCalculation.service.test.ts`: Kalkulasi dinamis status UPCOMING, DUE SOON, DUE, dan OVERDUE.
6. `src/services/healthScore.service.test.ts`: Perhitungan skor kesehatan 0-100, penalti poin, dan penanganan data kosong.
7. `src/services/recommendation.service.test.ts`: Pencocokan kata kunci keluhan dan pengembalian safe fallback.

**Hasil Pengujian:**
- Total File Pengujian: **7 file**
- Total Kasus Pengujian: **48 tests**
- Status: **48 Lulus (PASS), 0 Gagal, 0 Dibatalkan, 0 Dilewati**.

---

## 10. Build Produksi & Validasi Skema

Jalankan perintah verifikasi build untuk memastikan integritas kode:

1. **Validasi Skema Prisma:**
   ```powershell
   cd Project-FullAi/apps/api
   npx.cmd prisma validate
   ```
2. **Build Backend:**
   ```powershell
   npm.cmd run build
   ```
   *Memastikan tidak ada error tipe data TypeScript (`tsc --noEmit`).*

3. **Build Frontend:**
   ```powershell
   cd ../web
   npm.cmd run build
   ```
   *Mengompilasi aset produksi ke direktori `dist/`.*

---

## 11. Status Deployment & Batasan Akses

### Status Deployment Publik: **BLOCKED (Hanya untuk Lingkungan Lokal / Demo)**
- **Alasan Pemblokiran:**  
  Aplikasi tahap MVP ini belum memiliki lapisan autentikasi pengguna (login/password/JWT). Seluruh endpoint CRUD terbuka untuk akses lokal. Menempatkan API ini ke domain publik tanpa autentikasi dapat membahayakan data.
- **Langkah Deployment Produksi Mendatang:**
  1. Pasang modul autentikasi pengguna (misal: JSON Web Tokens atau OAuth).
  2. Tambahkan otorisasi kepemilikan motor (`userId` pada entitas `motorcycles`).
  3. Konfigurasi reverse proxy (seperti Nginx atau Caddy) dengan sertifikat SSL/TLS.
  4. Amankan kredensial database MySQL melalui secret manager atau Docker secrets.

---

## 12. Skenario Demonstrasi Singkat (Demo Walkthrough)

1. Buka aplikasi di browser (`http://localhost:5173`).
2. Masuk ke menu **Motor Saya** dan tambahkan motor baru (misal: "Yamaha NMAX", 2024, Odometer 5.000 KM).
3. Buka menu **Catat Odometer**, masukkan 5.500 KM (verifikasi bahwa input 4.000 KM ditolak oleh validasi sistem).
4. Buka menu **Jadwal Servis**, amati status dinamis dan progress bar setiap suku cadang.
5. Buka menu **Catat Servis**, tambahkan servis "Ganti Oli Mesin" pada 5.500 KM, lalu amati jadwal Oli Mesin otomatis tersinkronisasi.
6. Periksa **Health Score** di Dashboard untuk melihat transparansi rincian penalti nilai.
7. Buka menu **Rekomendasi**, ketik keluhan *"motor bergetar dan susah nyala"*, dan periksa panduan komponen rekomendasi yang dihasilkan.

---

## 13. Referensi Dokumentasi Lainnya

- [Panduan Troubleshooting & Log Aman](TROUBLESHOOTING.md)
- [Laporan Keamanan & Audit Dependensi](SECURITY_REVIEW.md)
- [Daftar Periksa Kelengkapan MVP](checklist_mvp.md)
- [Naskah Panduan Presentasi Demo](DEMO_SCRIPT.md)

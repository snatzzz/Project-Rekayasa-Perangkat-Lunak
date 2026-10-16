# Panduan Menjalankan Sistem (How To Run)
## Smart Motorcycle Health & Maintenance System

Dokumen ini berisi panduan komprehensif langkah-demi-langkah untuk menyiapkan, mengonfigurasi, dan menjalankan aplikasi **Smart Motorcycle Health & Maintenance System** pada lingkungan lokal (development).

---

### 1. Ringkasan Proyek & Lingkup MVP

Aplikasi ini merupakan sistem manajemen kesehatan dan jadwal perawatan sepeda motor berbasis web yang dirancang secara deterministik, mencakup:
1. **Manajemen Profil Motor**: Tambah, lihat daftar, detail, ubah profil, dan hapus data motor.
2. **Pencatatan Kilometer (Odometer)**: Tambah riwayat kilometer dengan validasi monotonik (tidak boleh mundur).
3. **Riwayat Servis**: Pencatatan log servis (tipe servis, tanggal, kilometer servis, biaya, dan catatan teknis) dengan sinkronisasi otomatis ke odometer dan jadwal perawatan terkait.
4. **Jadwal & Pengingat Servis**: Perhitungan otomatis status perawatan (`UPCOMING`, `DUE SOON`, `DUE`, `OVERDUE`) berdasarkan ambang batas interval jarak (KM) dan interval waktu (Hari).
5. **Skor Kesehatan Motor (Motorcycle Health Score)**: Perhitungan nilai kesehatan kendaraan skala 0–100 berdasarkan status pemenuhan jadwal perawatan.
6. **Rekomendasi Berbasis Keluhan**: Mesin rekomendasi deterministik berdasarkan kata kunci gejala motor dengan *safe fallback* untuk keluhan yang belum terdaftar.
7. **Dashboard Terintegrasi**: Tampilan metrik terpusat untuk memantau status kendaraan terpilih.

---

### 2. Prasyarat Sistem (Prerequisites)

Pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `>= 20.x` (disarankan Node.js 22 LTS / 24)
- **npm**: Versi `>= 10.x`
- **Docker Desktop**: Untuk menjalankan layanan MySQL database secara terisolasi.
- **Git**: Untuk manajemen repositori.
- **Web Browser Modern**: Google Chrome, Microsoft Edge, atau Mozilla Firefox.

---

### 3. Struktur Direktori Proyek

```text
Project-Rekayasa-Perangkat-Lunak/
├── Project-FullAi/
│   ├── docker-compose.yml          # Konfigurasi container database MySQL
│   ├── HowToRun.md                 # Panduan ini
│   ├── checklist_mvp.md            # Matriks verifikasi & hasil pengujian MVP
│   ├── DEMO_SCRIPT.md              # Skenario & narasi perekaman demonstrasi
│   ├── apps/
│   │   ├── api/                    # Backend REST API (Node.js, Express, Prisma)
│   │   │   ├── prisma/             # Schema database & migrasi Prisma
│   │   │   ├── src/                # Controllers, Routes, Schemas, Services
│   │   │   ├── package.json
│   │   │   └── .env.example
│   │   └── web/                    # Frontend SPA (React, Vite, Tailwind CSS)
│   │       ├── src/                # Pages, Components, Context, Services
│   │       ├── package.json
│   │       └── vite.config.ts
```

---

### 4. Konfigurasi Environment Variable (`.env`)

Backend memerlukan konfigurasi koneksi database. Masuk ke direktori `Project-FullAi/apps/api`:

Salin file `.env.example` menjadi `.env`:
```powershell
cd apps/api
copy .env.example .env
```

Isi konfigurasi default dalam `.env`:
```env
PORT=3000
DATABASE_URL="mysql://motorcycle_user:motorcycle_password@localhost:3306/smart_motorcycle"
```
*(Catatan: Kredensial di atas telah diselaraskan secara otomatis dengan service MySQL di `docker-compose.yml`)*.

---

### 5. Menjalankan Database MySQL (Docker Compose)

Dari direktori `Project-FullAi`:

1. Pastikan Docker Desktop sedang aktif di komputer Anda.
2. Jalankan container database MySQL di background:
   ```powershell
   docker compose up -d
   ```
3. Periksa status container:
   ```powershell
   docker ps
   ```
   *Container `smart-motorcycle-mysql` harus berada dalam status `Up` (Port `3306`).*

---

### 6. Menjalankan Backend API

Masuk ke direktori backend:
```powershell
cd apps/api
```

1. **Instalasi Dependensi** *(jika baru clone)*:
   ```powershell
   npm install
   ```

2. **Generate Prisma Client & Migrasi Schema**:
   ```powershell
   npx prisma generate
   npx prisma migrate dev
   ```
   *(Perintah ini menerapkan skema tabel `Motorcycle`, `MileageRecord`, `ServiceHistory`, dan `MaintenanceSchedule` secara non-destruktif).*

3. **Menjalankan Server Backend**:
   ```powershell
   npm run dev
   ```
   Backend aktif pada: **`http://localhost:3000`**  
   Cek endpoint health di browser atau terminal: `http://localhost:3000/`

---

### 7. Menjalankan Frontend Web

Buka terminal/PowerShell baru, lalu masuk ke direktori frontend:
```powershell
cd apps/web
```

1. **Instalasi Dependensi** *(jika baru clone)*:
   ```powershell
   npm install
   ```

2. **Menjalankan Dev Server**:
   ```powershell
   npm run dev
   ```
   Frontend aktif pada: **`http://localhost:5173`**

---

### 8. Menjalankan Unit Test & Build

#### Menjalankan Seluruh Unit Test (Backend)
Buka direktori `apps/api` dan jalankan:
```powershell
npm test
```
*Perintah ini menjalankan 48 unit test (mencakup seluruh validasi schema Zod dan kalkulasi business service) menggunakan Node.js Test Runner bawaan.*

#### Memvalidasi Build Produksi
- **Backend Build Validation**:
  ```powershell
  cd apps/api
  npm run build
  npx prisma validate
  ```
- **Frontend Build Validation**:
  ```powershell
  cd apps/web
  npm run build
  ```

---

### 9. Prosedur Uji Coba / Skenario Demonstrasi

Buka peramban di `http://localhost:5173`:
1. **Navigasi ke Halaman "Motor"**:
   - Klik tombol **"Tambah Motor"**, isi Merk (misal: `Yamaha`), Model (`Aerox 155`), Tahun (`2023`), Odometer (`12000`). Simpan.
   - Edit motor yang baru dibuat untuk memperbarui model menjadi `Aerox 155 Connected`.
2. **Navigasi ke Halaman "Kilometer"**:
   - Pilih motor `Yamaha Aerox 155 Connected`.
   - Masukkan kilometer baru: `12500` KM. Odometer berhasil bertambah dan tercatat di riwayat.
   - Uji batas validasi dengan mencoba memasukkan angka lebih rendah (misal: `11000` KM). Sistem akan menampilkan pesan error penolakan.
3. **Navigasi ke Halaman "Servis"**:
   - Tambah riwayat servis: Tipe `Ganti Oli Mesin`, Biaya `150000`, Kilometer `12500`, Catatan `Oli Yamalube Full Synthetic`. Simpan.
4. **Navigasi ke Halaman "Jadwal Perawatan"**:
   - Tambah jadwal servis berkala: Tipe `Ganti Oli Mesin`, Interval KM `3000`, Interval Hari `60`, Terakhir Servis KM `12500`.
   - Lihat kalkulasi status dinamis (`UPCOMING`).
5. **Navigasi ke Halaman "Rekomendasi"**:
   - Ketik keluhan umum: *"Mesin susah hidup dan starter bunyi cetek"*. Lihat analisis penyebab kemungkinan, tingkat urgensi (*TINGGI*), dan estimasi biaya.
   - Ketik keluhan tidak dikenal: *"Klakson berbunyi aneh seperti terompet"*. Sistem tetap merespons dengan rekomendasi *safe fallback* umum.
6. **Kembali ke "Dashboard"**:
   - Amati *Motorcycle Health Score* (100 - Kondisi Prima), jadwal servis terdekat, riwayat kilometer terakhir, dan ringkasan riwayat servis.

---

### 10. Pemecahan Masalah (Troubleshooting)

- **Port 3306 atau 3000 bentrok (Already in use)**:
  Pastikan tidak ada instance MySQL lokal bawaan XAMPP/WAMP atau node process lain yang berjalan di background.
- **Koneksi Database Gagal**:
  Jalankan `docker ps` untuk memastikan container MySQL aktif. Jika berhenti, jalankan kembali dengan `docker compose up -d`.
- **File Konfigurasi & Bukti Verifikasi**:
  - Matriks pengujian lengkap: [checklist_mvp.md](./checklist_mvp.md)
  - Naskah perekaman video: [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

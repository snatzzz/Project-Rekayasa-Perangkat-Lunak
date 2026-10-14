# DOKUMENTASI PENYEMPURNAAN MVP — SMART MOTORCYCLE HEALTH & MAINTENANCE SYSTEM

Dokumen ini disusun untuk memenuhi ketentuan tugas Rekayasa Perangkat Lunak: **Penyempurnaan MVP** secara iteratif berbasis AI Agent (Antigravity IDE pair-programming).

---

## 1. PROJECT OVERVIEW & DEFINISI MVP

### 1.1 Definisi MVP
**Smart Motorcycle Health & Maintenance System MVP (Minimum Viable Product)** adalah versi fungsional minimum dari sistem pemantauan kondisi kendaraan roda dua yang memungkinkan pemilik motor mengelola profil motor, mencatat riwayat penambahan kilometer, merekam riwayat servis bengkel, memantau jadwal perawatan berkala, serta memperoleh kalkulasi skor kesehatan motor (*Health Score*) dan rekomendasi keluhan awal berbasis aturan (*rule-based*).

### 1.2 Batasan MVP (Constraints)
- Tidak menggunakan autentikasi/login yang rumit.
- Tidak bergantung pada modul IoT fisik atau GPS tracker.
- Tidak menyertakan payment gateway, sistem booking bengkel, atau live chat.
- Menggunakan deterministic business rules (kalkulasi murni berbasis aturan dan rumus matematika terprediksi, bukan model black-box/AI gelap yang tidak dapat dijelaskan).
- Frontend terhubung langsung ke backend melalui REST API dan persisted ke MySQL menggunakan Prisma ORM.

---

## 2. DOKUMENTASI 5 USER STORIES & ACCEPTANCE CRITERIA

### USER STORY 1 — Motorcycle Profile
- **User Story:** Sebagai pemilik sepeda motor, saya ingin dapat menambah, melihat, memperbarui, dan menghapus profil sepeda motor saya sehingga sistem dapat mengelola data identitas kendaraan yang benar.
- **Business Goal:** Menyimpan data dasar motor (brand, model, tahun, currentMileage) sebagai entitas utama untuk semua fitur operasional.
- **Acceptance Criteria:**
  - AC-1.1: Pengguna dapat membuat motor dengan field wajib: `brand`, `model`, `year`, `currentMileage`.
  - AC-1.2: Sistem menolak input string kosong atau spasi pada brand dan model.
  - AC-1.3: Tahun divalidasi antara 1950 hingga tahun depan; kilometer awal tidak boleh negatif.
  - AC-1.4: Pengguna dapat mengambil semua motor (`GET /api/motorcycles`) dan mengambil motor berdasarkan ID (`GET /api/motorcycles/:id`).
  - AC-1.5: Pengguna dapat memperbarui data motor secara parsial (`PUT /api/motorcycles/:id`).
  - AC-1.6: Pengguna dapat menghapus motor (`DELETE /api/motorcycles/:id`).
  - AC-1.7: ID tidak valid menghasilkan HTTP 400, dan motor tidak ditemukan menghasilkan HTTP 404.
  - AC-1.8: Data tersimpan persisten di MySQL via Prisma, bukan hanya di state browser.
- **Implementation Status:** COMPLETED.
- **Relevant Files:**
  - `apps/api/src/schemas/motorcycle.schema.ts`
  - `apps/api/src/controllers/motorcycle.controller.ts`
  - `apps/api/src/routes/motorcycle.routes.ts`
  - `apps/web/src/pages/MotorcyclesPage.tsx`
- **Unit Test File:** `apps/api/src/schemas/motorcycle.schema.test.ts` (6 test cases).

---

### USER STORY 2 — Mileage Recording
- **User Story:** Sebagai pemilik sepeda motor, saya ingin mencatat penambahan kilometer terbaru dan melihat riwayatnya agar dapat memantau akumulasi jarak tempuh kendaraan saya.
- **Business Goal:** Menjaga keakuratan odometer motor sebagai variabel utama perhitungan interval servis suku cadang.
- **Acceptance Criteria:**
  - AC-2.1: Pengguna dapat mencatat kilometer baru untuk motor yang dipilih (`POST /api/motorcycles/:id/mileage`).
  - AC-2.2: Mileage harus bilangan bulat (integer) dan tidak boleh negatif.
  - AC-2.3: Input kosong (`""`), spasi, null, boolean, array, dan pecahan ditolak.
  - AC-2.4: Numeric string valid dikonversi ke integer secara aman.
  - AC-2.5: Kilometer baru tidak boleh lebih rendah dari `currentMileage` motor saat ini.
  - AC-2.6: Catatan mileage terhubung dengan `motorcycleId` yang sesuai.
  - AC-2.7: Penyimpanan mileage memperbarui `currentMileage` pada tabel `motorcycles` dalam satu transaksi Prisma.
  - AC-2.8: Riwayat mileage dapat diambil dan diurutkan dari waktu pencatatan terbaru (`desc`).
  - AC-2.9: Pengajuan mileage tidak valid tidak akan mengubah `currentMileage` motor.
  - AC-2.10: Frontend dan API memberikan umpan balik sukses/gagal yang jelas.
- **Implementation Status:** COMPLETED.
- **Relevant Files:**
  - `apps/api/src/schemas/mileage.schema.ts`
  - `apps/api/src/controllers/mileage.controller.ts`
  - `apps/web/src/pages/MileagePage.tsx`
- **Unit Test File:** `apps/api/src/schemas/mileage.schema.test.ts` (10 test cases).

---

### USER STORY 3 — Service History
- **User Story:** Sebagai pemilik sepeda motor, saya ingin mencatat riwayat servis bengkel dan melihat riwayatnya agar dapat melacak riwayat perawatan yang telah dilakukan pada motor saya.
- **Business Goal:** Mendokumentasikan jenis pekerjaan, tanggal servis, odometer saat servis, biaya, dan catatan teknis bengkel.
- **Acceptance Criteria:**
  - AC-3.1: Pengguna dapat menambahkan data riwayat servis untuk motor yang dipilih (`POST /api/motorcycles/:id/services`).
  - AC-3.2: Field data wajib mencakup `serviceType`, `serviceDate`, `mileage`, `cost`, dan catatan bersifat opsional.
  - AC-3.3: Input tidak valid seperti mileage negatif, biaya negatif, atau string jenis servis kosong ditolak.
  - AC-3.4: Permintaan servis untuk motor yang tidak ditemukan menghasilkan HTTP 404.
  - AC-3.5: Riwayat servis motor dapat diambil melalui endpoint `GET /api/motorcycles/:id/services`.
  - AC-3.6: Riwayat disajikan terurut berdasarkan tanggal servis terbaru (`desc`).
  - AC-3.7: Jika servis memiliki odometer lebih tinggi dari `currentMileage` motor, sistem memperbarui `currentMileage` motor dan menyinkronkan jadwal maintenance yang namanya cocok.
  - AC-3.8: Pengguna dapat memperbarui (`PUT /api/services/:id`) atau menghapus (`DELETE /api/services/:id`) data servis.
- **Implementation Status:** COMPLETED.
- **Relevant Files:**
  - `apps/api/src/schemas/service.schema.ts`
  - `apps/api/src/controllers/service.controller.ts`
  - `apps/web/src/pages/ServicesPage.tsx`
- **Unit Test File:** `apps/api/src/schemas/service.schema.test.ts` (7 test cases).

---

### USER STORY 4 — Maintenance Schedule and Reminders
- **User Story:** Sebagai pemilik sepeda motor, saya ingin mengelola jadwal perawatan berkala sehingga saya dapat mengidentifikasi komponen yang berstatus aman, mendekati jadwal servis, maupun yang sudah jatuh tempo/terlewat batas.
- **Business Goal:** Memberikan pengingat visual dinamis berdasarkan batasan kilometer (`intervalKm`) maupun waktu (`intervalDays`) untuk setiap komponen (misal: Oli Mesin, Busi, V-Belt, dsb).
- **Acceptance Criteria:**
  - AC-4.1: Pengguna dapat membuat jadwal maintenance untuk motor yang dipilih (`POST /api/motorcycles/:id/maintenance`).
  - AC-4.2: Data jadwal memuat `maintenanceType`, `intervalKm` (> 0), `intervalDays` (> 0), `lastServiceMileage` (>= 0), dan `lastServiceDate`.
  - AC-4.3: Interval non-positif (0 atau negatif) ditolak oleh schema validasi.
  - AC-4.4: Status jadwal dihitung secara dinamis (*real-time*):
    - `OVERDUE`: Jarak tempuh tersisa (`remainingKm`) <= 0 KM atau sisa hari (`remainingDays`) <= 0 hari.
    - `DUE`: `remainingKm` <= 5% dari interval atau `remainingDays` <= 3 hari.
    - `DUE SOON`: `remainingKm` <= 10% dari interval atau `remainingDays` <= 7 hari.
    - `UPCOMING`: Kondisi aman di luar ambang batas di atas.
  - AC-4.5: Menghitung persentase progres pemakaian suku cadang (`progressPercent` 0–100%).
  - AC-4.6: Pengguna dapat memperbarui (`PUT /api/maintenance/:id`) dan menghapus (`DELETE /api/maintenance/:id`) jadwal.
  - AC-4.7: Frontend menampilkan progress bar visual dengan badge status yang sesuai.
- **Implementation Status:** COMPLETED.
- **Relevant Files:**
  - `apps/api/src/schemas/maintenance.schema.ts`
  - `apps/api/src/services/maintenanceCalculation.service.ts`
  - `apps/api/src/controllers/maintenance.controller.ts`
  - `apps/web/src/pages/MaintenancePage.tsx`
- **Unit Test Files:**
  - `apps/api/src/schemas/maintenance.schema.test.ts` (7 test cases).
  - `apps/api/src/services/maintenanceCalculation.service.test.ts` (7 test cases).

---

### USER STORY 5 — Motorcycle Health Score and Recommendations
- **User Story:** Sebagai pemilik sepeda motor, saya ingin mendapatkan evaluasi kesehatan motor secara menyeluruh (*Health Score*) serta rekomendasi awal berdasarkan keluhan gejala motor saya agar saya tahu tindakan perawatan yang perlu diambil.
- **Business Goal:** Menyediakan indikator kesehatan komprehensif (skala 0–100) dan panduan teknis awal saat motor mengalami gangguan performa.
- **Acceptance Criteria:**
  - AC-5.1: Health Score dihitung secara deterministik dari base score 100:
    - Setiap komponen `OVERDUE` atau `DUE`: dikurangi 25 poin.
    - Setiap komponen `DUE SOON`: dikurangi 10 poin.
    - Nilai dikurung (*clamped*) di rentang 0 hingga 100.
  - AC-5.2: Label status Health Score:
    - `GOOD`: Skor >= 80.
    - `FAIR`: Skor 60–79.
    - `NEEDS_ATTENTION`: Skor < 60.
    - `INSUFFICIENT_DATA`: Jika belum ada jadwal maintenance yang didaftarkan.
  - AC-5.3: Rekomendasi mendeteksi kata kunci keluhan (seperti "nyala/starter", "getar/gredek", "rem/blong/decit", "panas/overheat/radiator") dan memberikan arahan komponen terkait serta tingkat urgensi (`TINGGI`/`SEDANG`/`STANDAR`).
  - AC-5.4: Keluhan yang tidak dikenali mengembalikan respons fallback aman dengan instruksi konsultasi teknisi bengkel.
  - AC-5.5: Setiap rekomendasi menyertakan disclaimer bahwa saran bersifat bantuan awal berbasis aturan, bukan vonis mutlak bengkel.
  - AC-5.6: Dashboard dan Halaman Rekomendasi menangani state loading, empty, dan null secara aman tanpa menyebabkan runtime crash.
- **Implementation Status:** COMPLETED.
- **Relevant Files:**
  - `apps/api/src/services/healthScore.service.ts`
  - `apps/api/src/services/recommendation.service.ts`
  - `apps/api/src/controllers/healthScore.controller.ts`
  - `apps/api/src/controllers/recommendation.controller.ts`
  - `apps/web/src/pages/DashboardPage.tsx`
  - `apps/web/src/pages/RecommendationPage.tsx`
- **Unit Test Files:**
  - `apps/api/src/services/healthScore.service.test.ts` (5 test cases).
  - `apps/api/src/services/recommendation.service.test.ts` (6 test cases).

---

## 3. UNIT TEST SUITE (7 TEST FILES & 48 TEST CASES)

Project memiliki **7 berkas unit test terpisah** yang menguji seluruh aturan bisnis inti:

| No | Berkas Test | Domain yang Diuji | Jumlah Test | Hasil |
|---|---|---|:---:|:---:|
| 1 | `apps/api/src/schemas/motorcycle.schema.test.ts` | Validasi brand, model, tahun motor, dan kilometer awal | 6 | **PASS** |
| 2 | `apps/api/src/schemas/mileage.schema.test.ts` | Validasi tipe mileage, empty string, desimal, tipe invalid, dan tanggal | 10 | **PASS** |
| 3 | `apps/api/src/schemas/service.schema.test.ts` | Validasi data servis, biaya/kilometer negatif, format tanggal, update parsial | 7 | **PASS** |
| 4 | `apps/api/src/schemas/maintenance.schema.test.ts` | Validasi interval > 0, kilometer negatif, dan format tanggal | 7 | **PASS** |
| 5 | `apps/api/src/services/maintenanceCalculation.service.test.ts` | Kalkulasi status `UPCOMING`, `DUE SOON`, `DUE`, `OVERDUE`, dan progres persen | 7 | **PASS** |
| 6 | `apps/api/src/services/healthScore.service.test.ts` | Perhitungan penalti skor, clamping 0–100, status `GOOD`/`FAIR`/`NEEDS_ATTENTION`/`INSUFFICIENT_DATA` | 5 | **PASS** |
| 7 | `apps/api/src/services/recommendation.service.test.ts` | Validasi input keluhan, keyword matching, tingkat urgensi, dan fallback respons | 6 | **PASS** |

**Total Keseluruhan:** **7 Unit Test Files, 48 Test Cases (100% Lulus / 0 Gagal)**

Perintah eksekusi:
```powershell
npm.cmd test
```
*Output:*
```text
> api@1.0.0 test
> node --import tsx --test src/schemas/*.test.ts src/services/*.test.ts

ℹ tests 48
ℹ suites 0
ℹ pass 48
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 498.6338
```

---

## 4. HASIL VERIFIKASI APLIKASI (BUILD & RUNTIME)

### 4.1 Automated Build Verification
1. **Backend TypeScript Check:**
   - Perintah: `npm.cmd run build` (di `apps/api`)
   - Hasil: **PASS** (`tsc --noEmit` sukses tanpa error tipe data).
2. **Prisma ORM Schema:**
   - Perintah: `npx.cmd prisma validate` (di `apps/api`)
   - Hasil: **PASS** (`The schema at prisma\schema.prisma is valid 🚀`).
3. **Frontend Production Build:**
   - Perintah: `npm.cmd run build` (di `apps/web`)
   - Hasil: **PASS** (`tsc -b && vite build` sukses menghasilkan production bundle di `dist/`).

### 4.2 End-to-End API Verification
Pengujian alur penuh 5 User Story menggunakan PowerShell terhadap server API aktual (`http://127.0.0.1:3000/api`):
- **Motorcycle Profile:** Berhasil membuat motor uji (`Yamaha Aerox 155 Test`, id=4) dan mengambil datanya.
- **Mileage Recording:** Berhasil memperbarui mileage ke 6500 KM. Pengajuan nilai lebih rendah (4000 KM) ditolak dengan status HTTP 400.
- **Service History:** Berhasil membuat riwayat servis `Ganti Oli Mesin` (id=1, biaya Rp 85.000).
- **Maintenance Schedule:** Berhasil mendaftarkan jadwal perawatan berkala dengan kalkulasi status otomatis.
- **Health Score & Recommendation:** Berhasil menghitung Health Score (75/100, FAIR) dan mencocokkan keluhan `"motor bergetar dan gredek saat tarikan awal"` ke topik `Motor Bergetar / Gredek di Kecepatan Rendah` (Urgensi SEDANG).
- **Cleanup:** Motor uji dibersihkan secara aman tanpa mengganggu data lain.

### 4.3 Frontend Runtime Error Resolution
- Masalah runtime crash (`Cannot destructure property 'healthScore' of 'data' as it is null`) pada `DashboardPage.tsx` telah diselesaikan dengan:
  - Mengubah loading guard menjadi ketat `if (loading)`.
  - Menambahkan null guard eksplisit `if (!data)` yang menampilkan `EmptyState` informatif.
  - Menghapus non-null assertion operator `data!`.
  - Menambahkan styling status `INSUFFICIENT_DATA` untuk motor yang baru didaftarkan.

---

## 5. CATATAN GIT COMMITS

Sesuai instruksi pemisahan commit antara kode produksi dan unit test:

1. **Commit Produksi 1 (Feature 1 - Motorcycle Profile):**
   - Hash: `eff4703`
   - Pesan: `fix: validate motorcycle profile inputs and add tests`
2. **Commit Produksi 2 (Feature 2 - Mileage Recording):**
   - Hash: `15dbf3e`
   - Pesan: `feat: add mileage validation schema and unit tests with Zod`
3. **Commit Produksi 3 (Frontend Dashboard Runtime Safety):**
   - Hash: `7fafc48`
   - Pesan: `fix: improve loading state handling and data availability check in DashboardPage`
4. **Commit Unit Tests (5+ Test Files untuk Business Rules MVP):**
   - Hash: `25c1ba8`
   - Pesan: `test: add unit tests for MVP business rules`

---

## 6. PANDUAN MENJALANKAN APLIKASI & SKENARIO DEMO DOSEN

### 6.1 Cara Menjalankan Aplikasi
1. **Jalankan Database MySQL (Docker):**
   ```powershell
   cd "c:\Pradita Univ\Semester 3\rpl\Project\Project-Rekayasa-Perangkat-Lunak\Project-FullAi"
   docker compose up -d
   ```
2. **Jalankan Backend API:**
   ```powershell
   cd "c:\Pradita Univ\Semester 3\rpl\Project\Project-Rekayasa-Perangkat-Lunak\Project-FullAi\apps\api"
   npm.cmd run dev
   ```
   *API aktif di `http://localhost:3000`.*
3. **Jalankan Frontend Web:**
   ```powershell
   cd "c:\Pradita Univ\Semester 3\rpl\Project\Project-Rekayasa-Perangkat-Lunak\Project-FullAi\apps\web"
   npm.cmd run dev
   ```
   *Buka antarmuka di `http://localhost:5173`.*
4. **Menjalankan Seluruh Unit Test:**
   ```powershell
   cd "c:\Pradita Univ\Semester 3\rpl\Project\Project-Rekayasa-Perangkat-Lunak\Project-FullAi\apps\api"
   npm.cmd test
   ```

### 6.2 Skenario Demo untuk Dosen (5 User Stories)
1. **Demo Story 1 (Motorcycle Profile):**
   - Buka menu **Motor Saya**. Tambahkan motor baru (misal: "Honda Vario 160", tahun 2023, kilometer awal 15.000 KM). Motor akan muncul di dropdown navbar dan kartu profil.
2. **Demo Story 2 (Mileage Recording):**
   - Buka menu **Pencatatan KM**. Masukkan angka 16.000 KM lalu klik perbarui. Odometer akan naik dan tercatat di riwayat bawah. Coba masukkan angka 10.000 KM, sistem akan menampilkan pesan penolakan.
3. **Demo Story 3 (Service History):**
   - Buka menu **Riwayat Servis**. Tambah servis "Ganti Oli Mesin", masukkan biaya Rp 85.000 dan odometer 16.000 KM. Data tersimpan di tabel riwayat servis.
4. **Demo Story 4 (Maintenance Schedule):**
   - Buka menu **Jadwal Servis**. Lihat komponen "Ganti Oli Mesin". Progress bar terisi dinamis dan menampilkan sisa kilometer serta status (UPCOMING / DUE SOON / DUE / OVERDUE).
5. **Demo Story 5 (Health Score & Recommendation):**
   - Buka menu **Dashboard**: periksa nilai Health Score (skala 0-100) dan penjelasan detail penalti poinnya.
   - Buka menu **Rekomendasi**: ketik keluhan `"motor bergetar dan gredek saat tarikan awal"`, sistem rule-based akan merekomendasikan pemeriksaan mangkok kopling CVT dan roller.

---

## 7. KONTRIBUSI AI AGENT & REVIEW MAHASISWA

- **Kontribusi AI Agent:**
  - Mengidentifikasi celah schema pada seluruh endpoint MVP.
  - Memperbaiki penanganan `z.preprocess()` agar input kosong, tipe invalid, dan boolean ditolak dengan benar.
  - Menulis 5 berkas test suite baru (`service.schema.test.ts`, `maintenance.schema.test.ts`, `maintenanceCalculation.service.test.ts`, `healthScore.service.test.ts`, dan `recommendation.service.test.ts`).
  - Mengonfigurasi `package.json` backend agar mengeksekusi seluruh 7 berkas unit test (48 test cases) secara otomatis.
  - Menghilangkan bug dereferensi null `data!` pada halaman Dashboard.
- **Review Mahasiswa:**
  - Mahasiswa menguji langsung responsibilitas halaman dan memvalidasi bahwa seluruh kalkulasi Health Score bersifat transparan dan dapat dipresentasikan di hadapan dosen penguji.
  - Mahasiswa memastikan seluruh pengujian API dan unit test dijalankan secara nyata pada environment lokal.

---
*Dokumen ini diperbarui secara otomatis berdasarkan eksekusi nyata pada environment Antigravity IDE.*

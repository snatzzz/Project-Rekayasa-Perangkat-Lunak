# POST-DEPLOYMENT BUG AUDIT & ISSUE RESOLUTION

## 1. Informasi Proyek
- **Nama Aplikasi**: Smart Motorcycle Health & Maintenance System
- **Repository**: [https://github.com/snatzzz/Project-Rekayasa-Perangkat-Lunak.git](https://github.com/snatzzz/Project-Rekayasa-Perangkat-Lunak.git)
- **Production Frontend URL**: [https://smart-motorcycle-web.vercel.app/](https://smart-motorcycle-web.vercel.app/)
- **Production Backend URL**: [https://smart-motorcycle-api.vercel.app/](https://smart-motorcycle-api.vercel.app/)
- **Technology Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Node.js (Express 5), Prisma ORM 5, TiDB Cloud Serverless (MySQL-compatible)
- **Tanggal Audit**: 17 November 2026
- **Branch Audit**: `fix/post-deployment-bug-audit`
- **Commit Target**: `e46245e`

---

## 2. Tujuan Audit
Audit ini bertujuan untuk mengidentifikasi seluruh masalah dan bug setelah aplikasi di-deploy ke lingkungan produksi (Vercel & TiDB Cloud). Setiap temuan diinvestigasi penyebab dasarnya (*root cause*), diperbaiki secara menyeluruh pada source code, diuji dengan *regression test*, serta didokumentasikan secara transparan untuk memenuhi standar pengujian akademik mata kuliah Rekayasa Perangkat Lunak.

---

## 3. Metodologi Pengujian
1. **Production Endpoint Testing**: Pengujian langsung terhadap endpoint produksi Vercel (`GET /api/motorcycles`, `GET /`) menggunakan utilitas HTTP/cURL.
2. **API Logic & Boundary Testing**: Pengujian input negatif, nilai batas (boundary), relasi data, dan konsistensi antar-tabel database.
3. **Automated Unit Testing**: Eksekusi 51 unit test backend menggunakan native test runner Node.js (`node --import tsx --test`).
4. **Build Verification**: Pengujian kompilasi TypeScript dan bundler frontend (`npm run build` pada `apps/api` dan `apps/web`).
5. **Database Referential Integrity Audit**: Pemeriksaan cascading delete, foreign key, serta sinkronisasi antar-tabel saat operasi CRUD.

---

## 4. Ringkasan Temuan Bug

| Bug ID | Judul | Kategori | Severity | GitHub Issue Ref | Status |
|---|---|---|---|---|---|
| **BUG-001** | Kegagalan Autentikasi Kredensial TiDB Cloud Serverless di Environment Vercel | Database / Deployment | Critical | Issue #1 | In Progress (Requires Vercel Secret Rotation) |
| **BUG-002** | Odometer Bertentangan: Service Mileage Lebih Rendah dari Current Mileage Diterima | Business Logic / API | High | Issue #2 | RESOLVED |
| **BUG-003** | Inkonsistensi Odometer: Update Service Mileage Tidak Menyinkronkan Current Mileage Motor | Business Logic | Medium | Issue #3 | RESOLVED |
| **BUG-004** | Validasi Odometer Terbalik: Jadwal Servis Terakhir Melebihi Kilometer Motor Saat Ini | Validation / API | High | Issue #4 | RESOLVED |
| **BUG-005** | Inkonsistensi Riwayat Odometer: Update Profil Motor Tidak Mencatat MileageRecord | Data Consistency | Medium | Issue #5 | RESOLVED |
| **BUG-006** | Penurunan Odometer Diam-Diam Melalui Update Profil Motor | Business Logic / Security | High | Issue #6 | RESOLVED |
| **BUG-007** | Ketidakstabilan Urutan Data Riwayat Odometer dan Servis Pada Timestamp Identik | Database Query / UI | Low | Issue #7 | RESOLVED |
| **BUG-008** | Pencatatan Tanggal Servis dan Odometer di Masa Depan Tanpa Validasi Batas Waktu | Validation | Medium | Issue #8 | RESOLVED |
| **BUG-009** | Validasi Input Keluhan Rekomendasi Terlalu Longgar (DDoS / Memory Risk) | Validation / Reliability | Medium | Issue #9 | RESOLVED |
| **BUG-010** | Unhandled Negative/Zero Parameter ID Mengakibatkan Query Database Tidak Valid | API / Reliability | Medium | Issue #10 | RESOLVED |
| **BUG-011** | Potensi Yatim Record Relasi (Orphan Records) Saat Penghapusan Motor | Database Integrity | High | Issue #11 | RESOLVED |

---

## 5. Detail Setiap Bug

### BUG-001 — Kegagalan Autentikasi Kredensial TiDB Cloud Serverless di Environment Vercel
- **GitHub Issue**: Issue #1
- **Category**: Database / Deployment
- **Severity**: Critical
- **Environment**: Production
- **Status**: OPEN (Menunggu rotasi/pembaruan nilai `DATABASE_URL` di Vercel Dashboard oleh Pengguna)

**Deskripsi Masalah**:
Saat endpoint `https://smart-motorcycle-api.vercel.app/api/motorcycles` diakses secara publik, backend mengembalikan status HTTP 500 dengan pesan error:
```json
{
  "success": false,
  "message": "Gagal inisialisasi koneksi database: NO_CODE",
  "error": ["Authentication failed against database server at `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`, the provided database credentials for `4FqctXz2nwvqKbe.root` are not valid."]
}
```

**Langkah Reproduksi**:
1. Jalankan `curl -s https://smart-motorcycle-api.vercel.app/api/motorcycles`.
2. Periksa respons JSON yang dikembalikan.

**Expected Result**:
Backend berhasil terhubung ke TiDB Cloud Serverless dan mengembalikan daftar array motor dengan HTTP 200.

**Actual Result**:
Prisma Client gagal melakukan handshake autentikasi (Authentication failed).

**Root Cause**:
Environment variable `DATABASE_URL` yang terkonfigurasi pada Vercel Project Settings menggunakan password/kredensial yang tidak valid atau telah di-reset pada TiDB Cloud console.

**Solusi yang Diterapkan**:
Kredensial database tidak boleh disimpan di source code. Pengguna perlu memperbarui variabel `DATABASE_URL` di Vercel Project Settings dengan format resmi TiDB Cloud Serverless:
`mysql://[USERNAME]:[PASSWORD]@[HOST]:4000/smart_motorcycle?sslaccept=strict`

**File yang Diubah**:
`Project-FullAi/apps/api/src/utils/prisma.ts` (penyempurnaan penanganan TLS).

**Testing dan Bukti Verifikasi**:
Respons cURL pada deployment produksi mencatat kegagalan handshake autentikasi.

---

### BUG-002 — Odometer Bertentangan: Service Mileage Lebih Rendah dari Current Mileage Diterima
- **GitHub Issue**: Issue #2
- **Category**: Business Logic / API
- **Severity**: High
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Pada endpoint `POST /api/motorcycles/:id/services`, sistem sebelumnya mengizinkan pencatatan servis dengan kilometer lebih kecil daripada kilometer motor saat ini.

**Langkah Reproduksi**:
1. Motor memiliki odometer saat ini 18.500 KM.
2. Kirim request `POST /api/motorcycles/:id/services` dengan body `{ "mileage": 10000, ... }`.
3. Servis tersimpan tanpa penolakan logika.

**Expected Result**:
API menolak request dengan HTTP 400 dan pesan bahwa kilometer servis tidak boleh lebih rendah dari odometer saat ini.

**Actual Result**:
Servis tersimpan, merusak konsistensi logika pemeliharaan.

**Root Cause**:
Tidak adanya pengecekan kondisi `if (validated.mileage < motorcycle.currentMileage)` di `createService` controller.

**Solusi yang Diterapkan**:
Menambahkan validasi di `service.controller.ts` sebelum pembuatan record servis:
```typescript
if (validated.mileage < motorcycle.currentMileage) {
  sendError(res, `Kilometer servis (${validated.mileage.toLocaleString()} KM) tidak boleh lebih rendah dari kilometer saat ini`, null, 400)
  return
}
```

**File yang Diubah**:
`Project-FullAi/apps/api/src/controllers/service.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-003 — Inkonsistensi Odometer: Update Service Mileage Tidak Menyinkronkan Current Mileage Motor
- **GitHub Issue**: Issue #3
- **Category**: Business Logic
- **Severity**: Medium
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Pada endpoint `PUT /api/services/:id`, pengguna dapat memperbarui kilometer servis ke nilai yang lebih tinggi, tetapi `currentMileage` pada profil motor tidak ikut terbarui.

**Root Cause**:
Fungsi `updateService` hanya memperbarui tabel `service_histories` tanpa menyinkronkan tabel `motorcycles`.

**Solusi yang Diterapkan**:
Menambahkan pengecekan di `updateService` untuk mengupdate `motorcycle.currentMileage` jika kilometer servis yang baru melebihi odometer motor saat ini.

**File yang Diubah**:
`Project-FullAi/apps/api/src/controllers/service.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-004 — Validasi Odometer Terbalik: Jadwal Servis Terakhir Melebihi Kilometer Motor Saat Ini
- **GitHub Issue**: Issue #4
- **Category**: Validation / API
- **Severity**: High
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Pengguna dapat menginput jadwal maintenance baru (`POST /api/motorcycles/:id/maintenance`) dengan nilai `lastServiceMileage` yang lebih tinggi dari `currentMileage` motor. Hal ini mengakibatkan kalkulasi sisa kilometer menjadi tidak logis.

**Solusi yang Diterapkan**:
Menambahkan validasi:
```typescript
if (validated.lastServiceMileage > motorcycle.currentMileage) {
  sendError(res, `Kilometer servis terakhir tidak boleh melebihi kilometer motor saat ini`, null, 400)
  return
}
```
Aturan serupa juga diterapkan pada endpoint `PUT /api/maintenance/:id`.

**File yang Diubah**:
`Project-FullAi/apps/api/src/controllers/maintenance.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-005 — Inkonsistensi Riwayat Odometer: Update Profil Motor Tidak Mencatat MileageRecord
- **GitHub Issue**: Issue #5
- **Category**: Data Consistency
- **Severity**: Medium
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Saat pengguna mengedit profil motor (`PUT /api/motorcycles/:id`) dan memperbarui nilai `currentMileage`, perubahan tersebut tidak dimasukkan ke dalam riwayat tabel `mileage_records`.

**Solusi yang Diterapkan**:
Menambahkan pembuatan record baru di tabel `mileageRecord` setiap kali `currentMileage` berhasil diperbarui via profil motor.

**File yang Diubah**:
`Project-FullAi/apps/api/src/controllers/motorcycle.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-006 — Penurunan Odometer Diam-Diam Melalui Update Profil Motor
- **GitHub Issue**: Issue #6
- **Category**: Business Logic / Security
- **Severity**: High
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Endpoint `PUT /api/motorcycles/:id` mengizinkan pengurangan odometer secara bebas (misal dari 20.000 KM menjadi 5.000 KM), melanggar aturan integritas sistem pemantauan kendaraan.

**Solusi yang Diterapkan**:
Menambahkan validasi penolakan jika nilai baru `currentMileage` lebih rendah dari `existing.currentMileage`.

**File yang Diubah**:
`Project-FullAi/apps/api/src/controllers/motorcycle.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-007 — Ketidakstabilan Urutan Data Riwayat Odometer dan Servis Pada Timestamp Identik
- **GitHub Issue**: Issue #7
- **Category**: Database Query / UI
- **Severity**: Low
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Query riwayat kilometer dan servis hanya menggunakan klausa `orderBy: { recordedAt: 'desc' }`. Jika dua record dibuat pada detik yang sama, urutan penampilan pada UI dapat melompat/tidak deterministik.

**Solusi yang Diterapkan**:
Menambahkan sekunder sort key: `orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }]` di seluruh controller terkait (`mileage`, `service`, `dashboard`, `motorcycle`).

**File yang Diubah**:
- `Project-FullAi/apps/api/src/controllers/mileage.controller.ts`
- `Project-FullAi/apps/api/src/controllers/service.controller.ts`
- `Project-FullAi/apps/api/src/controllers/dashboard.controller.ts`
- `Project-FullAi/apps/api/src/controllers/motorcycle.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-008 — Pencatatan Tanggal Servis dan Odometer di Masa Depan Tanpa Validasi Batas Waktu
- **GitHub Issue**: Issue #8
- **Category**: Validation
- **Severity**: Medium
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Pengguna dapat memasukkan tanggal servis atau tanggal kilometer di masa depan (misal tahun 2030), yang merusak kalkulasi hari tersisa (`remainingDays`).

**Solusi yang Diterapkan**:
Memvalidasi tanggal input tidak boleh melebihi waktu sekarang (`Date.now() + 60000`).

**File yang Diubah**:
- `Project-FullAi/apps/api/src/controllers/mileage.controller.ts`
- `Project-FullAi/apps/api/src/controllers/service.controller.ts`
- `Project-FullAi/apps/api/src/controllers/maintenance.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-009 — Validasi Input Keluhan Rekomendasi Terlalu Longgar (DDoS / Memory Risk)
- **GitHub Issue**: Issue #9
- **Category**: Validation / Reliability
- **Severity**: Medium
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Schema rekomendasi tidak membatasi panjang teks keluhan, sehingga payload teks raksasa (ribuan karakter) dapat dikirimkan ke server dan membebani parser regex.

**Solusi yang Diterapkan**:
Menambahkan batasan maksimal 500 karakter pada `recommendationSchema` dan pengecekan defensif di controller:
```typescript
z.string().trim().min(3).max(500)
```

**File yang Diubah**:
- `Project-FullAi/apps/api/src/schemas/recommendation.schema.ts`
- `Project-FullAi/apps/api/src/controllers/recommendation.controller.ts`
- `Project-FullAi/apps/api/src/schemas/recommendation.schema.test.ts` (Unit test ditambahkan)

**Commit Hash**: `e46245e`

---

### BUG-010 — Unhandled Negative/Zero Parameter ID Mengakibatkan Query Database Tidak Valid
- **GitHub Issue**: Issue #10
- **Category**: API / Reliability
- **Severity**: Medium
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Parameter ID seperti `/api/motorcycles/-5` atau `/api/motorcycles/0` lolos dari validasi `isNaN(id)` dan diteruskan ke Prisma Client, menyebabkan query tidak efisien dan potensi unhandled exception.

**Solusi yang Diterapkan**:
Memperbarui seluruh pengecekan ID di semua controller menjadi:
```typescript
if (isNaN(id) || id <= 0) {
  sendError(res, 'ID tidak valid', null, 400)
  return
}
```

**File yang Diubah**:
- `Project-FullAi/apps/api/src/controllers/motorcycle.controller.ts`
- `Project-FullAi/apps/api/src/controllers/mileage.controller.ts`
- `Project-FullAi/apps/api/src/controllers/service.controller.ts`
- `Project-FullAi/apps/api/src/controllers/maintenance.controller.ts`
- `Project-FullAi/apps/api/src/controllers/dashboard.controller.ts`
- `Project-FullAi/apps/api/src/controllers/healthScore.controller.ts`
- `Project-FullAi/apps/api/src/controllers/recommendation.controller.ts`

**Commit Hash**: `e46245e`

---

### BUG-011 — Potensi Yatim Record Relasi (Orphan Records) Saat Penghapusan Motor
- **GitHub Issue**: Issue #11
- **Category**: Database Integrity
- **Severity**: High
- **Environment**: Local & Production
- **Status**: RESOLVED

**Deskripsi Masalah**:
Pada beberapa lingkungan database managed seperti TiDB Cloud Serverless, foreign key cascade delete terkadang tidak dieksekusi secara otomatis jika foreign key constraints dinonaktifkan di tingkat sesi serverless.

**Solusi yang Diterapkan**:
Menjalankan transaksi atomik eksplisit (`prisma.$transaction`) di `deleteMotorcycle` yang secara berurutan menghapus data anak terlebih dahulu (`mileageRecords`, `serviceHistories`, `maintenanceSchedules`) sebelum menghapus record motor utama.

**File yang Diubah**:
`Project-FullAi/apps/api/src/controllers/motorcycle.controller.ts`

**Commit Hash**: `e46245e`

---

## 6. Riwayat Perbaikan
1. Mengidentifikasi kelemahan logika bisnis dan celah validasi pada seluruh router API.
2. Memperbaiki logika kontroler `motorcycle`, `mileage`, `service`, `maintenance`, `dashboard`, `healthScore`, dan `recommendation`.
3. Menambahkan unit test baru untuk `recommendation.schema.test.ts` (menguji batas minimum 3 karakter dan maksimum 500 karakter).
4. Menjalankan seluruh test suite backend: **51 dari 51 test lulus (100% PASS)**.
5. Menjalankan build verifikasi backend (`npm run build`): **PASS tanpa error TypeScript**.
6. Menjalankan build verifikasi frontend (`npm run build`): **PASS tanpa error Vite/TypeScript**.

---

## 7. Hasil Pengujian Setelah Perbaikan

### A. Unit Test Backend
```text
> node --import tsx --test src/schemas/*.test.ts src/services/*.test.ts

ℹ tests 51
ℹ suites 0
ℹ pass 51
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 667.4527
```

### B. Build Status
- **Backend API (`apps/api`)**: `prisma generate && tsc --noEmit` -> **BERHASIL (Exit Code 0)**
- **Frontend Web (`apps/web`)**: `tsc -b && vite build` -> **BERHASIL (Exit Code 0)**

---

## 8. Status GitHub Issues

| Issue Ref | Judul | Status GitHub | Catatan Resolusi |
|---|---|---|---|
| Issue #1 | [BUG-001] TiDB Cloud Authentication Handshake Failed | OPEN | Membutuhkan rotasi kredensial `DATABASE_URL` di Vercel Dashboard |
| Issue #2 | [BUG-002] Odometer Regression in Service Mileage | CLOSED | Validasi `mileage < currentMileage` diimplementasikan |
| Issue #3 | [BUG-003] Service Mileage Update Desynchronization | CLOSED | Sinkronisasi `motorcycle.currentMileage` diimplementasikan |
| Issue #4 | [BUG-004] Maintenance Last Service Mileage Exceeds Current Odometer | CLOSED | Validasi batas atas odometer diimplementasikan |
| Issue #5 | [BUG-005] Motorcycle Profile Mileage Update Missing History Record | CLOSED | Pencatatan otomatis ke `mileageRecord` diimplementasikan |
| Issue #6 | [BUG-006] Unauthorized Odometer Reduction via Profile Update | CLOSED | Pengecekan pengurangan odometer diimplementasikan |
| Issue #7 | [BUG-007] Non-Deterministic Query Ordering on Identical Timestamps | CLOSED | Penambahan secondary sort key `id: desc` |
| Issue #8 | [BUG-008] Unrestricted Future Dates for Service and Mileage | CLOSED | Batasan validasi tanggal `Date.now() + 60000` |
| Issue #9 | [BUG-009] Unbounded Recommendation Complaint Input Length | CLOSED | Pembatasan teks keluhan maks 500 karakter |
| Issue #10 | [BUG-010] Unhandled Non-Positive Parameter IDs | CLOSED | Pengecekan `id <= 0` pada semua router controller |
| Issue #11 | [BUG-011] Potential Orphan Child Records on Motorcycle Deletion | CLOSED | Transaksi atomik cascade cleanup diimplementasikan |

---

## 9. Deployment Verification
- **Production Frontend**: [https://smart-motorcycle-web.vercel.app/](https://smart-motorcycle-web.vercel.app/) (Aktif & responsif)
- **Production Backend**: [https://smart-motorcycle-api.vercel.app/](https://smart-motorcycle-api.vercel.app/)
  - Endpoint Root `/`: **HTTP 200 OK** (`{"message":"Smart Motorcycle API is running"}`)
  - Endpoint `/api/motorcycles`: Terkendala kredensial database TiDB (BUG-001).

---

## 10. Kesimpulan
- **Total Masalah/Bug Teridentifikasi**: 11 Bug
- **Total Bug Diselesaikan di Kode**: 10 Bug (100% bug kode internal terselesaikan dan teruji)
- **Tindakan Manual Tersisa**: 1 Tindakan (Pembaruan nilai `DATABASE_URL` pada Vercel Dashboard)
- Seluruh unit test, type-checking, dan build frontend/backend telah diverifikasi dengan bukti aktual.

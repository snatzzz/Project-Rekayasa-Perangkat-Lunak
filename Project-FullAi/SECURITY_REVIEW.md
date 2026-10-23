# Security Review & Audit Report
**Project:** Smart Motorcycle Health & Maintenance System  
**Audit Date:** 23 Oktober 2026  
**Auditor / Reviewer:** Antigravity Engineering Pair Assistant  
**Repository:** `https://github.com/snatzzz/Project-Rekayasa-Perangkat-Lunak.git`  
**Application Root:** `Project-FullAi`

---

## 1. Scope & Methodology

Pemeriksaan keamanan dilakukan secara menyeluruh terhadap implementasi teknis aktual repositori, mencakup:
- **Konfigurasi & Manajemen Rahasia (Secrets & Environment):** Pemeriksaan file yang terlacak git, aturan `.gitignore`, `.env.example`, dan potensi kebocoran kredensial di frontend.
- **Validasi Input & Parameter:** Pemeriksaan schema Zod pada body request, parsing integer parameter rute, penolakan input negatif atau tipe data tidak valid.
- **Interaksi Basis Data:** Pemeriksaan skema Prisma ORM, penggunaan parameterized queries, referential integrity, cascade delete, dan permission database.
- **Penanganan Kesalahan & API:** Analisis middleware error handling Express, kebocoran stack trace/error basis data ke client, proteksi denial-of-service melalui payload Express.
- **Audit Dependensi & Supply Chain:** Eksekusi `npm.cmd audit` pada backend (`apps/api`) dan frontend (`apps/web`), analisis CVE, dan mitigasi dependensi yang terdampak.
- **Batasan Akses & Autentikasi (Access Control Limitation):** Evaluasi status autentikasi/otorisasi pada MVP saat ini.

---

## 2. Ringkasan Temuan Keamanan (Findings by Severity)

| ID | Kategori | Komponen | Deskripsi Singkat | Tingkat Keparahan | Status |
|---|---|---|---|---|---|
| **SEC-001** | Access Control | API Endpoints | Ketiadaan mekanisme autentikasi dan otorisasi pada seluruh endpoint mutasi (CRUD). | **High** | Documented & Public Deployment Blocked |
| **SEC-002** | Supply Chain | Frontend (`apps/web`) | Kerentanan high-severity pada package `vite` (v8.3.1) dan `source-map-js` (v1.2.1). | **High** | **Fixed** (via targeted npm audit fix) |
| **SEC-003** | Error Handling | Backend (`apps/api`) | Pesan internal error (500) mengembalikan `err.message` mentah ke client tanpa filter environment. | **Medium** | **Fixed** (Sanitized in production mode) |
| **SEC-004** | Resource Limits | Backend (`apps/api`) | Parser `express.json()` tidak memiliki konfigurasi batas ukuran request body (`limit`). | **Low** | **Fixed** (Configured to 1mb) |
| **SEC-005** | Secrets Hygiene | Repository | Evaluasi pelacakan file rahasia (`.env`) dan kredensial sensitif. | **Informational** | **Verified Safe** (Excluded by .gitignore) |

---

## 3. Rincian Temuan & Tindakan Perbaikan

### SEC-001: Ketiadaan Autentikasi dan Otorisasi (Access Control)
- **Tingkat Keparahan:** High (jika terekspos ke internet publik)
- **Komponen:** Seluruh endpoint Express di `apps/api/src/routes/`
- **Bukti / Analisis:**
  Arsitektur MVP saat ini dirancang untuk demonstrasi lokal mata kuliah. Endpoint seperti `POST /api/motorcycles`, `PUT /api/services/:id`, dan `DELETE /api/motorcycles/:id` dapat dieksekusi oleh siapa saja tanpa verifikasi sesi, token JWT, maupun otorisasi kepemilikan data motor.
- **Dampak Potensial:**
  Jika aplikasi ini dideploy langsung ke jaringan publik (public cloud/VPS), pihak manapun dapat menambah, mengubah, atau menghapus data motor pengguna lain.
- **Tindakan Korektif & Mitigasi:**
  1. Status deployment publik ditandai secara tegas sebagai **BLOCKED** untuk lingkungan produksi publik.
  2. Akses aplikasi dibatasi hanya untuk demonstrasi lokal (`localhost`).
  3. Disiapkan roadmap penambahan modul autentikasi (JWT/Session) dan middleware `requireAuth` sebelum rilis publik.

---

### SEC-002: Kerentanan High-Severity pada Dependensi Frontend
- **Tingkat Keparahan:** High
- **Komponen:** `apps/web/package-lock.json` (`vite`, `source-map-js`)
- **Bukti / Analisis:**
  Eksekusi `npm.cmd audit` di `apps/web` mendeteksi 2 kerentanan berisiko High:
  - `source-map-js` (1.0.0 - 1.2.1): Penolakan layanan loop peristiwa melalui offset bagian peta sumber terindeks (GHSA-68fv-2mgg-jv7q).
  - `vite` (8.3.0 - 8.3.2): Bypass validasi argumen editor dan middleware Vite pada lingkungan pengembangan Windows (GHSA-698v-4r3x-3vcv, GHSA-9jrq-w75r-8gcw, dll.).
- **Tindakan Korektif:**
  Dijalankan `npm.cmd audit fix` non-destruktif untuk memperbarui package yang kompatibel (`vite` diperbarui ke `8.3.5`, `source-map-js` ke `1.2.2`).
- **File Diubah:** `Project-FullAi/apps/web/package-lock.json`
- **Hasil Retest:**
  - `npm.cmd audit` di `apps/web` mengonfirmasi: `found 0 vulnerabilities`.
  - Frontend build (`npm.cmd run build`) berhasil 100% tanpa error kompatibilitas.

---

### SEC-003: Potensi Kebocoran Informasi pada Error 500
- **Tingkat Keparahan:** Medium
- **Komponen:** `apps/api/src/middleware/errorHandler.ts`
- **Bukti / Analisis:**
  Sebelum perbaikan, kode pada baris 32 membaca:
  ```typescript
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal pada server'
  sendError(res, message, null, 500)
  ```
  Jika terjadi error fatal pada koneksi database atau query Prisma yang tidak terduga, pesan error internal database atau skema teknis dapat terpapar langsung ke client HTTP.
- **Tindakan Korektif:**
  Diperbarui agar pesan error mentah hanya ditampilkan pada mode *development*. Pada mode *production* (`NODE_ENV === 'production'`), error mask dipasang dan hanya mengembalikan pesan umum yang aman:
  ```typescript
  const isDev = process.env.NODE_ENV !== 'production'
  const message = isDev && err instanceof Error ? err.message : 'Terjadi kesalahan internal pada server'
  sendError(res, message, null, 500)
  ```
- **File Diubah:** `Project-FullAi/apps/api/src/middleware/errorHandler.ts`
- **Hasil Retest:** 48 unit test backend tetap lulus 100%, validasi TypeScript (`npm run build`) sukses tanpa error.

---

### SEC-004: Ketiadaan Batas Ukuran Payload JSON pada Express
- **Tingkat Keparahan:** Low
- **Komponen:** `apps/api/src/server.ts`
- **Bukti / Analisis:**
  Penggunaan `app.use(express.json())` secara default tanpa limit eksplisit dapat membebani memori server jika menerima payload berukuran sangat besar (Denial of Service vector).
- **Tindakan Korektif:**
  Ditambahkan limit eksplisit yang wajar untuk operasi CRUD otomotif:
  ```typescript
  app.use(express.json({ limit: '1mb' }))
  ```
- **File Diubah:** `Project-FullAi/apps/api/src/server.ts`
- **Hasil Retest:** Backend build sukses dan seluruh pengujian request validasi Zod berjalan normal.

---

### SEC-005: Kebersihan Manajemen Secrets & Git Tracking
- **Tingkat Keparahan:** Informational / Passed
- **Komponen:** Root `.gitignore`, `apps/api/.env.example`
- **Hasil Audit:**
  - File rahasia `.env` tidak terlacak di Git (diverifikasi via `git ls-files` dan `git check-ignore`).
  - `.env.example` hanya berisi placeholder kredensial default lokal Docker Compose (`motorcycle_user:motorcycle_password@localhost:3306/smart_motorcycle`).
  - Frontend `apps/web` tidak memuat environment secret server (menggunakan URL REST API publik lokal).

---

## 4. Hasil Audit Dependensi Otomatis

### Backend (`apps/api`):
```text
> npm.cmd audit
found 0 vulnerabilities
```

### Frontend (`apps/web`):
```text
> npm.cmd audit
found 0 vulnerabilities (setelah mitigasi vite@8.3.5 & source-map-js@1.2.2)
```

---

## 5. Ringkasan Retest & Status Verifikasi

| Komponen | Perintah Pengujian | Hasil | Catatan |
|---|---|---|---|
| API Schemas & Services | `npm.cmd test` (apps/api) | **PASS (48/48 tests)** | 7 test files lulus tanpa kegagalan |
| API TypeScript Build | `npm.cmd run build` (apps/api) | **PASS** | `tsc --noEmit` sukses (0 error) |
| Prisma Schema | `npx.cmd prisma validate` (apps/api) | **PASS** | Skema MySQL valid |
| Web Linting | `npm.cmd run lint` (apps/web) | **PASS** | 0 error |
| Web Production Build | `npm.cmd run build` (apps/web) | **PASS** | Output `dist/` terbentuk sukses |

---

## 6. Batasan & Rekomendasi Pengembangan Lanjutan

1. **Implementasi Autentikasi Pengguna (AuthN/AuthZ):**  
   Untuk rilis publik di masa mendatang, tambahkan sistem autentikasi multi-tenant (misal: JSON Web Tokens atau OAuth2/Session) sehingga entitas motor terikat pada `userId` pemilik akun.
2. **CORS Whitelist Dinamis:**  
   Saat ini CORS mengizinkan semua domain asal (`app.use(cors())`). Pada deployment produksi, batasi `origin` hanya pada domain frontend resmi.
3. **Rate Limiting:**  
   Tambahkan middleware pembatas laju request (`express-rate-limit`) pada endpoint komputasi seperti rekomendasi keluhan dan kalkulasi skor kesehatan.
4. **Keamanan Kontainer:**  
   Pada lingkungan produksi, pastikan password default MySQL di `docker-compose.yml` dirotasi menggunakan Docker Secrets atau variabel lingkungan rahasia server.

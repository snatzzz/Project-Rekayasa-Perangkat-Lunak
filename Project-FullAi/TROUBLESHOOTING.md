# Panduan Troubleshooting & Log Kejadian Aman
**Project:** Smart Motorcycle Health & Maintenance System  
**Bahasa:** Bahasa Indonesia  
**Tujuan Dokumen:** Dokumentasi kendala teknis riil yang teramati selama pengembangan dan pengujian, analisis akar penyebab (root cause), langkah perbaikan yang aman (*safe corrective action*), serta cara verifikasi hasil perbaikannya.

---

## 1. Aturan Logging Aman (Safe Logging Policy)

Dalam dokumentasi dan implementasi aplikasi:
1. **Tidak Membocorkan Rahasia:** Dilarang mencetak kata sandi database, token sesi, connection string lengkap dengan kredensial, atau private key pada log konsol maupun log publik.
2. **Sanitasi Error Client:** Error detail dari database (misalnya error sintaks SQL atau trace koneksi database) disembunyikan dari respon publik/client HTTP pada lingkungan produksi.
3. **Pemberian Kode Kesalahan yang Jelas:** Menggunakan kode status HTTP standar (400 untuk validasi input, 404 untuk data tidak ditemukan, 500 untuk kegagalan internal server) disertai pesan penjelasan yang mudah dipahami manusia.

---

## 2. Katalog Kasus Troubleshooting Teramati

### Kasus 1: Eksekusi `npm` Terblokir oleh PowerShell ExecutionPolicy di Windows

#### Contoh Log:
```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
For more information, see about_Execution_Policies at https:/go.microsoft.com/fwlink/?LinkID=135170.
At line:1 char:1
+ npm -v
+ ~~~
    + CategoryInfo          : SecurityError: (:) [], PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

#### Perilaku yang Diharapkan:
Perintah npm dapat dipanggil dan dieksekusi secara mulus pada terminal PowerShell.

#### Akar Penyebab (Root Cause):
Secara default, Windows PowerShell mengaktifkan `ExecutionPolicy` bertipe `Restricted`, sehingga pemanggilan file skrip `.ps1` (seperti `npm.ps1`) diblokir oleh sistem keamanan Windows.

#### Cara Mendiagnosis:
Jalankan perintah:
```powershell
Get-ExecutionPolicy
```
Jika hasilnya `Restricted`, maka skrip PowerShell lokal tidak diizinkan berjalan.

#### Tindakan Perbaikan Aman:
Gunakan wrapper command Windows `npm.cmd` dan `npx.cmd`, atau ubah execution policy untuk proses lokal sesi aktif tanpa merusak konfigurasi sistem:
```powershell
# Opsi 1 (Sangat Direkomendasikan - Tanpa ubah policy sistem):
npm.cmd run dev
npm.cmd test
npx.cmd prisma validate

# Opsi 2 (Mengizinkan skrip hanya untuk sesi terminal saat ini):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

#### Perintah Verifikasi:
```powershell
npm.cmd -v
```

#### Hasil Verifikasi:
Versi npm tampil normal (contoh: `11.19.0`) dan skrip `npm.cmd test` / `npm.cmd run build` berjalan dengan sukses.

---

### Kasus 2: Koneksi Database Gagal / Kontainer Docker Belum Berjalan (`P1001`)

#### Contoh Log (Sanitized):
```text
PrismaClientInitializationError: Can't reach database server at `localhost`:`3306`
Please make sure your database server is running at `localhost`:`3306`.
    at ... (@prisma/client/runtime/library.js) {
  clientVersion: '5.22.0',
  errorCode: 'P1001'
}
```

#### Perilaku yang Diharapkan:
Backend Express berhasil terhubung ke basis data MySQL 8.0 pada port 3306 saat memproses request query.

#### Akar Penyebab (Root Cause):
Layanan MySQL di Docker belum dinyalakan atau Docker Desktop dalam keadaan mati/berhenti, sehingga port `3306` menolak koneksi TCP (`TcpTestSucceeded: False`).

#### Cara Mendiagnosis:
1. Periksa status port database dengan PowerShell:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 3306
   ```
2. Periksa status kontainer Docker:
   ```powershell
   cd Project-FullAi
   docker compose ps
   ```

#### Tindakan Perbaikan Aman:
1. Pastikan Docker Desktop telah dibuka dan berjalan.
2. Jalankan service MySQL melalui Docker Compose:
   ```powershell
   cd Project-FullAi
   docker compose up -d
   ```
3. Tunggu hingga kontainer berstatus `healthy` atau siap menerima koneksi (sekitar 5-15 detik).

#### Perintah Verifikasi:
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
# Pastikan TcpTestSucceeded : True
```

---

### Kasus 3: Kerentanan Keamanan High-Severity pada Package Vite & Source-Map-Js

#### Contoh Log:
```text
# npm audit report

source-map-js  1.0.0 - 1.2.1
Severity: high
source-map-js allows event-loop denial of service through indexed source-map section offsets - GHSA-68fv-2mgg-jv7q
fix available via `npm audit fix`

vite  8.3.0 - 8.3.2
Severity: high
launch-editor CLI & bypass issues - GHSA-698v-4r3x-3vcv, GHSA-9jrq-w75r-8gcw
fix available via `npm audit fix`

2 high severity vulnerabilities
```

#### Perilaku yang Diharapkan:
Audit dependensi frontend bersih (`0 vulnerabilities`) dan build Vite tetap stabil.

#### Akar Penyebab (Root Cause):
Versi pustaka pembangun frontend yang terkunci di `package-lock.json` memiliki advisory keamanan CVE yang telah diperbaiki pada rilis patch resmi yang lebih baru.

#### Cara Mendiagnosis:
Jalankan audit pada direktori frontend:
```powershell
cd Project-FullAi/apps/web
npm.cmd audit
```

#### Tindakan Perbaikan Aman:
Jalankan `npm.cmd audit fix` yang hanya menaikkan versi semver minor/patch tanpa flag `--force` agar tidak merusak kompatibilitas pustaka:
```powershell
cd Project-FullAi/apps/web
npm.cmd audit fix
```

#### Perintah Verifikasi:
```powershell
npm.cmd audit
npm.cmd run build
```

#### Hasil Verifikasi:
Output audit mengembalikan `found 0 vulnerabilities`, dan build Vite menghasilkan bundle produksi dengan sukses (0 error).

---

### Kasus 4: Penolakan Validasi Input Odometer Lebih Rendah dari Kilometer Saat Ini

#### Contoh Log:
```text
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "message": "Kilometer baru (12,000 KM) tidak boleh lebih rendah dari kilometer saat ini (15,400 KM)"
}
```

#### Perilaku yang Diharapkan:
API menolak pembaruan kilometer jika angka yang dimasukkan lebih kecil daripada angka odometer yang tercatat di database, guna menjaga integritas data riwayat fisik motor.

#### Akar Penyebab (Root Cause):
Pengguna memasukkan nilai kilometer yang lebih kecil atau keliru mengetik angka di form input.

#### Cara Mendiagnosis:
Periksa payload body yang dikirim ke endpoint `POST /api/motorcycles/:id/mileage`:
```json
{
  "mileage": 12000
}
```
Bandingkan dengan field `currentMileage` motor terkait via `GET /api/motorcycles/:id`.

#### Tindakan Perbaikan Aman:
Masukkan nilai kilometer yang lebih besar atau sama dengan kilometer saat ini. Jika terdapat kesalahan input historis sebelumnya, lakukan koreksi melalui endpoint pembaruan profil yang sah.

#### Perintah Verifikasi:
Kirimkan request dengan nilai yang valid:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/motorcycles/1/mileage" -Method Post -Body '{"mileage": 16000}' -ContentType "application/json"
```

---

### Kasus 5: Konflik Port Server Backend (`EADDRINUSE`)

#### Contoh Log (Sanitized):
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1904:16)
    at listenInCluster (node:net:1961:12)
    at Server.listen (node:net:2063:7)
    at ... (apps/api/src/server.ts:29:5) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

#### Perilaku yang Diharapkan:
Backend API berhasil mengikat port `3000` dan menerima request HTTP.

#### Akar Penyebab (Root Cause):
Terdapat proses Node.js lain yang masih berjalan di latar belakang dan menggunakan port 3000, atau service lain telah menempati port tersebut.

#### Cara Mendiagnosis:
Cek proses yang sedang mendengarkan pada port 3000 di Windows:
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, OwningProcess
```

#### Tindakan Perbaikan Aman:
1. Jika proses lama merupakan instance backend yang tertinggal, hentikan proses tersebut dengan aman:
   ```powershell
   Stop-Process -Id <OwningProcessId> -Force
   ```
2. Atau jalankan backend pada port lain dengan mengatur environment variable `PORT`:
   ```powershell
   $env:PORT="3001"; npm.cmd run dev
   ```

#### Perintah Verifikasi:
```powershell
npm.cmd run dev
# Server running on http://localhost:3000
```

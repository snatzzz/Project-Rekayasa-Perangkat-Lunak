# Skrip Demonstrasi 📽️

**Proyek:** *Smart Motorcycle Health & Maintenance System*  
**Durasi target:** ≈ 5‑7 menit

---

## SCENE 1 — INTRODUKSI

**Duration:** 30 detik

**Screen / Page:** Tidak ada (PowerShell/terminal).

**Actions:**
1. Tempatkan kamera pada diri Anda, sambil menyiapkan mikrofon.
2. Baca narasi berikut.

**Narration:**
> "Halo, saya *[Nama]*, mahasiswa Sistem Informasi pada semester tiga. Pada kesempatan ini saya akan mendemonstrasikan proyek akhir mata kuliah Rekayasa Perangkat Lunak, yaitu **Smart Motorcycle Health & Maintenance System**. Sistem ini membantu pemilik sepeda motor memantau kondisi motor, mencatat kilometer, riwayat servis, jadwal perawatan, serta memberikan rekomendasi berdasarkan keluhan yang dimasukkan. Semua fitur ini dibangun dengan arsitektur **frontend Vite + React**, **backend Express + TypeScript**, dan **database MySQL** yang dijalankan lewat Docker. Pada demo berikut saya akan menunjukkan alur kerja lengkap dari persiapan hingga verifikasi unit‑test."

**Key Explanation:** Perkenalkan nama proyek, tujuan, dan teknologi utama.

**Evidence to Capture:** Rekaman video diri Anda selama memperkenalkan proyek.

---

## SCENE 2 — PERSIAPAN & MENJALANKAN APLIKASI

**Duration:** 45 detik

**Screen / Page:** PowerShell.

**Actions:**
1. Buka PowerShell (run as Administrator tidak diperlukan).
2. Jalankan Docker Compose dengan file yang berada di folder `Project-FullAi`:
   ```powershell
   docker compose -f .\Project-FullAi\docker-compose.yml up -d
   ```
3. Pastikan container MySQL berjalan (`docker compose ps`).
4. Masuk ke folder backend dan jalankan server:
   ```powershell
   cd "C:\Pradita Univ\Semester 3\rpl\Project\Project-Rekayasa-Perangkat-Lunak\Project-FullAi\apps\api"
   npm.cmd run dev
   ```
   *Catatan:* menggunakan `npm.cmd` karena kebijakan eksekusi PowerShell melarang `npm.ps1`.
5. Buka terminal baru, masuk ke folder frontend, dan jalankan aplikasi React:
   ```powershell
   cd "C:\Pradita Univ\Semester 3\rpl\Project\Project-Rekayasa-Perangkat-Lunak\Project-FullAi\apps\web"
   npm.cmd run dev
   ```
6. Pada layar terminal, catat URL yang ditampilkan:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5173`

**Narration:**
> "Pertama-tama saya menyalakan Docker Desktop, kemudian saya menjalankan file docker‑compose yang berada di dalam folder Project‑FullAi. Docker akan meng‑pull image MySQL dan membuat volume `mysql_data`. Selanjutnya, saya mengeksekusi `npm.cmd run dev` pada folder `apps/api`. Perintah ini memakai `tsx` untuk mem‑watch file TypeScript dan meluncurkan server Express pada port 3000. Terakhir, saya menjalankan `npm.cmd run dev` pada folder `apps/web`; Vite menyiapkan development server pada port 5173. Semua perintah memakai `npm.cmd` supaya tidak terhalang oleh kebijakan eksekusi PowerShell."

**Key Explanation:** Tekankan penggunaan `npm.cmd`/`npx.cmd` dan lokasi file Docker Compose.

**Evidence to Capture:** Capture layar terminal yang memperlihatkan tiga perintah di atas serta URL output.

---

## SCENE 3 — DASHBOARD

**Duration:** 50 detik

**Screen / Page:** `http://localhost:5173` → **Dashboard** (halaman utama setelah login).

**Actions:**
1. Buka browser, akses `http://localhost:5173`.
2. Jika belum ada motor yang dipilih, klik tombol **"Buka Menu Motor Saya"** (tombol berada pada kartu kosong).
3. Pilih motor yang sudah ada atau buat motor baru (kita akan membuat motor pada Scene 4, jadi di sini pilih motor **DemoBike** setelah dibuat).
4. Perhatikan bagian atas kartu ringkasan:
   - Nama motor (brand + model + tahun).
   - **Kilometer Saat Ini** (nilai `summary.currentMileage`).
   - **Health Score** beserta badge berwarna (GOOD / FAIR / NEEDS ATTENTION / INSUFFICIENT_DATA).
   - Ringkasan jadwal perawatan terdekat (`closestMaintenance`).
5. Klik ikon **plus** pada kartu "Tambah KM" untuk membuka modal penambahan mileage (akan ditunjukkan pada Scene 5).

**Expected Result:**
- Dashboard menampilkan data motor yang dipilih.
- Health Score menampilkan badge berwarna (biasanya **GOOD** pada data kosong).
- Semua nilai ditulis dengan format angka ribuan, contoh `15 000 KM`.

**Narration:**
> "Setelah aplikasi terbuka, halaman utama menampilkan **Dashboard**. Pada bagian paling atas terdapat nama motor beserta tahun pembuatannya. Di sebelah kanan terdapat empat tombol cepat: Tambah KM, Catat Servis, Jadwal Baru, dan tombol navigasi ke menu motor. Di tengah dashboard ada kartu **Kilometer Saat Ini** yang menampilkan odometer motor, serta **Health Score** yang dihitung secara rule‑based berdasarkan jadwal perawatan yang ada. Badge berwarna hijau menandakan status **GOOD**, artinya semua jadwal masih UPCOMING."

**Key Explanation:** Jelaskan bahwa Health Score adalah hasil perhitungan rule‑based (penambahan poin negatif untuk jadwal *DUE* atau *OVERDUE*).

**Evidence to Capture:** Screenshot seluruh Dashboard, fokus pada nama motor, odometer, dan badge Health Score.

---

## SCENE 4 — PROFIL MOTOR (CREATE / READ / UPDATE / DELETE)

**Duration:** 70 detik

**Screen / Page:** Sidebar → **Motor Saya** → **Motorcycle Page**.

**Actions:**
1. Pada Dashboard, klik tombol **"Buka Menu Motor Saya"** (atau buka sidebar → ikon sepeda motor → *Motor Saya*).
2. Pada halaman **Motorcycle**, klik tombol **"Tambah Motor"** (biasanya ikon `Plus`).
3. Pada modal form isi data berikut dan tekan **Simpan**:
   ```text
   Brand:        Honda
   Model:        Vario 160
   Year:         2023
   Initial mileage (km): 15000
   ```
4. Setelah tersimpan, tabel menampilkan baris baru dengan data di atas.
5. Pilih baris motor tersebut, klik tombol **Edit** (ikon pensil) dan ubah **Mileage** menjadi `15500`, kemudian **Simpan**.
6. Verifikasi bahwa kolom mileage pada tabel berubah menjadi `15 500 KM`.
7. Untuk demonstrasi penghapusan, klik tombol **Delete** (ikon sampah) pada baris yang sama, konfirmasi dialog **"Ya, hapus"**.
8. Pastikan baris tersebut hilang dari tabel.

**Sample Input:**
```text
Brand: Honda
Model: Vario 160
Year: 2023
Initial mileage: 15000
```

**Expected Result:**
- Motor baru muncul di tabel.
- Setelah edit, mileage terupdate.
- Setelah delete, baris hilang. (Jika data sebelumnya sudah ada, gunakan data unik seperti `VarioDemo` untuk menghindari duplikat.)

**Narration:**
> "Di halaman **Motor Saya**, saya membuat profil motor baru dengan mengisi form yang terdiri dari brand, model, tahun, dan kilometer awal. Setelah disimpan, motor muncul dalam tabel. Saya demonstrasikan edit dengan mengubah kilometer menjadi 15 500 KM, lalu menghapus motor yang baru saja dibuat untuk menjaga database tetap bersih. Profil motor adalah titik awal semua fitur lain, karena setiap pencatatan mileage, service, atau jadwal perawatan terkait dengan motor yang dipilih."

**Key Explanation:** Hubungkan profil motor dengan fitur lain; tekankan bahwa ID motor dipakai oleh API.

**Evidence to Capture:** 
- Screenshot form tambah motor sebelum disubmit.
- Screenshot tabel setelah motor ditambahkan.
- Screenshot setelah edit mileage.
- Screenshot konfirmasi delete.

---

## SCENE 5 — CATAT KILOMETER (MILEAGE RECORDING)

**Duration:** 60 detik

**Screen / Page:** Dashboard → tombol **"Tambah KM"** → modal **Add Mileage**.

**Actions:**
1. Pada Dashboard, klik **"Tambah KM"** (tombol dengan ikon gauge).
2. Pada modal, pilih motor **Honda Vario 160** (jika ada pilihan dropdown) atau nilai sudah terisi otomatis karena motor aktif.
3. Isi **Mileage** dengan `16000` dan tekan **Simpan**.
4. Setelah sukses, modal menutup dan kartu **Kilometer Saat Ini** pada Dashboard berubah menjadi `16 000 KM`.
5. Klik ikon **History** pada Dashboard (tombol dengan ikon `History`) untuk membuka halaman **Mileage Page**; pastikan catatan baru muncul di daftar dengan tanggal hari ini.
6. Untuk menunjukkan validasi, buka kembali modal **Tambah KM**, masukkan nilai `15000` (lebih kecil dari odometer) dan tekan **Simpan**.
7. Perhatikan munculnya notifikasi error **"Mileage tidak boleh lebih kecil dari odometer saat ini"** (pesan persis diambil dari schema Zod).

**Sample Input:**
```text
Mileage: 16000
```

**Expected Result:**
- Odometer pada Dashboard berubah menjadi `16 000 KM`.
- Riwayat mileage menampilkan entri baru dengan nilai dan tanggal.
- Input lebih kecil menghasilkan pesan error dan tidak mengubah odometer.

**Narration:**
> "Fitur **Catat Kilometer** memungkinkan pengguna menambah nilai odometer. Saya menambahkan 16 000 km, dan secara otomatis kartu odometer di Dashboard berubah. Riwayat kilometer dapat dilihat pada halaman Mileage, yang menampilkan semua entri beserta tanggal pencatatan. Sistem juga memvalidasi bahwa nilai baru tidak boleh lebih rendah dari odometer yang ada; bila saya memasukkan 15 000 km, muncul pesan error dan nilai tidak berubah."

**Key Explanation:** Penjelasan tentang validasi Zod pada backend dan update state di frontend.

**Evidence to Capture:**
- Modal Add Mileage sebelum submit.
- Dashboard setelah odometer berubah.
- Daftar riwayat mileage.
- Notifikasi error pada input lebih kecil.

---

## SCENE 6 — RIWAYAT SERVIS (SERVICE HISTORY)

**Duration:** 60 detik

**Screen / Page:** Sidebar → **Servis** → **Service Page**.

**Actions:**
1. Pada sidebar (ikon `History`), pilih **Servis**.
2. Klik tombol **"Catat Servis"** (ikon `Plus`).
3. Isi form dengan data berikut dan tekan **Simpan**:
   ```text
   Service Type: Ganti Oli
   Service Date: (pilih hari ini)
   Mileage: 16000
   Cost (Rp): 150000
   Notes: Ganti oli 5W‑30
   ```
4. Setelah disimpan, tabel layanan menampilkan baris baru dengan semua kolom terisi.
5. Kembali ke Dashboard, perhatikan bagian **Recent Services** menampilkan entri baru tersebut.

**Expected Result:**
- Baris layanan baru muncul di tabel Service Page.
- Pada Dashboard, kartu **Recent Services** (bagian bawah) menampilkan jenis servis, tanggal, dan biaya.

**Narration:**
> "Pada halaman **Servis**, saya menambahkan catatan servis baru. Formulir meminta jenis servis, tanggal, kilometer saat servis, biaya, dan catatan tambahan. Setelah menyimpan, entri muncul di tabel dan juga muncul di bagian **Recent Services** pada Dashboard, sehingga pengguna dapat melihat riwayat perawatan secara cepat."

**Key Explanation:** Catatan servis berguna untuk histori perawatan dan menjadi bahan perhitungan health score.

**Evidence to Capture:**
- Form tambah servis sebelum submit.
- Tabel layanan setelah penambahan.
- Kartu Recent Services di Dashboard yang menampilkan entri.

---

## SCENE 7 — JADWAL PERAWATAN (MAINTENANCE SCHEDULE)

**Duration:** 70 detik

**Screen / Page:** Sidebar → **Jadwal** → **Maintenance Page**.

**Actions:**
1. Pada sidebar, pilih **Jadwal**.
2. Klik tombol **"Jadwal Baru"** (ikon `Plus`).
3. Isi form dan simpan:
   ```text
   Maintenance Type: Ganti Kampas Rem
   Interval km: 2000
   Interval days: 180
   Last Service Mileage: 16000
   Last Service Date: (tanggal servis sebelumnya, misal 2024‑09‑01)
   ```
4. Setelah tersimpan, tabel jadwal menampilkan baris dengan kolom **Status** (misalnya **UPCOMING**), **Next Mileage**, dan **Next Date**.
5. Kembali ke Dashboard, perhatikan kartu **Maintenance** yang menampilkan jadwal terdekat (misal "Ganti Kampas Rem – due in 1 800 km atau 120 hari").
6. Untuk menunjukkan status **DUE SOON**, ubah *Last Service Mileage* menjadi `18000` (atau ubah *Last Service Date* menjadi tiga hari sebelum hari ini) dan simpan; perhatikan perubahan badge menjadi **DUE SOON** pada tabel.

**Expected Result:**
- Jadwal baru muncul dengan status **UPCOMING** (karena mileage dan tanggal masih jauh).
- Dashboard menampilkan ringkasan jadwal terdekat.
- Setelah mengubah data supaya mendekati batas, status berubah menjadi **DUE SOON** (warna oranye) atau **DUE** (merah) sesuai logika di `maintenanceCalculation.service`. 

**Narration:**
> "Di halaman **Jadwal**, saya membuat jadwal perawatan baru untuk mengganti kampas rem setiap 2 000 km atau 180 hari. Sistem menghitung tanggal dan kilometer berikutnya, lalu menampilkan status. Pada contoh pertama statusnya **UPCOMING**, artinya masih aman. Saya kemudian mengubah nilai `Last Service Mileage` sehingga jarak ke batas hanya 200 km; status berubah menjadi **DUE SOON**, yang ditandai dengan badge berwarna oranye pada tabel."

**Key Explanation:** Jelaskan aturan status: `UPCOMING` > 10 % sisa km & > 7 hari, `DUE SOON` ≤ 10 % km atau ≤ 7 hari, `DUE` ≤ 5 % km atau ≤ 3 hari, `OVERDUE` ketika melewati batas.

**Evidence to Capture:**
- Form tambah jadwal sebelum submit.
- Tabel jadwal dengan status UPCOMING.
- Dashboard menampilkan ringkasan jadwal.
- Screenshot perubahan status menjadi DUE SOON.

---

## SCENE 8 — SKOR KESEHATAN MOTOR (HEALTH SCORE)

**Duration:** 40 detik

**Screen / Page:** Dashboard (badge Health Score).

**Actions:**
1. Pada Dashboard, perhatikan **Health Score** badge (warna hijau, kuning, atau merah).
2. Catat nilai numerik (misalnya `100`) dan label (`GOOD`).
3. Untuk memperlihatkan penurunan skor, tambahkan jadwal **OVERDUE** (ubah `Last Service Mileage` menjadi `20000` sehingga next mileage = `2000` dan odometer sudah `16000`).
4. Refresh Dashboard (tombol **Segarkan Data** pada kartu error atau reload browser).
5. Health Score badge berubah menjadi **NEEDS ATTENTION** atau **FAIR** dengan nilai yang berkurang (misalnya `70`).

**Expected Result:**
- Badge menampilkan nilai dan label yang berubah sesuai dengan kondisi jadwal.
- Pada kondisi **INSUFFICIENT_DATA** (tidak ada jadwal), badge berwarna abu‑abu dengan teks *"Belum Ada Jadwal"*.

**Narration:**
> "Health Score ditampilkan di bagian paling kanan Dashboard sebagai badge berwarna. Nilai dihitung dengan memulai dari 100 poin, lalu mengurangi 10 poin untuk setiap jadwal **DUE SOON** dan 25 poin untuk setiap jadwal **DUE** atau **OVERDUE**. Jika tidak ada jadwal sama sekali, skor menjadi **INSUFFICIENT_DATA** dan badge berwarna abu‑abu. Pada contoh pertama skor 100 (GOOD). Setelah saya menambahkan jadwal yang sudah **OVERDUE**, skor turun menjadi 70 (FAIR) dan badge berubah menjadi kuning."

**Key Explanation:** Tekankan bahwa skor bersifat rule‑based, bukan AI.

**Evidence to Capture:**
- Badge GOOD pada awal demo.
- Badge berubah setelah menambah jadwal overdue.

---

## SCENE 9 — REKOMENDASI BERDASARKAN KELUHAN

**Duration:** 55 detik

**Screen / Page:** Sidebar → **Rekomendasi**.

**Actions:**
1. Buka halaman **Rekomendasi** melalui ikon di sidebar.
2. Pada form keluhan, ketik **"vibrasi kuat saat akselerasi"** dan tekan **Cari**.
3. Sistem menampilkan rekomendasi **"Periksa rantai dan bearing, kemungkinan pelumas kurang"** dengan tingkat urgensi **SEDANG** (badge kuning).
4. Ulangi langkah 2 dengan keluhan yang tidak dikenali, misalnya **"lampu depan redup"**.
5. Sistem menampilkan fallback **"Tidak ada rekomendasi khusus, periksa kondisi umum motor"** dengan urgensi **RINGAN**.

**Sample Input:**
```text
vibrasi kuat saat akselerasi
```
```text
lampu depan redup
```

**Expected Result:**
- Untuk keluhan yang dikenali (berdasarkan `recommendation.service.test.ts`), muncul rekomendasi spesifik dan badge **SEDANG**.
- Untuk keluhan tidak dikenali, muncul pesan fallback dengan badge **RINGAN**.

**Narration:**
> "Halaman **Rekomendasi** memungkinkan pengguna memasukkan keluhan motor. Pada contoh saya menuliskan *vibrasi kuat saat akselerasi*. Sistem mencocokkan kata kunci dengan aturan yang ada dan memberikan rekomendasi untuk memeriksa rantai serta bearing, dengan tingkat urgensi **SEDANG**. Ketika saya menuliskan keluhan yang tidak ada dalam basis aturan, seperti *lampu depan redup*, sistem memberikan saran umum sebagai fallback dengan urgensi **RINGAN**."

**Key Explanation:** Jelaskan bahwa rekomendasi di‑generate dari rule‑based mapping (tidak AI).

**Evidence to Capture:**
- Form keluhan sebelum submit.
- Hasil rekomendasi spesifik.
- Hasil fallback.

---

## SCENE 10 — VALIDASI & PENANGANAN KESALAHAN

**Duration:** 50 detik

**Screen / Page:** Dashboard / Modal Tambah (*mileage*, *service*, *maintenance*).

**Actions & Cases:**
1. **Form motor** – biarkan **Brand** kosong, tekan **Simpan** → muncul pesan **"Brand tidak boleh kosong"**.
2. **Form mileage** – masukkan nilai negatif `-1000`, tekan **Simpan** → muncul pesan **"Mileage tidak boleh negatif"**.
3. **Form mileage (lower value)** – masukkan nilai `15000` (lebih kecil dari odometer 16000) → muncul pesan **"Mileage tidak boleh lebih kecil dari odometer saat ini"**.
4. **Form maintenance** – masukkan **Interval km** `0`, tekan **Simpan** → pesan **"Interval km harus lebih dari 0"**.
5. **Form rekomendasi** – kosongkan kolom keluhan, tekan **Cari** → notifikasi **"Keluhan harus diisi minimal 3 karakter"**.

**Narration:**
> "Aplikasi melakukan validasi baik di frontend maupun backend menggunakan library **Zod**. Contohnya, ketika saya mencoba menyimpan motor tanpa mengisi brand, muncul pesan error yang jelas. Begitu pula pada pencatatan kilometer, nilai negatif atau nilai yang lebih kecil dari odometer tidak diterima. Pada pembuatan jadwal, interval km harus lebih dari nol, dan pada rekomendasi keluhan minimal tiga karakter diperlukan. Semua error ditampilkan sebagai toast di pojok kanan atas, sehingga pengguna langsung mengetahui apa yang perlu diperbaiki."

**Key Explanation:** Tekankan pentingnya validasi untuk mencegah data tidak konsisten.

**Evidence to Capture:**
- Setiap toast error yang muncul (satu per kasus).

---

## SCENE 11 — PENGUJIAN UNIT & VERIFIKASI TEKNIS

**Duration:** 45 detik

**Screen / Page:** Terminal (backend) → **`npm.cmd test`**.

**Actions:**
1. Pada PowerShell, masuk ke folder `apps/api` (jika belum di situ).
2. Jalankan perintah:
   ```powershell
   npm.cmd test
   ```
3. Tampilkan seluruh output terminal yang berisi:
   - Jumlah test (48) dan suites.
   - Semua test **PASS**.
   - Durasi total (~848 ms).
4. Jalankan build backend:
   ```powershell
   npm.cmd run build
   ```
   Pastikan tidak ada error (output `tsc --noEmit` berhasil).
5. Kembali ke folder `apps/web`, jalankan build frontend:
   ```powershell
   npm.cmd run build
   ```
   Pastikan output menunjukkan `vite build` selesai tanpa error.
6. Jalankan validasi Prisma (sebelumnya sudah dilakukan) untuk menegaskan schema valid:
   ```powershell
   npx.cmd prisma validate
   ```

**Expected Result:**
- Terminal menampilkan semua 48 test lulus.
- Build backend dan frontend selesai tanpa error.
- Prisma validation berhasil (`The schema at prisma\schema.prisma is valid 🚀`).

**Narration:**
> "Sebagai bukti kualitas kode, saya menjalankan seluruh unit‑test backend dengan perintah `npm.cmd test`. Semua 48 test lulus, tidak ada yang gagal. Selanjutnya saya melakukan build backend (`npm.cmd run build`) dan frontend (`npm.cmd run build`), keduanya selesai tanpa error. Validasi schema Prisma juga berhasil, menandakan bahwa model database konsisten dengan kode. Semua langkah ini dijalankan otomatis melalui skrip npm, sehingga mudah di‑integrasikan ke pipeline CI/CD."

**Key Explanation:** Menunjukkan bahwa proyek telah tervalidasi secara otomatis, penting untuk penilaian kualitas.

**Evidence to Capture:**
- Screenshot terminal dengan output **PASS 48**.
- Screenshot hasil `npm.cmd run build` backend.
- Screenshot hasil `npm.cmd run build` frontend.
- Screenshot output `npx.cmd prisma validate`.

---

## SCENE 12 — KESIMPULAN

**Duration:** 30 detik

**Screen / Page:** Tidak ada (kamera kembali pada presenter).

**Actions:** Baca narasi penutup.

**Narration:**
> "Demikianlah demonstrasi **Smart Motorcycle Health & Maintenance System**. Sistem ini mengintegrasikan frontend React, backend Express, dan database MySQL melalui Docker, serta menyediakan alur kerja lengkap mulai dari pembuatan profil motor, pencatatan kilometer, riwayat servis, jadwal perawatan, hingga rekomendasi berbasis keluhan. Seluruh logika bisnis diimplementasikan secara rule‑based dan telah teruji lewat 48 unit‑test yang semuanya lulus. Dengan arsitektur modul‑modul ini, aplikasi mudah untuk dikembangkan lebih lanjut—misalnya menambah analisis AI atau integrasi dengan IoT sensor. Terima kasih atas perhatiannya."

**Key Explanation:** Ringkas kembali tujuan, teknologi, dan manfaat utama.

**Evidence to Capture:** Rekaman video penutup presenter.

---

# Ringkasan File
- **Path:** `Project-FullAi/demo.script.md`
- **Jumlah scene:** 12
- **Estimasi total durasi:** ≈ 6 menit 30 detik
- **Fitur yang telah diverifikasi:**
  - Docker Compose (lokasi file).
  - Backend (`npm.cmd run dev`) pada `http://localhost:3000`.
  - Frontend (`npm.cmd run dev`) pada `http://localhost:5173`.
  - Dashboard, profil motor, pencatatan mileage, service history, maintenance schedule, health score, rekomendasi, validasi UI, dan unit‑test.
- **Catatan manual:** Pastikan sebelum merekam, database MySQL dalam keadaan **kosong** atau setidaknya tidak berisi motor dengan nama *Honda Vario  Demo* untuk menghindari duplikasi.

---


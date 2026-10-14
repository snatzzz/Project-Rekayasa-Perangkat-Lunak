1. 2 Fitur Inti Yang Dipilih :
# Fitur 1 — Motorcycle Profile
    User bisa:
    1.menambahkan motor
    2.melihat data motor
    3.mengubah data motor
    4.menghapus motor
# Fitur 2 - Millage Recording
    1.memasukkan kilometer terbaru
    2.melihat riwayat kilometer

2. BRIEF
Smart Motorcycle Health & Maintenance System membutuhkan data dasar kendaraan agar sistem dapat menyimpan identitas motor yang digunakan pengguna dan menjadikannya sebagai dasar untuk fitur-fitur berikutnya.

### Objective
Menyediakan fitur Motorcycle Profile yang memungkinkan pengguna mengelola informasi dasar motor yang digunakan dalam sistem.

### Scope
Fitur Motorcycle Profile mencakup:
- Menambahkan data motor.
- Menampilkan data motor.
- Mengubah data motor.
- Menghapus data motor.

Data utama motor yang dikelola meliputi:
- Brand / merek motor.
- Model motor.
- Tahun motor.
- Current mileage / kilometer motor saat ini.

### Expected User Flow
Pengguna dapat membuka bagian data motor, melihat motor yang tersimpan, menambahkan motor baru, mengubah informasi motor yang sudah ada, dan menghapus data motor yang tidak diperlukan.

### Expected Behavior
- Data motor yang valid dapat disimpan ke database.
- Data motor yang tersimpan dapat ditampilkan kembali.
- Data motor dapat diperbarui.
- Data motor dapat dihapus.
- Sistem memberikan respons yang sesuai ketika input tidak valid atau proses gagal.
- Data frontend harus terhubung dengan backend melalui REST API.
- Data yang tersimpan harus menggunakan database yang telah disediakan oleh project.

### Constraints
- Menggunakan arsitektur dan teknologi yang sudah digunakan pada project.
- Tidak menambahkan authentication/login.
- Tidak menambahkan fitur IoT, GPS, payment, chat, atau fitur lain di luar kebutuhan MVP.
- Tidak membuat ulang seluruh aplikasi.
- Tidak mengubah fitur lain yang tidak berhubungan dengan Motorcycle Profile kecuali diperlukan agar fitur ini dapat berjalan dengan benar.
- AI Agent hanya digunakan sebagai engineering assistant dan hasilnya harus direview oleh mahasiswa.

### Expected Result
Fitur Motorcycle Profile dapat digunakan pada aplikasi yang runnable dan mampu melakukan operasi pengelolaan data motor dengan benar.

# FEATURE 2 — MILEAGE RECORDING

### Background
Data kilometer merupakan informasi penting dalam Smart Motorcycle Health & Maintenance System karena kilometer digunakan untuk memantau penggunaan motor dan menjadi salah satu dasar untuk menentukan kebutuhan maintenance.

### Objective
Menyediakan fitur Mileage Recording yang memungkinkan pengguna mencatat kilometer motor secara berkala dan melihat riwayat pencatatan kilometer.

### Scope
Fitur Mileage Recording mencakup:
- Menambahkan catatan kilometer.
- Menampilkan riwayat catatan kilometer.
- Menampilkan informasi waktu pencatatan.
- Menghubungkan setiap catatan kilometer dengan motor yang sesuai.

Data utama mileage record meliputi:
- Motor yang dicatat.
- Nilai kilometer.
- Tanggal / waktu pencatatan.

### Expected User Flow
Pengguna memilih motor yang ingin dicatat, memasukkan kilometer terbaru, menyimpan pencatatan, kemudian dapat melihat riwayat kilometer yang telah dicatat sebelumnya.

### Expected Behavior
- Catatan kilometer yang valid dapat disimpan ke database.
- Setiap catatan kilometer terhubung dengan motor yang benar.
- Riwayat mileage dapat ditampilkan kembali.
- Sistem menyimpan waktu pencatatan.
- Sistem memberikan respons yang sesuai ketika input tidak valid atau proses gagal.
- Data frontend harus terhubung dengan backend melalui REST API.
- Data yang tersimpan harus menggunakan database yang telah disediakan oleh project.

### Constraints
- Menggunakan arsitektur dan teknologi yang sudah digunakan pada project.
- Tidak menambahkan fitur di luar kebutuhan Mileage Recording.
- Tidak membuat ulang seluruh aplikasi.
- Tidak mengubah fitur lain yang tidak berhubungan dengan Mileage Recording kecuali diperlukan agar fitur ini dapat berjalan dengan benar.
- AI Agent hanya digunakan sebagai engineering assistant dan hasilnya harus direview oleh mahasiswa.

### Expected Result
Fitur Mileage Recording dapat digunakan pada aplikasi yang runnable, dapat menyimpan pencatatan kilometer, dan dapat menampilkan riwayat pencatatan dengan benar.

# GENERAL DEVELOPMENT PRINCIPLES

3. PLAN
# PLAN

Pengembangan dilakukan secara bertahap. Setiap fitur akan melalui proses review terhadap implementasi yang sudah ada sebelum dilakukan perubahan. Perubahan hanya dilakukan pada bagian yang diperlukan untuk memenuhi requirement dan acceptance criteria.

---

# FEATURE 1 — MOTORCYCLE PROFILE

## Development Plan

### Step 1 — Review Existing Implementation
Memeriksa struktur project yang sudah tersedia sebelum melakukan perubahan, meliputi:
- Prisma schema dan model `Motorcycle`.
- Struktur backend Express.
- Endpoint Motorcycle yang sudah tersedia.
- Struktur frontend yang menangani data motor.
- API integration antara frontend dan backend.
- Validation yang sudah tersedia.
- Unit test yang sudah tersedia, apabila ada.

Tujuan tahap ini adalah menghindari pembuatan ulang komponen yang sudah berfungsi dan memastikan perubahan tetap sesuai dengan arsitektur project.

### Step 2 — Verify Database Model
Memastikan model `Motorcycle` memiliki data yang dibutuhkan:
- `id`
- `brand`
- `model`
- `year`
- `currentMileage`
- field timestamp yang digunakan project

Memastikan relasi dengan tabel lain tetap valid dan tidak rusak oleh perubahan.

### Step 3 — Verify / Implement Backend CRUD
Memastikan backend menyediakan operasi:
- Create Motorcycle
- Get Motorcycle
- Get Motorcycle by ID
- Update Motorcycle
- Delete Motorcycle

Endpoint harus:
- menggunakan REST API;
- menggunakan Prisma untuk akses database;
- mengembalikan response yang konsisten;
- menangani input tidak valid;
- menangani data yang tidak ditemukan;
- menangani error database/server.

### Step 4 — Verify / Implement Input Validation
Memastikan data yang dimasukkan memenuhi aturan domain.

Contoh validasi:
- `brand` tidak boleh kosong.
- `model` tidak boleh kosong.
- `year` harus berupa tahun yang valid.
- `currentMileage` tidak boleh bernilai negatif.
- Field wajib tidak boleh kosong atau memiliki format yang tidak sesuai.

### Step 5 — Verify / Implement Frontend
Memastikan frontend menyediakan:
- daftar motor;
- form tambah motor;
- form edit motor;
- aksi hapus motor;
- feedback ketika proses berhasil;
- feedback ketika terjadi error;
- loading state;
- empty state ketika belum ada data motor.

Frontend harus menggunakan API backend, bukan menyimpan data utama hanya pada state lokal.

### Step 6 — Unit Test
Membuat atau memeriksa unit test untuk logika dan endpoint yang relevan.

Minimal mencakup:
- create motorcycle dengan data valid;
- create motorcycle dengan data tidak valid;
- mengambil data motorcycle;
- update motorcycle;
- delete motorcycle.

Setiap test harus dapat dijalankan dan hasilnya dapat dibuktikan.

### Step 7 — Manual Verification
Menjalankan aplikasi dan melakukan pengujian melalui interface atau API untuk memastikan alur pengguna bekerja dari awal sampai akhir.

Contoh alur:
1. Membuka halaman Motorcycle Profile.
2. Menambahkan motor.
3. Memastikan motor muncul pada daftar.
4. Mengubah data motor.
5. Memastikan perubahan tersimpan.
6. Menghapus motor.
7. Memastikan data tidak lagi muncul.

### Step 8 — Review Mahasiswa
Mahasiswa melakukan review terhadap hasil implementasi dengan memeriksa:
- kesesuaian requirement;
- validasi input;
- error handling;
- integrasi frontend dan backend;
- hasil unit test;
- dampak perubahan terhadap fitur lain.

Setiap perubahan yang dilakukan setelah review harus memiliki alasan yang dapat dijelaskan.

---

# FEATURE 2 — MILEAGE RECORDING

## Development Plan

### Step 1 — Review Existing Implementation
Memeriksa implementasi yang sudah tersedia untuk Mileage Recording, meliputi:
- Prisma model `MileageRecord`.
- Relasi `MileageRecord` dengan `Motorcycle`.
- Endpoint mileage.
- Struktur service/controller/route yang digunakan project.
- Komponen atau halaman frontend mileage.
- API integration.
- Validation.
- Unit test yang sudah tersedia, apabila ada.

### Step 2 — Verify Database Relationship
Memastikan setiap mileage record:
- memiliki `motorcycleId`;
- hanya dapat terkait dengan motor yang valid;
- menyimpan nilai mileage;
- menyimpan waktu pencatatan;
- memiliki relasi database yang benar dengan `Motorcycle`.

### Step 3 — Verify / Implement Backend
Memastikan backend menyediakan:
- Create Mileage Record.
- Get Mileage Records berdasarkan motorcycle.
- Pengambilan riwayat mileage dalam urutan waktu yang sesuai.

Backend harus:
- memvalidasi `motorcycleId`;
- memastikan motor yang dipilih benar-benar ada;
- memvalidasi nilai mileage;
- menyimpan waktu pencatatan;
- mengembalikan response yang konsisten;
- menangani error dengan benar.

### Step 4 — Verify Mileage Validation
Memastikan nilai mileage:
- harus berupa angka;
- tidak boleh negatif;
- tidak boleh kosong;
- harus terkait dengan motorcycle yang valid.

Apabila project menerapkan aturan bahwa pencatatan mileage baru tidak boleh lebih rendah dari mileage sebelumnya, aturan tersebut harus diperiksa dan diterapkan secara konsisten apabila memang sudah ditetapkan dalam requirement.

### Step 5 — Verify / Implement Frontend
Memastikan frontend menyediakan:
- pemilihan motor;
- input kilometer;
- tombol untuk menyimpan catatan;
- daftar/riwayat mileage;
- informasi tanggal/waktu pencatatan;
- loading state;
- empty state;
- error feedback;
- success feedback.

### Step 6 — Unit Test
Membuat atau memeriksa unit test untuk kasus utama:

- menambahkan mileage dengan data valid;
- menolak mileage dengan data tidak valid;
- menolak `motorcycleId` yang tidak valid;
- mengambil riwayat mileage;
- memastikan record terhubung ke motorcycle yang benar.

### Step 7 — Manual Verification
Menjalankan aplikasi dan melakukan pengujian end-to-end.

Contoh alur:
1. Memilih motor.
2. Memasukkan kilometer terbaru.
3. Menyimpan data.
4. Memastikan record tersimpan.
5. Membuka riwayat mileage.
6. Memastikan nilai kilometer dan waktu pencatatan tampil dengan benar.
7. Mencoba input tidak valid dan memastikan sistem menolaknya.

### Step 8 — Review Mahasiswa
Mahasiswa melakukan review terhadap:
- validasi mileage;
- hubungan data motorcycle dan mileage;
- response API;
- tampilan riwayat;
- error handling;
- hasil unit test;
- kemungkinan dampak terhadap fitur maintenance dan dashboard.

Perubahan hanya dilakukan apabila diperlukan untuk memperbaiki bug, memenuhi requirement, meningkatkan validasi, atau memastikan acceptance criteria terpenuhi.

---

# DEVELOPMENT ORDER

Kedua fitur tidak dikerjakan secara bersamaan.

Urutan pengembangan:

**Feature 1 — Motorcycle Profile**
  
Review → Build/Fix → Unit Test → Manual Verification → Review → Commit

Kemudian:

**Feature 2 — Mileage Recording**

Review → Build/Fix → Unit Test → Manual Verification → Review → Commit

Dengan urutan tersebut, Mileage Recording dapat menggunakan data Motorcycle yang telah tersedia dan diverifikasi terlebih dahulu.

---

# GIT COMMIT PLAN

Setiap fitur harus menghasilkan satu meaningful commit setelah proses verification selesai.

### Commit 1    
```text
feat: implement and verify motorcycle profile
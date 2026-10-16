# Naskah & Panduan Perekaman Video Demonstrasi (Demo Script)
## Smart Motorcycle Health & Maintenance System

Dokumen ini memuat panduan lengkap, urutan alur navigasi, dan narasi berbahasa Indonesia untuk merekam demonstrasi aplikasi berdurasi **3 hingga 5 menit** yang siap dipresentasikan kepada dosen penguji.

---

### A. Persiapan Sebelum Merekam

1. **Jalankan Seluruh Layanan**:
   - Pastikan database aktif: `docker compose up -d`
   - Pastikan backend aktif: `cd apps/api && npm run dev` (Port 3000)
   - Pastikan frontend aktif: `cd apps/web && npm run dev` (Port 5173)
2. **Buka Aplikasi di Browser**:
   - URL: `http://localhost:5173`
   - Pastikan zoom browser pada 100% dan resolusi layar minimal Full HD (1920x1080) agar tampilan responsif dan jelas.
3. **Alat Perekaman Rekomendasi di Windows**:
   - **Xbox Game Bar**: Tekan `Windows + Alt + R` untuk langsung mulai/berhenti merekam jendela browser.
   - **OBS Studio**: Perekam layar gratis dengan tangkapan window browser.
   - **Clipchamp / ShareX**: Alternatif perekam layar bawaan Windows.

---

### B. Urutan Langkah Demonstrasi & Narasi

#### Bagian 1: Pengenalan & Halaman Dashboard (Durasi ~45 detik)
- **Tindakan**: Buka halaman utama `http://localhost:5173` (Dashboard).
- **Narasi**:
  > *"Halo semuanya. Pada kesempatan kali ini, kami mendemonstrasikan aplikasi Smart Motorcycle Health & Maintenance System. Sistem ini dirancang untuk membantu pemilik sepeda motor memantau kesehatan motor, mencatat kilometer, riwayat servis, serta mendapatkan rekomendasi perawatan berbasis keluhan secara cerdas dan deterministik. Di halaman Dashboard ini, kita dapat melihat pilihan motor, skor kesehatan, status odometer, dan jadwal servis terdekat."*

#### Bagian 2: Manajemen Profil Sepeda Motor (Durasi ~45 detik)
- **Tindakan**:
  1. Klik menu navigasi **"Motor"**.
  2. Klik tombol **"Tambah Motor"**.
  3. Masukkan data:
     - Merk: `Yamaha`
     - Model: `Aerox 155`
     - Tahun: `2023`
     - Odometer Awal: `12000`
  4. Klik tombol **Simpan**. Tunjukkan motor baru berhasil muncul di daftar kartu motor.
  5. Klik tombol **Edit** pada motor tersebut, ubah model menjadi `Aerox 155 Connected`, lalu simpan.
- **Narasi**:
  > *"Sekarang kita beralih ke modul Profil Sepeda Motor. Di sini pengguna dapat menambah kendaraan baru lengkap dengan data kilometer awal. Setelah tersimpan, kita juga dapat melakukan pembaruan data profil seperti mengubah tipe atau model kendaraan secara mudah."*

#### Bagian 3: Pencatatan Kilometer & Validasi Anti-Mundur (Durasi ~45 detik)
- **Tindakan**:
  1. Klik menu navigasi **"Kilometer"**.
  2. Pilih motor `Yamaha Aerox 155 Connected`.
  3. Masukkan kilometer baru yang valid: `12500` KM, klik **Catat Kilometer**. Tunjukkan odometer bertambah dan log riwayat muncul di tabel.
  4. Coba masukkan angka yang lebih kecil: `11000` KM, klik **Catat Kilometer**. Tunjukkan muncul peringatan validasi: *"Kilometer baru tidak boleh lebih rendah dari kilometer saat ini"*.
- **Narasi**:
  > *"Berikutnya adalah modul Pencatatan Kilometer. Ketika kita memasukkan angka 12.500 KM, sistem otomatis mencatat riwayat pemakaian dan memperbarui odometer motor. Sistem juga menerapkan aturan bisnis ketat di mana kilometer baru tidak boleh lebih rendah dari odometer saat ini, mencegah manipulasi atau kesalahan input data."*

#### Bagian 4: Pencatatan Riwayat Servis Berkala (Durasi ~45 detik)
- **Tindakan**:
  1. Klik menu navigasi **"Servis"**.
  2. Pilih motor `Yamaha Aerox 155 Connected`.
  3. Klik **"Catat Servis Baru"**.
  4. Masukkan:
     - Tipe Servis: `Ganti Oli Mesin`
     - Tanggal Servis: (Pilih hari ini)
     - Kilometer Servis: `12500`
     - Biaya Servis: `150000`
     - Catatan: `Menggunakan oli Yamalube Full Synthetic 10W-40`
  5. Klik **Simpan Riwayat Servis**. Tunjukkan data tersimpan rapi pada daftar riwayat servis.
- **Narasi**:
  > *"Pada modul Riwayat Servis, pemilik dapat mendokumentasikan setiap servis yang dilakukan, mulai dari tanggal servis, estimasi biaya, kilometer pengerjaan, hingga catatan teknis bengkel. Data ini berguna untuk melacak total pengeluaran dan riwayat perawatan kendaraan."*

#### Bagian 5: Jadwal Perawatan & Pengingat Servis Berkala (Durasi ~45 detik)
- **Tindakan**:
  1. Klik menu navigasi **"Jadwal"**.
  2. Pilih motor `Yamaha Aerox 155 Connected`.
  3. Klik **"Tambah Jadwal"**:
     - Tipe Perawatan: `Ganti Oli Mesin`
     - Interval Kilometer: `3000`
     - Interval Hari: `60`
     - Terakhir Servis KM: `12500`
     - Tanggal Terakhir Servis: (Pilih hari ini)
  4. Klik **Simpan Jadwal**. Tunjukkan badge status jadwal berstatus `UPCOMING` (Aman) dengan sisa jarak 3.000 KM.
- **Narasi**:
  > *"Di menu Jadwal Perawatan, pengguna dapat menentukan siklus servis rutin. Sistem akan menghitung status perawatan secara deterministik: apakah masih berstatus Upcoming, Due Soon jika mendekati batas, Due saat tepat jatuh tempo, atau Overdue jika sudah terlewat."*

#### Bagian 6: Rekomendasi Berbasis Keluhan (Diagnosa Deterministik) (Durasi ~45 detik)
- **Tindakan**:
  1. Klik menu navigasi **"Rekomendasi"**.
  2. Pada input keluhan, ketik: *"Mesin susah hidup dan starter bunyi cetek"*.
  3. Klik **"Analisis Keluhan"**. Tunjukkan hasil: Penyebab Aki/Baterai atau Dinamo Starter, Tingkat Urgensi: **TINGGI**, Rekomendasi tindakan teknis, dan estimasi biaya perbaikan.
  4. Uji keluhan tidak umum, ketik: *"Klakson berbunyi aneh seperti terompet"*.
  5. Klik **"Analisis Keluhan"**. Tunjukkan bahwa sistem memberikan safe fallback rekomendasi pemeriksaan umum tanpa mengalami crash.
- **Narasi**:
  > *"Fitur unggulan selanjutnya adalah Rekomendasi Gejala Keluhan. Sistem mendeteksi kata kunci dari keluhan pengguna secara deterministik dan transparan, lalu memetakan potensi kerusakan komponen, tingkat urgensi, serta estimasi biaya. Jika keluhan tidak teridentifikasi, sistem menyediakan safe fallback panduan inspeksi tanpa menyebabkan error."*

#### Bagian 7: Penutupan pada Dashboard Terpadu (Durasi ~30 detik)
- **Tindakan**:
  1. Klik menu **"Dashboard"**.
  2. Sorot *Motorcycle Health Score* yang bernilai 100 (Kondisi Prima) karena seluruh jadwal perawatan terjaga.
  3. Tunjukkan ringkasan jadwal servis terdekat dan riwayat servis terakhir yang telah terintegrasi secara dinamis.
- **Narasi**:
  > *"Kembali ke Dashboard, kita dapat melihat Motorcycle Health Score kendaraan bernilai 100 (Prima) karena jadwal perawatan aktif terpenuhi dengan baik. Seluruh data dari motor, kilometer, servis, dan jadwal telah terhubung secara terpusat dan mulus. Demikian demonstrasi Smart Motorcycle Health & Maintenance System. Terima kasih."*

---

### C. Lokasi Penyimpanan Video Hasil Rekaman

Setelah selesai merekam menggunakan alat perekam layar pilihan Anda:
1. Simpan file video dengan format MP4 ke path:
   `Project-Rekayasa-Perangkat-Lunak/Project-FullAi/demo.mp4`
2. Pastikan file tidak korup dan dapat diputar menggunakan pemutar video bawaan (Windows Media Player, VLC, dll).

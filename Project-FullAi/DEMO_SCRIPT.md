Berikut ringkasan yang terdapat di dalam file DEMO_SCRIPT.md (versi lengkap dapat dilihat di file tersebut).

Scene	Durasi (detik)	Tampilan	Aksi pengguna	Data contoh	Hasil yang terlihat	Narasi (Indonesian)
1 – Persiapan	30	PowerShell	docker-up.bat → tunggu selesai
npm.cmd run dev di api
npm.cmd run dev di web	–	Docker MySQL up, backend http://localhost:3000, frontend http://localhost:5173	“Selamat datang, pertama‑tama kita jalankan Docker, lalu start backend dan frontend…”
2 – Dashboard	45	http://localhost:5173
	Pilih motor dari dropdown	Motor “DemoBike” (created otomatis bila belum ada)	Health Score 100 (“BAIK”), ringkasan perawatan	“Ini adalah Dashboard utama… nilai kesehatan dihitung otomatis…”
3 – Profil Motor	60	Form “Tambah Motor”	Isi brand: Yamaha, model: YZF‑R15, tahun: 2022, mileage: 5000 → Submit	–	Tabel motor menampilkan data baru	“Kita buat data motor baru, semua field wajib diisi…”
4 – Update Motor	30	Tabel motor → tombol Edit	Ubah mileage menjadi 5500 → Simpan	–	Mileage berubah di tabel	“Perubahan mileage langsung tercermin di tampilan”
5 – Rekam Mileage	45	Form “Tambah Mileage”	Pilih motor → masukkan mileage 5600 → Submit	–	Riwayat mileage menambah baris; odometer terbaru = 5600	“Aplikasi menolak mileage yang lebih kecil dari odometer saat ini.”
6 – Service History	45	Form “Tambah Service”	Pilih motor, tanggal 2024‑09‑01, mileage 5600, cost 150000 → Submit	–	Daftar service menampilkan entry baru	“Catatan service disimpan lengkap dengan biaya.”
7 – Jadwal Perawatan	50	Form “Buat Jadwal”	Interval km 2000, interval hari 180, lastServiceMileage 5600, lastServiceDate 2024‑09‑01 → Submit	–	Status jadwal muncul UPCOMING; kalkulasi tanggal & km selanjutnya	“Jadwal menghitung kapan perawatan selanjutnya berdasarkan km & hari.”
8 – Health Score	30	Dashboard (Score panel)	–	–	Score 100, label BAIK	“Skor dihitung dari semua jadwal, semakin banyak yang overdue, skor turun.”
9 – Rekomendasi	50	Form “Keluhan”	Ketik “vibrasi kuat saat akselerasi” → Submit	–	Rekomendasi “Periksa rantai & bearing” (urgensi SEDANG)	“Jika keluhan tidak dikenali, sistem memberi saran umum.”
10 – Unit‑test & Build	30	Terminal	npm.cmd test → pastikan semua 48/48 lulus
npm.cmd run build (backend) & npm.cmd run build (frontend)	–	Semua test lulus, build selesai tanpa error	“Sebagai bukti kestabilan, jalankan semua tes unit serta build.”
11 – Penutup	30	Semua tampilan	–	–	–	“Itulah demo singkat Smart Motorcycle Health & Maintenance System, solusi lengkap untuk mengelola motor Anda.”

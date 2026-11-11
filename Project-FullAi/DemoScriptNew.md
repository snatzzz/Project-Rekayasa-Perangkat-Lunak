# DemoScriptNew – Panduan Demo Tekstual

*File ini berisi langkah‑langkah tekstual yang dapat diikuti untuk merekam demo aplikasi **Smart Motorcycle Health & Maintenance System** secara **silent** (tanpa audio). Semua aksi dilakukan pada browser yang menampilkan aplikasi yang dijalankan secara lokal.*

---

## Daftar Scene
| Scene | Judul | Durasi (menit) | Halaman | Aksi Utama | Input Contoh | Hasil yang Diharapkan |
|------|-------|----------------|---------|------------|--------------|-----------------------|
| 1 | **Pendahuluan** | 0.5 | Dashboard (halaman utama) | Buka URL frontend (biasanya `http://localhost:5173` atau yang tercetak di terminal). Tampilkan judul aplikasi pada bilah tab. | – | Tampilan judul **Smart Motorcycle Health & Maintenance System** terlihat di tab dan header. |
| 2 | **Dashboard** | 1.0 | Dashboard | Lihat kartu ringkasan motor aktif, odometer, skor kesehatan, dan jadwal perawatan. | – | Kartu menampilkan data motor (mis. *Honda Vario 160*, 18 500 KM) serta skor kesehatan (*FAIR*). |
| 3 | **Profil Motor** | 0.8 | Motorcycles Page | Klik menu **Motor Saya** → tombol **Tambah Motor** → isi form *Brand*, *Model*, *Tahun*, *Odometer* → Simpan. | Brand: `Yamaha`, Model: `Aerox 155`, Tahun: `2023`, Odometer: `15000` | Motor baru muncul dalam daftar, toast *Berhasil menambahkan motor* muncul. Edit salah satu motor (ubah model) dan hapus motor demo setelahnya. |
| 4 | **Pencatatan Kilometer** | 0.8 | Mileage Page | Pilih motor aktif → klik **Tambah Kilometer**, isi nilai baru yang lebih besar → Simpan. Coba masukkan nilai lebih kecil (mis. 15000) dan periksa pesan error. | Nilai valid: `19000`, Nilai invalid: `17000` | Nilai valid memperbarui odometer dan menampilkan toast sukses; nilai invalid menampilkan toast error **Kilometer tidak boleh lebih kecil**. |
| 5 | **Riwayat Servis** | 0.9 | Service Page | Klik **Riwayat Servis**, tombol **+ Catat Servis**, isi *Jenis Servis*, *Biaya*, *Catatan* → Simpan. | Jenis: `Ganti Oli Mesin`, Biaya: `70000`, Catatan: `Ganti oli mesin MPX2 0.8L` | Baris baru muncul di tabel riwayat, toast *Servis berhasil disimpan* muncul. |
| 6 | **Jadwal Perawatan** | 0.9 | Maintenance Page | Klik **Maintenance**, tombol **+ Jadwal Baru**, isi *Tipe Maintenance*, *Interval Km*, *Interval Hari* → Simpan. | Tipe: `Pembersihan Injektor`, Km: `10000`, Hari: `180` | Kartu jadwal baru muncul, badge menampilkan sisa jarak/hari. |
| 7 | **Skor Kesehatan Motor** | 0.7 | Dashboard (kembali) | Kembali ke Dashboard, arahkan kursor ke badge skor kesehatan. | – | Badge menampilkan nilai (mis. `75`) dan label status (*FAIR*). Hover menampilkan tooltip perhitungan. |
| 8 | **Rekomendasi Keluhan** | 0.9 | Recommendation Page | Klik **Rekomendasi**, pilih contoh keluhan *"motor bergetar dan gredek di rpm rendah"* → Cari. Lihat rekomendasi. Coba keluhan tak dikenal (mis. `lampu indikator rem menyala redup`). | Keluhan contoh: `motor bergetar dan gredek di rpm rendah` | Daftar rekomendasi relevan muncul (mis. *CVT*). Keluhan tak dikenal menampilkan fallback *"Periksa sistem kelistrikan"*. |
| 9 | **Validasi Input (Error Cases)** | 0.8 | Semua halaman terkait | Demonstrasikan contoh error: field kosong, kilometer negatif, interval maintenance negatif. | – | Toast error yang sesuai muncul, tidak ada perubahan data. |
|10| **Verifikasi Teknis**| 0.5| Terminal | Tampilkan output perintah: `npm.cmd test` (backend), `npm.cmd run build` (backend), `npm.cmd run build` (frontend), `npx.cmd prisma validate`. | – | Semua perintah selesai tanpa error, menampilkan *PASS* atau *BUILD SUCCESS*. |
|11| **Penutup (Dashboard akhir)**|0.4| Dashboard | Kembali ke Dashboard, tunjukkan kondisi akhir aplikasi setelah semua data demo dibuat. | – | Dashboard menunjukkan data terbaru (odometer, jadwal, skor). |

---

### Tips Perekaman
- **Resolusi**: 1920×1080 (jika monitor mendukung) atau 1280×720.
- **Frame rate**: ~30 FPS.
- **Tidak ada audio**: gunakan mode headless atau perintah `ffmpeg -an` bila perlu meng‑strip audio.
- **Kursor**: pastikan kursor virtual terlihat (Playwright menambah overlay secara otomatis).
- **Durasi total**: sekitar **7 menit** (≈ 420 detik).
- **Pastikan** tidak ada informasi sensitif (mis. password, token) yang muncul pada layar.

---

*File ini hanya berisi teks; tidak ada suara, musik, atau subtitle audio.*


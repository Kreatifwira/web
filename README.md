# Solitaire Pattern Recorder V3

Browser extension Chrome/Edge untuk merekam dan membandingkan pola permainan.

V3 membagi area permainan menjadi 25 zona (5x5). Setiap zona memiliki fingerprint visual sendiri. Saat CEK POLA dijalankan, sistem menghitung kemiripan tiap zona lalu menghasilkan skor keseluruhan. Ini lebih tahan terhadap perubahan kecil di sebagian layar dibanding satu hash untuk seluruh halaman.

Instal:
1. chrome://extensions atau edge://extensions
2. Developer mode
3. Load unpacked
4. Pilih folder repository
5. Buka halaman Solitaire
6. Login sendiri bila diperlukan
7. Klik extension dan gunakan RECORD POLA → SIMPAN POLA → CEK POLA.

V3 tidak melakukan auto-click/auto-play dan tidak membutuhkan password pengguna.

Catatan: V3 adalah pengenal visual berbasis zona, bukan OCR/identifikasi nilai kartu. Tahap berikutnya dapat menambahkan deteksi bentuk kartu dan OCR bila diperlukan.

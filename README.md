# Browser Pattern Recorder

Aplikasi desktop Windows berbasis Electron.

## Menjalankan
1. Install Node.js LTS.
2. Di folder repository jalankan:
   npm install
   npm start

## Membuat EXE
   npm run build

Installer Windows dibuat di folder dist.

## Fitur
- Browser Chromium internal.
- Membuka URL dan navigasi.
- RECORD POLA: mengambil snapshot tampilan.
- SIMPAN: menyimpan fingerprint lokal.
- CEK POLA: mencari fingerprint yang sama.
- Database pola tersimpan di localStorage aplikasi.

Versi awal menggunakan fingerprint visual sederhana. Ini fondasi untuk pengenal susunan kartu yang lebih akurat. Tidak ada auto-click atau auto-play.

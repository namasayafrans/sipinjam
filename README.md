# SIPINJAM — starter project

## Isi folder
- `index.html`, `style.css`, `app.js`: aplikasi web.
- `schema.sql`: lima tabel relasional, trigger profile, RLS, dan data contoh.
- `DOKUMENTASI.md`: SRS, diagram Mermaid, SDD, rencana UAT, dan contoh analisis SQL.

## Cara menjalankan dengan layanan gratis
1. Buat akun di https://supabase.com dan buat project Free.
2. Buka SQL Editor pada project Supabase, tempel seluruh isi `schema.sql`, lalu jalankan.
3. Buka Project Settings > API. Salin Project URL dan anon/public key.
4. Buka `app.js`, ganti `PASTE_SUPABASE_PROJECT_URL` dan `PASTE_SUPABASE_ANON_KEY` dengan nilai project milikmu.
5. Jalankan `index.html` menggunakan VS Code Live Server untuk tes lokal.
6. Untuk membuat URL website publik, unggah folder ini ke GitHub lalu deploy sebagai static site di Netlify (Free), atau gunakan fitur deploy manual Netlify.

## Uji coba
- Register akun baru, lalu login.
- Bila konfirmasi email aktif, cek inbox dan konfirmasi sebelum login.
- Dashboard seharusnya menampilkan 5 barang contoh.
- Klik Ajukan pinjam, masukkan jumlah 1, lalu cek Riwayat pengajuan.
- Coba masukkan jumlah lebih besar dari stok; sistem seharusnya menolak.

## Penting
- Jangan pernah menaruh Supabase `service_role` key di frontend. Gunakan hanya anon/public key.
- Project Supabase Free dapat dijeda setelah tidak aktif selama seminggu; cek ketentuan paket terbaru.
- Ini prototype pembelajaran, bukan sistem produksi. Persetujuan admin, stok otomatis, dan proses pengembalian belum dibangun.
- Isi hasil pengujian UAT berdasarkan tes sungguhan, jangan mengklaim Pass sebelum diuji.

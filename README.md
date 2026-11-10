# SIPINJAM — Paket dashboard sederhana

## File
- `index.html`: login/register dan dua dashboard.
- `style.css`: tampilan aplikasi.
- `app.js`: autentikasi, membaca role, dashboard mahasiswa, persetujuan admin.
- `supabase_setup.sql`: trigger profil baru dan RLS dasar.

## Pemasangan
1. Backup project Supabase terlebih dahulu.
2. Buka Supabase > SQL Editor, jalankan `supabase_setup.sql`.
3. Pastikan setiap akun di `auth.users` mempunyai baris di `public.profiles`.
4. Di `public.profiles`, ubah role akun admin menjadi `admin`; akun mahasiswa tetap `member`.
5. Ganti `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di bagian atas `app.js` dengan URL dan publishable/anon key project Anda. Jangan gunakan service_role key.
6. Jalankan folder melalui VS Code Live Server.

## Role
- `admin`: melihat ringkasan inventaris dan seluruh pengajuan; dapat menyetujui/menolak pengajuan.
- `member`: melihat barang, mengajukan peminjaman, dan melihat riwayat miliknya.
- Form register publik selalu membuat role `member`. Jangan tambahkan pilihan admin pada register publik.

## Catatan
- Script mengasumsikan nama tabel/kolom sama dengan project yang terlihat di screenshot. Pastikan foreign key relasi `items.category_id`, `loan_items.loan_id`, dan `loan_items.item_id` tersedia.
- Versi sederhana ini belum mengurangi stok otomatis saat disetujui dan belum mengelola pengembalian barang.
- Konfirmasi email OFF hanya memengaruhi pendaftaran baru. Akun lama yang belum terkonfirmasi mungkin masih perlu dikonfirmasi atau dibuat ulang melalui Dashboard Supabase.
- RLS tetap wajib; menyembunyikan dashboard di browser saja bukan keamanan.

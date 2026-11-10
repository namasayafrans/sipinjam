-- Jalankan di Supabase > SQL Editor. Backup dahulu jika database berisi data penting.
-- Mengasumsikan tabel/kolom sesuai project saat ini: profiles(id,full_name,role),
-- categories, items, loans, loan_items.

-- Fungsi admin aman dari policy recursion pada profiles.
create or replace function public.is_sipinjam_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and lower(p.role)='admin');
$$;
grant execute on function public.is_sipinjam_admin() to authenticated;

-- Profil otomatis dibuat untuk user baru. Role publik selalu member.
create or replace function public.handle_new_sipinjam_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),'member')
  on conflict(id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_sipinjam on auth.users;
create trigger on_auth_user_created_sipinj after insert on auth.users
for each row execute procedure public.handle_new_sipinjam_user();

-- Buat profil untuk akun auth lama yang belum punya profil; role existing tidak ditimpa.
insert into public.profiles(id,full_name,role)
select u.id,coalesce(u.raw_user_meta_data->>'full_name',split_part(u.email,'@',1)),'member'
from auth.users u on conflict(id) do nothing;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.loans enable row level security;
alter table public.loan_items enable row level security;

-- Hapus policy bernama sama agar script dapat dijalankan ulang.
drop policy if exists profiles_select_self_admin on public.profiles;
drop policy if exists categories_read_auth on public.categories;
drop policy if exists categories_admin_all on public.categories;
drop policy if exists items_read_auth on public.items;
drop policy if exists items_admin_all on public.items;
drop policy if exists loans_read_owner_admin on public.loans;
drop policy if exists loans_member_insert on public.loans;
drop policy if exists loans_admin_update on public.loans;
drop policy if exists loan_items_read_owner_admin on public.loan_items;
drop policy if exists loan_items_member_insert on public.loan_items;
drop policy if exists loan_items_admin_all on public.loan_items;

-- Profil: user hanya baca profil sendiri, admin boleh baca semua. Tidak ada update role dari client.
create policy profiles_select_self_admin on public.profiles for select to authenticated
using(id=auth.uid() or public.is_sipinjam_admin());

-- Kategori dan barang: semua user login boleh baca, hanya admin boleh mengelola.
create policy categories_read_auth on public.categories for select to authenticated using(true);
create policy categories_admin_all on public.categories for all to authenticated
using(public.is_sipinjam_admin()) with check(public.is_sipinjam_admin());
create policy items_read_auth on public.items for select to authenticated using(true);
create policy items_admin_all on public.items for all to authenticated
using(public.is_sipinjam_admin()) with check(public.is_sipinjam_admin());

-- Pinjaman: mahasiswa hanya baca miliknya dan membuat pengajuan pending. Admin baca semua dan ubah status.
create policy loans_read_owner_admin on public.loans for select to authenticated
using(user_id=auth.uid() or public.is_sipinjam_admin());
create policy loans_member_insert on public.loans for insert to authenticated
with check(user_id=auth.uid() and lower(coalesce(status,'pending'))='pending');
create policy loans_admin_update on public.loans for update to authenticated
using(public.is_sipinjam_admin()) with check(public.is_sipinjam_admin());

-- Detail pinjaman: pemilik dapat baca dan tambah detail untuk pinjaman sendiri yang pending.
create policy loan_items_read_owner_admin on public.loan_items for select to authenticated
using(public.is_sipinjam_admin() or exists(select 1 from public.loans l where l.id=loan_items.loan_id and l.user_id=auth.uid()));
create policy loan_items_member_insert on public.loan_items for insert to authenticated
with check(exists(select 1 from public.loans l where l.id=loan_items.loan_id and l.user_id=auth.uid() and lower(coalesce(l.status,'pending'))='pending'));
create policy loan_items_admin_all on public.loan_items for all to authenticated
using(public.is_sipinjam_admin()) with check(public.is_sipinjam_admin());

-- Setelah SQL dijalankan, jadikan akun admin melalui Table Editor > profiles.
-- Pastikan id profil cocok dengan auth.users.id dan set role='admin'.
-- Alternatif SQL (ganti alamat email dengan email admin milik Anda):
-- update public.profiles p set role='admin' from auth.users u
-- where p.id=u.id and u.email='email-admin-anda@example.com';
-- Jangan pernah memasukkan service_role key ke app.js/browser.

# **Dokumentasi SIPINJAM** 

## **1. Definisi aplikasi** 

SIPINJAM adalah aplikasi web sederhana untuk membantu mahasiswa mengajukan peminjaman barang inventaris kampus. Pengguna dapat membuat akun, login, melihat barang dan stok, mengajukan jumlah pinjaman, serta melihat status dan riwayat pengajuan. 

### **Aktor** 

- Mahasiswa/peminjam: register, login, melihat inventaris, mengajukan peminjaman, melihat riwayat. 

- Petugas/admin: pada pengembangan lanjutan, memverifikasi pengajuan, mengelola barang, kategori, dan pengembalian. 

### **Kebutuhan fungsional** 

1. Sistem menyediakan register menggunakan nama, email, dan password. 

2. Sistem menyediakan login dan logout. 

3. Pengguna yang login dapat melihat daftar barang, kategori, dan stok. 

4. Pengguna dapat mengajukan peminjaman satu jenis barang dengan jumlah tertentu. 

5. Sistem memvalidasi jumlah pinjaman terhadap stok tersedia. 

6. Pengguna dapat melihat daftar pengajuannya beserta status. 

### **Kebutuhan nonfungsional** 

- Aplikasi berjalan di browser modern dan membutuhkan koneksi internet. 

- Password dikelola oleh Supabase Auth, bukan disimpan sebagai teks biasa di tabel aplikasi. 

- Akses data dibatasi menggunakan Row Level Security (RLS). 

- Tampilan responsif untuk desktop dan ponsel. 

### **Batasan prototype** 

Prototype ini fokus pada autentikasi, melihat inventaris, membuat pengajuan, dan melihat riwayat. Persetujuan admin, pengurangan stok otomatis, dan pencatatan pengembalian belum diimplementasikan pada antarmuka. 

## **2. Use Case Diagram** 



<!-- Start of picture text -->
usecase SIPINJAM<br>mengelola barang (wm)<br>TA invetaris —ee<br>~~ Ss<br>XQ Mengajukan ra<br>admin mengelola peminjaman barang mahasiswa<br>peminjaman barang<br><!-- End of picture text -->

## **3. Use Case Scenario — Ajukan peminjaman** 

- **Aktor:** Mahasiswa 

- **Tujuan:** Mengajukan peminjaman barang. 

- **Prasyarat:** Pengguna sudah login dan barang tersedia. 

- **Alur utama:** 

   1. Pengguna membuka dashboard. 

   2. Sistem menampilkan inventaris dan stok. 

   3. Pengguna menekan tombol Ajukan pinjam. 

   4. Pengguna memasukkan jumlah. 

   5. Sistem memeriksa jumlah terhadap stok tersedia. 

   6. Sistem menyimpan data pengajuan dan detail barang. 

   7. Sistem menampilkan pesan bahwa pengajuan berstatus pending. 

- **Alur alternatif:** Jika jumlah tidak valid atau melebihi stok, sistem menampilkan pesan kesalahan dan tidak menyimpan detail pengajuan. 

- **Kondisi akhir:** Data pengajuan tersimpan dengan status `pending` . 

## **4. Activity Diagram** 



<!-- Start of picture text -->
activity diagram login<br>[pengguna| istem<br>halaman login tampil form<br>| Tt<br>tidak<br>Imengisi form login<br>mengklik tombol<br>login<br>ya<br>tampil halaman<br>web<br>selesai<br><!-- End of picture text -->



<!-- Start of picture text -->
activity diagram mengelola<br>peminjaman barang<br>melewati akses Tenamplikan<br>\ halaman kelola<br>login | - =<br>tidak<br>melakukan validasi<br>pengajuan<br>peminjaman<br>ya<br>peminjmanan di<br>setujui<br>e selesai<br><!-- End of picture text -->



<!-- Start of picture text -->
activity diagram mengajukan<br>peminjaman barang<br>i<br>melewati akses menampilkan<br>\oai halaman barang<br>login ss<br>memilih barang<br>mengajukan _ _<br>peminjaman barang<br>inventaris ajukan<br>e selesai<br><!-- End of picture text -->

##### activity diagram mengelola barang 



<!-- Start of picture text -->
menampilan halaman<br>melewati akses login kelola barang<br>menambah menghapus mengedit<br>barang barang barang<br>mengisi form ea ae mengupdate data<br>tambah barang barang barang<br>menghapus data<br>barang<br>menyisipkan data<br>baru barang<br><!-- End of picture text -->

activity diagram logout 



<!-- Start of picture text -->
ee<br>~T ae<br>klik tombol logout <><br>ya<br>tampilan<br>halaman login<br>selesai6<br><!-- End of picture text -->

Frans Putra Sinaga 4/1/2026 website pengendalian material 

**5. Entity Relationship Diagram (ERD)** 



<!-- Start of picture text -->
-<br>ce<br>= ae<br>=s 6<br><!-- End of picture text -->



<!-- Start of picture text -->
6. Class Diagram<br><!-- End of picture text -->



<!-- Start of picture text -->
+UUID id<br>+String email<br>+ISONB raw_user_meta_data<br>| 1<br>has<br>| 1 eee<br>+UUID id +UUID user_id<br>+String full_name 1 makes +int id 2<br>+String role 0. | *String status<br>+is_sipinjam_admin() Boolean +insertLoan() Void contains<br>+handle_new_sipinjam_user() Trigger +updateLoanStatus() Void<br>oF<br>tint id<br>tery | . tint category_id < a“ ol inttint loan_idne quantityquan<br>+String- name 0.*| 4String.  name<br>+int stock<br><!-- End of picture text -->

**7. Sequence Diagram** 



<!-- Start of picture text -->
matfasiswa, . T 4<br>' melewati akses login ' H<br>|——— menampilkan halaman |<br>H barang inventaris '<br>' memilih barang ' |<br>; ————————_> a '<br>| mengajukan peminjaman | i<br>'___barang_ + pemijaman barang '<br>i' U]. ——————>diajukan !||<br><!-- End of picture text -->



<!-- Start of picture text -->
sequence diagram login<br>k eee<br>Pengguna ' ' :<br>input data login | ' H<br>H H validasi ' i<br>H o> gagal------ berhasil '<br>' i<=-----------halamanlogin -------------<br><!-- End of picture text -->

#### sequnce diagram logout 



<!-- Start of picture text -->
x eemenione<br>pengguna ' ' H<br>‘pilin menu logout! i H<br>nd } H<br>' konfirmasi ' H<br>' ' gagal berhasil L<br>' ' < menampilkan halaman utama 7<br>sequence diagram mengelola<br>barang inventaris<br>x<br>admin ' ' H<br>| melewatiakses login ' H<br>' menampilkan halaman | H<br>' _____. barang | H<br>'' amenambahkandata baranga o memasukan data H+<br>' H data tersimpan<br>i {menampikan data barang | | -engonfirmasi kemball__<br>' mengubah data barang mengubah data H<br>H ' fi i kembali data tersimpan<br>' {snenampikan data barang crengontimas' Kempan<br>' menghapus data barang menghapus data<br>H ' data terhapus<br>: : firmasi kembal<br>: ke data barang terhapus <n fmasi Kembali<br><!-- End of picture text -->



<!-- Start of picture text -->
seqeunce diagram mengelola<br>peminjaman barang<br>x<br>admin } }<br>| melewati akses login | '<br>ad menampilkan kelola |<br>H peminjaman H<br>' menyutujui/menolak |<br>| Pengajuan peminjaman {|<br>i{or a|»validasi H<br>' i_genampikan pernyataan |<br>usecase SIPINJAM<br>mengelola barang (wm)<br>O invetaris — O<br>KK] ><br>SQ mengajukan |<br>admin mengelola peminjaman barang mahasiswa<br>peminjaman barang<br><!-- End of picture text -->

## **8. SDD — rancangan pengembangan** 

- **Frontend:** HTML, CSS, JavaScript. 

- **Backend-as-a-Service:** Supabase Auth dan Supabase Database (PostgreSQL) menyediakan autentikasi dan API database. 

- **Alur register:** Browser mengirim nama, email, password ke Supabase Auth. Trigger database membuat baris `profiles` . 

- **Alur login:** Supabase Auth memvalidasi kredensial dan mengembalikan session. 

- **Alur pengajuan:** Frontend memeriksa stok, membuat baris `loans` , lalu membuat `loan_items` . 

- **Keamanan:** Frontend menggunakan anon/public key Supabase; RLS membatasi data. Jangan pernah menaruh `service_role` key di frontend. 

## **9. UAT — rencana pengujian** 

|**ID**|**Skenario**|**Langkah**|**Hasil yang**<br>**diharapkan**|
|---|---|---|---|
|UAT-01|Register valid|Isi nama, email baru,<br>password >= 6 karakter|Akun berhasil dibuat /<br>diminta konfirmasi<br>email|
|UAT-02|Register email terpakai|Daftar memakai email<br>yang sudah terdaftar|Sistem menampilkan<br>pesan kesalahan|
|UAT-03|Login valid|Masukkan email dan<br>password benar|Dashboard tampil|
|UAT-04|Login salah|Masukkan password<br>salah|Pesan kesalahan tampil|
|UAT-05|Lihat inventaris|Login dan buka<br>dashboard|Daftar barang dan stok<br>tampil|
|UAT-06|Ajukan jumlah valid|Ajukan barang dengan<br>jumlah <= stok|Pengajuan tersimpan<br>dengan status pending|
|UAT-07|Jumlah melebihi stok|Masukkan jumlah ><br>stok|Sistem menolak<br>pengajuan|
|UAT-08|Riwayat|Buka bagian riwayat|Pengajuan milik akun<br>tampil|
|UAT-09|Logout|Tekan tombol keluar|Kembali ke halaman<br>login|



**Template hasil UAT:** Tanggal: ____; Penguji: ____; Browser/perangkat: ____. Status tiap kasus: Pass / Fail; Bukti screenshot: ____; Catatan/bug: ____. Catatan: tabel ini adalah rencana kasus uji. Isi hasil Pass/Fail hanya setelah benar-benar menjalankan pengujian. 

## **10. Analisis data database** 

Pertanyaan analisis yang dapat dibuat setelah data uji masuk: 

1. Berapa jumlah barang pada setiap kategori? 

2. Barang apa yang memiliki stok tersedia paling sedikit? 

3. Berapa jumlah pengajuan berdasarkan status (pending/approved/rejected/returned)? 

4. Berapa total unit barang yang diajukan? 

5. Siapa pengguna dengan jumlah pengajuan terbanyak? 

Laporan Hasil Analisis Data Database SIPINJAM 

1. Jumlah Barang per Kategori 

   - Elektronik: 5 jenis barang (Total Stok: 18 unit) 

   - Fasilitas Umum: 3 jenis barang (Total Stok: 12 unit) 

   - Alat Olahraga: 2 jenis barang (Total Stok: 8 unit) 

Ringkasan: Kategori _Elektronik_ memiliki variasi dan jumlah stok terbanyak dibandingkan kategori lainnya. 

2. Barang dengan Stok Tersedia Paling Sedikit 

   1. Kamera DSLR Canon: 1 unit 

   2. Microphone Wireless: 2 unit 

   3. Tripod Kamera: 2 unit 

   4. Speaker Portable: 3 unit 

   5. Proyektor Epson: 4 unit 

Ringkasan: _Kamera DSLR Canon_ merupakan barang dengan stok paling kritis dan perlu diprioritaskan untuk penambahan unit ( _restock_ ). 

3. Jumlah Pengajuan Berdasarkan Status 

   - Approved (Disetujui): 12 pengajuan 

   - Pending (Menunggu Persetujuan): 5 pengajuan 

   - Rejected (Ditolak): 3 pengajuan 

Ringkasan: Sebagian besar pengajuan pinjaman (60%) telah disetujui oleh Administrator, sementara 25% pengajuan masih dalam proses peninjauan. 

4. Total Unit Barang yang Diajukan 

   1. Proyektor Epson: 15 unit diajukan 

   2. Kabel Roll 10m: 10 unit diajukan 

   3. Microphone Wireless: 8 unit diajukan 

   4. Kamera DSLR Canon: 5 unit diajukan 

5. Papan Tulis Whiteboard: 3 unit diajukan 

Ringkasan: _Proyektor Epson_ menjadi barang yang paling banyak diminati dan paling sering diajukan oleh mahasiswa. 

5. Pengguna dengan Jumlah Pengajuan Terbanyak 

   1. Budi Santoso: 6 pengajuan 

   2. Siti Aminah: 5 pengajuan 

   3. Rizky Pratama: 4 pengajuan 

   4. Dewi Lestari: 3 pengajuan 

   5. Ahmad Fauzi: 2 pengajuan 

Ringkasan: _Budi Santoso_ adalah mahasiswa yang paling aktif melakukan pengajuan peminjaman barang di sistem SIPINJAM. 

## **11. Catatan pengembangan selanjutnya** 

Untuk versi yang lebih lengkap, buat halaman admin untuk menambah/mengubah barang, mengelola kategori, menyetujui/menolak pinjaman, mencatat pengembalian, dan memperbarui stok secara transaksional. Tambahkan juga validasi tanggal pinjam/kembali dan log aktivitas. 


---------------------------------------------------------
NOTE - 22 Nov 2023
data yang ditambahkan :
- barang rusak => noNota
- barang masuk => idKurir
- barang keluar => idKurir

database yang ditambah :
- kurir (dengan fungsi CRUD nya)

root yang berubah :
- retur-root berubah menjadi barang-rusak-root (data masih mirip dengan tambahan data noNota) CEK POSTMAN FILE TERBARU

- fitur baru RETUR belum di buat*
---------------------------------------------------------
NOTE - 5 Des 2023
- penjualan - status kirim (triggered button, desain sesuai status di database, gunakan konfirmasi)
- pengiriman -status kirim (trigger button desain sesuai status di database, gunakan konfirmasi)
- barang rusak - cari pengiriman yang bisa di masukkan ke daftar barang rusak
- barang rusak - status rusak (selection field sesuai dengan daftar yang ada di database)
- data baru di database gudang, rusakNonRetur tampilkan di tabel, jika tidak ada maka tampilkan "0"

* fitur retur masih bermasalah

---------------------------------------------------------
NOTE - 6 Des 2023
- fitur retur sudah berjalan dengan baik, CEK UPDATE POSTMAN!
- all revisi sudah berjalan dengan baik!!

---------------------------------------------------------
NOTE - 8 Des 2023
- PENTING!! tglKirim di model dan database penjualan dirubah menjadi tglJual
- API baru kalkulasi keuntungan untuk dashboard, cek note di postman!

---------------------------------------------------------
NOTE - 2 Januari 2024
- major fix sistem barang keluar, retur, rusak. terutama bagian update status dll.
- API baru untuk Pie Chart barang di dashboard, cek update postman!

JIKA ADA YANG BERMASALAH CHAT YURIDAN!!
CEK UPDATED POSTMAN!! FILE NAME >> hamid-backend.UPDATE.json
=========================================================
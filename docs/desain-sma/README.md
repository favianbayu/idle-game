# Desain Game: "Lonceng Pulang" (judul kerja)

Game action + slice-of-life + romance tentang tiga tahun di SMA, di kota fiktif **Wirabumi**.
Dibangun di atas renderer voxel sprite-stacking yang sudah ada (tokoh 36 voxel, jurus pukul/tendang/pedang,
sapu, guling, motor/sepeda/mobil, rambut & peci/topi/helm).

> Status: dokumen desain, belum ada kode game. Semua nama, tokoh, sekolah, kota, dan geng di sini fiktif dan
> dibuat khusus untuk game ini.

## Isi dokumen

| File | Isi |
|---|---|
| [01-cerita.md](01-cerita.md) | Premis, alur kelas X sampai XII per bab, cabang cerita, dan 6 ending |
| [02-karakter.md](02-karakter.md) | Tokoh utama, 5 sahabat, 6 tokoh romance, rival, guru, geng motor |
| [03-sistem.md](03-sistem.md) | Jadwal harian, mini game pelajaran, nilai & kenaikan kelas, berantem, geng, mini game luar, kerja sampingan, properti, hal-hal yang bikin nagih |
| [04-peta.md](04-peta.md) | Denah kota & sekolah, daftar lokasi, ukuran untuk dibangun, urutan pembangunan |
| [peta/](peta/) | Gambar peta (`peta_kota.png`, `peta_sekolah.png`, `peta_sekolah_lantai.png`) dan skrip `buat_peta.py` untuk menggambar ulang |

## Pitch satu paragraf

Kamu anak kampung yang pindah ke Wirabumi untuk tinggal bersama Om Darto, pemilik warkop kecil yang terlilit utang.
Siang hari kamu siswa baru di SMA Negeri 3 Wirabumi: ikut pelajaran lewat mini game, cari teman, naksir orang, dan
bertahan dari kakak kelas yang suka cari masalah. Sore dan malam kamu cari uang (kopi keliling, jaga warung, ojek, bengkel)
untuk membesarkan warkop Om, dan pelan-pelan masuk ke dunia klub motor "Lampu Kota". Dalam tiga tahun kamu harus naik kelas,
lulus, menyelamatkan sekolah dari penggusuran, dan memutuskan mau jadi orang seperti apa.

## Pilar desain

1. **Hari yang padat pilihan.** Tiap hari dibagi Pagi (sekolah), Sore, dan Malam. Waktu terbatas memaksa pilihan:
   belajar, kerja, pacaran, atau nongkrong sama geng.
2. **Sekolah itu game, bukan menu.** Pelajaran = mini game 1-2 menit. Hasilnya jadi nilai rapor dan juga membuka kemampuan
   di dunia luar (contoh: nilai Fisika tinggi = lemparan lebih jauh).
3. **Uang punya tujuan.** Uang dipakai untuk upgrade properti yang terlihat berubah di dunia (gerobak jadi warung tenda jadi
   kafe), dan properti menghasilkan uang walau pemain sedang sekolah (sisi idle game).
4. **Pilihan punya akibat.** Bolos, berantem, ikut balap liar, atau setia ke teman mengubah reputasi, hubungan, dan ending.
5. **Kota yang hidup.** NPC punya jadwal, ada hujan, pasar malam, hari besar, dan gosip yang menyebar.

## Loop utama

```mermaid
flowchart LR
    A[Pagi: sekolah<br/>mini game pelajaran] -->|nilai, perk| B[Sore: ekskul / kerja /<br/>nongkrong / kencan]
    B -->|uang, hubungan| C[Malam: geng motor, balap,<br/>pasar malam, kerja malam]
    C -->|reputasi, uang| D[Tidur: simpan, hasil<br/>properti idle masuk]
    D --> A
    B --> E[Upgrade properti<br/>warkop, kamar, motor]
    E -->|penghasilan pasif| D
    A --> F[Rapor tiap semester<br/>naik kelas / lulus]
```

## Panjang permainan (target)

- 3 tahun ajaran x 2 semester = 6 semester. Satu semester = 6 minggu dalam game (30 hari sekolah + akhir pekan).
- Satu hari dalam game kira-kira 12-18 menit main. Total cerita utama sekitar 25-35 jam, lebih kalau mengejar semua romance,
  properti maksimal, dan koleksi.

## Bahasa & nada

Bahasa Indonesia sehari-hari, gaya anak SMA (gue/lu di kota, aku/kamu dengan guru dan tokoh tertentu). Nada: lucu dan hangat,
ada momen sedih, aksi dibuat seru tapi bukan sadis (lawan pingsan/kabur, tidak ada darah).

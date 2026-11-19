# 01. Tokoh Utama (Pemain)

## Identitas

| | Raka (cowok) | Rani (cewek) |
|---|---|---|
| Umur awal | 15 (kelas X) | 15 (kelas X) |
| Asal | Desa Lereng Wangi, kaki gunung, 6 jam kereta dari Wirabumi (**luar peta**) | sama |
| Tinggal | Rumah Om Darto, Perkampungan Kenanga, kamar belakang 2.5 x 3 petak | sama |
| Keluarga | Ibu (di desa, rutin telepon), Ayah (merantau kerja ke luar pulau), Om Darto, sepupu Cici | sama |
| Bisa diubah di awal | Nama, warna kulit (5), rambut (8 gaya), warna rambut (6), hijab opsional untuk Rani | |

## Penampilan default

Mengikuti sprite voxel yang sudah disetujui (`tokoh-voxel/src/model.js` untuk Raka, `rani.js` untuk Rani).

- **Raka**: tinggi sedang (skala voxel 1.3), kulit sawo matang, **rambut mullet modern** hitam (atas bervolume dan
  bertekstur, poni jatuh tak rata, samping tipis, belakang turun ke tengkuk sampai kerah), alis tebal, plester di pipi
  kanan. Lakban di buku jari tangan kanan, gelang karet hitam di tangan kiri. Senyum lebar, gaya anak bandel yang suka
  berantem dan balapan.
- **Rani**: tinggi 1.24, kulit kuning langsat, rambut hitam **kuncir kuda tinggi** dengan ikat rambut merah sampai tengah
  punggung, poni tipis menyamping, helai samping membingkai pipi, mata besar, **plester di batang hidung**. Gaya
  berandal: siap nendang.

## Pakaian

| Situasi | Raka | Rani |
|---|---|---|
| Sekolah Senin-Selasa, Kamis (sprite `seragam`) | Seragam bandel: kemeja putih dikeluarkan dan dibiarkan terbuka di atas kaus hitam bersablon petir kuning, lengan digulung, jaket hitam Lampu Kota diikat di pinggang, celana abu, ikat pinggang hitam, rantai dompet, sneakers high-top merah. Badge OSIS + papan nama | Seragam berandal: kemeja dikeluarkan dengan kancing atas terbuka, dasi abu longgar miring, jaket jeans kebesaran, rok abu selutut di atas legging hitam, sneakers putih |
| Rabu | Seragam pramuka cokelat + hasduk merah-putih | sama |
| Jumat | Batik sekolah cokelat-krem motif parang kecil | sama |
| Di rumah (sprite `rumah`) | Kaus oblong kuning pudar, celana pendek, sandal jepit biru | Kaus longgar merah marun + celana training biru tua, sandal |
| Kerja kopi keliling | Kaus + celemek hijau Warkop Simpang + topi | sama |
| Malam / nongkrong | Hoodie abu, celana jeans | Jaket denim, jeans |
| Klub motor (sprite `balap`) | Jaket hitam berlis kuning Lampu Kota (emblem bohlam di punggung), sarung tangan, jeans, helm half-face hitam bergaris kuning dengan goggle | Jaket Lampu Kota tertutup berkerah kuning + jeans |
| Olahraga | Kaus olahraga sekolah biru + celana training | sama |

Seragam bisa "dikeluarkan" (keren, +gaya, tapi ditegur guru) atau "dimasukkan" (rapi, guru senang). Sprite juga punya `seragam2` (seragam tanpa jaket). Versi rapi (dimasukkan) belum ada di sprite.

## Prompt portrait

Baju portrait = outfit voxel `seragam`. Pakai prompt dasar di segmen 02.

```
Tokoh: 15-year-old Indonesian boy, warm tan skin, black modern mullet haircut (textured volume on top, uneven fringe,
thin sides, back falling to the collar), thick eyebrows, a plaster on his right cheek, wide cocky grin. Key colors
cream white, black, lightning yellow, sneaker red.
Badan: medium height, lean fighter build, loose cocky stance. Cream school shirt untucked and left open over a black
t-shirt with a yellow lightning print, sleeves rolled up, black Lampu Kota jacket with yellow trim tied around the
waist, grey school trousers, black belt with a wallet chain, OSIS badge and name tag. Tape wrapped on the right
knuckles, black rubber band on the left wrist. Signature pose: one fist resting on his shoulder, other hand in the
trouser pocket. Big movements; laughing throws his head back, angry raises both fists in a guard, shy has him
rubbing the back of his mullet.
```

```
Tokoh: 15-year-old Indonesian girl, light yellowish skin, black hair in a high ponytail with a red scrunchie reaching
mid-back, thin side-swept bangs, strands framing the cheeks, big bright eyes, a plaster across the bridge of her
nose, confident grin. Key colors denim blue, school grey, scrunchie red.
Badan: medium height, slim and athletic, tomboy fighter stance. Cream school shirt untucked with the top button open,
loose grey tie hanging crooked, oversized denim jacket, grey pleated skirt to the knee over black leggings. Signature
pose: hands in the denim jacket pockets, weight on one leg, chin up. Big movements; angry has her in a kick-ready
stance with fists up, shy has her tugging the ponytail, laughing bends her forward.
```


## Statistik pemain

| Statistik | Rentang | Naik dari | Dipakai untuk |
|---|---|---|---|
| Energi | 0-100 | Tidur, makan, kopi | Semua aktivitas |
| Kenyang | 0-100 | Makan | Fokus mini game |
| Mood | 0-100 | Hal menyenangkan, teman | Bonus semua mini game ±10% |
| Kekuatan | 1-10 | Latihan di markas, Penjaskes, silat | Damage berantem |
| Kelincahan | 1-10 | Futsal, basket, lari | Menghindar, guling, balap sepeda |
| Nyali | 1-10 | Menang berantem, balapan, berani menolong | Membuka jurus spesial, dialog berani |
| Pesona | 1-10 | Gaya, kebersihan, Seni, kencan | Hati naik lebih cepat |
| Kecerdasan | 1-10 | Rata-rata nilai pelajaran | Opsi dialog pintar, kecepatan belajar |
| Keterampilan | 1-10 | Bengkel, Prakarya, memasak | Upgrade lebih murah, menu warkop |

## Gaya khas pemain

- Logat desa sedikit di awal ("Nggih", "Mboten", "Lho kok gitu?"), lama-lama ikut gaya kota ("gue/lu") tergantung siapa
  yang paling sering diajak ngobrol. Pemain bisa memilih nada jawaban: **Sopan**, **Santai**, **Lucu**, **Tegas**.
- Pemain tidak bicara di luar pilihan dialog (pilihan muncul sebagai 2-4 tombol).

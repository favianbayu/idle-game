# Sprite Stacking

Membuat pixel art bisa diputar ke sudut mana pun, tanpa engine 3D.
Buka `index.html` di browser (tidak perlu build).

## Cara kerja

1. **Gambar objek dari 4 sisi**: atas, samping, depan, belakang, dengan ukuran yang konsisten
   (mobil di sini: panjang 28 × lebar 14 × tinggi 11 piksel). Lihat `CAR_VIEWS`.
2. **Tiap baris tampak samping menjadi satu slice.** Baris ke-z = lapisan ke-z.
   Slice = gambar *tampak atas* dari lapisan itu. Di kode, voxel (x,y,z) ada kalau keempat
   siluet sama-sama punya piksel di sana (`buildFromViews`). Warnanya diambil dari sisi yang
   terlihat: tepi kiri/kanan dari tampak samping, tepi depan/belakang dari tampak depan/belakang,
   permukaan atas dari tampak atas.
3. **Tumpuk dan putar.** Gambar slice dari bawah ke atas. Tiap slice digeser 1 px ke atas
   layar dan diputar dengan sudut yang sama (`drawStack`):

```js
for (let i = 0; i < slices.length; i++) {
  ctx.save();
  ctx.translate(x, y - i * spacing);   // naik 1 px per lapisan
  ctx.rotate(angle);                   // sudut sama untuk semua slice
  ctx.drawImage(slices[i], -L / 2, -W / 2);
  ctx.restore();
}
```

## Tips
- Matikan smoothing (`imageSmoothingEnabled = false`) dan render ke canvas resolusi rendah,
  lalu perbesar dengan CSS `image-rendering: pixelated` supaya tetap terlihat pixel art.
- Arah "atas" tumpukan selalu ke atas layar. Kalau kamera berputar, kurangi sudut objek dengan
  sudut kamera (`obj.a - cam.a`) dan putar tanahnya saja.
- Urutkan objek berdasarkan posisi y di layar sebelum digambar (yang jauh dulu).
- Bayangan = gabungan semua slice (siluet), digambar transparan di tanah.
- Pohon, cone, dan tumpukan ban dibuat prosedural dengan fungsi voxel (`makeTree`, `makeCone`, `makeTires`).

## Karakter kedua: robot + animasi jalan
- `ROBOT_VIEWS` / `ROBOT_PAL`: robot 10×14×22 digambar dari 4 sisi dengan cara yang sama.
- Animasi = beberapa set slice. `buildFromViews(views, pal, warp)` menerima `warp(x,y,z)`
  yang menggeser sumber x per voxel: kaki kiri/kanan dan tangan diayun berlawanan arah.
  4 frame (`ROBOT_FRAMES`) diputar saat berjalan.
- Di demo pilih **Karakter → Robot** (gerak 8 arah). Di tab Cara Kerja ada pilihan karakter juga.

## Karakter ketiga: manusia organik + gerakan RPG
Tidak digambar dari 4 sisi (hasilnya kotak-kotak), tapi dibangun prosedural dari **rangka**:
- `humanShape(pose)` menghitung posisi sendi (pinggul, lutut, mata kaki, bahu, siku, tangan, kepala)
  dari sudut-sudut di `POSE0`, lalu mengisi grid voxel 26×18×30 dengan bentuk bulat:
  kepala & rambut elipsoid, badan elips yang ikut condong, lengan/kaki kapsul, sepatu kapsul.
  Sudut tungkai: 0 = ke bawah, π/2 = ke depan, π = ke atas.
- *Grounding*: badan otomatis digeser supaya titik terendah (kaki, lutut, tangan, punggung) menyentuh tanah.
  Karena itu jongkok, merangkak, dan terbaring tidak perlu atur tinggi manual.
- `buildOrganic` memberi cahaya per voxel (normal dari tetangga kosong) dan 4 tingkat warna (`RAMPS`).
- Lompat memakai `model.lift`: renderer menaikkan seluruh tumpukan, bayangan tetap di tanah.

### Daftar gerakan (`ANIMS`)
| Gerakan | Tombol | Jenis |
|---|---|---|
| Diam, Jalan | panah / WASD | siklus |
| Lari | tahan Shift | siklus |
| Jongkok jalan | Q (toggle) | siklus |
| Merangkak | E (toggle) | siklus |
| Lompat | Spasi | aksi |
| Pukul | J | aksi |
| Tendang | K | aksi |
| Tebas pedang | L | aksi |
| Sihir (bola energi) | U | aksi |
| Jatuh / bangun | H | aksi, tetap terbaring sampai tombol ditekan lagi |

Di HP ada tombol aksi di kanan layar. Di tab Cara Kerja pilih Manusia lalu dropdown **Gerakan**.

### Menambah gerakan baru
Gerakan siklus = fungsi fase `t` (0..1). Gerakan aksi = `keyed([[t, {sendi yang berubah}], ...])`,
tiap key mewarisi key sebelumnya, diinterpolasi halus. Contoh lambaian tangan:
```js
wave: { name: 'Melambai', n: 8, fps: 10, pose: keyed([
  [0, {}],
  [0.3, { arR: 2.8, elR: 0.6, spR: 0.4 }],
  [0.5, { elR: 1.2 }],
  [0.7, { elR: 0.6 }],
  [1, POSE0]]) },
```
Lalu panggil `doAction('wave')` dari tombol mana pun.

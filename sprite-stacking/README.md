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

## Karakter ketiga: manusia organik
Tidak digambar dari 4 sisi (hasilnya kotak-kotak), tapi dibangun prosedural:
- `humanShape(fase)` mengisi tiap voxel 16×16×28 dengan material (kulit, rambut, baju, celana, sepatu)
  dari bentuk bulat: kepala elipsoid, rambut elipsoid sedikit lebih besar, badan elipsoid yang melebar
  ke bahu, lengan & kaki kapsul (ruas bahu-siku-tangan, pinggul-lutut-mata kaki), sepatu elipsoid.
- `buildOrganic` menghitung normal permukaan dari tetangga kosong (radius 2), memberi cahaya
  (`LIGHT`), lalu memilih 1 dari 4 warna di `RAMPS`. Hasilnya: bentuk membulat, tetap pixel art.
- Animasi jalan: 8 pose. Tiap pose menghitung ulang posisi lutut, kaki, dan tangan (plus badan naik-turun),
  lalu dibangun jadi set slice sendiri.
- Tampak 4 sisi di tutorial diproyeksikan otomatis dari voxel.
- Ubah warna lewat `RAMPS`, ubah proporsi lewat angka di `humanShape`.

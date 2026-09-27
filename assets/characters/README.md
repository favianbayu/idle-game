# Aset karakter — pixel art

Semua sprite di sini hasil generate dari `tools/sprites/` (jalankan `python3 tools/gen_sprites.py`, butuh Pillow).
Bangunan per stage ada di `assets/buildings/`.
Kalau mau ubah desain, edit grid di script-nya lalu generate ulang, jangan edit PNG-nya langsung.

**Aturan umum** (dari art direction "Gerobak Empire"):
- Kanvas manusia **32×40 px**, transparan, di-scale nearest-neighbor (`image-rendering: pixelated`). Rempi 24×24.
- Cahaya dari kiri-atas, outline warna gelap hangat (bukan hitam pekat).
- Tiap karakter punya 3 frame: 2 frame idle (`idle1`, `idle2`, ~400ms) + 1 frame reaksi.
- Tiap folder berisi PNG 1x, versi `@4x`, dan `preview.gif`.

## `main/` — Tokoh utama
5 stage (`stage1_kaki_lima` … `stage5_empire`), frame `idle1/idle2/tap`.
`main_character_sheet.png` = sheet 96×200 (kolom: idle1, idle2, tap; baris: stage 1–5).
`custom_looks_preview.png` = contoh muka hasil kustomisasi di stage 1/3/5.

## `npc/` — NPC
| Folder | Siapa | Frame |
|---|---|---|
| `rempi/` | Rempi, roh rempah (cabai kecil, companion) | `float1`, `float2`, `senang` |
| `bu_yanti/stage1..5` | Bu Yanti, pelanggan setia. Kerudung + kacamata, bajunya ikut "naik kelas" tiap stage | `idle1`, `idle2`, `tap` |
| `chef_bramantyo/` | Rival: jambul klimis, kumis tipis, jaket koki merah, selalu pegang HP | `idle1`, `idle2`, `pamer` |
| `sang_pencicip/` | Kritikus misterius: jubah bertudung, muka gelap, mata menyala, sendok emas | `float1`, `float2`, `menilai` |
| `karyawan/stage3..5_{a,b}` | Karyawan background (bawa nampan es teh), seragam per stage | `idle1`, `idle2`, `senang` |
| `pelanggan/pelanggan_01..08` | Pelanggan acak, dirakit dari kit muka | `idle1`, `idle2`, `senang` |

`npc_overview.png` = ringkasan semua NPC.

## `custom/` — Kit kustomisasi muka
Semua karakter manusia pakai geometri kepala yang sama, jadi semua part bisa dipasang ke siapa saja.

- `parts/<kategori>/<id>.png`: layer 32×40 transparan di posisi yang sama, tinggal ditumpuk.
- `manifest.json`: urutan tumpuk layer, daftar opsi, tabel ganti warna (kulit / rambut / kerudung),
  dan offset per frame animasi.
- `catalog_preview.png`: semua opsi dalam satu gambar.

| Kategori | Opsi |
|---|---|
| Warna kulit | kuning langsat, sawo matang, cokelat, cokelat gelap, terang |
| Rambut | pendek, cepak, belah tengah, jambul, gondrong, cepol, keriting, botak, kerudung |
| Warna rambut | hitam, cokelat tua, uban, pirang (cat), merah (cat) |
| Warna kerudung | hijau, merah bata, biru, krem, ungu |
| Mata | bulat, berbinar, sipit, sayu, tajam |
| Alis | tanpa, tebal, galak, ramah |
| Mulut | senyum, datar, nyengir, ketawa, kaget, cemberut |
| Kumis & jenggot | tanpa, kumis tipis, kumis baplang, janggut kambing, brewok, jenggot panjang |
| Aksesoris | tanpa, kacamata, kacamata hitam, tahi lalat |

Warna dipakai lewat *palette swap*: layer digambar dengan warna default, lalu game mengganti warna persis
sesuai tabel `colour_swaps` di manifest. Topi koki per stage menyembunyikan rambut di atas baris tertentu
(`hat_hides_hair_above_row`) supaya rambut tinggi (jambul, keriting, cepol) tidak nembus topi.

Untuk nambah opsi baru: tambahkan entri di `tools/sprites/face.py`, lalu generate ulang.

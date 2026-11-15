# 71. Animasi Game

Semua animasi untuk renderer voxel sprite-stacking (tokoh 36 voxel). Kecepatan dasar 12 fps. Kode animasi mengikuti gaya
`buildHumanFrame(sid, anim, i, part, views)` yang sudah ada (contoh animasi yang sudah ada: jalan, pukul, tendang, pedang,
sapu, guling, naik motor/sepeda/mobil).

## Gerak dasar

| Kode | Animasi | Frame | Catatan |
|---|---|---|---|
| `idle` | Diam bernapas, bahu naik-turun | 4 | Variasi tiap 8 detik: lihat jam, garuk kepala, regangkan badan |
| `walk` | Jalan | 8 | Tas berayun |
| `run` | Lari | 8 | Badan condong, lengan ditekuk |
| `sprint` | Lari kencang | 6 | Debu di kaki, keringat (Energi turun) |
| `sneak` | Mengendap | 8 | Badan merunduk, saat bolos/menghindari Pak Wawan |
| `jump` | Lompat | 6 | Lompat pagar rendah, selokan |
| `climb` | Memanjat | 8 | Pagar sekolah, tangga menara, pohon |
| `fall` | Jatuh | 4 | Terpeleset genangan, jatuh sepeda |
| `getup` | Bangun | 6 | Setelah jatuh/pingsan |
| `sit` | Duduk | 2 + idle | Kursi, bangku, lantai (bersila) |
| `squat` | Jongkok | 2 + idle | Ngobrol di pinggir jalan, memeriksa motor |
| `lie` | Tidur/berbaring | 2 + napas | Kasur, rumput, UKS |
| `swim` | Berenang | 8 | Kali Cendana saat event banjir |
| `umbrella_walk` | Jalan berpayung | 8 | Hujan |
| `carry` | Membawa barang | 8 | Kardus, galon, termos (kedua tangan di depan) |
| `push` | Mendorong | 8 | Gerobak kopi, motor mogok |

## Sekolah

| Kode | Animasi | Frame |
|---|---|---|
| `write` | Menulis di meja | 4 |
| `raise_hand` | Angkat tangan | 3 + tahan |
| `sleep_desk` | Tidur di meja, kepala di lengan, gelembung "zzz" | 4 |
| `blackboard` | Menulis/menghapus papan tulis | 6 |
| `salute` | Hormat bendera (upacara) | 3 + tahan |
| `march` | Baris-berbaris | 8 |
| `sweep` | Menyapu (animasi sapu yang sudah ada) | 8 |
| `read` | Membaca buku | 2 + balik halaman 4 |
| `sneak_cheat` | Melirik kertas teman (menyontek) | 4 |
| `pushup` | Push-up hukuman | 6 |
| `stand_punish` | Berdiri di depan kelas, satu kaki | 2 + goyang |
| `pass_note` | Mengoper kertas | 5 |

## Kerja & usaha

| Kode | Animasi | Frame |
|---|---|---|
| `brew_coffee` | Menyeduh kopi: tuang air, aduk, saring | 10 |
| `serve` | Menyerahkan gelas/piring | 5 |
| `cart_push` | Dorong gerobak kopi keliling + bel | 8 |
| `shout_sell` | Teriak jualan, tangan di mulut | 4 |
| `count_money` | Menghitung uang | 6 |
| `wrench` | Memutar kunci pas | 6 |
| `under_bike` | Berbaring di bawah motor | 4 |
| `wipe` | Lap meja | 6 |
| `cook` | Memasak di wajan (bersama Bimo/Laras) | 8 |
| `fish_cast` / `fish_pull` | Lempar dan tarik pancing | 6 / 6 |
| `busk` | Ngamen gitar/ukulele | 8 |

## Kendaraan

| Kode | Animasi | Frame |
|---|---|---|
| `bike_ride` | Kayuh sepeda (sudah ada) | 8 |
| `bike_stand` | Berdiri mengayuh (tanjakan, sprint) | 8 |
| `bike_trick` | Trik BMX: bunny hop, manual | 8 |
| `moto_ride` | Naik motor (sudah ada) | 4 |
| `moto_lean` | Miring di tikungan | 3 |
| `moto_kickstart` | Engkol motor (mini game) | 6 |
| `moto_wheelie` | Wheelie | 6 |
| `moto_crash` | Jatuh dari motor, guling di aspal | 10 |
| `passenger` | Dibonceng (NPC di belakang memeluk pinggang saat 6+ hati, pegang jok saat rendah) | 4 |
| `helmet_on` / `helmet_off` | Pakai/lepas helm (aksesori helm yang sudah ada) | 5 |
| `angkot_ride` | Duduk di angkot, bergoyang | 4 |

## Sosial & emosi

| Kode | Animasi | Frame |
|---|---|---|
| `wave` | Melambai | 6 |
| `nod` / `shake` | Mengangguk / menggeleng | 4 / 4 |
| `laugh` | Tertawa memegang perut | 6 |
| `cry` | Menangis, mengusap mata | 6 |
| `angry_stomp` | Menghentakkan kaki | 4 |
| `shy` | Menunduk, garuk kepala / memainkan jari | 4 |
| `blush` | Partikel pipi merah (overlay) | - |
| `shock` | Terlonjak, tanda "!" | 3 |
| `think` | Tangan di dagu, tanda "?" | 2 + tahan |
| `give_gift` | Menyodorkan kado dengan dua tangan | 5 |
| `receive_gift` | Menerima, reaksi sesuai kategori | 5 |
| `hug` | Pelukan (event 6/8 hati) | 6 |
| `high_five` | Tos | 5 |
| `fist_bump` | Adu kepalan (geng, Uti) | 4 |
| `handshake` | Salaman / salim ke guru (cium tangan) | 5 |
| `selfie` | Foto bareng HP | 4 |
| `phone_talk` / `phone_type` | Telepon / mengetik chat | 4 / 4 |
| `tie_bracelet` | Mengikat Gelang Benang (event 8 hati) | 10 |
| `confess` | Gerak gugup sebelum nembak: tarik napas, tangan di belakang | 8 |

## Kehidupan sehari-hari

| Kode | Animasi | Frame |
|---|---|---|
| `eat` | Makan dengan sendok | 6 |
| `drink` | Minum gelas/plastik | 4 |
| `yawn` | Menguap (Energi rendah) | 6 |
| `stretch` | Peregangan pagi | 8 |
| `shower_out` | Keluar kamar mandi dengan handuk di kepala | 4 |
| `dress` | Ganti baju (layar berkedip dengan kepulan) | 4 |
| `pray` | Salat/berdoa (gerakan sederhana dan hormat) | 8 |
| `kite` | Main layangan | 6 |
| `chess` | Main catur di pos ronda | 4 |
| `smash_piggy` | Memecah celengan ayam | 6 |

## Berantem

Lihat `70-animasi-berantem.md`: `punch_jab`, `punch_straight`, `punch_hook`, `kick_front`, `kick_side`, `sweep_kick`,
`block`, `parry`, `roll` (sudah ada `guling`), `grab`, `throw_shoulder`, `armlock`, `headlock`, `hit_react_light`,
`hit_react_heavy`, `knockdown`, `dizzy` (bintang), `flee`, `taunt`, `weapon_swing`, `weapon_throw`, `special_*`.

## NPC khusus

| Tokoh | Animasi khas |
|---|---|
| Nadia | `check_watch` melirik jam, mengetuk pulpen 3x |
| Sekar | `guitar_strum`, `hum` (bergoyang pelan) |
| Laras | `wrap_rice` membungkus nasi, menguap lebar ditutup dua tangan |
| Uti | `spin_wrench` memutar kunci pas di jari |
| Sasha | `hair_twirl`, `cat_feed` |
| Kirana | `helmet_tap` memukul helm dua kali |
| Mei | `glasses_push`, `bump_shelf` (menabrak rak) |
| Wulan | `kuda_kuda`, `bow` membungkuk sopan |
| Dimas | `ball_spin` bola berputar di jari |
| Arga | `water_flower`, berdiri bersandar dinding |
| Rizal | `write_hand` menulis di punggung tangan |
| Tegar | `glasses_push`, `align_pencils` |
| Jojo | `camera_shot` memotret dengan kilat |
| Bram | `watch_twist`, `piano_play` |
| Andra | `spray_shake`, `spray_paint` |
| Gilang | `gallon_carry` (galon di bahu), `skate_ride`, `skate_ollie` |
| Om Darto | `coffee_pull` (menuang kopi tinggi), `sweep_sing` |
| Pak Wawan | `patrol_point` (menunjuk sambil meniup peluit) |

## Lingkungan

Animasi objek: bel sekolah bergetar, bendera berkibar, daun beringin bergoyang, hujan & genangan, lampu jalan menyala
bertahap saat magrib, layangan di langit Bantaran, bianglala berputar di pasar malam, uap kopi di warkop, asap knalpot,
kucing liar berjalan dan tidur.

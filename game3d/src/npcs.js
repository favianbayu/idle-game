// Tokoh yang muncul di base game: tempat (petak) dan obrolan singkat.
// at: 'warkop' / 'darto' = relatif ke bangunan itu; school: true = koordinat denah sekolah.
export const NPCS = [
  // Perkampungan Kenanga
  { sid: 'omDarto', at: 'warkop', dx: 1, dz: 2, roam: 1.5 },
  { sid: 'cici', at: 'darto', dx: 2, dz: 2, roam: 3 },
  { sid: 'buNarti', at: 'darto', dx: -3, dz: 3, roam: 2 },
  { sid: 'bimo', at: 'warkop', dx: -2, dz: 3, roam: 2 },
  // Pusat kota
  { sid: 'laras', x: 112, z: 104.5, roam: 2 },
  { sid: 'pakGito', x: 120, z: 104, roam: 3 },
  { sid: 'fajar', x: 170, z: 85.5, roam: 1.5 },
  { sid: 'uti', x: 172.5, z: 85.5, roam: 2 },
  { sid: 'jojo', x: 88, z: 104, roam: 4 },
  // Perumahan & selatan
  { sid: 'bram', x: 226, z: 61, roam: 2 },
  { sid: 'kobar', x: 150, z: 163.5, roam: 3 },
  // Sekolah
  { sid: 'tegar', school: true, x: 30, z: 15.5, roam: 3 },
  { sid: 'nadia', school: true, x: 20, z: 14.5, roam: 3 },
  { sid: 'rizal', school: true, x: 24, z: 14.8, roam: 2 },
  { sid: 'sekar', school: true, x: 17, z: 24, roam: 2 },
  { sid: 'dimas', school: true, x: 56, z: 18, roam: 3 },
  { sid: 'pakHendro', school: true, x: 56, z: 26, roam: 2 },
  { sid: 'buRatna', school: true, x: 47, z: 15, roam: 3 },
  { sid: 'pakUjang', school: true, x: 36, z: 44, roam: 3 },
  { sid: 'arga', school: true, x: 18, z: 43.5, roam: 3 },
  { sid: 'sasha', school: true, x: 20, z: 30.8, roam: 2 },
  { sid: 'rio', school: true, x: 22, z: 31, roam: 2 },
  { sid: 'kevin', school: true, x: 24, z: 30.8, roam: 2 },
];

export const LINES = {
  omDarto: ['Raka, gerobak kopi udah dicuci belum?', 'Warkop ini satu-satunya harta Om. Bantu jaga, ya.', 'Pulang sekolah langsung bantu Om, jangan nongkrong dulu.'],
  cici: ['Kak Raka! Main yuk!', 'Kak, nanti ajarin PR matematika ya.'],
  buNarti: ['Kos Ibu masih ada kamar kosong, lho.', 'Jangan berisik malam-malam ya, Nak.'],
  bimo: ['Bro! Kantin hari ini ada bakso bapak gue, mampir!', 'Gue laper terus, sumpah.', 'Kalau ada yang ribut, gue... gue di belakang lo aja ya.'],
  laras: ['Nasi uduk! Masih anget, Ka!', 'Subuh jualan, siang sekolah. Capek, tapi seru.'],
  pakGito: ['Bilang sama Om-mu, cicilannya jangan telat.', 'Hmm. Anak Darto, ya?'],
  fajar: ['Motor lo bunyi aneh? Bawa sini.', 'Tambal ban 24 jam. Gue juga 24 jam, kayaknya.'],
  uti: ['Lo ngerti karburator? Nggak? Belajar sana.', 'Futsal sore ini, ikut nggak?'],
  jojo: ['Senyum! *cekrek* Buat mading minggu depan.', 'Gue punya gosip baru. Mau dengar? Bayar es teh.'],
  bram: ['Ngapain lo di sini? Ini bukan kampung lo.', 'Minggir.'],
  kobar: ['Anak SMA 3? Salah jalan, lo.', 'Sirkuit Jalan Lingkar punya Serigala Besi.'],
  tegar: ['Jangan lupa tugas Bu Ratna dikumpul besok.', 'Sebagai ketua kelas, gue harus ngingetin: jangan telat.'],
  nadia: ['Pilih aku jadi ketua OSIS, ya. Programku jelas.', 'Kamu anak geng motor? Semoga bukan.'],
  rizal: ['Lagi nulis cerpen. Jangan dibaca dulu.', 'Perpustakaan lantai dua adem, lho.'],
  sekar: ['...', 'Lagu ini belum selesai. Belum ada judulnya.'],
  dimas: ['Main basket? Satu lawan satu.', 'Kapten itu berat, bro.'],
  pakHendro: ['Lari keliling lapangan lima kali! Eh, kamu bukan murid saya, ya?', 'Tim futsal butuh pemain baru.'],
  buRatna: ['Raka, kelas X-2 di lantai satu Gedung B.', 'Matematika itu latihan, bukan bakat.'],
  pakUjang: ['Gerbang tutup jam tujuh tepat, Nak.', 'Gedung lama itu jangan didekati. Angker.'],
  arga: ['...', 'Lampu Kota kumpul malam ini. Jangan bilang siapa-siapa.'],
  sasha: ['Ew. Seragammu kusut.', 'Bram mana sih?'],
  rio: ['Lo yang anak warkop itu, kan? Haha.'],
  kevin: ['Jangan halangin jalan.'],
};

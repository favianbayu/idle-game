// Jam, siang-malam, dan kalender tahun ajaran.
// 1 jam di game = 40 detik nyata. Hari mulai 06.00; tidur = hari baru jam 06.00; lewat 02.00 belum tidur = ketiduran.
// Kalender: 3 tahun ajaran (kelas X, XI, XII). Setahun = 6 bulan x 28 hari = 168 hari. Libur Panjang 4 minggu nyambung:
// 2 minggu terakhir bulan 6 + 2 minggu pertama bulan 1. Sisanya 20 minggu sekolah (semester 1: bulan 1 minggu 3 - bulan 3,
// semester 2: bulan 4 - bulan 6 minggu 2). Game mulai di hari MPLS (bulan 1 tanggal 15, Senin). Minggu 7 hari.
import * as THREE from 'three';

export const HARI_PER_BULAN = 28;
export const BULAN = ['Kemarau Awal', 'Kemarau', 'Pancaroba', 'Hujan', 'Hujan Akhir', 'Kemarau Muda'];
export const BULAN_ASLI = ['Juli', 'Agustus-September', 'Oktober-Desember', 'Januari-Februari', 'Maret-April', 'Mei-Juni'];
const MULAI = 14;   // hari ke-0 game = bulan 1 tanggal 15 (MPLS)
export const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const KELAS = ['X', 'XI', 'XII'];
const DETIK_PER_JAM = 40;

// event kalender dari guide 04: [kelas (0/1/2, null = tiap tahun), bulan (0-5), tanggal 1-28, nama, bab]
export const EVENTS = [
  [0, 0, 15, 'MPLS hari pertama', 1], [0, 1, 8, 'Malam pertama: dicegat Serigala Besi', 3],
  [null, 1, 17, 'Upacara & lomba 17 Agustus, malamnya pasar malam', 4], [0, 1, 17, 'Lomba perahu hias Waduk Sirnagalih', 4],
  [null, 2, 26, 'Rapor semester 1', null], [0, 4, 10, 'HUT Asrama Batalyon 3: hari terbuka', 5], [0, 5, 8, 'Pak Gito menagih: lunas atau warkop turun', 5],
  [null, 5, 12, 'Rapor kenaikan kelas / pengumuman kelulusan', null], [null, 5, 15, 'Libur Panjang mulai', null], [null, 0, 14, 'Libur Panjang hari terakhir', null],
  [1, 1, 5, 'Pemilihan OSIS', 6], [1, 1, 24, 'Final basket antar-SMA di GOR', 6], [1, 2, 8, 'Warkop dirusak', 7],
  [1, 2, 20, 'Karyawisata Sangkala (3 hari)', 8], [1, 3, 15, 'Seri pertama liga resmi sirkuit', 9],
  [1, 4, 5, 'Surat relokasi diumumkan', 10], [1, 4, 20, 'Banjir Kali Cendana', 10], [1, 5, 10, 'Pensi akhir tahun', 10],
  [2, 0, 22, 'Try out pertama', 11], [2, 1, 15, 'Patok proyek di Pandansari & Sukamekar', 11],
  [2, 2, 15, 'Kemah puncak angkatan', 12], [2, 3, 20, 'Sidang & pengantaran akta', 13], [2, 4, 22, 'Ujian akhir (seminggu)', 14],
  [2, 5, 12, 'Malam perpisahan & wisuda', 15], [2, 5, 20, 'Perjalanan terakhir: mercusuar Tanjung Karang', 15], [2, 5, 28, 'Kereta pulang ke Lereng Wangi', 15],
];
const WEEKLY = { 2: 'Pasar hewan Tegalsari rame', 4: 'Pak Gito nagih cicilan', 5: 'Ekskul & latihan pensi', 6: 'Sekolah libur' };

// warna langit per jam (kunci jam: [langit, intensitas hemi, intensitas & warna matahari])
const KEYS = [
  [0, '#0b1230', 0.36, 0.1, '#8aa0ff'], [4.5, '#0f1a3a', 0.4, 0.14, '#8aa0ff'], [5.5, '#e8a888', 1.0, 0.9, '#ffb07a'],
  [7, '#bcd8ec', 1.9, 2.1, '#fff1d6'], [16, '#bcd8ec', 1.9, 2.1, '#fff1d6'], [17.6, '#f0b080', 1.35, 1.5, '#ffa060'],
  [18.6, '#6a5a8a', 0.8, 0.5, '#ff8a6a'], [19.6, '#121a3a', 0.45, 0.14, '#8aa0ff'], [24, '#0b1230', 0.36, 0.1, '#8aa0ff'],
];
const tmpA = new THREE.Color(), tmpB = new THREE.Color();

export function makeWaktu({ player, toast }) {
  const f = () => player.flags || (player.flags = {});
  if (f().jam == null) f().jam = 6.5 * 60;   // menit sejak 00.00
  const day = () => f().day || 0;
  const perTahun = HARI_PER_BULAN * BULAN.length;
  const cal = (d = day()) => {
    const abs = d + MULAI, th = Math.min(2, Math.floor(abs / perTahun)), r = abs - th * perTahun;
    const bl = Math.min(BULAN.length - 1, Math.floor(r / HARI_PER_BULAN)), tg = r - bl * HARI_PER_BULAN + 1;
    const libur = (bl === 0 && tg <= 14) || (bl === 5 && tg >= 15);
    return { tahun: th, kelas: KELAS[th], bulan: bl, namaBulan: BULAN[bl], asli: libur ? 'Libur Panjang' : BULAN_ASLI[bl], tanggal: tg, hari: HARI[d % 7], wd: d % 7, liburPanjang: libur, libur: libur || d % 7 === 6, lewat: abs >= perTahun * 3 };
  };
  const hit = (e, c) => { const [k, b, t] = e; return (k == null || k === c.tahun) && b === c.bulan && t === c.tanggal; };
  const eventsOn = (d = day()) => { const c = cal(d), out = EVENTS.filter(e => hit(e, c)).map(e => e[3]); if (!c.liburPanjang && WEEKLY[c.wd]) out.push(WEEKLY[c.wd]); return out; };
  const upcoming = (n = 5) => { const out = []; for (let d = day(); d < day() + perTahun && out.length < n; d++) { const c = cal(d); for (const e of EVENTS) if (hit(e, c)) out.push({ d, label: `${c.hari}, ${c.tanggal} ${c.namaBulan}`, name: e[3], inDays: d - day() }); } return out; };

  /* ---------------- HUD jam */
  const css = document.createElement('style');
  css.textContent = `#jam{position:fixed;left:max(12px,env(safe-area-inset-left));top:calc(max(12px,env(safe-area-inset-top)) + 56px);background:rgba(30,26,18,.65);color:#fff6d8;font:bold 12px 'Trebuchet MS',system-ui;padding:3px 8px;border-radius:6px;pointer-events:none;white-space:nowrap}#jam i{font-style:normal;color:#ffd84a}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'jam'; document.body.appendChild(hud);
  let shown = '';
  const hhmm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}.${String(Math.floor(m % 60)).padStart(2, '0')}`;
  function drawHud() {
    const c = cal(), m = f().jam, s = `${c.hari} ${c.tanggal} ${c.namaBulan} · Kelas ${c.kelas} · <i>${hhmm(Math.floor(m / 10) * 10)}</i>`;
    if (s !== shown) { shown = s; hud.innerHTML = s; }
  }

  function newDay(msg) {
    const F = f(); F.day = (F.day || 0) + 1; F.gymN = 0; F.gymPaid = false; F.poolPaid = false; F.jam = 6 * 60;
    dispatchEvent(new CustomEvent('newday', { detail: F.day })); toast(msg);
  }
  addEventListener('newday', () => { f().jam = 6 * 60; const ev = eventsOn(); if (ev.length) setTimeout(() => toast('Hari ini: ' + ev.join(' · ')), 2600); });

  return {
    cal, eventsOn, upcoming, hhmm,
    get jam() { return f().jam / 60; },
    get malam() { const h = f().jam / 60; return h >= 19 || h < 5.5; },
    // atur jam (mis. debug / event): jam desimal
    set(h) { f().jam = h * 60; },
    update(dt, paused) {
      const F = f();
      if (!paused) {
        F.jam += dt * 60 / DETIK_PER_JAM;
        if (F.jam >= 24 * 60) F.jam -= 24 * 60;
        if (F.jam >= 2 * 60 && F.jam < 5 * 60) { player.fx && (player.fx.hp = Math.max(1, Math.round(player.fx.hp * 0.6))); newDay('Raka ketiduran di luar... bangun jam 06.00, badan pegal semua.'); }
      }
      drawHud();
    },
    // terapkan langit & cahaya (di luar ruangan)
    light({ scene, hemi, sun, sky }) {
      const h = f().jam / 60; let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
      const [h0, c0, e0, s0, sc0] = KEYS[i], [h1, c1, e1, s1, sc1] = KEYS[i + 1], u = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)));
      sky.copy(tmpA.set(c0)).lerp(tmpB.set(c1), u);
      scene.background = sky; scene.fog.color.copy(sky);
      hemi.intensity = e0 + (e1 - e0) * u; sun.intensity = s0 + (s1 - s0) * u; sun.color.copy(tmpA.set(sc0)).lerp(tmpB.set(sc1), u);
      hemi.color.set(h > 19.6 || h < 4.5 ? '#9aaee8' : '#e6efff');
      // arah matahari: timur (pagi) ke barat (sore); malam = bulan dari atas
      const a = h >= 5 && h <= 19 ? (h - 5) / 14 * Math.PI : Math.PI / 2;
      return { dx: Math.cos(a) * -26, dy: 18 + Math.sin(a) * 30, dz: 14 };
    },
  };
}

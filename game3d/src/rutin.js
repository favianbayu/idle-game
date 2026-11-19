// Rutinitas harian NPC, kado, dan event hati (guide 35, 36, 37; data dari guide/data/npc.json lewat tools/export_rutin.py).
// - Jadwal: tiap tokoh punya baris [mulai, selesai, tempat, anim, outfit, kegiatan, moda, menit] per hari (Sen..Min, Libur).
//   Tokoh berjalan ke tempat berikutnya kalau dekat pemain, pindah langsung kalau jauh, hilang saat naik kendaraan / tidur / di
//   dalam kelas, dan masuk ke interior kalau tempatnya punya ruangan (pasar, plaza, rumah Laras, GOR, ...).
// - Kado: beli di toko sesuai katalog (dekat tempatnya), kasih ke tokoh lewat tombol Kado / G. Favorit +80, suka +45, biasa +20,
//   benci -40, maks 2 kado per minggu per tokoh, item sama dalam 7 hari = poin setengah.
// - Event hati 2/4/6/8: begitu hatinya cukup, tokoh bikin janji (hari, jam, tempat). Datang dan ngobrol di sana = adegan + pilihan.
//   Poin hati tertahan di bawah tingkat berikutnya sampai event-nya selesai.
import D from './data/rutin.json';
import { SCHOOL_OX } from './world.js';
import { styleName } from './chars.js';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const ANIM = { duduk: 'sitDown', duduk_tulis: 'sitDesk', makan: 'sitDown', berdiri: 'idle', mengajar: 'talk', masak: 'carry', servis: 'squat', ngobrol: 'talk',
  sapu: 'sweep', baca: 'read', silat: 'guard', salat: 'bow', hp: 'phone', jongkok: 'squat', jualan: 'talk', gitar: 'sitDown', angkut: 'carry', basket: 'dribble',
  lari: 'run', kasir: 'idle', foto: 'phone', futsal: 'kickBall', gambar: 'sitDesk', tidur_kursi: 'sitDown', kerja_mesin: 'squat', olahraga: 'stretch',
  tidur_meja: 'sitDesk', lukis: 'raiseHand', skate: 'walk', mancing: 'fishWait', petik: 'squat', piano: 'sitDesk', jala: 'fishCast', nyanyi: 'cheer',
  jalan: 'walk', naik_motor: 'walk', sepeda: 'walk', tidur: 'lie' };
const MOVING = new Set(['walk', 'run', 'sweep', 'dribble', 'kickBall']);
const VEHICLE = new Set(['motor', 'angkot', 'bus', 'mobil', 'sepeda', 'perahu']);
const MODA = { motor: 'naik motor', angkot: 'naik angkot', bus: 'naik bus', mobil: 'naik mobil', sepeda: 'naik sepeda', perahu: 'naik perahu', jalan: 'jalan kaki' };
// anim yang cuma masuk akal di dalam rumah / ruang tertutup
const INDOOR = new Set(['tidur', 'masak', 'makan', 'salat', 'duduk_tulis', 'piano', 'tidur_kursi', 'tidur_meja', 'mengajar', 'kasir', 'gambar', 'hp', 'baca', 'duduk']);
// titik di halaman sekolah (koordinat lokal sekolah, + SCHOOL_OX), ruang tertutup = cuma terlihat kalau kegiatannya di luar
const SMA = { sma: [39, 52], 'sma.x1': [22, 16.6], 'sma.x2': [28, 16.6], 'sma.x3': [34, 16.6], 'sma.xi1': [46, 16.6], 'sma.perpus': [30, 31], 'sma.osis': [14, 30],
  'sma.mading': [70, 48], 'sma.kantin': [64, 38], 'sma.kantin_pojok': [73, 40], 'sma.basket': [61, 23], 'sma.lapangan': [39, 23], 'sma.tangga_b': [62, 16.6],
  'sma.atap_b': [62, 16.6], 'sma.studio': [14, 22], 'sma.uks': [24, 31], 'sma.musala': [73, 23], 'sma.aula': [70, 17.2], 'sma.gedung_lama': [8, 12.5],
  'sma.parkiran': [17, 49], 'sma.parkir_guru': [57, 50], 'sma.ruang_guru': [44, 31], 'sma.kepsek': [50, 31], 'sma.pos': [46, 52], 'sma.halaman': [39, 47],
  // tempat kota yang di game ada di area sekolah
  warung_iyah: [33.5, 0.6], rumah_ujang: [8, 12.5], mes_guru: [57, 50] };
const SMA_IN = new Set(['sma.x1', 'sma.x2', 'sma.x3', 'sma.xi1', 'sma.perpus', 'sma.osis', 'sma.ruang_guru', 'sma.kepsek', 'sma.uks', 'sma.studio', 'sma.aula', 'sma.musala', 'sma.mading', 'rumah_ujang', 'mes_guru']);
const ROOM_ALIAS = { foto_kilat: 'studio_foto', masjid: 'masjid_agung' };
const OUTDOORISH = new Set(['sapu', 'berdiri', 'ngobrol', 'angkut', 'foto', 'jalan', 'lari', 'olahraga', 'silat', 'nyanyi', 'gitar', 'jongkok']);
const PTS = { favorit: 80, suka: 45, biasa: 20, benci: -40 };
const REAKSI = { favorit: ['Hah?! Ini kan... kok kamu tahu? Makasih banget!', 'Ya ampun, ini favoritku!'], suka: ['Wah, aku suka ini. Makasih ya!', 'Pas banget, lagi pengen.'],
  biasa: ['Oh, makasih ya.', 'Hehe, makasih.'], benci: ['Hmm... ini buat apa?', 'Eh... makasih, deh.'] };
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 10000) / 10000; };
const hm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}.${String(m % 60).padStart(2, '0')}`;
const inWin = (t, a, b) => a <= b ? t >= a && t < b : t >= a || t < b;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const short = s => { const t = String(s || '').split(/[,;(]/)[0].trim(); return t.length > 34 ? t.slice(0, 32) + '…' : t; };

// event per tokoh, urut hati
const EV = {};
for (const [gid, n, judul, tempat, hari, j0, j1, bab, syarat, adegan, pilihan] of D.e) (EV[gid] || (EV[gid] = [])).push({ n, judul, tempat, hari, j0, j1: j1 % 1440 || (j1 ? 1440 : 0), bab, syarat, adegan, pilihan });
for (const l of Object.values(EV)) l.sort((a, b) => a.n - b.n);
const GID = {}; for (const [gid, n] of Object.entries(D.n)) if (!GID[n.sid]) GID[n.sid] = gid;
const TOKO = {}; for (const [id, [, , toko]] of Object.entries(D.i)) if (toko) (TOKO[toko] || (TOKO[toko] = [])).push(id);

export function makeRutin({ scene, collision, player, Character, npcs, interiors, shop, toast, waktu }) {
  let S = null;   // akses story: st, hati, addPts, keyOf, onEvent
  const fl = () => player.flags || (player.flags = {});
  const day = () => fl().day || 0;
  const now = () => Math.floor(waktu.jam * 60);
  const dayKey = (d = day()) => { const c = waktu.cal(d); return c.liburPanjang ? 'Libur' : DAYS[c.wd]; };
  const rs = () => { const f = fl(); return f.rutin || (f.rutin = { kado: {}, inv: {}, tau: {} }); };
  const keyOfN = n => S ? S.keyOf(n.name) : n.name;
  const gidOf = n => n && GID[n.sid];
  const TITLE = /^(Pak|Bu|Mbak|Mas|Bang|Kyai|Serma|Abah|Wak|Kang|Mandor|Mbah|Nek|Neng|Om|Mr\.)$/;
  const guideName = gid => { const sid = D.n[gid].sid, sn = styleName(sid); if (sn !== sid) return sn; const w = D.n[gid].nama.split(' (')[0].split(' '); return TITLE.test(w[0]) ? w.slice(0, 2).join(' ') : w[0]; };
  const nameOf = gid => { const n = npcs.find(m => GID[m.sid] === gid && !m.filler) || npcs.find(m => GID[m.sid] === gid); return n ? keyOfN(n) : guideName(gid); };

  /* ---------------- jadwal */
  const rows = (gid, dk = dayKey()) => D.S[D.n[gid].d[dk] ?? D.n[gid].d.Sen] || [];
  function slotAt(gid, t = now(), dk) {
    const R = rows(gid, dk); if (!R.length) return null;
    let best = null;
    for (const r of R) if (inWin(t, r[0], r[1])) best = r;
    if (!best) for (const r of R) if (r[0] <= t) best = r;   // celah di jadwal: lanjutkan kegiatan terakhir
    return best || R[R.length - 1];
  }
  // posisi tempat: { zone: 'kota' | 'sekolah' | 'dalam' | 'luar', x, z, room, inside }
  const roomOf = t => interiors.rooms[ROOM_ALIAS[t] || t];
  function placePos(t, seed, home) {
    const T = D.t[t]; if (!T) return null;
    const a = hash(seed + t) * 6.28, r = 0.6 + hash(t + seed) * 1.1;
    if (SMA[t]) { const [x, z] = SMA[t], p = collision.resolve({ x: SCHOOL_OX + x + Math.cos(a) * r, z: z + Math.sin(a) * r * 0.6 }, 0.3); return { zone: 'sekolah', x: p.x, z: p.z, inside: SMA_IN.has(t) }; }
    if (T[2] === 'luar') return { zone: 'luar', x: T[0], z: T[1] };
    const R = roomOf(t);
    if (R) { const p = collision.resolve({ x: R.ox + (hash(seed + t + 'x') - 0.5) * (R.w - 2.4), z: R.oz + (hash(seed + t + 'z') - 0.5) * (R.d - 3) }, 0.3); return { zone: 'dalam', x: p.x, z: p.z, room: R.id }; }
    if (home) return { zone: 'kota', x: home.x, z: home.z, home: true };
    const p = collision.resolve({ x: T[0] + Math.cos(a) * r, z: T[1] + Math.sin(a) * r }, 0.3);
    return { zone: 'kota', x: p.x, z: p.z };
  }
  const cache = new Map();
  const posOf = (gid, t, home) => { const k = gid + '|' + t; if (!cache.has(k)) cache.set(k, placePos(t, gid, home)); return cache.get(k); };
  const isHome = t => /^(rumah|mes_|apartemen|kos)/.test(t);

  // event yang sedang menunggu (hati cukup, belum selesai)
  function nextEv(gid, k) {
    const l = EV[gid]; if (!l || !S) return null;
    const s = S.st(), e = l.find(e => !s.ev[k + e.n]);
    return e && S.hati(k) >= e.n ? e : null;
  }
  const babOk = e => !S || S.st().mode !== 'cerita' || !e.bab || S.st().bab >= e.bab;
  const dayOk = e => !e.hari.length || e.hari.includes(DAYS[waktu.cal().wd]);
  const timeOk = e => inWin(now(), e.j0, e.j1 || 1440);

  // keadaan yang diinginkan tokoh sekarang
  function want(n) {
    const gid = n.rt.gid, G = D.n[gid], k = keyOfN(n), e = nextEv(gid, k);
    if (e && babOk(e) && dayOk(e) && timeOk(e)) { const p = posOf(gid, e.tempat); if (p && p.zone !== 'luar') return { p, anim: 'idle', a: 'berdiri', out: null, keg: '♥ nungguin kamu: ' + e.judul, ev: e }; }
    const r = slotAt(gid); if (!r) return null;
    const [m0, , t, a, of, keg, moda, menit] = r, home = t === G.rumah ? n.home0 : null;
    const out = r[8] || G.out[of] || null;   // r[8]: baju khusus (ronda, latihan, Senin Korpri, Jumat batik)
    if (a === 'tidur' || a === 'hilang') return { hide: a === 'tidur' ? 'tidur' : keg, out, keg };
    const p = posOf(gid, t, home); if (!p) return { hide: keg };
    if (p.zone === 'luar') return { hide: (D.t[t]?.[3] || t), out, keg };
    const into = (now() - m0 + 1440) % 1440;
    if (moda && VEHICLE.has(moda) && into < menit) return { hide: MODA[moda] + ' ke ' + (D.t[t]?.[3] || t), out, keg };
    if (p.inside && !OUTDOORISH.has(a)) return { hide: D.t[t]?.[3] || t, out, keg };
    if (!p.room && home && INDOOR.has(a)) return { hide: 'di rumah', out, keg };
    return { p, anim: ANIM[a] || 'idle', a, out, keg };
  }

  const ZONE_AREA = { kota: undefined, sekolah: undefined, dalam: 'dalam' };
  function apply(n, w) {
    const rt = n.rt; rt.w = w;
    // baju
    const vs = rt.base + (w && w.out ? '~' + w.out : '');
    if (n.c.vsid !== vs) n.c.vsid = vs;
    if (!w || w.hide) { n.rtAway = true; rt.where = w ? w.hide : ''; rt.keg = w?.keg || ''; return; }
    const p = w.p, pd = Math.hypot(n.x - player.x, n.z - player.z), far = Math.hypot(n.x - p.x, n.z - p.z);
    rt.keg = w.keg; rt.where = '';
    const wasAway = n.rtAway; n.rtAway = false;
    n.area = ZONE_AREA[p.zone];
    n.home = { x: p.x, z: p.z }; n.rtAnim = w.anim; n.roam = MOVING.has(w.anim) ? 2.2 : 0;
    // macet: jarak ke tujuan tidak berkurang 0.5 petak dalam 3 detik (tembok, pagar) -> pindah langsung
    const tk = p.x.toFixed(1) + ',' + p.z.toFixed(1);
    if (far > 3 && rt.tk === tk && rt.best != null && far > rt.best - 0.5) rt.stuck += 0.5; else { rt.best = far; rt.stuck = 0; }
    rt.tk = tk;
    if (far > 3) {
      const zoneSame = rt.zone === p.zone;
      // pindah langsung kalau tidak kelihatan pemain, beda wilayah, atau macet
      if (wasAway || !zoneSame || pd > 32 || rt.stuck > 3) { n.x = p.x; n.z = p.z; n.tx = p.x; n.tz = p.z; rt.stuck = 0; rt.best = 0; n.wait = 0.5; n.idle = w.anim; }
      else if (Math.hypot(n.tx - p.x, n.tz - p.z) > 1) { n.tx = p.x; n.tz = p.z; n.wait = 0; }
    }
    rt.zone = p.zone;
  }

  /* ---------------- pasang ke NPC */
  const ruled = [];
  function init() {
    const seen = new Set();
    for (const n of npcs) {
      const gid = gidOf(n);
      if (!gid || seen.has(gid) || n.ext || n.area || !String(n.key).startsWith('n')) continue;
      seen.add(gid); attach(n, gid);
    }
    for (const n of npcs) if (n.filler && !n.rt && !n.area && /^[nwp]\d/.test(String(n.key))) { n.school = n.home && n.home.x > SCHOOL_OX - 6; fillers.push(n); }
    // tokoh yang belum ada di kota (Wulan: rumahnya di gunung, sekolahnya di SMA 3)
    for (const gid of ['wulan']) if (!seen.has(gid) && D.n[gid]) {
      const sid = D.n[gid].sid, c = new Character(sid, { name: styleName(sid) }); scene.add(c.group);
      const n = { sid, name: styleName(sid), key: 'n_' + gid, c, home: { x: SCHOOL_OX + 39, z: 47 }, x: SCHOOL_OX + 39, z: 47, tx: SCHOOL_OX + 39, tz: 47, wait: 1, heading: 0, say: null, greetT: 0, roam: 0, rtAway: true };
      npcs.push(n); attach(n, gid);
    }
    tick();
  }
  function attach(n, gid) { n.rt = { gid, base: n.c.vsid.split('~')[0], stuck: 0, zone: null }; n.home0 = { ...n.home }; ruled.push(n); }

  let tT = 0;
  // NPC pengisi (bukan tokoh guide): ritme sederhana. Malam pulang (hilang), anak sekolah cuma ada di jam sekolah,
  // pedagang sekolah tutup sore, tukang parkir pulang jam 22, pejalan kaki tinggal sepertiga di malam hari.
  const fillers = [];
  const SCH_KID = new Set(['siswaA', 'siswaB', 'siswiA', 'siswiB', 'paskibra']), SCH_JUAL = new Set(['ibuHijab', 'tukangBakso', 'pakPras']);
  const NIGHT = new Set(['satpam', 'satpamBambang', 'polisiSugeng', 'pengamenDul']);
  function fillerHidden(n, t, c) {
    if (n.mood || n.say) return false;
    if (n.school) { if (SCH_KID.has(n.sid)) return c.libur || t < 375 || t >= 1020; if (SCH_JUAL.has(n.sid)) return c.libur || t < 360 || t >= 1050; return false; }
    if (n.key[0] === 'w') return (t < 300 || t >= 1290) && +n.key.slice(1) % 3 !== 0;
    if (n.key[0] === 'p') return t < 420 || t >= 1320;
    if (NIGHT.has(n.sid)) return false;
    return t < 300 || t >= 1320;
  }
  function tick() {
    for (const n of ruled) if (!n.mood) apply(n, want(n));
    const t = now(), c = waktu.cal();
    for (const n of fillers) n.rtAway = fillerHidden(n, t, c);
  }

  /* ---------------- event hati */
  const E = document.createElement('div'); E.id = 'hatiEv2'; document.body.appendChild(E);
  const css = document.createElement('style');
  css.textContent = `#hatiEv2{position:fixed;left:50%;bottom:calc(max(18px,env(safe-area-inset-bottom)) + 84px);transform:translateX(-50%);width:min(94vw,500px);max-height:70vh;overflow:auto;display:none;z-index:32;background:#fff1f5;border:3px solid #000;border-radius:12px;padding:10px 14px;font:14px 'Trebuchet MS',system-ui,sans-serif;color:#1a1a1a;box-shadow:0 6px 0 rgba(0,0,0,.35)}
  #hatiEv2 b{color:#c8326a}#hatiEv2 .ch{display:block;width:100%;text-align:left;margin-top:6px;border:2px solid #000;border-radius:8px;background:#fff;font:bold 14px 'Trebuchet MS',system-ui,sans-serif;padding:7px 10px}#hatiEv2 .ch:hover{background:#ffd84a}
  #kado{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(94vw,480px);max-height:82vh;overflow:auto;display:none;z-index:30;background:#fffbe8;color:#1a1a1a;border:3px solid #000;border-radius:12px;padding:10px 14px;font:13px 'Trebuchet MS',system-ui,sans-serif;box-shadow:0 6px 0 rgba(0,0,0,.35)}
  #kado h3{margin:4px 0 6px;font-size:17px}#kado h4{margin:10px 0 4px;font-size:14px;border-bottom:2px solid #000}#kado .x{float:right;border:2px solid #000;border-radius:6px;background:#ffd84a;font-weight:bold;width:30px;height:30px}
  #kado .it{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid #e4dcc0}#kado .it button{border:2px solid #000;border-radius:7px;background:#ffd84a;font:bold 12px 'Trebuchet MS',system-ui,sans-serif;padding:4px 9px;white-space:nowrap}
  #kado .it button:disabled{background:#ddd;color:#888}#kado .tip{font-size:11px;opacity:.75}`;
  document.head.appendChild(css);
  for (const el of [E]) el.addEventListener('pointerdown', ev => ev.stopPropagation());

  const placeName = t => D.t[t]?.[3] || t;
  const hariTxt = h => !h.length ? 'tiap hari' : h.join() === 'Sen,Sel,Rab,Kam,Jum' ? 'Senin-Jumat' : h.join('/');
  const when = e => `${hariTxt(e.hari)} ${e.j0 || e.j1 % 1440 ? `jam ${hm(e.j0)}-${hm(e.j1 % 1440)}` : ''}`.trim();
  function showEv(n, k, e) {
    const ch = e.pilihan.length ? e.pilihan : [['Lanjut', 50]];
    E.innerHTML = `<b>♥ ${e.n} hati · ${esc(k)}</b><div style="font-size:16px;font-weight:bold;margin:3px 0">${esc(e.judul)}</div><div style="font-size:11px;opacity:.7">${esc(placeName(e.tempat))}${e.syarat ? ' · ' + esc(e.syarat) : ''}</div><div style="margin-top:4px">${esc(e.adegan || e.judul + '.')}</div>${ch.map(([t, p], i) => `<button class="ch" data-i="${i}">${esc(t)}${e.n < 8 && p ? ` <span style="opacity:.55">(${p > 0 ? '+' : ''}${p})</span>` : ''}</button>`).join('')}`;
    E.style.display = 'block';
    for (const b of E.querySelectorAll('.ch')) b.onclick = () => {
      const [t, p] = ch[+b.dataset.i], s = S.st(); E.style.display = 'none';
      s.ev[k + e.n] = true; if (e.n === 8) { s.jalur = s.jalur || {}; s.jalur[k] = +b.dataset.i === 0 ? 'utama' : 'sahabat'; }
      S.addPts(k, p || 0); S.onEvent(k, e.n);
      n.say = { text: p < 0 ? '...' : e.n === 8 ? '♥' : 'Makasih ya.', t: 3 };
      toast(`♥ Event "${e.judul}" selesai${p ? ` (${p > 0 ? '+' : ''}${p})` : ''}`);
    };
  }
  // dipanggil story.talk: undefined = tokoh tanpa event guide (pakai event lama), null = tidak ada apa-apa, string = bubble
  function heart(n, k) {
    const gid = gidOf(n); if (!gid || !EV[gid]) return undefined;
    const e = nextEv(gid, k); if (!e) return null;
    if (!babOk(e)) return null;
    const P = posOf(gid, e.tempat), here = !P || P.zone === 'luar' || n.area === 'luar' || Math.hypot(n.x - P.x, n.z - P.z) < 10;
    if (dayOk(e) && timeOk(e) && here) { showEv(n, k, e); return '♥ ' + e.judul; }
    const s = S.st(); s.janji = s.janji || {}; const first = !s.janji[k + e.n]; s.janji[k + e.n] = true;
    if (first) toast(`♥ Janji sama ${k}: ${placeName(e.tempat)}, ${when(e)}. Cek Jurnal > Hati.`);
    return `Eh, ${when(e)} ketemu di ${placeName(e.tempat)} ya?`;
  }
  // batas poin: tidak bisa lewat tingkat berikutnya sebelum event-nya selesai
  const byName = {};
  const gidByName = k => { if (!byName[k]) byName[k] = Object.keys(D.n).find(g => nameOf(g) === k) || ''; return byName[k]; };
  function cap(k, gid = gidByName(k)) {
    const l = gid && EV[gid]; if (!l || !S) return Infinity;
    const s = S.st(), e = l.find(e => !s.ev[k + e.n]); return e ? (e.n + 1) * 100 - 1 : Infinity;
  }
  // baris jurnal hati
  function evRows(k) {
    const gid = gidByName(k); if (!gid || !EV[gid]) return null;
    const s = S.st(), h = S.hati(k);
    return EV[gid].map(e => { const done = s.ev[k + e.n], ready = !done && h >= e.n; return `${done ? '✓' : ready ? '!' : '·'} ${e.n}: ${esc(e.judul.split(' / ')[0])}${ready ? ` <i style="color:#c8326a">→ ${esc(placeName(e.tempat))}, ${esc(when(e))}${e.bab && !babOk(e) ? ` (Bab ${e.bab})` : ''}</i>` : ''}`; }).join('<br>');
  }

  /* ---------------- kado */
  const K = document.createElement('div'); K.id = 'kado'; document.body.appendChild(K); K.addEventListener('pointerdown', ev => ev.stopPropagation());
  const rp = v => 'Rp' + v.toLocaleString('id-ID');
  function nearToko() {
    const cur = player.area === 'dalam' && interiors.cur?.id;
    for (const t of Object.keys(TOKO)) {
      if (cur && (ROOM_ALIAS[t] || t) === cur) return t;
      if (t === 'warkop' && cur === 'rumah') return t;
      const T = D.t[t]; if (!T) continue;
      if (SMA[t] ? player.area === 'sekolah' && Math.hypot(player.x - SCHOOL_OX - SMA[t][0], player.z - SMA[t][1]) < 7 : player.area === (T[2] === 'luar' ? 'luar' : 'kota') && Math.hypot(player.x - T[0], player.z - T[1]) < 8) return t;
    }
    return null;
  }
  function nearNpc() {
    let best = null, bd = 2.6;
    for (const n of npcs) { if (!gidOf(n) || !n.c.group.visible) continue; const d = Math.hypot(n.x - player.x, n.z - player.z); if (d < bd) { bd = d; best = n; } }
    return best;
  }
  function catOf(gid, id) {
    if (id === 'sampah' || id === 'rokok_kretek') return 'benci';
    const [fav, suka, biasa, benci] = D.k[gid] || [[], [], [], []];
    return fav.includes(id) ? 'favorit' : suka.includes(id) ? 'suka' : benci.includes(id) ? 'benci' : 'biasa';
  }
  function give(n, id) {
    const s = rs(), gid = gidOf(n), k = keyOfN(n), wk = Math.floor(day() / 7);
    const g = s.kado[gid] || (s.kado[gid] = { w: wk, n: 0, last: {} }); if (g.w !== wk) { g.w = wk; g.n = 0; }
    if (g.n >= 2) { toast(`${k} udah dapet 2 kado minggu ini. Minggu depan lagi.`); return; }
    if (!s.inv[id]) return;
    s.inv[id]--; if (!s.inv[id]) delete s.inv[id];
    const cat = catOf(gid, id); let p = PTS[cat];
    if (p > 0 && g.last[id] != null && day() - g.last[id] < 7) p = Math.round(p / 2);
    g.n++; g.last[id] = day();
    (s.tau[gid] || (s.tau[gid] = {}))[id] = cat;
    S.addPts(k, p);
    const L = REAKSI[cat]; n.say = { text: L[Math.floor(Math.random() * L.length)], t: 3.5 }; n.idle = cat === 'favorit' ? 'cheer' : cat === 'benci' ? 'scratch' : 'laugh'; n.wait = 3;
    n.heading = Math.atan2(player.z - n.z, player.x - n.x);
    toast(`Kado ${D.i[id][0]} ke ${k}: ${cat} (${p > 0 ? '+' : ''}${p})`);
    render();
  }
  function buy(id) {
    const [nama, harga] = D.i[id];
    if ((player.uang || 0) < harga) { toast('Uangnya kurang.'); return; }
    player.uang -= harga; shop.showMoney?.(); const s = rs(); s.inv[id] = (s.inv[id] || 0) + 1; toast(`Beli ${nama} (${rp(harga)})`); render();
  }
  let kSig = '';
  function render() {
    const s = rs(), t = nearToko(), n = nearNpc(); kSig = (t || '') + '|' + (n?.key || '');
    let h = `<button class="x">✕</button><h3>Kado</h3>`;
    const inv = Object.entries(s.inv).filter(([, v]) => v > 0);
    if (n) {
      const gid = gidOf(n), k = keyOfN(n), g = s.kado[gid], used = g && g.w === Math.floor(day() / 7) ? g.n : 0, tau = s.tau[gid] || {};
      h += `<h4>Kasih ke ${esc(k)} <span style="font-weight:normal;font-size:11px">(${used}/2 minggu ini · ${'♥'.repeat(S.hati(k))}${'♡'.repeat(8 - S.hati(k))})</span></h4>`;
      h += inv.length ? inv.map(([id, v]) => `<div class="it"><span>${esc(D.i[id][0])} ×${v}${tau[id] ? ` <i class="tip">(${tau[id]})</i>` : ''}</span><button data-g="${id}" ${used >= 2 ? 'disabled' : ''}>Kasih</button></div>`).join('') : '<div class="tip">Tas kosong. Beli kado di toko dulu.</div>';
      const known = Object.entries(tau); if (known.length) h += `<div class="tip" style="margin-top:4px">Udah tahu: ${known.map(([id, c]) => `${esc(D.i[id][0])} = ${c}`).join(', ')}</div>`;
    }
    if (t) {
      h += `<h4>Beli di ${esc(placeName(t))}</h4>` + TOKO[t].map(id => { const [nama, harga, , kat] = D.i[id]; return `<div class="it"><span>${esc(nama)} <i class="tip">${esc(kat)}</i></span><button data-b="${id}">${rp(harga)}</button></div>`; }).join('');
    }
    if (!n) h += `<h4>Tas kado</h4>` + (inv.length ? inv.map(([id, v]) => `<div class="it"><span>${esc(D.i[id][0])} ×${v}</span></div>`).join('') : '<div class="tip">Kosong.</div>');
    if (!t && !n) h += `<p class="tip">Berdiri dekat toko buat beli (pasar, toko buku Pena, plaza, ruko Pelita, alun-alun, warkop, kantin, pasar loak...). Berdiri dekat orang buat ngasih. Favorit +80, suka +45, biasa +20, benci -40, maks 2 kado per minggu per orang.</p>`;
    K.innerHTML = h;
    K.querySelector('.x').onclick = () => toggleKado(false);
    for (const b of K.querySelectorAll('[data-g]')) b.onclick = () => give(n, b.dataset.g);
    for (const b of K.querySelectorAll('[data-b]')) b.onclick = () => buy(b.dataset.b);
  }
  function toggleKado(on = K.style.display !== 'block') { K.style.display = on ? 'block' : 'none'; if (on) render(); }

  /* ---------------- jurnal: cari orang */
  function findHtml() {
    const rowsH = [];
    for (const [gid, G] of Object.entries(D.n)) {
      const r = slotAt(gid); if (!r) continue;
      const n = ruled.find(m => m.rt.gid === gid), w = n?.rt.w;
      const moving = r[6] && VEHICLE.has(r[6]) && (now() - r[0] + 1440) % 1440 < r[7];
      const where = moving ? `${MODA[r[6]]} ke ${placeName(r[2])}` : r[3] === 'tidur' ? `${placeName(r[2])} (tidur)` : placeName(r[2]);
      rowsH.push(`<tr><td><b>${esc(nameOf(gid))}</b>${w?.ev ? ' ♥' : ''}</td><td>${esc(where)}<br><span style="font-size:11px;opacity:.7">${hm(r[0])}-${hm(r[1] % 1440)} · ${esc(short(r[5]))}</span></td></tr>`);
    }
    return `<div style="font-size:11px;opacity:.75">Posisi semua tokoh sekarang (${dayKey()}, ${hm(now())}). Jadwal ikut hari & jam.</div><table>${rowsH.join('')}</table>`;
  }

  return {
    init, heart, capOf: k => cap(k), hasEv: k => !!EV[gidByName(k)], evRows, findHtml, toggleKado, gidOf,
    bind(s) { S = s; },
    // label kecil di tag nama: kegiatan sekarang
    tag(n) { return n.rt && n.rt.keg ? short(n.rt.keg) : ''; },
    update(dt) {
      tT -= dt; if (tT > 0) return; tT = 0.5; tick();
      if (K.style.display === 'block') { const sig = (nearToko() || '') + '|' + (nearNpc()?.key || ''); if (sig !== kSig) render(); }
    },
  };
}

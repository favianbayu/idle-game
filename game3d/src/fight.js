// Berantem (guide 70): dua tombol serang (Pukul A, Tendang B) + Hindar (tekan = guling/mundur, tahan = tangkis, tangkis tepat = parry)
// + Pegang (banting bahu, kunci lengan saat lawan pusing). Combo dari urutan tombol, meter Nyali untuk jurus spesial, meter pusing lawan,
// tanda "!" sebelum lawan memukul, maksimal 2 lawan menyerang bersamaan. Tiap NPC punya tingkat kekuatan sesuai perannya di cerita;
// statistik pemain (Kekuatan, Kelincahan, Nyali) naik lewat latihan & menang berantem, jadi lawan berat bisa dikalahkan belakangan.
import { animInfo } from './chars.js';

// tingkat kekuatan per tokoh (lv 1-10): hp, kekuatan pukul, peluang tangkis/hindar, jeda serang, tipe (guide 70 "Tipe lawan" & "Bos")
const T = (lv, hp, pow, blk, cd, type, boss) => ({ lv, hp, pow, blk, cd, type, boss });
export const STRENGTH = {
  tegar: T(1, 5, 0.6, 0.05, 1.6, 'penggertak'), siswaA: T(1, 5, 0.7, 0.05, 1.5, 'penggertak'), siswaB: T(2, 7, 0.9, 0.1, 1.4, 'penggertak'),
  gilang: T(3, 9, 1, 0.15, 1.3, 'pembalap'), tukangParkir: T(2, 8, 1, 0.1, 1.4, 'preman'), tukangParkir2: T(2, 8, 1, 0.1, 1.4, 'preman'),
  ojol: T(2, 8, 1, 0.1, 1.3, 'pembalap'), pemuda: T(3, 9, 1.1, 0.15, 1.2, 'penggertak'), anakPunk: T(3, 10, 1.2, 0.15, 1.1, 'licik'),
  tukangBakso: T(3, 11, 1.2, 0.1, 1.5, 'preman'), omDarto: T(4, 13, 1.5, 0.2, 1.4, 'preman'), kevin: T(4, 11, 1.1, 0.35, 1.0, 'licik'),
  satpam: T(4, 13, 1.4, 0.3, 1.2, 'satpam'), polisi: T(5, 15, 1.6, 0.35, 1.1, 'satpam'), fajar: T(5, 15, 1.6, 0.3, 1.0, 'petarung'),
  dimas: T(6, 17, 1.7, 0.35, 0.95, 'petarung'), rio: T(6, 20, 2.0, 0.4, 1.1, 'petarung', 'Rio'), mandor: T(6, 22, 2.2, 0.25, 1.3, 'preman', 'Pak Bondan'),
  arga: T(7, 19, 1.9, 0.45, 0.9, 'petarung'), bram: T(7, 24, 2.0, 0.45, 0.85, 'licik', 'Bram'), kobar: T(8, 28, 2.6, 0.4, 0.95, 'pembalap', 'Kobar'),
  bangJaka: T(9, 32, 2.8, 0.55, 0.85, 'petarung', 'Bang Jaka'),
  pakPras: T(3, 12, 1.2, 0.1, 1.5, 'preman'), bangSarip: T(8, 30, 2.6, 0.35, 1.3, 'preman', 'Bang Sarip'), abahKarta: T(10, 34, 2.4, 0.7, 0.8, 'petarung', 'Abah Karta'),
  sermaHadi: T(9, 32, 2.6, 0.6, 0.9, 'petarung', 'Serma Hadi'), pakRusdi: T(5, 18, 1.8, 0.25, 1.3, 'preman'), wakKodir: T(4, 14, 1.5, 0.25, 1.2, 'petarung'), kangUjo: T(4, 14, 1.4, 0.3, 1.1, 'petarung'),
  anakSTM: T(2, 8, 1, 0.1, 1.3, 'penggertak'), anakSTMbengkel: T(3, 10, 1.2, 0.15, 1.3, 'preman'), anakSTMgaul: T(3, 9, 1.1, 0.15, 1.1, 'licik'),
};
export const FIGHTERS = new Set(Object.keys(STRENGTH));
const LAW = new Set(['satpam', 'polisi']);
// gerakan: kapan kena (0..1 durasi), jangkauan, kerusakan dasar, dorongan, pusing, efek
const MOVE = {
  jab: { at: 0.45, r: 1.1, dmg: 1, kb: 0.25, dz: 12 }, straight: { at: 0.5, r: 1.15, dmg: 1.2, kb: 0.3, dz: 14 }, hook: { at: 0.55, r: 1.05, dmg: 1.5, kb: 0.35, dz: 30 },
  uppercut: { at: 0.55, r: 1.0, dmg: 2, kb: 0.4, dz: 20 }, kickFront: { at: 0.5, r: 1.3, dmg: 1.6, kb: 0.55, dz: 12 }, kickHigh: { at: 0.5, r: 1.5, dmg: 1.8, kb: 1.0, dz: 15 },
  sweepKick: { at: 0.45, r: 1.25, dmg: 1.4, kb: 0.2, dz: 10, down: 1.6 }, spinKick: { at: 0.55, r: 1.35, dmg: 2.2, kb: 0.9, dz: 20, aoe: true },
  throwShoulder: { at: 0.65, r: 1.0, dmg: 2.5, kb: 0.5, dz: 10, down: 2.0 },
};
const COMBOS = [   // urutan tombol -> gerakan (guide 70 "Combo")
  ['AAAB', 'spinKick', 'Bel Pulang!'], ['AAA', 'hook', 'Tiga Kopi!'], ['AAB', 'kickHigh', 'Ojek Lewat!'], ['AB', 'sweepKick', 'Sapu Pasar!'],
  ['BB', 'kickFront', 'Angkot Ngerem!'], ['AA', 'straight'], ['A', 'jab'], ['B', 'kickFront'],
];
const L = {
  ouch: ['Aduh!', 'Aw!', 'Sakit, woi!', 'Adoh!', 'Uhh!'], ko: ['Ampun, ampun...', 'Aduh... pusing...', 'Udah, udah... ampun!'],
  flee: ['Tolong!!', 'Aaa! Jangan!', 'Kabuur!', 'Ada yang ngamuk!', 'Tolongin!'], witness: ['Ih, ada yang berantem!', 'Aduh, ngeri!', 'Lari, lari!'],
  fight: ['Berani lu?!', 'Sini lu!', 'Cari ribut ya?!', 'Maju sini!', 'Nantang nih?!'], law: ['Hei! Berhenti!', 'Jangan bikin rusuh!', 'Woi! Stop!'],
  end: ['Awas lu ya!', 'Udah, pergi sana!', 'Jangan balik lagi!'], win: ['Kapok kan?', 'Makanya jangan macem-macem!', 'Huh, lemah.', 'Latihan dulu sana!'],
  up: ['Aduh... ampun deh.', 'Pusing... siapa sih tadi?', 'Hhh... sakit.'], ride: ['Turun lu!', 'Berani turun nggak?!'],
  block: ['Ditangkis!', 'Hah, lambat!', 'Cuma segitu?'], strong: ['Pukulanmu kayak kipas angin.', 'Geli, hahaha!', 'Masih bocah lu.'],
  give: ['Oke, oke! Gue nyerah!', 'Lepasin! Gue kalah!'], taunt: ['Sini!', 'Ayo maju!', 'Cuma segitu?'], coward: ['Pengecut!', 'Kabur dia, hahaha!'],
};
const pick = a => a[Math.floor(Math.random() * a.length)];
const dur = a => { const i = animInfo(a); return i ? i.n / i.fps : 0.5; };
const restart = (c, a) => { c.anim = null; c.play(a); };
const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const NEED = lv => 6 + lv * 6;   // xp untuk naik level

export function makeFight({ player, raka, npcs, collision, riding, toast, onKO, save }) {
  const st = player.stats || (player.stats = {});
  for (const k of ['kekuatan', 'kelincahan', 'nyali']) { st[k] ??= 1; st[k + 'Xp'] ??= 0; }
  st.rep ??= 0;
  const maxHP = () => 8 + st.kekuatan * 2;
  const fx = player.fx = { atk: null, hp: maxHP(), hurt: 0, down: 0, lastEnd: -9, seq: '', t: 0, seen: -99, nyali: 0, block: false, blockT: 0, counterT: 0, roll: 0, rollDir: null, inv: 0, grab: null, stop: 0, shake: 0, fleeT: 0 };
  // HUD: nyawa (hijau), nyali (oranye), bos
  const hud = document.createElement('div'); hud.id = 'fightHud';
  hud.style.cssText = 'position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);padding:5px 10px;border-radius:8px;background:rgba(20,20,24,.7);color:#fff;font:600 12px system-ui;pointer-events:none;opacity:0;transition:opacity .3s;z-index:5;min-width:190px';
  hud.innerHTML = '<div class="fh-row">NYAWA <span class="fh-bar"><i class="fh-hp"></i></span></div><div class="fh-row">NYALI <span class="fh-bar"><i class="fh-ny"></i></span></div><div class="fh-boss" style="display:none"></div><div class="fh-msg"></div>';
  document.body.appendChild(hud);
  const st2 = document.createElement('style');
  st2.textContent = '.fh-row{display:flex;align-items:center;gap:6px;margin:2px 0}.fh-bar{flex:1;height:8px;background:#333;border-radius:4px;overflow:hidden;display:block}.fh-bar i{display:block;height:100%}.fh-hp{background:#4ac84a}.fh-ny{background:#f0902a}.fh-boss{margin-top:4px;color:#ffd84a}.fh-boss .fh-bar i{background:#e84a3a}.fh-msg{color:#ffd84a;text-align:center;min-height:0}';
  document.head.appendChild(st2);
  const hpEl = hud.querySelector('.fh-hp'), nyEl = hud.querySelector('.fh-ny'), bossEl = hud.querySelector('.fh-boss'), msgEl = hud.querySelector('.fh-msg');
  let msgT = 0, boss = null;
  const msg = t => { msgEl.textContent = t; msgT = 1.4; fx.seen = fx.t; };
  const showBar = () => { fx.seen = fx.t; };

  const prof = n => STRENGTH[n.sid] || T(1, 4, 0.6, 0, 1.6, 'warga');
  const isFighter = n => FIGHTERS.has(n.sid) && !n.ext;
  const say = (n, lines, t = 2.2, cls) => { n.say = { text: pick(lines), t, cls }; };
  const push = (o, ax, az, d) => { const l = Math.hypot(ax, az) || 1, p = collision.move(o, o.x + ax / l * d, o.z + az / l * d, 0.26); const hit = Math.hypot(p.x - o.x - ax / l * d, p.z - o.z - az / l * d) > d * 0.4; o.x = p.x; o.z = p.z; return hit; };
  const calm = (n, lines) => { n.mood = null; n.atk = null; n.hurt = 0; n.wind = 0; n.dz = 0; n.dizzyT = 0; n.wait = 1.5; n.tx = n.x; n.tz = n.z; n.idle = 'idle'; if (lines) say(n, lines); if (boss === n) boss = null; };
  const gain = (k, x) => {
    if (st[k] >= 10) return; st[k + 'Xp'] += x;
    while (st[k] < 10 && st[k + 'Xp'] >= NEED(st[k])) { st[k + 'Xp'] -= NEED(st[k]); st[k]++; toast(`${k[0].toUpperCase() + k.slice(1)} naik ke ${st[k]}!`); if (k === 'kekuatan') fx.hp = maxHP(); }
    save && save();
  };
  const speed = () => 1 + (st.kelincahan - 1) * 0.05;

  function startAtk(o, c, anim, extra = {}) { const d = dur(anim) / (o === fx ? speed() : 1); o.atk = { anim, t: 0, d, hit: (MOVE[anim]?.at ?? 0.5) * d, did: false, ...extra }; restart(c, anim); }
  function nearestEnemy(r, arc = 1.1) {
    let best = null;
    for (const n of npcs) { if (!n.c.group.visible || n.mood === 'down' || n.ext) continue; const dx = n.x - player.x, dz = n.z - player.z, d = Math.hypot(dx, dz); if (d < r && angDiff(Math.atan2(dz, dx), player.heading) < arc && (!best || d < best.d)) best = { n, d, a: Math.atan2(dz, dx) }; }
    return best;
  }
  const canAct = () => !(riding() || fx.down > 0 || fx.hurt > 0 || fx.grab || fx.roll > 0 || player.swim || player.area !== 'kota' && player.area !== 'sekolah' && player.area !== 'dalam');

  // tombol serang: A = pukul, B = tendang; special = Shift/LT (butuh Nyali penuh)
  function attack(btn = 'A', special = false) {
    if (!canAct()) return;
    if (fx.atk && fx.atk.t < fx.atk.d * 0.6) { fx.buf = btn; return; }   // simpan input untuk combo berikutnya
    fx.block = false;
    let anim, name, mult = 1;
    if (special && fx.nyali >= 100) { anim = 'spinKick'; name = 'TENDANGAN SENJA!'; mult = 3; fx.nyali = 0; }
    else if (btn === 'A' && fx.counterT > 0) { anim = 'straight'; name = 'Balas Tangkis!'; mult = 1.5; fx.counterT = 0; fx.seq = ''; }
    else {
      fx.seq = (fx.t - fx.lastEnd < 0.6 ? fx.seq : '') + btn; if (fx.seq.length > 4) fx.seq = btn;
      if (btn === 'B' && fx.seq === 'B' && player.inMove) { anim = 'kickHigh'; name = 'Tendangan samping'; }
      else { const c = COMBOS.find(([k]) => fx.seq.endsWith(k) && (fx.seq === k || k.length > 1)); anim = c ? c[1] : btn === 'A' ? 'jab' : 'kickFront'; name = c && c[2]; }
      if (fx.seq.length >= 4 || anim === 'spinKick') fx.seq = '';
    }
    const best = nearestEnemy(1.9); if (best) player.heading = best.a;
    player.emote = null; startAtk(fx, raka, anim, { mult, name }); showBar();
    if (name) msg(name);
  }
  // hindar: tekan = guling ke arah gerak (kebal sebentar) / mundur cepat tanpa arah; tahan = tangkis
  function dodge(down) {
    if (!down) { fx.block = false; return; }
    if (!canAct() || fx.atk) return;
    fx.blockT = 0; fx.block = true;
    const d = player.inDir;
    if (d) { fx.roll = dur('roll'); fx.rollDir = d; fx.inv = 0.35; fx.block = false; restart(raka, 'roll'); }
    else fx.pendingBack = 0.16;   // kalau dilepas cepat = mundur, kalau ditahan = tangkis
  }
  // pegang: lawan pusing = kunci lengan (lawan menyerah), selain itu banting bahu
  function grab() {
    if (!canAct() || fx.atk) return;
    const best = nearestEnemy(1.2, 1.3); if (!best) { msg('Nggak ada yang bisa dipegang'); return; }
    const n = best.n; player.heading = best.a;
    if (n.dizzyT > 0 || (n.hp ?? 9) <= 2) { fx.grab = { n, t: 0, d: 1.6 }; n.mood = 'held'; restart(raka, 'armlock'); restart(n.c, 'grabbed'); msg('Kunci lengan!'); }
    else if (Math.random() < prof(n).blk * 0.8) { msg('Lepas!'); startAtk(fx, raka, 'jab', { mult: 0.3 }); }
    else startAtk(fx, raka, 'throwShoulder', { name: 'Banting bahu!', target: n });
  }
  function taunt() {
    if (!canAct() || fx.atk) return;
    startAtk(fx, raka, 'taunt'); fx.taunting = 1.0; fx.nyali = Math.min(100, fx.nyali + 12); say({ say: null }, L.taunt); msg(pick(L.taunt));
    for (const n of npcs) if (n.mood === 'fight' && Math.hypot(n.x - player.x, n.z - player.z) < 4) n.cd = Math.min(n.cd || 0, 0.3);   // lawan terpancing langsung menyerang
  }

  function damageNPC(n, anim, mult) {
    const M = MOVE[anim] || MOVE.jab, p = prof(n);
    if (n.mood === 'down') return;
    if (!n.mood && !isFighter(n)) st.rep -= 1;   // memukul warga = reputasi turun
    n.hp ??= isFighter(n) ? p.hp : 3; n.maxHp ??= n.hp;
    // lawan bisa menangkis (kecuali sedang pusing / memukul / dari belakang)
    const behind = angDiff(Math.atan2(player.z - n.z, player.x - n.x), n.heading) > 1.9;
    if (isFighter(n) && n.mood === 'fight' && !n.atk && !(n.dizzyT > 0) && !behind && anim !== 'throwShoulder' && Math.random() < p.blk * (anim === 'sweepKick' ? 0.3 : 1)) {
      restart(n.c, 'block'); n.blockT = 0.35; if (Math.random() < 0.4) say(n, L.block, 1.2); fx.stop = 0.04; return;
    }
    const pow = (1 + (st.kekuatan - 1) * 0.3) * M.dmg * mult;
    n.hp -= pow; n.hurt = 0.4; n.atk = null; n.wind = 0; n.moodT = 0;
    n.dz = (n.dz || 0) + M.dz * (1 + st.kekuatan * 0.05);
    const wall = push(n, n.x - player.x, n.z - player.z, M.kb);
    n.heading = Math.atan2(player.z - n.z, player.x - n.x);
    fx.nyali = Math.min(100, fx.nyali + 8); fx.stop = M.dmg >= 1.5 ? 0.08 : 0.05; if (M.dmg >= 1.8 || mult > 1) fx.shake = 0.18;
    if (wall && anim === 'kickFront') { n.dz += 15; msg('Mentok tembok!'); }
    restart(n.c, 'hurt');
    if (n.hp <= 0 || M.down) {
      n.mood = 'down'; n.downT = n.hp <= 0 ? 4.5 : M.down; n.up = false; restart(n.c, 'fall');
      if (n.hp <= 0) { say(n, L.ko, 2.5); if (isFighter(n)) { dispatchEvent(new CustomEvent('ko', { detail: n.name || p.boss || '' })); gain('kekuatan', 2 + p.lv * 1.5); gain('nyali', 1 + p.lv); st.rep += p.lv; if (p.boss) toast(`${p.boss} tumbang!`); } }
      return;
    }
    if (n.dz >= 100) { n.dz = 0; n.dizzyT = 2.5; restart(n.c, 'dizzy'); n.say = { text: '★ pusing ★', t: 2.5, cls: 'dizzy' }; }
    if (isFighter(n)) {
      if (n.mood !== 'fight') say(n, p.lv >= st.kekuatan + 3 ? L.strong : L.fight); else if (Math.random() < 0.3) say(n, L.ouch, 1.2);
      n.mood = 'fight'; n.cd = Math.max(n.cd || 0, 0.5); if (p.boss) boss = n;
    } else { n.mood = 'flee'; n.moodT = 0; n.stuck = 0; say(n, L.flee); }
    for (const o of npcs) {   // saksi
      if (o === n || o.mood || !o.c.group.visible || o.ext) continue;
      const d = Math.hypot(o.x - n.x, o.z - n.z); if (d > 8) continue;
      if (LAW.has(o.sid)) { o.mood = 'fight'; o.moodT = 0; o.cd = 1.2; say(o, L.law); }
      else if (!isFighter(o)) { o.mood = 'flee'; o.moodT = 0; o.stuck = 0; if (Math.random() < 0.6) say(o, L.witness); }
    }
  }

  function playerHit(n) {
    if (fx.down > 0 || fx.inv > 0) return;
    const p = prof(n), raw = p.pow * (1 + p.lv * 0.12) * (n.atk.anim === 'kickFront' ? 1.3 : 1) / (1 + (st.kekuatan - 1) * 0.12);
    if (fx.block) {
      if (fx.blockT < 0.2) {   // tangkis tepat waktu = parry: lawan terdorong & limbung, pukulan balasan x1.5
        msg('PARRY!'); restart(n.c, 'hurt'); n.hurt = 0.6; n.atk = null; n.dz = (n.dz || 0) + 25; push(n, n.x - player.x, n.z - player.z, 0.5);
        fx.counterT = 0.9; fx.nyali = Math.min(100, fx.nyali + 15); fx.stop = 0.07; gain('kelincahan', 1); return;
      }
      fx.hp -= raw * 0.2; fx.nyali = Math.min(100, fx.nyali + 4); showBar(); push(player, player.x - n.x, player.z - n.z, 0.12); return;
    }
    fx.hp -= raw; fx.hurt = 0.4; fx.atk = null; fx.seq = ''; showBar(); fx.shake = 0.12; fx.stop = 0.05;
    push(player, player.x - n.x, player.z - n.z, 0.35);
    player.heading = Math.atan2(n.z - player.z, n.x - player.x);
    restart(raka, 'hurt');
    if (fx.hp <= 0) {
      fx.down = 3.4; restart(raka, 'fall'); toast(`Kamu KO dihajar ${n.name}! (lawan lv ${p.lv}, Kekuatanmu ${st.kekuatan})`);
      for (const o of npcs) if (o.mood === 'fight') calm(o, L.win);
      fx.ko = true;
    }
  }

  // dipanggil tiap frame dari updatePlayer: kembalikan nama animasi kalau pemain sedang terkunci
  function updatePlayer(dt) {
    fx.t += dt; fx.inv -= dt; fx.counterT -= dt; fx.taunting = (fx.taunting || 0) - dt;
    if (msgT > 0 && (msgT -= dt) <= 0) msgEl.textContent = '';
    const fighting = npcs.some(n => n.mood === 'fight');
    hud.style.opacity = fx.t - fx.seen < 4 || fighting || fx.hp < maxHP() - 0.01 ? 1 : 0;
    hpEl.style.width = Math.max(0, fx.hp / maxHP() * 100) + '%'; nyEl.style.width = fx.nyali + '%';
    if (boss && boss.mood === 'fight') { bossEl.style.display = ''; bossEl.innerHTML = `${prof(boss).boss} (lv ${prof(boss).lv}) <span class="fh-bar"><i style="width:${Math.max(0, boss.hp / boss.maxHp * 100)}%"></i></span>`; } else bossEl.style.display = 'none';
    if (fx.hp < maxHP() && !fx.down && !fighting && fx.t - fx.seen > 5) fx.hp = Math.min(maxHP(), fx.hp + dt * 0.6);
    // kabur: jauh dari semua lawan 5 detik = berantem selesai, reputasi turun
    if (fighting) { const near = npcs.some(n => n.mood === 'fight' && Math.hypot(n.x - player.x, n.z - player.z) < 9); fx.fleeT = near ? 0 : fx.fleeT + dt;
      if (fx.fleeT > 5) { fx.fleeT = 0; st.rep -= 2; for (const n of npcs) if (n.mood === 'fight') calm(n, L.coward); toast('Berhasil kabur... tapi reputasi turun.'); } }
    if (fx.down > 0) {
      fx.down -= dt;
      if (fx.down <= 0.9 && raka.anim === 'fall') restart(raka, 'getUp');
      if (fx.down <= 0) { fx.down = 0; fx.hp = maxHP(); fx.nyali = 0; if (fx.ko) { fx.ko = false; onKO && onKO(); } }
      return raka.anim === 'getUp' ? 'getUp' : 'fall';
    }
    if (fx.hurt > 0) { fx.hurt -= dt; return 'hurt'; }
    if (fx.roll > 0) { fx.roll -= dt; const p = collision.move(player, player.x + fx.rollDir.x * 3.4 * dt, player.z + fx.rollDir.z * 3.4 * dt, 0.28); player.x = p.x; player.z = p.z; player.heading = Math.atan2(fx.rollDir.z, fx.rollDir.x); return 'roll'; }
    if (fx.grab) {   // kunci lengan: lawan menyerah, berantem dengannya selesai dengan baik (reputasi +)
      const g = fx.grab; g.t += dt; const n = g.n; n.x = player.x + Math.cos(player.heading) * 0.55; n.z = player.z + Math.sin(player.heading) * 0.55; n.heading = player.heading;
      if (g.t >= g.d) { fx.grab = null; say(n, L.give, 2.5); calm(n); n.mood = 'down'; n.downT = 1.2; n.up = true; restart(n.c, 'getUp'); st.rep += 2; gain('nyali', 2 + prof(n).lv); gain('kekuatan', 1 + prof(n).lv); }
      return 'armlock';
    }
    if (fx.pendingBack > 0) { fx.pendingBack -= dt; if (!fx.block) { fx.pendingBack = 0; fx.back = dur('backstep'); restart(raka, 'backstep'); fx.inv = 0.2; } }
    if (fx.back > 0) { fx.back -= dt; const p = collision.move(player, player.x - Math.cos(player.heading) * 2.6 * dt, player.z - Math.sin(player.heading) * 2.6 * dt, 0.28); player.x = p.x; player.z = p.z; return 'backstep'; }
    if (fx.block) { fx.blockT += dt; const e = nearestEnemy(4, 3.2); if (e) player.heading = e.a; return 'block'; }
    const a = fx.atk; if (!a) return null;
    a.t += dt;
    if (!a.did && a.t >= a.hit) {
      a.did = true; const M = MOVE[a.anim];
      if (M) {
        if (a.target) { const n = a.target; if (Math.hypot(n.x - player.x, n.z - player.z) < 1.3) { damageNPC(n, a.anim, a.mult || 1); } }
        else for (const n of npcs) {
          if (!n.c.group.visible || n.mood === 'down' || n.ext) continue;
          const dx = n.x - player.x, dz = n.z - player.z, d = Math.hypot(dx, dz);
          if (d < M.r + 0.25 && (M.aoe || angDiff(Math.atan2(dz, dx), player.heading) < 0.9)) { damageNPC(n, a.anim, a.mult || 1); if (!M.aoe) break; }
        }
      }
    }
    if (a.t >= a.d) { fx.atk = null; fx.lastEnd = fx.t; if (fx.buf) { const b = fx.buf; fx.buf = null; attack(b); } return fx.atk ? fx.atk.anim : null; }
    return a.anim;
  }

  // NPC yang sedang berantem / kabur / KO / pusing / dikunci. true = sudah diurus di sini
  function updateNPC(n, dt) {
    if (!n.mood) return false;
    const dx = player.x - n.x, dz = player.z - n.z, d = Math.hypot(dx, dz), p = prof(n);
    n.moodT = (n.moodT || 0) + dt;
    let anim = 'idle';
    if (n.mood === 'held') anim = 'grabbed';
    else if (n.hurt > 0) { n.hurt -= dt; anim = 'hurt'; }
    else if (n.blockT > 0) { n.blockT -= dt; anim = 'block'; }
    else if (n.dizzyT > 0) { n.dizzyT -= dt; anim = 'dizzy'; if (n.dizzyT <= 0 && n.say?.cls === 'dizzy') n.say = null; }
    else if (n.mood === 'down') {
      n.downT -= dt;
      if (n.downT <= 1 && !n.up) { n.up = true; restart(n.c, 'getUp'); }
      anim = n.up ? 'getUp' : 'fall';
      if (n.downT <= 0) { if (n.hp <= 0) { n.hp = null; calm(n, L.up); n.wait = 3; } else { n.mood = 'fight'; n.cd = 0.6; } }
    } else if (n.mood === 'flee') {
      if (n.cowerT > 0) { n.cowerT -= dt; anim = 'cower'; n.heading = Math.atan2(dz, dx); if (n.cowerT <= 0) calm(n); }
      else {
        const s = 3.6 * dt, ox = n.x, oz = n.z; push(n, -dx, -dz, s);
        n.heading = Math.atan2(-dz, -dx); anim = 'panic';
        if (Math.hypot(n.x - ox, n.z - oz) < s * 0.3) n.stuck += dt; else n.stuck = 0;
        if (n.stuck > 0.8) n.cowerT = 3;
        if (d > 15 || n.moodT > 8) { calm(n); n.tx = n.home.x; n.tz = n.home.z; n.wait = 2; }
      }
    } else if (n.mood === 'fight') {
      if (d > 13 || player.area !== n.area && n.area || n.moodT > 30 || fx.down > 0) { calm(n, fx.down > 0 ? L.win : L.end); }
      else if (n.wind > 0) {   // ancang-ancang: tanda "!" merah 0.5 detik sebelum memukul (waktu untuk tangkis / hindar)
        n.wind -= dt; anim = 'guard'; n.heading = Math.atan2(dz, dx);
        if (n.wind <= 0) { startAtk(n, n.c, n.nextAtk); anim = n.atk.anim; n.moodT = 0; if (n.say?.cls === 'warn') n.say = null; }
      } else if (n.atk) {
        const a = n.atk; a.t += dt; anim = a.anim;
        if (!a.did && a.t >= a.hit) { a.did = true; if (d < (MOVE[a.anim]?.r || 1.1) + 0.2 && angDiff(Math.atan2(dz, dx), n.heading) < 0.8 && !riding()) playerHit(n); }
        if (a.t >= a.d) { n.atk = null; n.cd = p.cd * (0.7 + Math.random() * 0.6); }
      } else {
        // keroyokan: hanya 2 lawan yang menyerang bersamaan, sisanya mengitari di jarak 2.4 (guide 70)
        const attackers = npcs.filter(o => o.mood === 'fight' && o !== n && (o.atk || o.wind > 0 || o.slot)).length;
        const mine = n.slot || attackers < 2; n.slot = mine;
        n.heading = Math.atan2(dz, dx);
        const want = mine ? 0.95 : 2.4;
        if (d > want + 0.1) { const sp = d > 2.6 ? 3.0 * (p.type === 'pembalap' ? 1.25 : p.type === 'preman' ? 0.85 : 1) : 1.6; push(n, dx, dz, Math.min(sp * dt, d - want)); anim = d > 2.6 ? 'run' : 'walk'; }
        else if (!mine) { anim = 'guard'; const s = 0.8 * dt; push(n, -dz, dx, s); }
        else {
          anim = 'guard'; n.cd -= dt;
          if (p.type === 'penggertak' && !n.say && Math.random() < dt * 0.25) { restart(n.c, 'taunt'); n.blockT = 0; say(n, L.taunt, 1.2); }
          if (p.type === 'licik' && d < 0.9 && Math.random() < dt * 0.8) push(n, -dx, -dz, 0.3);   // licik: menjaga jarak
          if (riding()) { if (!n.say && Math.random() < dt * 0.4) say(n, L.ride); }
          else if (n.cd <= 0) { n.wind = 0.5; n.nextAtk = p.type === 'pembalap' ? pick(['kickFront', 'kickHigh', 'jab']) : p.type === 'preman' ? pick(['hook', 'straight', 'uppercut']) : pick(['jab', 'straight', 'hook', 'kickFront', 'jab']); n.say = { text: '!', t: 0.5, cls: 'warn' }; }
        }
      }
    }
    if (n.mood !== 'fight') n.slot = false;
    if (!n.mood) anim = 'idle';
    if (n.mood !== 'down' && n.mood !== 'held' && d < 0.7 && d > 1e-4) { n.x = player.x - dx / d * 0.7; n.z = player.z - dz / d * 0.7; }   // jangan menempel ke pemain
    n.c.heading = n.heading; n.c.play(anim);
    n.c.group.position.set(n.x, 0, n.z); n.c.update(dt);
    if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; }
    return true;
  }
  return {
    attack, dodge, grab, taunt, updatePlayer, updateNPC, gain, maxHP, STRENGTH, prof,
    // hit-stop (bekukan sebentar saat pukulan kena) & guncangan layar
    stopFactor(dt) { if (fx.stop > 0) { fx.stop -= dt; return 0.05; } return 1; },
    shake(dt) { if (fx.shake > 0) { fx.shake -= dt; return fx.shake * 0.6; } return 0; },
  };
}

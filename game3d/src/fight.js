// Berantem: pemain memukul (F / tombol Pukul, combo jab -> straight -> hook -> tendangan).
// NPC yang kena bereaksi sesuai wataknya: yang "jagoan" (preman, satpam, ojol, pemuda...) ngelawan,
// sisanya kabur sambil teriak minta tolong. Saksi di sekitar ikut bereaksi (aparat datang melerai, yang lain lari).
import { animInfo } from './chars.js';

export const FIGHTERS = new Set(['satpam', 'pemuda', 'ojol', 'anakPunk', 'tukangBakso', 'tegar', 'siswaB', 'rio', 'polisi', 'mandor', 'kobar',
  'fajar', 'bram', 'bangJaka', 'arga', 'dimas', 'gilang', 'tukangParkir', 'tukangParkir2', 'omDarto', 'kevin']);
const LAW = new Set(['satpam', 'polisi']);
const COMBO = ['jab', 'straight', 'hook', 'kickFront'];
const HITT = { jab: 0.45, straight: 0.5, hook: 0.55, uppercut: 0.55, kickFront: 0.5 };
const REACH = { jab: 1.1, straight: 1.15, hook: 1.05, uppercut: 1.0, kickFront: 1.3 };
const POWER = { jab: 1, straight: 1, hook: 1, uppercut: 2, kickFront: 2 };
const L = {
  ouch: ['Aduh!', 'Aw!', 'Sakit, woi!', 'Adoh!', 'Uhh!'],
  ko: ['Ampun, ampun...', 'Aduh... pusing...', 'Udah, udah... ampun!'],
  flee: ['Tolong!!', 'Aaa! Jangan!', 'Kabuur!', 'Ada yang ngamuk!', 'Tolongin!'],
  witness: ['Ih, ada yang berantem!', 'Aduh, ngeri!', 'Lari, lari!'],
  fight: ['Berani lu?!', 'Sini lu!', 'Cari ribut ya?!', 'Maju sini!', 'Nantang nih?!'],
  law: ['Hei! Berhenti!', 'Jangan bikin rusuh!', 'Woi! Stop!'],
  end: ['Awas lu ya!', 'Udah, pergi sana!', 'Jangan balik lagi!'],
  win: ['Kapok kan?', 'Makanya jangan macem-macem!', 'Huh, lemah.'],
  up: ['Aduh... ampun deh.', 'Pusing... siapa sih tadi?', 'Hhh... sakit.'],
  ride: ['Turun lu!', 'Berani turun nggak?!'],
};
const pick = a => a[Math.floor(Math.random() * a.length)];
const dur = a => { const i = animInfo(a); return i ? i.n / i.fps : 0.5; };
const restart = (c, a) => { c.anim = null; c.play(a); };
const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

export function makeFight({ player, raka, npcs, collision, riding, toast }) {
  const fx = player.fx = { atk: null, hp: 10, hurt: 0, down: 0, lastEnd: -9, combo: 0, t: 0, seen: -99 };
  // bar nyawa kecil, hanya muncul saat/habis berantem
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);padding:4px 10px;border-radius:8px;background:rgba(20,20,24,.65);color:#fff;font:600 13px system-ui;letter-spacing:1px;pointer-events:none;opacity:0;transition:opacity .3s;z-index:5';
  document.body.appendChild(bar);
  const showBar = () => { fx.seen = fx.t; const h = Math.max(0, Math.floor(fx.hp + 1e-6)); bar.textContent = 'NYAWA ' + '♥'.repeat(h) + '♡'.repeat(10 - h); };

  const isFighter = n => FIGHTERS.has(n.sid);
  const say = (n, lines, t = 2.2) => { n.say = { text: pick(lines), t }; };
  const push = (o, ax, az, d) => { const l = Math.hypot(ax, az) || 1, p = collision.move(o, o.x + ax / l * d, o.z + az / l * d, 0.26); o.x = p.x; o.z = p.z; };
  const calm = (n, lines) => { n.mood = null; n.atk = null; n.hurt = 0; n.wait = 1.5; n.tx = n.x; n.tz = n.z; n.idle = 'idle'; if (lines) say(n, lines); };

  function startAtk(o, c, anim) { o.atk = { anim, t: 0, d: dur(anim), hit: HITT[anim] * dur(anim), did: false }; restart(c, anim); }

  function attack() {
    if (riding() || fx.down > 0 || fx.hurt > 0 || player.area !== 'kota' && player.area !== 'sekolah') return;
    if (fx.atk && fx.atk.t < fx.atk.d * 0.65) return;
    fx.combo = fx.t - fx.lastEnd < 0.6 ? (fx.combo + 1) % COMBO.length : 0;
    // bidik otomatis: NPC terdekat di depan
    let best = null;
    for (const n of npcs) { if (!n.c.group.visible || n.mood === 'down') continue; const dx = n.x - player.x, dz = n.z - player.z, d = Math.hypot(dx, dz); if (d < 1.8 && angDiff(Math.atan2(dz, dx), player.heading) < 1.1 && (!best || d < best.d)) best = { n, d, a: Math.atan2(dz, dx) }; }
    if (best) player.heading = best.a;
    player.emote = null; startAtk(fx, raka, COMBO[fx.combo]); showBar();
  }

  function hitNPC(n, anim) {
    if (n.mood === 'down') return;
    n.hp ??= isFighter(n) ? 5 : 3;
    n.hp -= POWER[anim] || 1; n.hurt = 0.45; n.atk = null; n.moodT = 0;
    push(n, n.x - player.x, n.z - player.z, anim === 'kickFront' ? 0.55 : 0.3);
    n.heading = Math.atan2(player.z - n.z, player.x - n.x);
    restart(n.c, 'hurt');
    if (n.hp <= 0) { n.mood = 'down'; n.downT = 4.5; n.up = false; restart(n.c, 'fall'); say(n, L.ko, 2.5); }
    else if (isFighter(n)) { if (n.mood !== 'fight') say(n, L.fight); else say(n, L.ouch, 1.2); n.mood = 'fight'; n.cd = 0.6; }
    else { n.mood = 'flee'; n.moodT = 0; n.stuck = 0; say(n, L.flee); }
    // saksi
    for (const o of npcs) {
      if (o === n || o.mood || !o.c.group.visible) continue;
      const d = Math.hypot(o.x - n.x, o.z - n.z); if (d > 8) continue;
      if (LAW.has(o.sid)) { o.mood = 'fight'; o.moodT = 0; o.cd = 1.2; say(o, L.law); }
      else if (!isFighter(o)) { o.mood = 'flee'; o.moodT = 0; o.stuck = 0; if (Math.random() < 0.6) say(o, L.witness); }
    }
  }

  function playerHit(n) {
    if (fx.down > 0) return;
    fx.hp -= POWER[n.atk.anim] || 1; fx.hurt = 0.4; fx.atk = null; showBar();
    push(player, player.x - n.x, player.z - n.z, 0.35);
    player.heading = Math.atan2(n.z - player.z, n.x - player.x);
    restart(raka, 'hurt');
    if (fx.hp <= 0) {
      fx.down = 3.2; restart(raka, 'fall'); toast('Kamu KO! Tunggu bangun dulu...');
      for (const o of npcs) if (o.mood === 'fight') calm(o, L.win);
    }
  }

  // dipanggil tiap frame dari updatePlayer: kembalikan nama animasi kalau pemain sedang terkunci (pukul / kena / jatuh)
  function updatePlayer(dt) {
    fx.t += dt;
    bar.style.opacity = fx.t - fx.seen < 4 || fx.hp < 10 ? 1 : 0;
    if (fx.hp < 10 && !fx.down && fx.t - fx.seen > 6) { fx.hp = Math.min(10, fx.hp + dt * 0.5); if (fx.hp % 1 < dt * 0.5) showBar(); }   // pulih pelan
    if (fx.down > 0) {
      fx.down -= dt;
      if (fx.down <= 0.9 && raka.anim === 'fall') restart(raka, 'getUp');
      if (fx.down <= 0) { fx.down = 0; fx.hp = 10; showBar(); }
      return raka.anim === 'getUp' ? 'getUp' : 'fall';
    }
    if (fx.hurt > 0) { fx.hurt -= dt; return 'hurt'; }
    const a = fx.atk; if (!a) return null;
    a.t += dt;
    if (!a.did && a.t >= a.hit) {
      a.did = true;
      for (const n of npcs) {
        if (!n.c.group.visible || n.mood === 'down') continue;
        const dx = n.x - player.x, dz = n.z - player.z, d = Math.hypot(dx, dz);
        if (d < REACH[a.anim] + 0.25 && angDiff(Math.atan2(dz, dx), player.heading) < 0.9) hitNPC(n, a.anim);
      }
    }
    if (a.t >= a.d) { fx.atk = null; fx.lastEnd = fx.t; return null; }
    return a.anim;
  }

  // NPC yang sedang berantem / kabur / KO. true = sudah diurus di sini
  function updateNPC(n, dt) {
    if (!n.mood) return false;
    const dx = player.x - n.x, dz = player.z - n.z, d = Math.hypot(dx, dz);
    n.moodT = (n.moodT || 0) + dt;
    let anim = 'idle';
    if (n.hurt > 0) { n.hurt -= dt; anim = 'hurt'; }
    else if (n.mood === 'down') {
      n.downT -= dt;
      if (n.downT <= 1 && !n.up) { n.up = true; restart(n.c, 'getUp'); }
      anim = n.up ? 'getUp' : 'fall';
      if (n.downT <= 0) { n.hp = null; calm(n, L.up); n.wait = 3; }
    } else if (n.mood === 'flee') {
      if (n.cowerT > 0) { n.cowerT -= dt; anim = 'cower'; n.heading = Math.atan2(dz, dx); if (n.cowerT <= 0) calm(n); }
      else {
        const s = 3.6 * dt, ox = n.x, oz = n.z; push(n, -dx, -dz, s);
        n.heading = Math.atan2(-dz, -dx); anim = 'panic';
        if (Math.hypot(n.x - ox, n.z - oz) < s * 0.3) n.stuck += dt; else n.stuck = 0;
        if (n.stuck > 0.8) { n.cowerT = 3; }
        if (d > 15 || n.moodT > 8) { calm(n); n.tx = n.home.x; n.tz = n.home.z; n.wait = 2; }
      }
    } else if (n.mood === 'fight') {
      if (d > 13 || player.area !== n.area && n.area || n.moodT > 30 || fx.down > 0) { calm(n, fx.down > 0 ? L.win : L.end); }
      else if (n.atk) {
        const a = n.atk; a.t += dt; anim = a.anim;
        if (!a.did && a.t >= a.hit) { a.did = true; if (d < REACH[a.anim] + 0.2 && angDiff(Math.atan2(dz, dx), n.heading) < 0.8 && !riding()) playerHit(n); }
        if (a.t >= a.d) { n.atk = null; n.cd = 0.8 + Math.random() * 0.9; }
      } else {
        n.heading = Math.atan2(dz, dx);
        if (d > 1.0) { const sp = d > 2.2 ? 3.0 : 1.6; push(n, dx, dz, Math.min(sp * dt, d - 0.95)); anim = d > 2.2 ? 'run' : 'walk'; }
        else {
          anim = 'guard'; n.cd -= dt;
          if (riding()) { if (!n.say && Math.random() < dt * 0.4) say(n, L.ride); }
          else if (n.cd <= 0) { startAtk(n, n.c, pick(['jab', 'straight', 'hook', 'kickFront', 'jab'])); anim = n.atk.anim; n.moodT = 0; }
        }
      }
    }
    if (!n.mood) anim = 'idle';
    if (n.mood !== 'down' && d < 0.7 && d > 1e-4) { n.x = player.x - dx / d * 0.7; n.z = player.z - dz / d * 0.7; }   // jangan menempel ke pemain
    n.c.heading = n.heading; n.c.play(anim);
    n.c.group.position.set(n.x, 0, n.z); n.c.update(dt);
    if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; }
    return true;
  }
  return { attack, updatePlayer, updateNPC };
}

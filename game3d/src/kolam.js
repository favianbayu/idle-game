// Kolam renang lomba GOR (guide 89): mini game balap renang (ritme kanan-kiri + tahan napas) dan loncat indah
// dari menara 1 / 3 / 5 m (timing buka badan; 5 m = uji nyali). Ruangannya dibangun di interior.js (setup()).
// Selama main, posisi & animasi tokoh pemain diatur modul ini lewat step(); input dari keyboard & tombol layar sendiri.
import * as THREE from 'three';

const pick = a => a[Math.floor(Math.random() * a.length)];
const RIVALS = [['siswaB', 'Bayu'], ['pemuda', 'Kang Yusuf'], ['siswaA', 'Andi'], ['remaja', 'Dewa'], ['siswiB', 'Rina'], ['anakPunk', 'Tio'], ['mbak', 'Mbak Lia']];

export function makeKolam({ scene, player, Character, fight, shop, toast, getCam }) {
  let cfg = null, S = null, D = null, board = null, hideT = 0, msgT = 0;
  const racers = RIVALS.map(([sid, name]) => { const c = new Character(sid); c.group.visible = false; c.blob.visible = false; scene.add(c.group); return { sid, name, c }; });
  const splash = new THREE.Group(); scene.add(splash);
  const drops = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: '#eaf6ff' })); m.visible = false; splash.add(m); return { m, vx: 0, vy: 0, vz: 0 }; });

  /* ---------------- HUD */
  const css = document.createElement('style');
  css.textContent = `#kolam{position:fixed;inset:0;pointer-events:none;display:none;z-index:15;font-family:'Trebuchet MS',system-ui,sans-serif;color:#fffbe8}
  #kolam .big{position:absolute;top:26%;left:50%;transform:translateX(-50%);font:bold clamp(30px,8vw,50px) 'Trebuchet MS',system-ui,sans-serif;color:#ffd84a;text-shadow:0 3px 0 #000,0 0 8px #000;white-space:nowrap}
  #kolam .msg{position:absolute;top:40%;left:50%;transform:translateX(-50%);width:max-content;max-width:90vw;text-align:center;font:bold clamp(14px,4vw,20px) 'Trebuchet MS',system-ui,sans-serif;text-shadow:0 2px 0 #000}
  #kolam .pan{position:absolute;top:calc(max(10px,env(safe-area-inset-top)) + 2px);left:50%;transform:translateX(-50%);width:min(86vw,360px);background:rgba(16,30,44,.78);border:2px solid #000;border-radius:8px;padding:6px 8px;font-size:12px}
  #kolam .row{display:flex;align-items:center;gap:8px;margin:2px 0}#kolam .lab{width:54px;color:#bfe3ff}
  #kolam .bar{position:relative;flex:1;height:12px;background:#2a3640;border:2px solid #000;border-radius:3px;overflow:hidden}
  #kolam .bar i{position:absolute;left:0;top:0;bottom:0;background:#4ac0f0}#kolam .o2 i{background:#7ae07a}
  #kolam .trk{position:relative;flex:1;height:12px;background:#2a3640;border-radius:3px}
  #kolam .trk b{position:absolute;top:1px;width:9px;height:9px;margin-left:-4px;border-radius:50%;border:1px solid #000;background:#e04040}#kolam .trk b.me{background:#ffd84a;z-index:2}
  #kolam .btns{position:absolute;bottom:calc(max(18px,env(safe-area-inset-bottom)) + 8px);left:50%;transform:translateX(-50%);display:flex;gap:12px;pointer-events:auto}
  #kolam .btns button{font:bold 16px 'Trebuchet MS',system-ui,sans-serif;min-width:84px;height:64px;border-radius:14px;border:3px solid #000;background:#fffbe8;color:#1a1a1a;touch-action:none;user-select:none;-webkit-user-select:none}
  #kolam .btns button.on{background:#ffd84a}#kolam .hint{margin-top:3px;color:#cfe6f6;font-size:11px;text-align:center}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'kolam';
  hud.innerHTML = '<div class="pan"><div class="row"><span class="lab">Laju</span><div class="bar sp"><i></i></div><span class="len">1/2</span></div><div class="row"><span class="lab">Napas</span><div class="bar o2"><i></i></div><span class="pos">#1</span></div><div class="row"><span class="lab">Posisi</span><div class="trk"></div></div><div class="hint"></div></div><div class="big"></div><div class="msg"></div><div class="btns"></div>';
  document.body.appendChild(hud);
  const $ = s => hud.querySelector(s), H = { pan: $('.pan'), sp: $('.sp i'), o2: $('.o2 i'), len: $('.len'), pos: $('.pos'), trk: $('.trk'), hint: $('.hint'), big: $('.big'), msg: $('.msg'), btns: $('.btns') };
  const flash = (t, s = 2) => { H.msg.textContent = t; msgT = s; };
  function buttons(list) {   // tombol layar: [label, onDown, onUp]
    H.btns.innerHTML = '';
    for (const [label, down, up] of list) {
      const b = document.createElement('button'); b.textContent = label;
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); down(); });
      for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => { if (b.classList.contains('on')) { b.classList.remove('on'); up?.(); } });
      H.btns.appendChild(b);
    }
  }

  /* ---------------- input (hanya saat main) */
  const KEYL = ['KeyA', 'ArrowLeft', 'KeyJ'], KEYR = ['KeyD', 'ArrowRight', 'KeyL'], KEYB = ['Space', 'KeyW', 'ArrowUp', 'KeyK'];
  addEventListener('keydown', e => {
    if (!S && !D) return;
    if (e.repeat) { if (KEYB.includes(e.code) || KEYL.includes(e.code) || KEYR.includes(e.code)) e.preventDefault(); return; }
    if (S) { if (KEYL.includes(e.code)) stroke(-1); else if (KEYR.includes(e.code)) stroke(1); else if (KEYB.includes(e.code)) breath(true); else return; }
    else if (D) { if (KEYB.includes(e.code) || e.code === 'Enter') divePress(); else return; }
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  addEventListener('keyup', e => { if (S && KEYB.includes(e.code)) breath(false); }, true);

  /* ================= balap renang */
  // S: { n racer, lengths, L panjang kolam, run, phase, me: {s, v, o2, last, side, hold, done}, ai: [...] }
  function race(count, lengths) {
    if (!cfg || S || D) return;
    const L = cfg.len, lanes = cfg.lanes, me = { lane: 3, s: 0, v: 0, o2: 1, last: -9, side: 0, hold: false, done: null, holdT: 0, bad: 0 };
    const order = [3, 4, 2, 5, 1, 6, 0, 7].slice(0, count), ai = [];
    order.slice(1).forEach((lane, k) => { const r = racers[k]; ai.push({ r, lane, s: 0, v: 0, top: 2.35 + Math.random() * 0.55 + (count > 4 ? 0.15 : 0), br: 4 + Math.random() * 4, brT: 0, done: null, react: 0.15 + Math.random() * 0.35 }); r.c.group.visible = true; });
    S = { L, lengths, run: -3.2, phase: 'count', me, ai, lanes, false: false, cheer: 0 };
    hud.style.display = 'block'; H.pan.style.display = ''; H.hint.textContent = 'Kiri-kanan bergantian (A/D atau ←/→) • tahan napas: Spasi';
    H.trk.innerHTML = ''; for (const a of [me, ...ai]) { const b = document.createElement('b'); if (a === me) b.className = 'me'; H.trk.appendChild(b); a.dot = b; }
    buttons([['KIRI', () => stroke(-1)], ['NAPAS', () => breath(true), () => breath(false)], ['KANAN', () => stroke(1)]]);
    const cam = getCam(); S.saveCam = { yawT: cam.yawT, distT: cam.distT, pitchT: cam.pitchT }; cam.yawT = Math.PI / 2; cam.distT = 16; cam.pitchT = 0.85; cam.manualT = 99;
    H.big.textContent = 'Bersedia...'; player.swim = null;
  }
  function stroke(side) {
    const m = S?.me; if (!S) return;
    if (S.phase === 'count') { if (!S.false) { S.false = true; flash('Curi start! Telat 1 detik.', 1.6); m.v = 0; m.pen = 1; } return; }
    if (S.phase !== 'go' || m.done != null || m.hold) return;
    const dt = S.run - m.last;
    if (side === m.side || dt < 0.17) { m.v *= 0.55; m.bad = 0.6; flash(side === m.side ? 'Salah ritme! Kanan-kiri gantian.' : 'Kecepetan! Ikutin ritmenya.', 0.9); }
    else { const good = dt > 0.28 && dt < 0.75; m.v = Math.min(vmax(), m.v + (good ? 0.95 : 0.55)); if (good && S.run - (m.goodT || 0) > 3) { m.goodT = S.run; } }
    m.side = side; m.last = S.run;
  }
  function breath(on) { if (!S || S.phase !== 'go' || S.me.done != null) return; S.me.hold = on; }
  const vmax = () => { const k = (player.stats?.kelincahan || 1); return (2.7 + Math.min(10, k) * 0.07) * (S.me.o2 <= 0 ? 0.5 : 1); };
  function stepRace(dt) {
    const s = S, m = s.me, total = s.L * s.lengths;
    s.run += dt;
    if (s.phase === 'count') {
      H.big.textContent = s.run < -2 ? 'Bersedia...' : s.run < -0.8 ? 'Siap...' : 'Siap...';
      if (s.run >= 0) { s.phase = 'go'; H.big.textContent = 'PRIIIT!'; hideBig(0.9); s.run = 0; m.last = -9; }
    } else {
      const k = 1 - Math.exp(-dt * (m.hold ? 2.2 : 0.75));   // air menahan: tanpa kayuhan laju turun
      if (m.done == null) {
        if (m.pen > 0) { m.pen -= dt; }
        else m.s += m.v * dt;
        m.v -= m.v * k;
        if (m.hold) { m.o2 = Math.min(1, m.o2 + dt * 1.5); m.holdT += dt; }
        else m.o2 = Math.max(0, m.o2 - dt * (0.045 + m.v * 0.016));
        if (m.o2 <= 0 && !m.gasp) { m.gasp = true; flash('Kehabisan napas! Tahan Spasi / NAPAS buat ambil napas.', 1.8); }
        if (m.o2 > 0.3) m.gasp = false;
        if (m.s >= total) { m.s = total; m.done = s.run; }
      }
      for (const a of s.ai) {
        if (a.done != null) continue;
        if (s.run < a.react) continue;
        a.brT -= dt; if (a.brT <= -0.5) a.brT = a.br;
        const want = a.brT < 0 ? a.top * 0.35 : a.top * (0.92 + 0.08 * Math.sin(s.run * 3 + a.lane));
        a.v += (want - a.v) * Math.min(1, dt * 1.8); a.s += a.v * dt;
        if (a.s >= total) { a.s = total; a.done = s.run; }
      }
      if (m.done != null && (s.ai.every(a => a.done != null) || s.run > m.done + 6)) return endRace();
      if (s.run > 120) return endRace();
    }
    // tampilkan
    const all = [m, ...s.ai], rank = 1 + s.ai.filter(a => a.done != null ? m.done == null || a.done < m.done : m.done == null && a.s > m.s).length;
    H.sp.style.width = (Math.min(1, m.v / 3.4) * 100).toFixed(0) + '%'; H.o2.style.width = (m.o2 * 100).toFixed(0) + '%'; H.o2.style.background = m.o2 < 0.25 ? '#e05a4a' : '';
    H.len.textContent = `${Math.min(s.lengths, 1 + Math.floor(Math.min(m.s, total - 0.01) / s.L))}/${s.lengths}`; H.pos.textContent = '#' + rank;
    for (const a of all) a.dot.style.left = (a.s / total * 100).toFixed(1) + '%';
    for (const a of s.ai) place(a.r.c, a, dt, a.done != null || s.phase === 'count');
    return pose(m, dt, s.phase === 'count' || m.done != null, m.hold);
  }
  // posisi sepanjang lintasan: bolak-balik tiap panjang kolam
  function laneAt(lane, sv) {
    const L = cfg.len, k = Math.floor(sv / L), u = sv - k * L, back = k % 2 === 1, d = back ? L - u : u;
    const p = cfg.lanes[lane], dz = Math.sign(p.z1 - p.z0) * (back ? -1 : 1); return { x: p.x, z: p.z0 + (p.z1 - p.z0) * d / L, h: dz > 0 ? Math.PI / 2 : -Math.PI / 2 };
  }
  function place(c, a, dt, still) {
    const q = S.phase === 'count' ? { ...laneAt(a.lane, 0), x: cfg.lanes[a.lane].x } : laneAt(a.lane, a.s);
    if (S.phase === 'count') { c.group.position.set(q.x, cfg.blockY, cfg.lanes[a.lane].z0 - 0.35 * Math.sign(cfg.lanes[a.lane].z1 - cfg.lanes[a.lane].z0)); c.sink = 0; c.heading = q.h; c.play('crouch'); }
    else { c.group.position.set(q.x, cfg.waterY, q.z); c.heading = q.h; c.sink = still ? 0.62 : 0.3; c.play(still ? 'tread' : a.brT < 0 ? 'tread' : 'swim'); }
    c.update(dt);
  }
  function pose(m, dt, still, hold) {
    const q = laneAt(m.lane, m.s), p0 = cfg.lanes[m.lane];
    if (S.phase === 'count') return { x: p0.x, z: p0.z0 - 0.35 * Math.sign(p0.z1 - p0.z0), y: cfg.blockY, heading: q.h, anim: 'crouch', sink: 0 };
    return { x: q.x, z: q.z, y: cfg.waterY, heading: q.h, anim: still || hold ? 'tread' : 'swim', sink: still || hold ? 0.62 : 0.3, speed: m.v };
  }
  function endRace() {
    const s = S, m = s.me, times = [{ name: 'Kamu', t: m.done }, ...s.ai.map(a => ({ name: a.r.name, t: a.done }))].sort((a, b) => (a.t ?? 1e9) - (b.t ?? 1e9));
    const rank = times.findIndex(t => t.name === 'Kamu') + 1, dist = s.L * s.lengths;
    H.big.textContent = rank === 1 ? 'JUARA 1!' : `Juara ${rank}`; hideBig(3.5);
    flash(m.done != null ? `${dist} m gaya bebas · ${m.done.toFixed(2)} detik` : 'Belum sampai finis...', 3.5);
    fight.gain('kelincahan', [8, 5, 3][rank - 1] || 2); if (rank === 1) fight.gain('nyali', s.lengths > 2 ? 3 : 1);
    if (board) board.userData.redraw(['PAPAN SKOR KOLAM', `${dist} M GAYA BEBAS`, ...times.slice(0, 4).map((t, i) => `${i + 1}. ${t.name}  ${t.t != null ? t.t.toFixed(2) : '--'}`)], '#10161e', '#ffd84a');
    for (const a of s.ai) a.r.c.group.visible = false;
    const cam = getCam(); Object.assign(cam, s.saveCam); cam.manualT = 0;
    const out = cfg.exitRace; S = null; H.pan.style.display = 'none'; H.btns.innerHTML = ''; hideT = 3.5;
    toast(rank === 1 ? 'Juara 1 balap renang! Kelincahan & Nyali naik.' : `Finis ke-${rank}. Kelincahan naik, latihan lagi!`);
    return { x: out.x, z: out.z, y: 0, heading: out.h, anim: 'idle', sink: 0, end: true };
  }

  /* ================= loncat indah */
  // D: { h tinggi, phase: ready|air|water, t, spin, open, rot }
  function dive(h) {
    if (!cfg || S || D) return;
    const T = cfg.towers[h]; if (!T) return;
    const nyali = player.stats?.nyali || 1;
    D = { h, T, phase: 'ready', t: 0, rot: 0, open: false, target: { 1: 1, 3: 2, 5: 3 }[h], shake: h === 5 && nyali < 4 };
    hud.style.display = 'block'; H.pan.style.display = 'none'; H.big.textContent = `Menara ${h} m`; hideBig(1.4);
    flash(D.shake ? 'Kaki gemeteran... tinggi banget. Tekan Aksi/Spasi buat loncat!' : `Target ${D.target} putaran. Aksi/Spasi: loncat, tekan lagi buat buka badan.`, 3);
    buttons([['LONCAT', divePress]]);
    const cam = getCam(); D.saveCam = { yawT: cam.yawT, distT: cam.distT, pitchT: cam.pitchT }; cam.yawT = T.h; cam.distT = 12; cam.pitchT = 0.45; cam.manualT = 99;
    player.swim = null;
  }
  function divePress() {
    if (!D) return;
    if (D.phase === 'ready') { D.phase = 'air'; D.t = 0; H.btns.firstChild && (H.btns.firstChild.textContent = 'BUKA'); flash('', 0); }
    else if (D.phase === 'air' && !D.open && D.t > 0.12) { D.open = true; D.openRot = D.rot; }
  }
  function stepDive(dt) {
    const d = D, T = d.T, g = 9.8;
    if (d.phase === 'ready') { d.t += dt; const j = d.shake ? Math.sin(d.t * 47) * 0.035 : 0; return { x: T.x + j, z: T.z + Math.cos(d.t * 39) * j, y: T.y, heading: T.h, anim: 'idle', sink: 0 }; }
    if (d.phase === 'air') {
      d.t += dt;
      const v0 = 3.2, tFall = (v0 + Math.sqrt(v0 * v0 + 2 * g * (T.y - cfg.waterY + 0.4))) / g;   // naik sedikit, lalu jatuh ke air
      const u = Math.min(1, d.t / tFall), fx = Math.cos(T.h), fz = Math.sin(T.h), reach = 1.6 + d.h * 0.25;
      const cy = T.y + 0.7 + v0 * d.t - g * d.t * d.t / 2, cx = T.x + fx * reach * u, cz = T.z + fz * reach * u;
      // putaran: cukup cepat untuk target + seperempat (masuk kepala dulu); terus berputar sampai badan dibuka
      const want = (d.target + 0.25) * Math.PI * 2, w = want / (tFall * 0.82);
      if (!d.open) {
        d.rot += w * dt;
        const turns = d.rot / (Math.PI * 2), near = Math.abs(turns - (d.target + 0.25)) < 0.18;
        H.msg.textContent = `Putaran ${turns.toFixed(1)} / ${d.target}${near ? '  ▶ BUKA!' : ''}`; H.msg.style.color = near ? '#7ae07a' : ''; msgT = 1;
      }
      const th = -d.rot, ox = 0.7 * Math.sin(th), oy = -0.7 * Math.cos(th);   // putar di tengah badan, bukan di kaki
      if (d.t >= tFall) { d.phase = 'water'; d.t = 0; return scoreDive(cx, cz); }
      return { x: cx + ox * fx, z: cz + ox * fz, y: cy + oy, heading: T.h, anim: d.t < 0.2 ? 'jump' : d.open ? 'idle' : 'cower', sink: 0, rot: th };
    }
    return null;
  }
  function scoreDive(x, z) {
    H.msg.style.color = '';
    const d = D, want = (d.target + 0.25) * Math.PI * 2, got = d.open ? d.openRot : d.rot, err = Math.abs(got - want) / (Math.PI * 2);   // dalam putaran
    let sc = Math.max(0, 10 - err * 16); if (!d.open) sc = Math.min(sc, 3);
    const jd = [0, 1, 2].map(() => Math.max(0, Math.min(10, Math.round((sc + (Math.random() - 0.5) * 1.2) * 2) / 2)));
    const avg = jd.reduce((a, b) => a + b, 0) / 3;
    H.big.textContent = avg >= 8 ? 'SEMPURNA!' : avg >= 6 ? 'Bagus!' : avg >= 4 ? 'Lumayan' : 'Byurrr... nyeplak!'; hideBig(2.6);
    flash(`Juri: ${jd.map(j => j.toFixed(1)).join(' · ')}  (rata-rata ${avg.toFixed(1)})`, 3);
    if (board) board.userData.redraw(['PAPAN SKOR KOLAM', `LONCAT INDAH ${d.h} M`, `Kamu: ${jd.map(j => j.toFixed(1)).join(' / ')}`, `Nilai ${avg.toFixed(1)}`], '#10161e', '#ffd84a');
    if (avg >= 6) fight.gain('kelincahan', d.h + 1);
    if (d.h === 5) { fight.gain('nyali', avg >= 6 ? 5 : 3); if (!(player.flags || {}).dive5) { (player.flags || (player.flags = {})).dive5 = true; toast('Berani loncat dari menara 5 meter! Nyali naik.'); } }
    else if (avg < 4) toast('Perut duluan... perih! Coba buka badan lebih pas.');
    burst(x, z);
    const cam = getCam(); Object.assign(cam, d.saveCam); cam.manualT = 0;
    D = null; H.btns.innerHTML = ''; hideT = 3;
    player.swim = 'kolam';
    return { x, z, y: 0, heading: player.heading, anim: 'tread', sink: 0.62, end: true };
  }
  function burst(x, z) { for (const p of drops) { p.m.position.set(x + (Math.random() - 0.5) * 0.4, cfg.waterY + 0.1, z + (Math.random() - 0.5) * 0.4); p.vx = (Math.random() - 0.5) * 2.4; p.vz = (Math.random() - 0.5) * 2.4; p.vy = 2.5 + Math.random() * 2.5; p.m.visible = true; } }

  let bigT = 0; const hideBig = t => { bigT = t; };
  return {
    get active() { return !!(S || D); },
    setup(c) { cfg = c; board = c.board; },
    race, dive,
    target() { return S ? { kind: 'act', label: 'Kiri-kanan gantian • tahan napas', fn: () => {} } : D ? { kind: 'act', label: D.phase === 'ready' ? 'Loncat!' : 'Buka badan!', fn: divePress } : null; },
    // dipanggil main.js tiap frame saat aktif: posisi & animasi tokoh pemain
    step(dt) { return S ? stepRace(dt) : D ? stepDive(dt) : null; },
    update(dt) {
      if (bigT > 0) { bigT -= dt; if (bigT <= 0) H.big.textContent = ''; }
      if (msgT > 0) { msgT -= dt; if (msgT <= 0) H.msg.textContent = ''; }
      if (hideT > 0 && !S && !D) { hideT -= dt; if (hideT <= 0) { hud.style.display = 'none'; H.big.textContent = ''; H.msg.textContent = ''; } }
      for (const p of drops) if (p.m.visible) { p.vy -= 9.8 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; if (p.m.position.y < (cfg?.waterY ?? 0) - 0.1) p.m.visible = false; }
    },
  };
}

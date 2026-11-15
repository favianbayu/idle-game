// Render sprite & portrait tokoh dari renderer sprite-stacking.
// Pakai: node render.js <folder_raw> npc_styles.js <path ke sprite-stacking/index.html>
// Lalu: python cards.py <folder_raw> sprite
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
const { NPC_STYLES } = require(path.resolve(process.argv[3]));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(process.argv[4] || 'index.html')); await p.waitForTimeout(800);
  const res = await p.evaluate((styles) => {
    const out = {};
    for (const id in styles) {
      const st = styles[id]; STYLES['npc_' + id] = st; const r = {};
      r.skin = R(st.skin); r.nose = [r.skin[0], r.skin[0], r.skin[1], r.skin[1]];
      r.hair = R(st.hair || '#222222'); r.hair2 = r.hair.map(c => c.map(v => Math.round(v * 0.72))); r.brow = [r.hair[0], r.hair[0], r.hair[0], r.hair[1]];
      r.tie = R(st.tie || '#e83a5a'); r.helmet = R(st.helmet || '#2fa04a'); r.visor = R('#2a3440'); r.phone = fixedRamp('#1e2230'); r.stubble = [r.skin[0], r.skin[1], r.skin[1], r.skin[2]];
      if (st.hairStyle === 'hijab') r.brow = [R('#3a2418')[0], R('#3a2418')[0], R('#3a2418')[1], R('#3a2418')[1]];
      r.top = R(st.top); r.top2 = R(st.top2 || st.top); r.bottom = R(st.bottom); r.bottom2 = R(st.bottom2 || st.bottom);
      r.shoe = R(st.shoe); r.sole = R('#2a2420'); r.hijab = R(st.hijab || '#888888'); r.peci = R('#1e1e24'); r.cap = R(st.cap || '#cc3333');
      r.eye = fixedRamp('#16121e'); r.eyeW = fixedRamp('#ffffff'); r.mouth = fixedRamp('#9a3f38'); r.blush = fixedRamp('#ec8f82'); r.glasses = fixedRamp('#26262c');
      r.blade = R('#c4ced8'); r.hilt = R('#b07a26'); r.orb = R('#8fe0ff'); r.stick = R('#9a7440'); r.bristle = R('#d4b36a');
      st.ramps = r; st.color = organicColor(m => r[m]);
      const m = buildHumanFrame('npc_' + id, 'idle', 0, 'all', true);
      const vc = {}; for (const k of ['front', 'side', 'back']) vc[k] = m.vc[k].toDataURL();
      // 4 tampak
      const S = 3, Hh = Math.ceil((m.slices.length + 10) * S) + 20;
      const c = document.createElement('canvas'); c.width = 4 * 150; c.height = Hh; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      [Math.PI / 2, 3 * Math.PI / 4, Math.PI, -Math.PI / 2].forEach((a, i) => { drawStack(g, m, 75 + i * 150, Hh - 14, a, 1, S); g.setTransform(1, 0, 0, 1, 0, 0); });
      // portrait: 3/4 depan, besar, potong kepala+bahu
      const P = 10, PH = Math.ceil((m.slices.length + 10) * P) + 40;
      const c2 = document.createElement('canvas'); c2.width = 700; c2.height = PH; const g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = false;
      drawStack(g2, m, 350, PH - 20, 3 * Math.PI / 4 - 0.25, 1, P); g2.setTransform(1, 0, 0, 1, 0, 0);
      const d = g2.getImageData(0, 0, c2.width, c2.height).data; let top = PH;
      for (let y = 0; y < PH && top === PH; y++) for (let x = 0; x < c2.width; x++) if (d[(y * c2.width + x) * 4 + 3] > 0) { top = y; break; }
      const fig = PH - 20 - top, side = Math.round(fig * 0.5);
      const c3 = document.createElement('canvas'); c3.width = side; c3.height = side; const g3 = c3.getContext('2d'); g3.imageSmoothingEnabled = false;
      g3.drawImage(c2, 350 - side / 2, top - side * 0.06, side, side, 0, 0, side, side);
      out[id] = { views: c.toDataURL(), portrait: c3.toDataURL(), slices: m.slices.length, vc };
    }
    return out;
  }, NPC_STYLES);
  fs.mkdirSync(OUT, { recursive: true });
  for (const id in res) {
    fs.writeFileSync(path.join(OUT, id + '_views.png'), Buffer.from(res[id].views.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(OUT, id + '_portrait.png'), Buffer.from(res[id].portrait.split(',')[1], 'base64'));
    for (const k in res[id].vc) fs.writeFileSync(path.join(OUT, id + '_' + k + '.png'), Buffer.from(res[id].vc[k].split(',')[1], 'base64'));
  }
  console.log(Object.keys(res).length, 'tokoh');
  await b.close();
})();

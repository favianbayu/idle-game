// Pratinjau Raka voxel: renderer voxel software (z-buffer, ortografis) tanpa library, jalan dari file://.
// Warna voxel sudah membawa cahaya (sama dengan game: MeshBasicMaterial + warna vertex).
import { buildVox, ANIMS, STYLES, makeRamps, organicColor, faceCfg, humanShape } from './voxlib.js';
import { rakaShape, rakaColor, RAKA_OUTFITS, RAKA_ANIMS, ALL_ANIMS, exprFor, FACES } from './raka.js';

// Raka lama (gaya di npc_styles.js) untuk perbandingan
const OLD = { name: 'Raka', scale: 1.3, skin: '#d9a27a', hair: '#24160e', hairStyle: 'short', top: '#f4f4f0', sleeves: 'short', bottom: '#7d828c', shoe: '#1c1c20', shoeStyle: 'shoe', bottomStyle: 'pants', uniform: 'sma', belt: true };
OLD.ramps = makeRamps(OLD); OLD.color = organicColor(m => OLD.ramps[m]); OLD.fc = faceCfg(OLD);

const CACHE = new Map(), COLORS = {};
export function frameModel(who, outfitId, anim, i, expr) {
  const A = ALL_ANIMS[anim];
  const e = who === 'old' ? '' : (expr && expr !== 'auto' ? expr : exprFor(anim, i));
  const key = [who, outfitId, anim, i, e].join('|');
  if (CACHE.has(key)) return CACHE.get(key);
  const t = A.loop ? i / A.n : i / Math.max(1, A.n - 1);
  let sh, color;
  if (who === 'old') { sh = humanShape(A.pose(t), OLD, 'all'); color = OLD.color; }
  else { const o = RAKA_OUTFITS[outfitId]; sh = rakaShape(A.pose(t), o, e); color = COLORS[outfitId] || (COLORS[outfitId] = rakaColor(o)); }
  const m = buildVox(sh.L, sh.W, sh.H, sh.mat, color, { bbox: sh.bbox });
  m.lift = sh.lift || 0; m.yaw = A.pose(t).yaw || 0;
  CACHE.set(key, m);
  return m;
}

// sisi voxel: [bit, normal (dunia), sudut]  (sama dengan voxworker.js; dunia X = x, Y = z, Z = -y)
const FACES3 = [
  [1, [1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],
  [2, [-1, 0, 0], [[0, 1, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]]],
  [4, [0, 0, -1], [[1, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]],
  [8, [0, 0, 1], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
  [16, [0, 1, 0], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],
  [32, [0, -1, 0], [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]]],
];

/* Gambar satu atau beberapa model ke ImageData (z-buffer).
   items: [{ m, ox (geser dunia X), oz }]; cam: { yaw (0 = tampak depan), pitch, scale (piksel/voxel), w, h, cx, cy } */
export function renderModels(items, cam, img, zbuf) {
  const { w, h } = cam, data = img.data;
  const th = cam.yaw - Math.PI / 2, cs = Math.cos(th), sn = Math.sin(th), cp = Math.cos(cam.pitch), spp = Math.sin(cam.pitch);
  const sc = cam.scale;
  const P = new Float32Array(8), D = new Float32Array(4);
  for (const it of items) {
    const { m } = it, { L, W, vox } = m, cx0 = L / 2, cy0 = W / 2;
    const my = (it.yaw || 0) + (m.yaw || 0), mc = Math.cos(my), ms = Math.sin(my);
    for (const [bit, n, corners] of FACES3) {
      // normal setelah putar model (sekitar Y) lalu kamera
      const nx0 = n[0] * mc - n[2] * ms, nz0 = n[0] * ms + n[2] * mc;
      const nzr = -nx0 * sn + nz0 * cs, ny = n[1];
      const facing = ny * spp + nzr * cp;
      if (facing <= 1e-4) continue;
      for (let i = 0; i < vox.length; i += 7) {
        if (!(vox[i + 6] & bit)) continue;
        const x = vox[i], y = vox[i + 1], z = vox[i + 2];
        for (let c = 0; c < 4; c++) {
          const [dx, dy, dz] = corners[c];
          let X = x + dx - cx0, Y = z + dz + (m.lift || 0), Z = -(y + dy - cy0);
          const X2 = X * mc - Z * ms, Z2 = X * ms + Z * mc;
          X = X2 + (it.ox || 0); Z = Z2 + (it.oz || 0);
          const xr = X * cs + Z * sn, zr = -X * sn + Z * cs;
          P[c * 2] = cam.cx + xr * sc; P[c * 2 + 1] = cam.cy - (Y * cp - zr * spp) * sc;
          D[c] = Y * spp + zr * cp;
        }
        const r = vox[i + 3], g = vox[i + 4], b = vox[i + 5];
        tri(P[0], P[1], D[0], P[2], P[3], D[1], P[4], P[5], D[2], r, g, b);
        tri(P[0], P[1], D[0], P[4], P[5], D[2], P[6], P[7], D[3], r, g, b);
      }
    }
  }
  function tri(x0, y0, d0, x1, y1, d1, x2, y2, d2, r, g, b) {
    const minx = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxx = Math.min(w - 1, Math.ceil(Math.max(x0, x1, x2)));
    const miny = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxy = Math.min(h - 1, Math.ceil(Math.max(y0, y1, y2)));
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (Math.abs(area) < 1e-9) return;
    for (let py = miny; py <= maxy; py++) for (let px = minx; px <= maxx; px++) {
      const sx = px + 0.5, sy = py + 0.5;
      let w0 = ((x1 - sx) * (y2 - sy) - (x2 - sx) * (y1 - sy)) / area;
      let w1 = ((x2 - sx) * (y0 - sy) - (x0 - sx) * (y2 - sy)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
      const d = w0 * d0 + w1 * d1 + w2 * d2, k = py * w + px;
      if (d <= zbuf[k]) continue;
      zbuf[k] = d; const o = k * 4; data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255;
    }
  }
}

// render ke canvas: latar + bayangan bulat, lalu model; opsi pixel = render kecil lalu diperbesar (rasa di game)
export function draw(canvas, items, cam) {
  const pix = cam.pixel || 1;
  const w = Math.ceil(canvas.width / pix), h = Math.ceil(canvas.height / pix);
  const off = draw.off || (draw.off = document.createElement('canvas'));
  off.width = w; off.height = h;
  const ctx = off.getContext('2d');
  ctx.fillStyle = cam.bg || '#bcd8ee'; ctx.fillRect(0, 0, w, h);
  const c2 = { ...cam, w, h, scale: cam.scale / pix, cx: cam.cx / pix, cy: cam.cy / pix };
  // bayangan bulat di tanah tiap model
  const th = cam.yaw - Math.PI / 2, cs = Math.cos(th), sn = Math.sin(th);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (const it of items) {
    const X = it.ox || 0, Z = it.oz || 0, xr = X * cs + Z * sn, zr = -X * sn + Z * cs;
    ctx.beginPath(); ctx.ellipse(c2.cx + xr * c2.scale, c2.cy + zr * Math.sin(cam.pitch) * c2.scale, 13 * c2.scale, 13 * Math.sin(cam.pitch) * c2.scale, 0, 0, Math.PI * 2); ctx.fill();
  }
  const img = ctx.getImageData(0, 0, w, h), zb = new Float32Array(w * h).fill(-1e9);
  renderModels(items, c2, img, zb);
  ctx.putImageData(img, 0, 0);
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.drawImage(off, 0, 0, w * pix, h * pix);
}

/* ---------------- UI */
const $ = id => document.getElementById(id);
const ANIM_LIST = [
  ['idle', 'Diam'], ['hairFix', 'Sisir rambut pakai jari'], ['walk', 'Jalan'], ['run', 'Lari'], ['sprint', 'Sprint'],
  ['guard', 'Kuda-kuda'], ['jab', 'Jab'], ['straight', 'Pukulan lurus'], ['hook', 'Hook'], ['uppercut', 'Uppercut'],
  ['kickFront', 'Tendangan depan'], ['kickHigh', 'Tendangan tinggi'], ['taunt', 'Provokasi "Sini!"'], ['roll', 'Guling'],
  ['fall', 'Jatuh'], ['getup', 'Bangun'], ['rideMotor', 'Naik motor'], ['rideSport', 'Naik motor sport'], ['motoLean', 'Motor menikung'],
  ['pedal', 'Mengayuh sepeda'], ['phone', 'Main HP'], ['scratch', 'Garuk kepala'], ['laugh', 'Tertawa'], ['dance', 'Joget'],
  ['wave', 'Melambai'], ['squat', 'Jongkok'], ['sit', 'Duduk'], ['carry', 'Bawa kardus'], ['read', 'Baca buku'], ['jump', 'Lompat'],
];
export function initUI() {
  const st = { outfit: 'seragam', anim: 'idle', expr: 'auto', yaw: 0.6, pitch: 0.5, zoom: 9, pixel: 1, spin: false, compare: false, t0: performance.now() };
  for (const [k, o] of Object.entries(RAKA_OUTFITS)) $('outfit').add(new Option(o.name, k));
  for (const [k, n] of ANIM_LIST) $('anim').add(new Option(n, k));
  $('expr').add(new Option('Otomatis (ikut gerakan)', 'auto'));
  for (const k of Object.keys(FACES)) $('expr').add(new Option(k[0].toUpperCase() + k.slice(1), k));
  const bind = (id, key, conv = v => v) => $(id).addEventListener('input', e => { st[key] = conv(e.target.type === 'checkbox' ? e.target.checked : e.target.value); st.t0 = performance.now(); });
  bind('outfit', 'outfit'); bind('anim', 'anim'); bind('expr', 'expr');
  bind('pitch', 'pitch', v => +v); bind('zoom', 'zoom', v => +v); bind('spin', 'spin'); bind('compare', 'compare');
  bind('pixel', 'pixel', v => v ? Math.max(1, Math.round(st.zoom / 1.6)) : 1);
  const cv = $('view');
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, st.yaw, st.pitch]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag) return; st.yaw = drag[2] - (e.clientX - drag[0]) * 0.012; st.pitch = Math.max(0, Math.min(1.4, drag[3] + (e.clientY - drag[1]) * 0.008)); $('pitch').value = st.pitch; });
  cv.addEventListener('pointerup', () => drag = null);
  cv.addEventListener('wheel', e => { e.preventDefault(); st.zoom = Math.max(2, Math.min(20, st.zoom * (e.deltaY > 0 ? 0.9 : 1.1))); $('zoom').value = st.zoom; }, { passive: false });
  document.querySelectorAll('[data-yaw]').forEach(b => b.onclick = () => { st.yaw = +b.dataset.yaw; st.spin = false; $('spin').checked = false; });
  function resize() { const r = cv.getBoundingClientRect(); cv.width = Math.round(r.width); cv.height = Math.round(r.height); }
  addEventListener('resize', resize); resize();
  let last = performance.now();
  (function loop(now) {
    const dt = (now - last) / 1000; last = now;
    if (st.spin && !drag) st.yaw += dt * 0.6;
    const A = ALL_ANIMS[st.anim];
    let i = Math.floor((now - st.t0) / 1000 * A.fps);
    i = A.loop ? i % A.n : Math.min(A.n - 1, i % (A.n + Math.ceil(A.fps * 0.6)));
    const items = [{ m: frameModel('new', st.outfit, st.anim, i, st.expr), ox: st.compare ? 14 : 0 }];
    if (st.compare) items.push({ m: frameModel('old', '', st.anim in ANIMS ? st.anim : 'idle', st.anim in ANIMS ? i : 0), ox: -14 });
    const pix = $('pixel').checked ? Math.max(1, Math.round(st.zoom / 1.6)) : 1;
    draw(cv, items, { yaw: st.yaw, pitch: st.pitch, scale: st.zoom, w: cv.width, h: cv.height, cx: cv.width / 2, cy: cv.height * 0.84, pixel: pix });
    $('info').textContent = `${A.name || st.anim} · frame ${i + 1}/${A.n} · ekspresi: ${st.expr === 'auto' ? exprFor(st.anim, i) : st.expr}`;
    requestAnimationFrame(loop);
  })(last);
}
// dipakai skrip screenshot
window.RK = { frameModel, draw, ALL_ANIMS, exprFor };

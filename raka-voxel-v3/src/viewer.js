// Pratinjau WebGL kecil (tanpa library): kamera ortografis, warna vertex sudah membawa cahaya (sama seperti di game).
import { buildParts, OUTFITS, EXPRS, bikeVox, BIKE_PAL, BIKE_SEAT } from './model.js';
import { voxelFrame, voxMesh } from './frame.js';
import { propMesh } from './vox.js';
import { ANIMS, ANIM_LIST, exprFor } from './anims.js';
import { humanShape, buildVox, makeRamps, organicColor, faceCfg, ANIMS as OLDANIMS } from './voxlib.js';

const PARTS = new Map();
function partsFor(outfit, expr, helm, face) {
  const k = outfit + '|' + expr + '|' + (helm ? 1 : 0) + (face ? face.join('') : '');
  if (!PARTS.has(k)) PARTS.set(k, buildParts({ outfit, expr, helm, face }));
  return PARTS.get(k);
}
const cat = (a, b) => { const pos = new Float32Array(a.pos.length + b.pos.length), col = new Float32Array(pos.length); pos.set(a.pos); pos.set(b.pos, a.pos.length); col.set(a.col); col.set(b.col, a.col.length); return { pos, col, n: pos.length / 3 }; };
let BIKE = null;
// satu frame Raka -> segitiga. Ukuran dalam satuan voxel lama (1/32 petak): voxel Raka = 0.5 satuan.
const GEO = new Map();
export function rakaFrame(o) {
  if (o.pose || o.face) return makeFrame(o);
  const key = [o.outfit, o.anim, o.i, o.expr, o.helm ? 1 : 0, o.bike === false ? 0 : 1].join('|');
  let g = GEO.get(key);
  if (!g) { if (GEO.size > 400) GEO.clear(); GEO.set(key, g = makeFrame(o)); }
  return g;
}
function makeFrame(o) {
  const A = ANIMS[o.anim] || ANIMS.idle, i = o.i || 0;
  const t = A.loop ? i / A.n : i / Math.max(1, A.n - 1);
  const expr = o.expr && o.expr !== 'auto' ? o.expr : exprFor(o.anim, i, A.n);
  const P = partsFor(o.outfit || 'seragam', EXPRS.includes(expr) ? expr : 'biasa', o.helm, o.face);
  const f = voxelFrame(P, o.pose || A.pose(t));
  if (o.anim !== 'rideSport' || o.bike === false) return voxMesh(f, 0.5);
  // naik motor: pantat tokoh ditaruh tepat di jok; setang & pijakan motor dipasang di posisi tangan & kaki
  const dx = BIKE_SEAT[0] - f.buttX * 0.5, dz = BIKE_SEAT[1] - f.buttZ * 0.5;
  if (!BIKE) { const h = f.hands[1], p = f.feet[1]; BIKE = propMesh(bikeVox([h[0] * 0.5 + dx, h[1] * 0.5, h[2] * 0.5 + dz], [p[0] * 0.5 + dx, p[1] * 0.5, p[2] * 0.5 + dz]), BIKE_PAL); }
  f.lift = 0;
  return cat(voxMesh(f, 0.5, [dx, 0, dz]), BIKE);
}
// Raka lama (humanShape) untuk perbandingan
const OLD = { name: 'Raka', scale: 1.3, skin: '#d9a27a', hair: '#24160e', hairStyle: 'short', top: '#f4f4f0', sleeves: 'short', bottom: '#7d828c', shoe: '#1c1c20', shoeStyle: 'shoe', bottomStyle: 'pants', uniform: 'sma', belt: true };
OLD.ramps = makeRamps(OLD); OLD.color = organicColor(m => OLD.ramps[m]); OLD.fc = faceCfg(OLD);
const OLDC = new Map();
export function oldFrame(anim, i) {
  if (!OLDANIMS[anim]) { anim = 'idle'; i = 0; }
  const key = anim + i; if (OLDC.has(key)) return OLDC.get(key);
  const A = OLDANIMS[anim], t = A.loop ? i / A.n : i / Math.max(1, A.n - 1);
  const sh = humanShape(A.pose(t), OLD, 'all'), m = buildVox(sh.L, sh.W, sh.H, sh.mat, OLD.color, { bbox: sh.bbox });
  const F = [[1, [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]], [2, [[0, 1, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]]], [4, [[1, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]],
    [8, [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]], [16, [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [32, [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]]]];
  const pos = [], col = [], v = m.vox, lift = (sh.lift || 0);
  for (let k = 0; k < v.length; k += 7) for (const [bit, cs] of F) if (v[k + 6] & bit) for (const c of [0, 1, 2, 0, 2, 3]) {
    pos.push(v[k] + cs[c][0] - m.L / 2, v[k + 1] + cs[c][1] - m.W / 2, v[k + 2] + cs[c][2] + lift);
    col.push(v[k + 3] / 255, v[k + 4] / 255, v[k + 5] / 255);
  }
  const g = { pos: new Float32Array(pos), col: new Float32Array(col), n: pos.length / 3 };
  OLDC.set(key, g); return g;
}

/* ---------- WebGL */
const VS = `attribute vec3 p; attribute vec3 c; uniform mat4 m; varying vec3 v; void main(){ v = c; gl_Position = m * vec4(p, 1.0); }`;
const FS = `precision mediump float; varying vec3 v; uniform float a; void main(){ gl_FragColor = vec4(v, a); }`;
export function makeGL(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true, alpha: false });
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const bp = gl.createBuffer(), bc = gl.createBuffer(), lp = gl.getAttribLocation(pr, 'p'), lc = gl.getAttribLocation(pr, 'c'), um = gl.getUniformLocation(pr, 'm'), ua = gl.getUniformLocation(pr, 'a');
  gl.enableVertexAttribArray(lp); gl.enableVertexAttribArray(lc); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
  const disc = (() => { const p = [], c = []; for (let i = 0; i < 28; i++) { const a0 = i / 28 * 6.2832, a1 = (i + 1) / 28 * 6.2832; p.push(0, 0, 0.05, Math.cos(a0), Math.sin(a0), 0.05, Math.cos(a1), Math.sin(a1), 0.05); c.push(0, 0, 0, 0, 0, 0, 0, 0, 0); } return { pos: new Float32Array(p), col: new Float32Array(c), n: 84 }; })();
  function drawGeo(g, M, alpha) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bp); gl.bufferData(gl.ARRAY_BUFFER, g.pos.subarray(0, g.n * 3), gl.DYNAMIC_DRAW); gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bc); gl.bufferData(gl.ARRAY_BUFFER, g.col.subarray(0, g.n * 3), gl.DYNAMIC_DRAW); gl.vertexAttribPointer(lc, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(um, false, M); gl.uniform1f(ua, alpha); gl.drawArrays(gl.TRIANGLES, 0, g.n);
  }
  /* render(items, cam): items = [{ geo, ox, oy, yaw }], cam = { yaw (0 = tampak depan), pitch, scale (px per voxel), cx, cy (posisi kaki di layar, px), bg } */
  return function render(items, cam) {
    const w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);
    const bg = cam.bg || [0.74, 0.85, 0.93]; gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const pass of [0, 1]) for (const it of items) {
      // model (x maju, y samping, z naik) -> layar. yaw 0: kamera di depan tokoh.
      const a = (it.yaw || 0) - cam.yaw - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      // putar terhadap z: X = x*ca - y*sa (kanan layar), D = x*sa + y*ca (menjauh dari kamera)
      const sx = 2 * cam.scale / w, sy = 2 * cam.scale / h, ox = (it.ox || 0), tx = (cam.cx + ox * cam.scale) / w * 2 - 1, ty = 1 - cam.cy / h * 2;
      // kamera di depan-atas: layarY = z*cp + D*sp ; kedalaman = D*cp - z*sp
      const M = new Float32Array([
        ca * sx, sa * sp * sy, sa * cp * 0.004, 0,
        -sa * sx, ca * sp * sy, ca * cp * 0.004, 0,
        0, cp * sy, -sp * 0.004, 0,
        tx, ty, 0, 1]);
      if (pass === 0) {
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        const r = it.big ? 17 : 11, D = new Float32Array(M); for (let k = 0; k < 8; k++) D[k] *= r;
        drawGeo(disc, D, 0.2); gl.depthMask(true); gl.disable(gl.BLEND);
      } else drawGeo(it.geo, M, 1);
    }
  };
}

/* ---------- UI */
const $ = id => document.getElementById(id);
export function initUI() {
  const cv = $('view'), render = makeGL(cv);
  const st = { outfit: 'seragam', anim: 'idle', expr: 'auto', helm: false, yaw: 0.6, pitch: 0.45, zoom: 9, spin: false, compare: false, pix: false, t0: performance.now() };
  for (const [k, o] of Object.entries(OUTFITS)) $('outfit').add(new Option(o.name, k));
  for (const k of ANIM_LIST) if (ANIMS[k]) $('anim').add(new Option(ANIMS[k].name || k, k));
  $('expr').add(new Option('Otomatis (ikut gerakan)', 'auto'));
  for (const k of EXPRS) $('expr').add(new Option(k[0].toUpperCase() + k.slice(1), k));
  const bind = (id, key, conv = v => v) => $(id).addEventListener('input', e => { st[key] = conv(e.target.type === 'checkbox' ? e.target.checked : e.target.value); st.t0 = performance.now(); });
  bind('outfit', 'outfit'); bind('anim', 'anim'); bind('expr', 'expr'); bind('helm', 'helm'); bind('pitch', 'pitch', v => +v); bind('zoom', 'zoom', v => +v); bind('spin', 'spin'); bind('compare', 'compare'); bind('pix', 'pix');
  let drag = null;
  cv.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, st.yaw, st.pitch]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!drag) return; st.yaw = drag[2] - (e.clientX - drag[0]) * 0.012; st.pitch = Math.max(0, Math.min(1.4, drag[3] + (e.clientY - drag[1]) * 0.008)); $('pitch').value = st.pitch; });
  cv.addEventListener('pointerup', () => drag = null);
  cv.addEventListener('wheel', e => { e.preventDefault(); st.zoom = Math.max(1.5, Math.min(24, st.zoom * (e.deltaY > 0 ? 0.9 : 1.1))); $('zoom').value = st.zoom; }, { passive: false });
  document.querySelectorAll('[data-yaw]').forEach(b => b.onclick = () => { st.yaw = +b.dataset.yaw; st.spin = false; $('spin').checked = false; });
  let last = performance.now();
  (function loop(now) {
    const dt = (now - last) / 1000; last = now;
    if (st.spin && !drag) st.yaw += dt * 0.7;
    const r = cv.getBoundingClientRect(), pix = st.pix ? Math.max(1, Math.round(st.zoom / 1.6)) : 1 / (window.devicePixelRatio || 1);
    const w = Math.max(2, Math.round(r.width / pix)), h = Math.max(2, Math.round(r.height / pix));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const A = ANIMS[st.anim];
    let i = Math.floor((now - st.t0) / 1000 * A.fps);
    i = A.loop ? i % A.n : Math.min(A.n - 1, i % (A.n + Math.ceil(A.fps * 0.7)));
    const items = [{ geo: rakaFrame({ outfit: st.outfit, anim: st.anim, i, expr: st.expr, helm: st.helm }), ox: st.compare ? 13 : 0, big: st.anim === 'rideSport' }];
    if (st.compare) items.push({ geo: oldFrame(st.anim, i), ox: -13 });
    render(items, { yaw: st.yaw, pitch: st.pitch, scale: st.zoom / pix, cx: w / 2, cy: h * 0.86 });
    $('info').textContent = `${A.name || st.anim} · frame ${i + 1}/${A.n} · ekspresi: ${st.expr === 'auto' ? exprFor(st.anim, i, A.n) : st.expr}`;
    requestAnimationFrame(loop);
  })(last);
}
// untuk skrip screenshot: gambar satu sel ke canvas 2D
export function cell(o) {
  const c = cell.c || (cell.c = document.createElement('canvas')), pix = o.pixel || 1;
  c.width = Math.round(o.w / pix); c.height = Math.round(o.h / pix);
  const render = cell.r || (cell.r = makeGL(c));
  const geo = o.old ? oldFrame(o.anim || 'idle', o.i || 0) : rakaFrame(o);
  render([{ geo, big: !o.old && o.anim === 'rideSport' }], { yaw: o.yaw || 0, pitch: o.pitch ?? 0.4, scale: o.scale / pix, cx: c.width / 2 + (o.dx || 0) / pix, cy: (o.cy ?? o.h * 0.88) / pix, bg: o.bg });
  return c;
}
window.RK = { cell, rakaFrame, oldFrame, ANIMS, EXPRS, OUTFITS };

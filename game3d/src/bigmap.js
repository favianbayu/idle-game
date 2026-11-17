// Peta besar (M / tombol Peta): seluruh kota Wirabumi, nomor tempat penting, posisi & arah pemain, kendaraan yang diparkir.
// Seret = geser, roda / cubit = zoom, ketuk nomor = nama tempat.
export function makeBigMap({ kota, player, parked, isTouch }) {
  const W = 260, H = 180;
  const wrap = document.createElement('div');
  wrap.id = 'bigmap';
  wrap.innerHTML = `<canvas></canvas><div class="bm-top"><b>Peta Wirabumi</b><span class="bm-hint">${isTouch ? 'geser · cubit zoom · ketuk nomor' : 'seret · roda zoom · klik nomor'}</span>
    <button class="bm-c">◎ Aku</button><button class="bm-x">✕ Tutup</button></div><div class="bm-info"></div>`;
  document.body.appendChild(wrap);
  const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d'), info = wrap.querySelector('.bm-info');
  const marks = kota.marks, labels = kota.labels || [];
  let s = 4, ox = 0, oy = 0, open = false, sel = null, t = 0;
  const ptrs = new Map(); let pinch = null, moved = 0;

  function fit() {
    const r = devicePixelRatio || 1;
    cv.width = innerWidth * r; cv.height = innerHeight * r;
    s = Math.min(cv.width / (W + 8), cv.height / (H + 20));
    ox = (cv.width - W * s) / 2; oy = (cv.height - H * s) / 2 + 14 * r;
  }
  function centerOn(x, z, k) { if (k) s = k; ox = cv.width / 2 - x * s; oy = cv.height / 2 - z * s; }
  function zoomAt(f, cx, cy) {
    const ns = Math.max(Math.min(cv.width / W, cv.height / H) * 0.8, Math.min(60, s * f));
    ox = cx - (cx - ox) * ns / s; oy = cy - (cy - oy) * ns / s; s = ns;
  }
  const toMap = (x, z) => [ox + x * s, oy + z * s];

  function draw(dt = 0) {
    t += dt;
    const r = devicePixelRatio || 1;
    ctx.fillStyle = '#1e2430'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = s < 6;
    ctx.drawImage(kota.groundTex, ox, oy, W * s, H * s);
    ctx.strokeStyle = '#2a2014'; ctx.lineWidth = 3 * r; ctx.strokeRect(ox, oy, W * s, H * s);
    // nama wilayah
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const l of labels) if (l.big) {
      const [x, y] = toMap(l.x, l.y), fs = Math.max(10 * r, Math.min(22 * r, s * 3.2));
      ctx.font = `bold ${fs}px Trebuchet MS, sans-serif`; ctx.lineWidth = 4 * r; ctx.strokeStyle = '#000a'; ctx.fillStyle = '#fffbe8';
      l.t.replace(/\s*\(W\d\)/, '').split('\n').forEach((ln, i, a) => { const yy = y + (i - (a.length - 1) / 2) * fs * 1.1; ctx.strokeText(ln, x, yy); ctx.fillText(ln, x, yy); });
    }
    // tempat penting
    const mr = Math.max(7 * r, Math.min(13 * r, s * 1.6));
    for (const m of marks) {
      const [x, y] = toMap(m.x, m.y);
      ctx.fillStyle = m === sel ? '#ffd84a' : '#d23a3a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * r;
      ctx.beginPath(); ctx.arc(x, y, mr, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = m === sel ? '#2a2014' : '#fff'; ctx.font = `bold ${mr * 1.05}px Trebuchet MS, sans-serif`; ctx.fillText(m.n, x, y + r);
      if (s > 9 || m === sel) {
        ctx.font = `bold ${11 * r}px Trebuchet MS, sans-serif`; ctx.lineWidth = 3 * r; ctx.strokeStyle = '#000c'; ctx.fillStyle = '#fff';
        ctx.strokeText(m.name, x, y + mr + 9 * r); ctx.fillText(m.name, x, y + mr + 9 * r);
      }
    }
    // kendaraan parkir
    for (const p of parked()) {
      const [x, y] = toMap(p.x, p.z);
      ctx.fillStyle = '#2a8ae0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * r;
      ctx.beginPath(); ctx.roundRect(x - 9 * r, y - 7 * r, 18 * r, 14 * r, 3 * r); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `bold ${10 * r}px Trebuchet MS, sans-serif`; ctx.fillText(p.icon, x, y + r);
    }
    // pemain: lingkaran berdenyut + panah arah hadap
    if (player.area === 'kota') {
      const [x, y] = toMap(player.x, player.z), pr = (14 + Math.sin(t * 5) * 4) * r;
      ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 3 * r; ctx.beginPath(); ctx.arc(x, y, pr, 0, 7); ctx.stroke();
      ctx.save(); ctx.translate(x, y); ctx.rotate(player.heading);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 * r;
      ctx.beginPath(); ctx.moveTo(10 * r, 0); ctx.lineTo(-7 * r, -7 * r); ctx.lineTo(-3 * r, 0); ctx.lineTo(-7 * r, 7 * r); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.font = `bold ${12 * r}px Trebuchet MS, sans-serif`; ctx.lineWidth = 3 * r; ctx.strokeStyle = '#000'; ctx.fillStyle = '#ffd84a';
      ctx.strokeText('KAMU', x, y - pr - 8 * r); ctx.fillText('KAMU', x, y - pr - 8 * r);
    }
  }
  function pick(cx, cy) {
    const r = devicePixelRatio || 1, mr = Math.max(9 * r, Math.min(14 * r, s * 1.6));
    let best = null, bd = mr * 1.6;
    for (const m of marks) { const [x, y] = toMap(m.x, m.y), d = Math.hypot(x - cx, y - cy); if (d < bd) { bd = d; best = m; } }
    sel = best; info.style.display = best ? '' : 'none';
    if (best) info.innerHTML = `<b>${best.n}. ${best.name}</b><br>${best.desc}`;
  }

  const r = () => devicePixelRatio || 1;
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
  cv.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) zoomAt(d / pinch, (a.x + b.x) / 2 * r(), (a.y + b.y) / 2 * r()); pinch = d; moved += 10; }
    else { ox += dx * r(); oy += dy * r(); moved += Math.abs(dx) + Math.abs(dy); }
  });
  const up = e => { if (ptrs.size === 1 && moved < 8) pick(e.clientX * r(), e.clientY * r()); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch = null; });
  cv.addEventListener('wheel', e => { zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX * r(), e.clientY * r()); e.preventDefault(); }, { passive: false });
  const stop = e => { e.stopPropagation(); };
  wrap.addEventListener('pointerdown', stop);
  wrap.querySelector('.bm-x').addEventListener('click', () => api.close());
  wrap.querySelector('.bm-c').addEventListener('click', () => centerOn(player.x, player.z, Math.max(s, Math.min(cv.width / W, cv.height / H) * 2.5)));
  addEventListener('resize', () => { if (open) fit(); });

  const api = {
    get isOpen() { return open; },
    open() { open = true; wrap.style.display = 'block'; fit(); sel = null; info.style.display = 'none'; },
    close() { open = false; wrap.style.display = 'none'; },
    toggle() { open ? api.close() : api.open(); },
    update(dt) { if (open) draw(dt); },
  };
  return api;
}

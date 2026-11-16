// Screenshot lembar pratinjau: node shot.mjs <outdir>
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import path from 'path';
const out = process.argv[2] || 'shots';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
page.on('console', m => m.type() === 'error' && console.error('console', m.text()));
await page.goto('file://' + path.resolve('raka_voxel.html'));
await page.waitForFunction(() => window.RK);

const sheets = {
  // tampak putar: depan, serong, samping, belakang
  turnaround: { cols: 4, cell: [300, 460], scale: 10, pitch: 0.28, items: [
    { label: 'Depan', yaw: 0 }, { label: 'Serong', yaw: 0.75 }, { label: 'Samping', yaw: Math.PI / 2 }, { label: 'Belakang', yaw: Math.PI }] },
  wajah: { cols: 5, cell: [230, 230], scale: 16, pitch: 0.12, cy: 0.98, headOnly: true, items: [
    { label: 'Biasa (senyum miring)', expr: 'biasa' }, { label: 'Kedip', expr: 'kedip' }, { label: 'Berantem', expr: 'berantem' }, { label: 'Nyengir', expr: 'nyengir' }, { label: 'Kesakitan', expr: 'sakit' }] },
  pose: { cols: 4, cell: [300, 380], scale: 7, pitch: 0.45, items: [
    { label: 'Jalan', anim: 'walk', i: 1, yaw: 0.7 }, { label: 'Lari', anim: 'run', i: 2, yaw: 0.9 }, { label: 'Kuda-kuda', anim: 'guard', i: 1, yaw: 0.6 }, { label: 'Pukulan lurus', anim: 'straight', i: 4, yaw: 0.9 },
    { label: 'Uppercut', anim: 'uppercut', i: 4, yaw: 0.7 }, { label: 'Tendangan tinggi', anim: 'kickHigh', i: 4, yaw: 1.1 }, { label: 'Provokasi "Sini!"', anim: 'taunt', i: 2, yaw: 0.5 }, { label: 'Kesakitan / jatuh', anim: 'fall', i: 3, yaw: 0.9 },
    { label: 'Naik motor sport', anim: 'rideSport', i: 0, yaw: 1.2 }, { label: 'Sisir rambut', anim: 'hairFix', i: 4, yaw: 0.6 }, { label: 'Main HP', anim: 'phone', i: 0, yaw: 0.5 }, { label: 'Tertawa', anim: 'laugh', i: 1, yaw: 0.4 }] },
  baju: { cols: 3, cell: [320, 440], scale: 9, pitch: 0.3, items: [
    { label: 'Seragam bandel', outfit: 'seragam', yaw: 0.6 }, { label: 'Jaket balap Lampu Kota', outfit: 'balap', yaw: 0.6 }, { label: 'Jaket (punggung)', outfit: 'balap', yaw: 2.6 }] },
  // ukuran asli di game: ±1.6 px per voxel lalu diperbesar 4x (pixelated)
  game: { cols: 4, cell: [260, 300], scale: 8, pixel: 5, pitch: 0.55, compare: true, items: [
    { label: 'Lama · depan', who: 'old', yaw: 0.3 }, { label: 'Baru · depan', yaw: 0.3 }, { label: 'Lama · jalan', who: 'old', anim: 'walk', i: 1, yaw: 0.9 }, { label: 'Baru · jalan', anim: 'walk', i: 1, yaw: 0.9 },
    { label: 'Lama · jab', who: 'old', anim: 'straight', i: 4, yaw: 0.9 }, { label: 'Baru · jab', anim: 'straight', i: 4, yaw: 0.9 }, { label: 'Lama · belakang', who: 'old', yaw: 2.8 }, { label: 'Baru · belakang', yaw: 2.8 }] },
};
for (const [name, sh] of Object.entries(sheets)) {
  const url = await page.evaluate(sh => {
    const { frameModel, draw } = window.RK;
    const rows = Math.ceil(sh.items.length / sh.cols), [cw, ch] = sh.cell;
    const big = document.createElement('canvas'); big.width = cw * sh.cols; big.height = ch * rows;
    const g = big.getContext('2d');
    sh.items.forEach((it, k) => {
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const m = frameModel(it.who || 'new', it.outfit || 'seragam', it.anim || 'idle', it.i || 0, it.expr || 'auto');
      const scale = sh.scale, cy = sh.headOnly ? ch * 0.5 + 33 * scale * Math.cos(sh.pitch) : ch * (sh.cy || 0.86);
      draw(c, [{ m }], { yaw: it.yaw || 0, pitch: sh.pitch, scale, w: cw, h: ch, cx: cw / 2, cy, pixel: sh.pixel || 1, bg: it.who === 'old' ? '#d6dbe4' : '#bcd8ee' });
      const x = (k % sh.cols) * cw, y = Math.floor(k / sh.cols) * ch;
      g.drawImage(c, x, y);
      g.fillStyle = '#0009'; g.fillRect(x, y + ch - 26, cw, 26);
      g.fillStyle = '#fff'; g.font = '600 15px system-ui'; g.fillText(it.label, x + 10, y + ch - 8);
      g.strokeStyle = '#0003'; g.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
    });
    return big.toDataURL('image/png');
  }, sh);
  fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', name);
}
await browser.close();

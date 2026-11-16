// Lembar screenshot: node shot.mjs <outdir> [nama-lembar...]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');
const out = process.argv[2] || 'shots', only = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const SHEETS = JSON.parse(fs.readFileSync('sheets.json', 'utf8'));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on('pageerror', e => console.error('PAGE ERROR', e.message));
page.on('console', m => m.type() === 'error' && console.error('console', m.text()));
await page.addInitScript(() => { window.NO_UI = true; });
await page.goto('file://' + path.resolve('raka_voxel.html'));
await page.waitForFunction(() => window.RK);
for (const [name, sh] of Object.entries(SHEETS)) {
  if (only.length && !only.includes(name)) continue;
  const url = await page.evaluate(sh => {
    const rows = Math.ceil(sh.items.length / sh.cols), [cw, ch] = sh.cell;
    const big = document.createElement('canvas'); big.width = cw * sh.cols; big.height = ch * rows;
    const g = big.getContext('2d'); g.imageSmoothingEnabled = false;
    sh.items.forEach((it, k) => {
      const o = { w: cw, h: ch, ...sh.base, ...it };
      if (o.old) o.bg = [0.84, 0.86, 0.9];
      const c = window.RK.cell(o), x = (k % sh.cols) * cw, y = Math.floor(k / sh.cols) * ch;
      g.drawImage(c, x, y, cw, ch);
      if (it.label) { g.fillStyle = '#0009'; g.fillRect(x, y + ch - 24, cw, 24); g.fillStyle = '#fff'; g.font = '600 14px system-ui'; g.fillText(it.label, x + 8, y + ch - 7); }
      g.strokeStyle = '#0002'; g.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
    });
    return big.toDataURL('image/png');
  }, sh);
  fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', name);
}
await browser.close();

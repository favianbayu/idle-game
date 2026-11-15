// Bangun game jadi SATU file index.html (bisa dibuka langsung dari folder, tanpa server).
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const worker = await build({ entryPoints: [path.join(root, 'src/voxworker.js')], bundle: true, write: false, format: 'iife', minify: true });
const main = await build({
  entryPoints: [path.join(root, 'src/main.js')], bundle: true, write: false, format: 'iife', minify: true, target: 'es2020',
  define: { __WORKER_SRC__: JSON.stringify(worker.outputFiles[0].text) }, loader: { '.json': 'json' },
});
const html = fs.readFileSync(path.join(root, 'src/index.template.html'), 'utf8')
  .replace('<script>/*GAME*/</script>', () => '<script>' + main.outputFiles[0].text.replace(/<\/script/g, '<\\/script') + '</script>');
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(0), 'KB');

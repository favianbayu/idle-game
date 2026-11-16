// Gabung voxlib.js + raka.js + preview.js jadi satu raka_voxel.html (bisa dibuka langsung dari file://).
// Tiap file dibungkus fungsi sendiri (nama helper yang sama tidak bentrok); import/export lewat objek M.
import fs from 'fs';
let code = 'const M = {};\n';
for (const f of ['voxlib.js', 'raka.js', 'preview.js']) {
  let s = fs.readFileSync(f, 'utf8');
  const imports = [...s.matchAll(/^import \{([^}]*)\} from .*$/gm)].flatMap(m => m[1].split(',').map(x => x.trim()).filter(Boolean));
  const exports = [...s.matchAll(/^export (?:function|const|let|class) (\w+)/gm)].map(m => m[1]);
  for (const m of s.matchAll(/^export \{([^}]*)\};?$/gm)) exports.push(...m[1].split(',').map(x => x.trim()).filter(Boolean));
  s = s.replace(/^import .*$/gm, '').replace(/^export \{[^}]*\};?$/gm, '').replace(/^export /gm, '');
  code += `// ===== ${f}\n(() => {\nconst { ${imports.join(', ')} } = M;\n${s}\nObject.assign(M, { ${exports.join(', ')} });\n})();\n`;
}
code += 'const { initUI } = M;\n';
fs.writeFileSync('raka_voxel.html', fs.readFileSync('template.html', 'utf8').replace('/*__CODE__*/', () => code));
console.log('raka_voxel.html', (fs.statSync('raka_voxel.html').size / 1024).toFixed(0) + ' KB');

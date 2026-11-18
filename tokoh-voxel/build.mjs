// Gabung semua modul src/ jadi satu raka_voxel.html (bisa dibuka langsung dari file://).
// Tiap modul dibungkus fungsi & punya ruang nama sendiri (NS.<file>), import dipetakan ke ruang nama sumbernya.
import fs from 'fs';
let code = 'const NS = {};\n';
for (const f of ['voxlib', 'npc_styles', 'vox', 'rig', 'model', 'rani', 'bimo', 'bram', 'nadia', 'dimas', 'rok', 'sekar', 'arga', 'laras', 'rizal', 'uti', 'tegar', 'sasha', 'kirana', 'jojo', 'andra', 'mei', 'gilang', 'wulan', 'darto', 'cici', 'fajar', 'kobar', 'jaka', 'narti', 'rtslamet', 'haris', 'gito', 'rio', 'kevin', 'hartini', 'ratna', 'hendro', 'wawan', 'sinta', 'anton', 'gunadi', 'melati', 'ujang', 'iyah', 'ama', 'karto', 'sum', 'darmin', 'rini', 'joko', 'euis', 'ahong', 'dodi', 'didi', 'rizki', 'hasan', 'bambang', 'veronika', 'yuni', 'raffi', 'willem', 'lita', 'kurir', 'kevinkecil', 'sugeng', 'barista', 'lastri', 'tarno', 'dewi', 'dul', 'hendrik', 'wati', 'ilham', 'nana', 'darsono', 'udin', 'inah', 'ucok', 'ijah', 'roni', 'lilis', 'tejo', 'satpamudin', 'ningsih', 'cilok', 'andi', 'fitri', 'rina', 'bayu', 'maya', 'bejo', 'sutris', 'spawn_base', 'sp_pria', 'sp_wanita', 'sp_hijab', 'sp_lansia', 'sp_muda', 'sp_anak', 'sp_tentara', 'sp_buruh', 'sp_petani', 'sp_siswa', 'sp_siswi', 'sp_guru', 'sp_ojol', 'sp_kuli', 'sp_parkir', 'sp_polisi', 'sp_satpam', 'sp_nelayan', 'sp_mekanik', 'sp_pedagang', 'chars', 'frame', 'anims', 'viewer']) {
  let s = fs.readFileSync(`src/${f}.js`, 'utf8');
  const exports = [...s.matchAll(/^export (?:function|const|let|class) (\w+)/gm)].map(m => m[1]);
  for (const m of s.matchAll(/^export \{([^}]*)\};?$/gm)) exports.push(...m[1].split(',').map(x => x.trim()).filter(Boolean));
  s = s.replace(/^import \{([^}]*)\} from '\.\/(\w+)\.js';?$/gm, (_, names, src) => `const { ${names.replace(/(\w+)\s+as\s+(\w+)/g, '$1: $2')} } = NS.${src};`)
    .replace(/^export \{[^}]*\};?$/gm, '').replace(/^export /gm, '');
  code += `// ===== ${f}.js\nNS.${f} = (() => {\n${s}\nreturn { ${exports.join(', ')} };\n})();\n`;
}
code += 'const { initUI } = NS.viewer;\n';
fs.writeFileSync('raka_voxel.html', fs.readFileSync('template.html', 'utf8').replace('/*__CODE__*/', () => code));
console.log('raka_voxel.html', (fs.statSync('raka_voxel.html').size / 1024).toFixed(0) + ' KB');

// Worker: membangun mesh voxel tokoh (per gaya, per animasi, per frame) di luar thread utama,
// supaya game tidak tersendat saat tokoh baru muncul.
import { STYLES, ANIMS, humanShape, buildVox, organicColor, makeRamps, faceCfg } from './voxlib.js';
import { NPC_STYLES } from './npc_styles.js';
import { EXTRA_STYLES } from './npc_extra.js';
import { buildParts } from './raka/model.js';
import { build as raniBuild } from './raka/rani.js';
import { build as bimoBuild } from './raka/bimo.js';
import { build as bramBuild } from './raka/bram.js';
import { build as nadiaBuild } from './raka/nadia.js';
import { build as dimasBuild } from './raka/dimas.js';
import { build as sekarBuild } from './raka/sekar.js';
import { build as argaBuild } from './raka/arga.js';
import { build as larasBuild } from './raka/laras.js';
import { build as rizalBuild } from './raka/rizal.js';
import { build as utiBuild } from './raka/uti.js';
import { build as tegarBuild } from './raka/tegar.js';
import { build as sashaBuild } from './raka/sasha.js';
import { build as kiranaBuild } from './raka/kirana.js';
import { build as jojoBuild } from './raka/jojo.js';
import { build as andraBuild } from './raka/andra.js';
import { build as meiBuild } from './raka/mei.js';
import { build as gilangBuild } from './raka/gilang.js';
import { build as wulanBuild } from './raka/wulan.js';
import { build as dartoBuild } from './raka/darto.js';
import { build as ciciBuild } from './raka/cici.js';
import { build as fajarBuild } from './raka/fajar.js';
import { build as kobarBuild } from './raka/kobar.js';
import { build as jakaBuild } from './raka/jaka.js';
import { build as nartiBuild } from './raka/narti.js';
import { build as rtSlametBuild } from './raka/rtslamet.js';
import { build as harisBuild } from './raka/haris.js';
import { build as gitoBuild } from './raka/gito.js';
import { build as rioBuild } from './raka/rio.js';
import { build as kevinBuild } from './raka/kevin.js';
import { build as hartiniBuild } from './raka/hartini.js';
import { build as ratnaBuild } from './raka/ratna.js';
import { build as hendroBuild } from './raka/hendro.js';
import { build as wawanBuild } from './raka/wawan.js';
import { build as sintaBuild } from './raka/sinta.js';
import { build as antonBuild } from './raka/anton.js';
import { build as gunadiBuild } from './raka/gunadi.js';
import { build as melatiBuild } from './raka/melati.js';
import { build as ujangBuild } from './raka/ujang.js';
import { build as iyahBuild } from './raka/iyah.js';
import { build as amaBuild } from './raka/ama.js';
import { build as kartoBuild } from './raka/karto.js';
import { build as sumBuild } from './raka/sum.js';
import { build as darminBuild } from './raka/darmin.js';
import { build as riniBuild } from './raka/rini.js';
import { build as jokoBuild } from './raka/joko.js';
import { build as euisBuild } from './raka/euis.js';
import { build as ahongBuild } from './raka/ahong.js';
import { build as dodiBuild } from './raka/dodi.js';
import { build as didiBuild } from './raka/didi.js';
import { build as rizkiBuild } from './raka/rizki.js';
import { build as hasanBuild } from './raka/hasan.js';
import { build as bambangBuild } from './raka/bambang.js';
import { build as veronikaBuild } from './raka/veronika.js';
import { build as yuniBuild } from './raka/yuni.js';
import { build as raffiBuild } from './raka/raffi.js';
import { build as willemBuild } from './raka/willem.js';
import { build as litaBuild } from './raka/lita.js';
import { voxelFrame } from './raka/frame.js';
import { exprFor, helmFor } from './raka/expr.js';

// Gaya tokoh SMA: ramp warna dibuat sama seperti loop STYLES di renderer lama.
const ALL = { ...NPC_STYLES, ...EXTRA_STYLES };
for (const id in ALL) {
  const st = { ...ALL[id] };
  st.ramps = makeRamps(st); st.color = organicColor(m => st.ramps[m]); st.fc = faceCfg(st);
  STYLES[id] = st;
}

const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const LIN = new Float32Array(256).map((_, i) => lin(i));
const S = 1 / 32;   // 1 voxel = 1/32 petak

// sisi: [bit mask, normal (dunia), 4 sudut (offset voxel x,y,z)]
// dunia: X = x, Y = z, Z = -y  (rotasi murni, tidak tercermin)
const FACES = [
  [1, [1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],     // +x
  [2, [-1, 0, 0], [[0, 1, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]]],    // -x
  [4, [0, 0, -1], [[1, 1, 0], [0, 1, 0], [0, 1, 1], [1, 1, 1]]],    // +y  -> -Z
  [8, [0, 0, 1], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],     // -y  -> +Z
  [16, [0, 1, 0], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],    // +z  -> +Y
  [32, [0, -1, 0], [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]]],   // -z  -> -Y
];

function mesh(m, S = 1 / 32, cx = m.L / 2, cy = m.W / 2, cz = 0) {
  const { vox } = m;
  let nq = 0;
  for (let i = 0; i < vox.length; i += 7) { let k = vox[i + 6]; while (k) { nq += k & 1; k >>= 1; } }
  const pos = new Float32Array(nq * 12), nor = new Int8Array(nq * 12), col = new Float32Array(nq * 12);
  const idx = new Uint32Array(nq * 6);
  let q = 0;
  for (let i = 0; i < vox.length; i += 7) {
    const x = vox[i], y = vox[i + 1], z = vox[i + 2], r = LIN[vox[i + 3]], g = LIN[vox[i + 4]], b = LIN[vox[i + 5]], mask = vox[i + 6];
    for (const [bit, n, corners] of FACES) {
      if (!(mask & bit)) continue;
      for (let c = 0; c < 4; c++) {
        const o = (q * 4 + c) * 3, [dx, dy, dz] = corners[c];
        pos[o] = (x + dx - cx) * S; pos[o + 1] = (z + dz + cz) * S; pos[o + 2] = -(y + dy - cy) * S;
        nor[o] = n[0] * 127; nor[o + 1] = n[1] * 127; nor[o + 2] = n[2] * 127;
        col[o] = r; col[o + 1] = g; col[o + 2] = b;
      }
      const v = q * 4, j = q * 6;
      idx[j] = v; idx[j + 1] = v + 1; idx[j + 2] = v + 2; idx[j + 3] = v; idx[j + 4] = v + 2; idx[j + 5] = v + 3;
      q++;
    }
  }
  return { pos, nor, col, idx };
}

// tokoh utama bermodel voxel halus (1/64 petak, digambar tangan, lihat src/raka/ dan tokoh-voxel/PANDUAN-TOKOH.md)
const FINE = { raka: buildParts, rani: raniBuild, bimo: bimoBuild, bram: bramBuild, nadia: nadiaBuild, dimas: dimasBuild, sekar: sekarBuild, arga: argaBuild,
  laras: larasBuild, rizal: rizalBuild, uti: utiBuild, tegar: tegarBuild, sasha: sashaBuild, kirana: kiranaBuild, jojo: jojoBuild, andra: andraBuild,
  mei: meiBuild, gilang: gilangBuild, wulan: wulanBuild, omDarto: dartoBuild, cici: ciciBuild, fajar: fajarBuild, kobar: kobarBuild,
  bangJaka: jakaBuild, buNarti: nartiBuild, rtSlamet: rtSlametBuild, pakHaris: harisBuild, pakGito: gitoBuild, rio: rioBuild, kevin: kevinBuild,
  buHartini: hartiniBuild, buRatna: ratnaBuild, pakHendro: hendroBuild, pakWawan: wawanBuild, buSinta: sintaBuild, mrAnton: antonBuild,
  pakGunadi: gunadiBuild, buMelati: melatiBuild, pakUjang: ujangBuild, makIyah: iyahBuild, ama: amaBuild, mbahKarto: kartoBuild,
  buSum: sumBuild, pakDarmin: darminBuild, mbakRini: riniBuild, pakJoko: jokoBuild, tehEuis: euisBuild, kohAhong: ahongBuild,
  dodi: dodiBuild, didi: didiBuild, udaRizki: rizkiBuild, ustazHasan: hasanBuild, satpamBambang: bambangBuild, buVeronika: veronikaBuild,
  mbakYuni: yuniBuild, kakRaffi: raffiBuild, opaWillem: willemBuild, nyonyaLita: litaBuild };
const PARTS = new Map();
const fineParts = (sid, outfit, expr, helm) => {
  const k = sid + '|' + outfit + '|' + expr + (helm ? '+h' : '');
  if (!PARTS.has(k)) PARTS.set(k, FINE[sid]({ outfit, expr, helm }));
  return PARTS.get(k);
};

self.onmessage = e => {
  const { key, sid, anim, i } = e.data;
  const A = ANIMS[anim], st = STYLES[sid];
  const t = A.loop ? i / A.n : i / Math.max(1, A.n - 1);
  if (FINE[sid]) {
    const f = voxelFrame(fineParts(sid, 'seragam', exprFor(anim, i, A.n), helmFor(anim)), A.pose(t)), H = 1 / 64;
    const g = mesh(f, H, -f.org[0], -f.org[1], f.org[2]);
    g.lift = f.lift * H; g.butt = f.buttZ * H; g.buttX = f.buttX * H;
    self.postMessage({ key, ...g }, [g.pos.buffer, g.nor.buffer, g.col.buffer, g.idx.buffer]);
    return;
  }
  const sh = humanShape(A.pose(t), st, 'all');
  const m = buildVox(sh.L, sh.W, sh.H, sh.mat, st.color, { bbox: sh.bbox });
  const g = mesh(m);
  g.lift = (sh.lift || 0) * S; g.butt = sh.buttZ * S; g.buttX = sh.buttX * S;
  self.postMessage({ key, ...g }, [g.pos.buffer, g.nor.buffer, g.col.buffer, g.idx.buffer]);
};
self.postMessage({ ready: true, anims: Object.fromEntries(Object.entries(ANIMS).map(([k, a]) => [k, { n: a.n, fps: a.fps, loop: !!a.loop }])),
  names: Object.fromEntries(Object.entries(STYLES).map(([k, s]) => [k, s.name])) });

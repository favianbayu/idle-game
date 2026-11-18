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
import { build as kurirBuild } from './raka/kurir.js';
import { build as kevinkecilBuild } from './raka/kevinkecil.js';
import { build as sugengBuild } from './raka/sugeng.js';
import { build as baristaBuild } from './raka/barista.js';
import { build as lastriBuild } from './raka/lastri.js';
import { build as tarnoBuild } from './raka/tarno.js';
import { build as dewiBuild } from './raka/dewi.js';
import { build as dulBuild } from './raka/dul.js';
import { build as hendrikBuild } from './raka/hendrik.js';
import { build as watiBuild } from './raka/wati.js';
import { build as ilhamBuild } from './raka/ilham.js';
import { build as nanaBuild } from './raka/nana.js';
import { build as darsonoBuild } from './raka/darsono.js';
import { build as udinBuild } from './raka/udin.js';
import { build as inahBuild } from './raka/inah.js';
import { build as ucokBuild } from './raka/ucok.js';
import { build as ijahBuild } from './raka/ijah.js';
import { build as roniBuild } from './raka/roni.js';
import { build as lilisBuild } from './raka/lilis.js';
import { build as tejoBuild } from './raka/tejo.js';
import { build as satpamudinBuild } from './raka/satpamudin.js';
import { build as ningsihBuild } from './raka/ningsih.js';
import { build as cilokBuild } from './raka/cilok.js';
import { build as andiBuild } from './raka/andi.js';
import { build as fitriBuild } from './raka/fitri.js';
import { build as rinaBuild } from './raka/rina.js';
import { build as bayuBuild } from './raka/bayu.js';
import { build as mayaBuild } from './raka/maya.js';
import { build as bejoBuild } from './raka/bejo.js';
import { build as sutrisBuild } from './raka/sutris.js';
import { build as prasBuild } from './raka/pras.js';
import { build as saripBuild } from './raka/sarip.js';
import { build as kartaBuild } from './raka/karta.js';
import { build as mahfudBuild } from './raka/mahfud.js';
import { build as hadiBuild } from './raka/hadi.js';
import { build as sudarmajiBuild } from './raka/sudarmaji.js';
import { build as kodirBuild } from './raka/kodir.js';
import { build as romlahBuild } from './raka/romlah.js';
import { build as ujoBuild } from './raka/ujo.js';
import { build as sabarBuild } from './raka/sabar.js';
import { build as yusufBuild } from './raka/yusuf.js';
import { build as sriBuild } from './raka/sri.js';
import { build as darmoBuild } from './raka/darmo.js';
import { build as sumiBuild } from './raka/sumi.js';
import { build as titoBuild } from './raka/tito.js';
import { build as ayuBuild } from './raka/ayu.js';
import { build as rusdiBuild } from './raka/rusdi.js';
import { build as lukmanBuild } from './raka/lukman.js';
import { SPAWN as sp_priaS, build as sp_priaB } from './raka/sp_pria.js';
import { SPAWN as sp_wanitaS, build as sp_wanitaB } from './raka/sp_wanita.js';
import { SPAWN as sp_hijabS, build as sp_hijabB } from './raka/sp_hijab.js';
import { SPAWN as sp_lansiaS, build as sp_lansiaB } from './raka/sp_lansia.js';
import { SPAWN as sp_mudaS, build as sp_mudaB } from './raka/sp_muda.js';
import { SPAWN as sp_anakS, build as sp_anakB } from './raka/sp_anak.js';
import { SPAWN as sp_tentaraS, build as sp_tentaraB } from './raka/sp_tentara.js';
import { SPAWN as sp_buruhS, build as sp_buruhB } from './raka/sp_buruh.js';
import { SPAWN as sp_petaniS, build as sp_petaniB } from './raka/sp_petani.js';
import { SPAWN as sp_siswaS, build as sp_siswaB } from './raka/sp_siswa.js';
import { SPAWN as sp_siswiS, build as sp_siswiB } from './raka/sp_siswi.js';
import { SPAWN as sp_guruS, build as sp_guruB } from './raka/sp_guru.js';
import { SPAWN as sp_ojolS, build as sp_ojolB } from './raka/sp_ojol.js';
import { SPAWN as sp_kuliS, build as sp_kuliB } from './raka/sp_kuli.js';
import { SPAWN as sp_parkirS, build as sp_parkirB } from './raka/sp_parkir.js';
import { SPAWN as sp_polisiS, build as sp_polisiB } from './raka/sp_polisi.js';
import { SPAWN as sp_satpamS, build as sp_satpamB } from './raka/sp_satpam.js';
import { SPAWN as sp_nelayanS, build as sp_nelayanB } from './raka/sp_nelayan.js';
import { SPAWN as sp_mekanikS, build as sp_mekanikB } from './raka/sp_mekanik.js';
import { SPAWN as sp_pedagangS, build as sp_pedagangB } from './raka/sp_pedagang.js';
import { SPAWN as sp_pendakiS, build as sp_pendakiB } from './raka/sp_pendaki.js';
import { SPAWN as sp_turisS, build as sp_turisB } from './raka/sp_turis.js';
import { SPAWN as sp_penontonS, build as sp_penontonB } from './raka/sp_penonton.js';
import { SPAWN as sp_santriS, build as sp_santriB } from './raka/sp_santri.js';
import { SPAWN as sp_silatS, build as sp_silatB } from './raka/sp_silat.js';
import { SPAWN as sp_persitS, build as sp_persitB } from './raka/sp_persit.js';
import { SPAWN as sp_stmS, build as sp_stmB } from './raka/sp_stm.js';
import { SPAWN as sp_smkS, build as sp_smkB } from './raka/sp_smk.js';
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
  mbakYuni: yuniBuild, kakRaffi: raffiBuild, opaWillem: willemBuild, nyonyaLita: litaBuild,
  kurirBayu: kurirBuild, kevinKecil: kevinkecilBuild, polisiSugeng: sugengBuild, masBarista: baristaBuild, buLastri: lastriBuild,
  pakTarno: tarnoBuild, mbakDewi: dewiBuild, pengamenDul: dulBuild, omHendrik: hendrikBuild, buWati: watiBuild,
  masIlham: ilhamBuild, kakNana: nanaBuild, pakDarsono: darsonoBuild, wakUdin: udinBuild, buInah: inahBuild,
  bangUcok: ucokBuild, makIjah: ijahBuild, pakRoni: roniBuild, tehLilis: lilisBuild, masTejo: tejoBuild,
  satpamUdin: satpamudinBuild, buNingsih: ningsihBuild, masCilok: cilokBuild, siswaAndi: andiBuild, siswiFitri: fitriBuild, siswiRina: rinaBuild, siswaBayu: bayuBuild, siswiMaya: mayaBuild, stmBejo: bejoBuild, mandorSutris: sutrisBuild, pakPras: prasBuild, bangSarip: saripBuild, abahKarta: kartaBuild, kyaiMahfud: mahfudBuild, sermaHadi: hadiBuild, pakSudarmaji: sudarmajiBuild, wakKodir: kodirBuild, buRomlah: romlahBuild, kangUjo: ujoBuild, mandorSabar: sabarBuild, pakYusuf: yusufBuild, mbakSri: sriBuild, mbahDarmo: darmoBuild, nekSumi: sumiBuild, tito: titoBuild, nengAyu: ayuBuild, pakRusdi: rusdiBuild, irLukman: lukmanBuild };
// NPC tanpa nama (guide segmen 34): tiap template spawn didaftarkan 8 kali sebagai <sid>_0..7 (seed v). Sid tampilan boleh
// membawa baju lewat akhiran '~', misal 'tentara_3~jaga'; tanpa akhiran template memakai baju bawaannya.
for (const [S, B] of [[sp_priaS, sp_priaB], [sp_wanitaS, sp_wanitaB], [sp_hijabS, sp_hijabB], [sp_lansiaS, sp_lansiaB], [sp_mudaS, sp_mudaB], [sp_anakS, sp_anakB], [sp_tentaraS, sp_tentaraB], [sp_buruhS, sp_buruhB], [sp_petaniS, sp_petaniB], [sp_siswaS, sp_siswaB], [sp_siswiS, sp_siswiB], [sp_guruS, sp_guruB], [sp_ojolS, sp_ojolB], [sp_kuliS, sp_kuliB], [sp_parkirS, sp_parkirB], [sp_polisiS, sp_polisiB], [sp_satpamS, sp_satpamB], [sp_nelayanS, sp_nelayanB], [sp_mekanikS, sp_mekanikB], [sp_pedagangS, sp_pedagangB], [sp_pendakiS, sp_pendakiB], [sp_turisS, sp_turisB], [sp_penontonS, sp_penontonB], [sp_santriS, sp_santriB], [sp_silatS, sp_silatB], [sp_persitS, sp_persitB], [sp_stmS, sp_stmB], [sp_smkS, sp_smkB]]) for (let v = 0; v < 8; v++) FINE[S.sid + '_' + v] = o => B({ ...o, v });
const PARTS = new Map();
const fineParts = (sid, outfit, expr, helm) => {
  const k = sid + '|' + outfit + '|' + expr + (helm ? '+h' : '');
  if (!PARTS.has(k)) { const [base, of] = sid.split('~'); PARTS.set(k, FINE[base]({ outfit: of || outfit, expr, helm })); }
  return PARTS.get(k);
};

self.onmessage = e => {
  const { key, sid, anim, i } = e.data;
  const A = ANIMS[anim], st = STYLES[sid];
  const t = A.loop ? i / A.n : i / Math.max(1, A.n - 1);
  if (FINE[sid.split('~')[0]]) {
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

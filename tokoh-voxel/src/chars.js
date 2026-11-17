// Daftar tokoh voxel halus (1/64 petak). Tiap tokoh: build({ outfit, expr, helm }) -> data untuk voxelFrame.
import { buildParts as rakaBuild, OUTFITS as RAKA_OUT, EXPRS as RAKA_EX } from './model.js';
import { build as raniBuild, OUTFITS as RANI_OUT, EXPRS as RANI_EX } from './rani.js';
import { build as bimoBuild, OUTFITS as BIMO_OUT, EXPRS as BIMO_EX } from './bimo.js';
import { build as nadiaBuild, OUTFITS as NADIA_OUT, EXPRS as NADIA_EX } from './nadia.js';
import { build as dimasBuild, OUTFITS as DIMAS_OUT, EXPRS as DIMAS_EX } from './dimas.js';
import { build as sekarBuild, OUTFITS as SEKAR_OUT, EXPRS as SEKAR_EX } from './sekar.js';
import { build as argaBuild, OUTFITS as ARGA_OUT, EXPRS as ARGA_EX } from './arga.js';
import { build as larasBuild, OUTFITS as LARAS_OUT, EXPRS as LARAS_EX } from './laras.js';
import { build as rizalBuild, OUTFITS as RIZAL_OUT, EXPRS as RIZAL_EX } from './rizal.js';
import { build as utiBuild, OUTFITS as UTI_OUT, EXPRS as UTI_EX } from './uti.js';
import { build as tegarBuild, OUTFITS as TEGAR_OUT, EXPRS as TEGAR_EX } from './tegar.js';
import { build as sashaBuild, OUTFITS as SASHA_OUT, EXPRS as SASHA_EX } from './sasha.js';
import { build as kiranaBuild, OUTFITS as KIRANA_OUT, EXPRS as KIRANA_EX } from './kirana.js';
import { build as jojoBuild, OUTFITS as JOJO_OUT, EXPRS as JOJO_EX } from './jojo.js';
import { build as andraBuild, OUTFITS as ANDRA_OUT, EXPRS as ANDRA_EX } from './andra.js';
import { build as meiBuild, OUTFITS as MEI_OUT, EXPRS as MEI_EX } from './mei.js';
import { build as gilangBuild, OUTFITS as GILANG_OUT, EXPRS as GILANG_EX } from './gilang.js';
import { build as bramBuild, OUTFITS as BRAM_OUT, EXPRS as BRAM_EX } from './bram.js';
export const CHARS = {
  raka: { name: 'Raka', build: rakaBuild, OUTFITS: RAKA_OUT, EXPRS: RAKA_EX },
  rani: { name: 'Rani', build: raniBuild, OUTFITS: RANI_OUT, EXPRS: RANI_EX },
  bimo: { name: 'Bimo', build: bimoBuild, OUTFITS: BIMO_OUT, EXPRS: BIMO_EX },
  nadia: { name: 'Nadia', build: nadiaBuild, OUTFITS: NADIA_OUT, EXPRS: NADIA_EX },
  dimas: { name: 'Dimas', build: dimasBuild, OUTFITS: DIMAS_OUT, EXPRS: DIMAS_EX },
  sekar: { name: 'Sekar', build: sekarBuild, OUTFITS: SEKAR_OUT, EXPRS: SEKAR_EX },
  arga: { name: 'Arga', build: argaBuild, OUTFITS: ARGA_OUT, EXPRS: ARGA_EX },
  laras: { name: 'Laras', build: larasBuild, OUTFITS: LARAS_OUT, EXPRS: LARAS_EX },
  rizal: { name: 'Rizal', build: rizalBuild, OUTFITS: RIZAL_OUT, EXPRS: RIZAL_EX },
  uti: { name: 'Uti', build: utiBuild, OUTFITS: UTI_OUT, EXPRS: UTI_EX },
  tegar: { name: 'Tegar', build: tegarBuild, OUTFITS: TEGAR_OUT, EXPRS: TEGAR_EX },
  sasha: { name: 'Sasha', build: sashaBuild, OUTFITS: SASHA_OUT, EXPRS: SASHA_EX },
  kirana: { name: 'Kirana', build: kiranaBuild, OUTFITS: KIRANA_OUT, EXPRS: KIRANA_EX },
  jojo: { name: 'Jojo', build: jojoBuild, OUTFITS: JOJO_OUT, EXPRS: JOJO_EX },
  andra: { name: 'Andra', build: andraBuild, OUTFITS: ANDRA_OUT, EXPRS: ANDRA_EX },
  mei: { name: 'Mei', build: meiBuild, OUTFITS: MEI_OUT, EXPRS: MEI_EX },
  gilang: { name: 'Gilang', build: gilangBuild, OUTFITS: GILANG_OUT, EXPRS: GILANG_EX },
  bram: { name: 'Bram', build: bramBuild, OUTFITS: BRAM_OUT, EXPRS: BRAM_EX },
};

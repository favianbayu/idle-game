// Daftar tokoh voxel halus (1/64 petak). Tiap tokoh: build({ outfit, expr, helm }) -> data untuk voxelFrame.
import { buildParts as rakaBuild, OUTFITS as RAKA_OUT, EXPRS as RAKA_EX } from './model.js';
import { build as raniBuild, OUTFITS as RANI_OUT, EXPRS as RANI_EX } from './rani.js';
import { build as bimoBuild, OUTFITS as BIMO_OUT, EXPRS as BIMO_EX } from './bimo.js';
import { build as nadiaBuild, OUTFITS as NADIA_OUT, EXPRS as NADIA_EX } from './nadia.js';
import { build as dimasBuild, OUTFITS as DIMAS_OUT, EXPRS as DIMAS_EX } from './dimas.js';
import { build as bramBuild, OUTFITS as BRAM_OUT, EXPRS as BRAM_EX } from './bram.js';
export const CHARS = {
  raka: { name: 'Raka', build: rakaBuild, OUTFITS: RAKA_OUT, EXPRS: RAKA_EX },
  rani: { name: 'Rani', build: raniBuild, OUTFITS: RANI_OUT, EXPRS: RANI_EX },
  bimo: { name: 'Bimo', build: bimoBuild, OUTFITS: BIMO_OUT, EXPRS: BIMO_EX },
  nadia: { name: 'Nadia', build: nadiaBuild, OUTFITS: NADIA_OUT, EXPRS: NADIA_EX },
  dimas: { name: 'Dimas', build: dimasBuild, OUTFITS: DIMAS_OUT, EXPRS: DIMAS_EX },
  bram: { name: 'Bram', build: bramBuild, OUTFITS: BRAM_OUT, EXPRS: BRAM_EX },
};

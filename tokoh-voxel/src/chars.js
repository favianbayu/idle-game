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
import { build as wulanBuild, OUTFITS as WULAN_OUT, EXPRS as WULAN_EX } from './wulan.js';
import { build as dartoBuild, OUTFITS as DARTO_OUT, EXPRS as DARTO_EX } from './darto.js';
import { build as ciciBuild, OUTFITS as CICI_OUT, EXPRS as CICI_EX } from './cici.js';
import { build as fajarBuild, OUTFITS as FAJAR_OUT, EXPRS as FAJAR_EX } from './fajar.js';
import { build as kobarBuild, OUTFITS as KOBAR_OUT, EXPRS as KOBAR_EX } from './kobar.js';
import { build as jakaBuild, OUTFITS as JAKA_OUT, EXPRS as JAKA_EX } from './jaka.js';
import { build as nartiBuild, OUTFITS as NARTI_OUT, EXPRS as NARTI_EX } from './narti.js';
import { build as rtslametBuild, OUTFITS as RTSLAMET_OUT, EXPRS as RTSLAMET_EX } from './rtslamet.js';
import { build as harisBuild, OUTFITS as HARIS_OUT, EXPRS as HARIS_EX } from './haris.js';
import { build as gitoBuild, OUTFITS as GITO_OUT, EXPRS as GITO_EX } from './gito.js';
import { build as rioBuild, OUTFITS as RIO_OUT, EXPRS as RIO_EX } from './rio.js';
import { build as kevinBuild, OUTFITS as KEVIN_OUT, EXPRS as KEVIN_EX } from './kevin.js';
import { build as hartiniBuild, OUTFITS as HARTINI_OUT, EXPRS as HARTINI_EX } from './hartini.js';
import { build as ratnaBuild, OUTFITS as RATNA_OUT, EXPRS as RATNA_EX } from './ratna.js';
import { build as hendroBuild, OUTFITS as HENDRO_OUT, EXPRS as HENDRO_EX } from './hendro.js';
import { build as wawanBuild, OUTFITS as WAWAN_OUT, EXPRS as WAWAN_EX } from './wawan.js';
import { build as sintaBuild, OUTFITS as SINTA_OUT, EXPRS as SINTA_EX } from './sinta.js';
import { build as antonBuild, OUTFITS as ANTON_OUT, EXPRS as ANTON_EX } from './anton.js';
import { build as gunadiBuild, OUTFITS as GUNADI_OUT, EXPRS as GUNADI_EX } from './gunadi.js';
import { build as melatiBuild, OUTFITS as MELATI_OUT, EXPRS as MELATI_EX } from './melati.js';
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
  wulan: { name: 'Wulan', build: wulanBuild, OUTFITS: WULAN_OUT, EXPRS: WULAN_EX },
  omDarto: { name: 'Om Darto', build: dartoBuild, OUTFITS: DARTO_OUT, EXPRS: DARTO_EX },
  cici: { name: 'Cici', build: ciciBuild, OUTFITS: CICI_OUT, EXPRS: CICI_EX },
  fajar: { name: 'Mas Fajar', build: fajarBuild, OUTFITS: FAJAR_OUT, EXPRS: FAJAR_EX },
  kobar: { name: 'Kobar', build: kobarBuild, OUTFITS: KOBAR_OUT, EXPRS: KOBAR_EX },
  bangJaka: { name: 'Bang Jaka', build: jakaBuild, OUTFITS: JAKA_OUT, EXPRS: JAKA_EX },
  buNarti: { name: 'Bu Narti', build: nartiBuild, OUTFITS: NARTI_OUT, EXPRS: NARTI_EX },
  rtSlamet: { name: 'Pak RT Slamet', build: rtslametBuild, OUTFITS: RTSLAMET_OUT, EXPRS: RTSLAMET_EX },
  pakHaris: { name: 'Pak Haris', build: harisBuild, OUTFITS: HARIS_OUT, EXPRS: HARIS_EX },
  pakGito: { name: 'Pak Gito', build: gitoBuild, OUTFITS: GITO_OUT, EXPRS: GITO_EX },
  rio: { name: 'Rio', build: rioBuild, OUTFITS: RIO_OUT, EXPRS: RIO_EX },
  kevin: { name: 'Kevin', build: kevinBuild, OUTFITS: KEVIN_OUT, EXPRS: KEVIN_EX },
  buHartini: { name: 'Bu Hartini', build: hartiniBuild, OUTFITS: HARTINI_OUT, EXPRS: HARTINI_EX },
  buRatna: { name: 'Bu Ratna', build: ratnaBuild, OUTFITS: RATNA_OUT, EXPRS: RATNA_EX },
  pakHendro: { name: 'Pak Hendro', build: hendroBuild, OUTFITS: HENDRO_OUT, EXPRS: HENDRO_EX },
  pakWawan: { name: 'Pak Wawan', build: wawanBuild, OUTFITS: WAWAN_OUT, EXPRS: WAWAN_EX },
  buSinta: { name: 'Bu Sinta', build: sintaBuild, OUTFITS: SINTA_OUT, EXPRS: SINTA_EX },
  mrAnton: { name: 'Mr. Anton', build: antonBuild, OUTFITS: ANTON_OUT, EXPRS: ANTON_EX },
  pakGunadi: { name: 'Pak Gunadi', build: gunadiBuild, OUTFITS: GUNADI_OUT, EXPRS: GUNADI_EX },
  buMelati: { name: 'Bu Melati', build: melatiBuild, OUTFITS: MELATI_OUT, EXPRS: MELATI_EX },
  bram: { name: 'Bram', build: bramBuild, OUTFITS: BRAM_OUT, EXPRS: BRAM_EX },
};

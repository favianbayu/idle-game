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
import { build as ujangBuild, OUTFITS as UJANG_OUT, EXPRS as UJANG_EX } from './ujang.js';
import { build as iyahBuild, OUTFITS as IYAH_OUT, EXPRS as IYAH_EX } from './iyah.js';
import { build as amaBuild, OUTFITS as AMA_OUT, EXPRS as AMA_EX } from './ama.js';
import { build as kartoBuild, OUTFITS as KARTO_OUT, EXPRS as KARTO_EX } from './karto.js';
import { build as sumBuild, OUTFITS as SUM_OUT, EXPRS as SUM_EX } from './sum.js';
import { build as darminBuild, OUTFITS as DARMIN_OUT, EXPRS as DARMIN_EX } from './darmin.js';
import { build as riniBuild, OUTFITS as RINI_OUT, EXPRS as RINI_EX } from './rini.js';
import { build as jokoBuild, OUTFITS as JOKO_OUT, EXPRS as JOKO_EX } from './joko.js';
import { build as euisBuild, OUTFITS as EUIS_OUT, EXPRS as EUIS_EX } from './euis.js';
import { build as ahongBuild, OUTFITS as AHONG_OUT, EXPRS as AHONG_EX } from './ahong.js';
import { build as dodiBuild, OUTFITS as DODI_OUT, EXPRS as DODI_EX } from './dodi.js';
import { build as didiBuild, OUTFITS as DIDI_OUT, EXPRS as DIDI_EX } from './didi.js';
import { build as rizkiBuild, OUTFITS as RIZKI_OUT, EXPRS as RIZKI_EX } from './rizki.js';
import { build as hasanBuild, OUTFITS as HASAN_OUT, EXPRS as HASAN_EX } from './hasan.js';
import { build as bambangBuild, OUTFITS as BAMBANG_OUT, EXPRS as BAMBANG_EX } from './bambang.js';
import { build as veronikaBuild, OUTFITS as VERONIKA_OUT, EXPRS as VERONIKA_EX } from './veronika.js';
import { build as yuniBuild, OUTFITS as YUNI_OUT, EXPRS as YUNI_EX } from './yuni.js';
import { build as raffiBuild, OUTFITS as RAFFI_OUT, EXPRS as RAFFI_EX } from './raffi.js';
import { build as willemBuild, OUTFITS as WILLEM_OUT, EXPRS as WILLEM_EX } from './willem.js';
import { build as litaBuild, OUTFITS as LITA_OUT, EXPRS as LITA_EX } from './lita.js';
import { build as kurirBuild, OUTFITS as KURIR_OUT, EXPRS as KURIR_EX } from './kurir.js';
import { build as kevinkecilBuild, OUTFITS as KEVINKECIL_OUT, EXPRS as KEVINKECIL_EX } from './kevinkecil.js';
import { build as sugengBuild, OUTFITS as SUGENG_OUT, EXPRS as SUGENG_EX } from './sugeng.js';
import { build as baristaBuild, OUTFITS as BARISTA_OUT, EXPRS as BARISTA_EX } from './barista.js';
import { build as lastriBuild, OUTFITS as LASTRI_OUT, EXPRS as LASTRI_EX } from './lastri.js';
import { build as tarnoBuild, OUTFITS as TARNO_OUT, EXPRS as TARNO_EX } from './tarno.js';
import { build as dewiBuild, OUTFITS as DEWI_OUT, EXPRS as DEWI_EX } from './dewi.js';
import { build as dulBuild, OUTFITS as DUL_OUT, EXPRS as DUL_EX } from './dul.js';
import { build as hendrikBuild, OUTFITS as HENDRIK_OUT, EXPRS as HENDRIK_EX } from './hendrik.js';
import { build as watiBuild, OUTFITS as WATI_OUT, EXPRS as WATI_EX } from './wati.js';
import { build as ilhamBuild, OUTFITS as ILHAM_OUT, EXPRS as ILHAM_EX } from './ilham.js';
import { build as nanaBuild, OUTFITS as NANA_OUT, EXPRS as NANA_EX } from './nana.js';
import { build as darsonoBuild, OUTFITS as DARSONO_OUT, EXPRS as DARSONO_EX } from './darsono.js';
import { build as udinBuild, OUTFITS as UDIN_OUT, EXPRS as UDIN_EX } from './udin.js';
import { build as inahBuild, OUTFITS as INAH_OUT, EXPRS as INAH_EX } from './inah.js';
import { build as ucokBuild, OUTFITS as UCOK_OUT, EXPRS as UCOK_EX } from './ucok.js';
import { build as ijahBuild, OUTFITS as IJAH_OUT, EXPRS as IJAH_EX } from './ijah.js';
import { build as roniBuild, OUTFITS as RONI_OUT, EXPRS as RONI_EX } from './roni.js';
import { build as lilisBuild, OUTFITS as LILIS_OUT, EXPRS as LILIS_EX } from './lilis.js';
import { build as tejoBuild, OUTFITS as TEJO_OUT, EXPRS as TEJO_EX } from './tejo.js';
import { build as satpamudinBuild, OUTFITS as SATPAMUDIN_OUT, EXPRS as SATPAMUDIN_EX } from './satpamudin.js';
import { build as ningsihBuild, OUTFITS as NINGSIH_OUT, EXPRS as NINGSIH_EX } from './ningsih.js';
import { build as cilokBuild, OUTFITS as CILOK_OUT, EXPRS as CILOK_EX } from './cilok.js';
import { build as andiBuild, OUTFITS as ANDI_OUT, EXPRS as ANDI_EX } from './andi.js';
import { build as fitriBuild, OUTFITS as FITRI_OUT, EXPRS as FITRI_EX } from './fitri.js';
import { build as rinaBuild, OUTFITS as RINA_OUT, EXPRS as RINA_EX } from './rina.js';
import { build as bayuBuild, OUTFITS as BAYU_OUT, EXPRS as BAYU_EX } from './bayu.js';
import { build as mayaBuild, OUTFITS as MAYA_OUT, EXPRS as MAYA_EX } from './maya.js';
import { build as bejoBuild, OUTFITS as BEJO_OUT, EXPRS as BEJO_EX } from './bejo.js';
import { build as sutrisBuild, OUTFITS as SUTRIS_OUT, EXPRS as SUTRIS_EX } from './sutris.js';
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
  pakUjang: { name: 'Pak Ujang', build: ujangBuild, OUTFITS: UJANG_OUT, EXPRS: UJANG_EX },
  makIyah: { name: 'Mak Iyah', build: iyahBuild, OUTFITS: IYAH_OUT, EXPRS: IYAH_EX },
  ama: { name: 'Ama', build: amaBuild, OUTFITS: AMA_OUT, EXPRS: AMA_EX },
  mbahKarto: { name: 'Mbah Karto', build: kartoBuild, OUTFITS: KARTO_OUT, EXPRS: KARTO_EX },
  buSum: { name: 'Bu Sum', build: sumBuild, OUTFITS: SUM_OUT, EXPRS: SUM_EX },
  pakDarmin: { name: 'Pak Darmin', build: darminBuild, OUTFITS: DARMIN_OUT, EXPRS: DARMIN_EX },
  mbakRini: { name: 'Mbak Rini', build: riniBuild, OUTFITS: RINI_OUT, EXPRS: RINI_EX },
  pakJoko: { name: 'Pak Joko', build: jokoBuild, OUTFITS: JOKO_OUT, EXPRS: JOKO_EX },
  tehEuis: { name: 'Teh Euis', build: euisBuild, OUTFITS: EUIS_OUT, EXPRS: EUIS_EX },
  kohAhong: { name: 'Koh Ahong', build: ahongBuild, OUTFITS: AHONG_OUT, EXPRS: AHONG_EX },
  dodi: { name: 'Dodi', build: dodiBuild, OUTFITS: DODI_OUT, EXPRS: DODI_EX },
  didi: { name: 'Didi', build: didiBuild, OUTFITS: DIDI_OUT, EXPRS: DIDI_EX },
  udaRizki: { name: 'Uda Rizki', build: rizkiBuild, OUTFITS: RIZKI_OUT, EXPRS: RIZKI_EX },
  ustazHasan: { name: 'Ustaz Hasan', build: hasanBuild, OUTFITS: HASAN_OUT, EXPRS: HASAN_EX },
  satpamBambang: { name: 'Pak Satpam Bambang', build: bambangBuild, OUTFITS: BAMBANG_OUT, EXPRS: BAMBANG_EX },
  buVeronika: { name: 'Bu Veronika', build: veronikaBuild, OUTFITS: VERONIKA_OUT, EXPRS: VERONIKA_EX },
  mbakYuni: { name: 'Mbak Yuni', build: yuniBuild, OUTFITS: YUNI_OUT, EXPRS: YUNI_EX },
  kakRaffi: { name: 'Kak Raffi', build: raffiBuild, OUTFITS: RAFFI_OUT, EXPRS: RAFFI_EX },
  opaWillem: { name: 'Opa Willem', build: willemBuild, OUTFITS: WILLEM_OUT, EXPRS: WILLEM_EX },
  nyonyaLita: { name: 'Nyonya Lita', build: litaBuild, OUTFITS: LITA_OUT, EXPRS: LITA_EX },
  kurirBayu: { name: 'Kurir Bayu', build: kurirBuild, OUTFITS: KURIR_OUT, EXPRS: KURIR_EX },
  kevinKecil: { name: 'Kevin kecil', build: kevinkecilBuild, OUTFITS: KEVINKECIL_OUT, EXPRS: KEVINKECIL_EX },
  polisiSugeng: { name: 'Pak Polisi Sugeng', build: sugengBuild, OUTFITS: SUGENG_OUT, EXPRS: SUGENG_EX },
  masBarista: { name: 'Mas Barista Kevin', build: baristaBuild, OUTFITS: BARISTA_OUT, EXPRS: BARISTA_EX },
  buLastri: { name: 'Bu Lastri', build: lastriBuild, OUTFITS: LASTRI_OUT, EXPRS: LASTRI_EX },
  pakTarno: { name: 'Pak Tarno', build: tarnoBuild, OUTFITS: TARNO_OUT, EXPRS: TARNO_EX },
  mbakDewi: { name: 'Mbak SPG Dewi', build: dewiBuild, OUTFITS: DEWI_OUT, EXPRS: DEWI_EX },
  pengamenDul: { name: 'Pengamen Dul', build: dulBuild, OUTFITS: DUL_OUT, EXPRS: DUL_EX },
  omHendrik: { name: 'Om Hendrik', build: hendrikBuild, OUTFITS: HENDRIK_OUT, EXPRS: HENDRIK_EX },
  buWati: { name: 'Bu Wati', build: watiBuild, OUTFITS: WATI_OUT, EXPRS: WATI_EX },
  masIlham: { name: 'Mas Ilham', build: ilhamBuild, OUTFITS: ILHAM_OUT, EXPRS: ILHAM_EX },
  kakNana: { name: 'Kak Nana', build: nanaBuild, OUTFITS: NANA_OUT, EXPRS: NANA_EX },
  pakDarsono: { name: 'Pak Darsono', build: darsonoBuild, OUTFITS: DARSONO_OUT, EXPRS: DARSONO_EX },
  wakUdin: { name: 'Wak Udin', build: udinBuild, OUTFITS: UDIN_OUT, EXPRS: UDIN_EX },
  buInah: { name: 'Bu Inah', build: inahBuild, OUTFITS: INAH_OUT, EXPRS: INAH_EX },
  bangUcok: { name: 'Bang Ucok', build: ucokBuild, OUTFITS: UCOK_OUT, EXPRS: UCOK_EX },
  makIjah: { name: 'Mak Ijah', build: ijahBuild, OUTFITS: IJAH_OUT, EXPRS: IJAH_EX },
  pakRoni: { name: 'Pak Roni', build: roniBuild, OUTFITS: RONI_OUT, EXPRS: RONI_EX },
  tehLilis: { name: 'Teh Lilis', build: lilisBuild, OUTFITS: LILIS_OUT, EXPRS: LILIS_EX },
  masTejo: { name: 'Mas Tejo', build: tejoBuild, OUTFITS: TEJO_OUT, EXPRS: TEJO_EX },
  satpamUdin: { name: 'Pak Satpam Udin', build: satpamudinBuild, OUTFITS: SATPAMUDIN_OUT, EXPRS: SATPAMUDIN_EX },
  buNingsih: { name: 'Bu Kantin Ningsih', build: ningsihBuild, OUTFITS: NINGSIH_OUT, EXPRS: NINGSIH_EX },
  masCilok: { name: 'Mas Cilok', build: cilokBuild, OUTFITS: CILOK_OUT, EXPRS: CILOK_EX },
  siswaAndi: { name: 'Andi', build: andiBuild, OUTFITS: ANDI_OUT, EXPRS: ANDI_EX },
  siswiFitri: { name: 'Fitri', build: fitriBuild, OUTFITS: FITRI_OUT, EXPRS: FITRI_EX },
  siswiRina: { name: 'Rina', build: rinaBuild, OUTFITS: RINA_OUT, EXPRS: RINA_EX },
  siswaBayu: { name: 'Bayu "Si Telat"', build: bayuBuild, OUTFITS: BAYU_OUT, EXPRS: BAYU_EX },
  siswiMaya: { name: 'Maya', build: mayaBuild, OUTFITS: MAYA_OUT, EXPRS: MAYA_EX },
  stmBejo: { name: 'Bejo', build: bejoBuild, OUTFITS: BEJO_OUT, EXPRS: BEJO_EX },
  mandorSutris: { name: 'Mandor Sutris', build: sutrisBuild, OUTFITS: SUTRIS_OUT, EXPRS: SUTRIS_EX },
  bram: { name: 'Bram', build: bramBuild, OUTFITS: BRAM_OUT, EXPRS: BRAM_EX },
};

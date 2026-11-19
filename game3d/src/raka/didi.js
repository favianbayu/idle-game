// Didi: kembaran Dodi (lihat dodi.js): rambut jabrik, gigi depan ompong, plester di pipi, kaus biru, kaleng benang layangan.
import { kembar, SKEL as SK, FACES_DIDI, OUTFITS_DIDI } from './dodi.js';
export const SKEL = SK;
export const FACES = FACES_DIDI;
export const OUTFITS = OUTFITS_DIDI;
export const EXPRS = Object.keys(FACES_DIDI);
export const build = opt => kembar('didi', opt);

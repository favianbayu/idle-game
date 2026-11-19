// Gaya voxel untuk tokoh-tokoh game SMA "Lonceng Pulang".
// Format sama dengan objek STYLES di sprite-stacking/index.html (cabang claude/relaxed-ride-1e8tfb):
// tempel entri-entri ini ke STYLES, lalu ramp warnanya dibuat otomatis oleh loop setelahnya.
// Seragam SMA: kemeja putih #f4f4f0, bawahan abu-abu #7d828c, sepatu hitam.
const SMA = { top: '#f4f4f0', sleeves: 'short', bottom: '#7d828c', shoe: '#1c1c20', shoeStyle: 'shoe' };
const SMA_CW = { ...SMA, bottomStyle: 'skirt' };            // rok panjang abu-abu
const SMA_CO = { ...SMA, bottomStyle: 'pants' };
const SMA_HIJAB = { ...SMA_CW, sleeves: 'long' };           // seragam panjang untuk siswi berhijab

const NPC_STYLES = {
  // ---------- tokoh utama
  raka:      { name: 'Raka', scale: 1.3, skin: '#d9a27a', hair: '#24160e', hairStyle: 'short', ...SMA_CO },
  rani:      { name: 'Rani', scale: 1.24, skin: '#e8b48c', hair: '#2a1810', hairStyle: 'ponytail', ...SMA_CW },
  // ---------- keluarga & rumah
  omDarto:   { name: 'Om Darto', scale: 1.32, skin: '#c48a60', hair: '#2a2420', hairStyle: 'buzz', top: '#8a8272', sleeves: 'short', bottom: '#3a3a40', bottomStyle: 'pants', shoe: '#4a3a2a', shoeStyle: 'sandal', belly: 0.5 },
  cici:      { name: 'Cici', scale: 0.98, skin: '#d9a27a', hair: '#24160e', hairStyle: 'twintail', tie: '#f28ab4', top: '#f6f6f2', sleeves: 'short', bottom: '#c22a2a', bottomStyle: 'skirt', skirtShort: true, shoe: '#1a1a1a', shoeStyle: 'shoe' },
  buNarti:   { name: 'Bu Narti', scale: 1.24, skin: '#d9a07a', hijab: '#8a3a6a', hairStyle: 'hijab', top: '#e0705a', top2: '#f6d27a', topPattern: 'batik', sleeves: 'long', bottom: '#e0705a', bottom2: '#f6d27a', bottomStyle: 'skirt', bottomPattern: 'batik', shoe: '#3a7a4a', shoeStyle: 'sandal', belly: 0.4 },
  // ---------- sahabat
  bimo:      { name: 'Bimo', scale: 1.3, skin: '#c98e66', hair: '#1a1410', hairStyle: 'curly', ...SMA_CO, belly: 1.0 },
  tegar:     { name: 'Tegar', scale: 1.32, skin: '#f0c4a0', hair: '#141010', hairStyle: 'sidepart', glasses: true, ...SMA_CO },
  jojo:      { name: 'Jojo', scale: 1.3, skin: '#a8724e', hair: '#2a2018', hairStyle: 'mohawk', ...SMA_CO, top: '#f4f4f0', top2: '#3a6a5a', topPattern: 'stripe' },
  uti:       { name: 'Uti', scale: 1.24, skin: '#c99068', hair: '#1e1612', hairStyle: 'bob', ...SMA_CW, top: '#2a4a7a', top2: '#e8e8e8', topPattern: 'stripe', sleeves: 'long', shoe: '#e8e8e8' },
  fajar:     { name: 'Mas Fajar', scale: 1.34, skin: '#b8805a', hair: '#1a1410', hairStyle: 'spiky', top: '#4a5a6a', top2: '#2a2a2a', topPattern: 'stripe', sleeves: 'short', bottom: '#2a3a5a', bottomStyle: 'pants', shoe: '#2a2a2a', shoeStyle: 'sandal' },
  // ---------- romance (pemain cowok)
  nadia:     { name: 'Nadia', scale: 1.24, skin: '#eec09c', hijab: '#d8e2ea', hairStyle: 'hijab', ...SMA_HIJAB },
  sekar:     { name: 'Sekar', scale: 1.22, skin: '#f0c8a8', hair: '#1e1418', hairStyle: 'twintail', tie: '#8a5ad0', ...SMA_CW, top: '#5a7aa8', sleeves: 'long' },
  laras:     { name: 'Laras', scale: 1.23, skin: '#c48a60', hair: '#24160e', hairStyle: 'ponytail', ...SMA_CW },
  // ---------- romance (pemain cewek)
  dimas:     { name: 'Dimas', scale: 1.38, skin: '#c98e66', hair: '#141010', hairStyle: 'short', ...SMA_CO, shoe: '#e8e8e8' },
  arga:      { name: 'Arga', scale: 1.34, skin: '#b07a52', hair: '#141010', hairStyle: 'buzz', ...SMA_CO, top: '#2a2a2e', sleeves: 'long' },
  rizal:     { name: 'Rizal', scale: 1.32, skin: '#e8b890', hair: '#2a1a12', hairStyle: 'sidepart', glasses: true, ...SMA_CO, top: '#7a2a3a', sleeves: 'long' },
  // ---------- rival & antagonis
  bram:      { name: 'Bram', scale: 1.38, skin: '#f0c8a8', hair: '#0e0a08', hairStyle: 'sidepart', ...SMA_CO, shoe: '#5a2a1a' },
  rio:       { name: 'Rio', scale: 1.32, skin: '#e0b088', hair: '#6a4024', hairStyle: 'spiky', ...SMA_CO },
  kevin:     { name: 'Kevin', scale: 1.34, skin: '#f0c4a0', hair: '#141010', hairStyle: 'cap', cap: '#1e1e22', ...SMA_CO },
  sasha:     { name: 'Sasha', scale: 1.24, skin: '#f2cdb0', hair: '#5a3020', hairStyle: 'long', ...SMA_CW, skirtShort: true },
  pakHaris:  { name: 'Pak Haris', scale: 1.34, skin: '#e8b890', hair: '#8a8a88', hairStyle: 'sidepart', top: '#24242e', sleeves: 'long', bottom: '#24242e', bottomStyle: 'pants', shoe: '#140c08', shoeStyle: 'shoe', belly: 0.5 },
  kobar:     { name: 'Kobar', scale: 1.36, skin: '#a86c48', hair: '#c23a2a', hairStyle: 'mohawk', top: '#3a5a8a', top2: '#1e2a40', topPattern: 'stripe', sleeves: 'short', bottom: '#222226', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  pakGito:   { name: 'Pak Gito', scale: 1.3, skin: '#c48a60', hair: '#1a1410', hairStyle: 'bald', glasses: true, top: '#6a4a2a', top2: '#e8c070', topPattern: 'batik', sleeves: 'short', bottom: '#2a2a30', bottomStyle: 'pants', shoe: '#140c08', shoeStyle: 'shoe', belly: 1.0 },
  // ---------- klub motor
  bangJaka:  { name: 'Bang Jaka', scale: 1.38, skin: '#a8724e', hair: '#141010', hairStyle: 'long', top: '#5a3a24', sleeves: 'long', bottom: '#2a3a5a', bottomStyle: 'pants', shoe: '#2a1a10', shoeStyle: 'shoe' },
  // ---------- guru & staf
  buHartini: { name: 'Bu Hartini', scale: 1.26, skin: '#d9a07a', hijab: '#2a4a7a', hairStyle: 'hijab', top: '#c8a060', top2: '#5a3a1a', topPattern: 'batik', sleeves: 'long', bottom: '#2a2a30', bottomStyle: 'skirt', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  buRatna:   { name: 'Bu Ratna', scale: 1.26, skin: '#e8b890', hair: '#2a1a12', hairStyle: 'bun', glasses: true, top: '#8a3a4a', sleeves: 'long', bottom: '#2a2a30', bottomStyle: 'skirt', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  pakHendro: { name: 'Pak Hendro', scale: 1.36, skin: '#b07a52', hair: '#1a1410', hairStyle: 'buzz', top: '#d23a3a', top2: '#f2f2f2', topPattern: 'stripe', sleeves: 'short', bottom: '#1a2a6a', bottomStyle: 'pants', shoe: '#f2f2f2', shoeStyle: 'shoe' },
  pakWawan:  { name: 'Pak Wawan', scale: 1.3, skin: '#c98e66', hair: '#1a1410', hairStyle: 'sidepart', top: '#c8b88a', sleeves: 'long', bottom: '#5a4a3a', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe', belly: 0.7 },
  buSinta:   { name: 'Bu Sinta', scale: 1.24, skin: '#e8b48c', hijab: '#d07a3a', hairStyle: 'hijab', top: '#f0d8a0', sleeves: 'long', bottom: '#5a3a2a', bottomStyle: 'skirt', shoe: '#3a2a1a', shoeStyle: 'shoe' },
  mrAnton:   { name: 'Mr. Anton', scale: 1.34, skin: '#d9a27a', hair: '#24160e', hairStyle: 'short', top: '#5a8ac0', sleeves: 'long', bottom: '#3a3a40', bottomStyle: 'pants', shoe: '#5a3a2a', shoeStyle: 'shoe' },
  pakGunadi: { name: 'Pak Gunadi', scale: 1.28, skin: '#e0b088', hair: '#c8c4bc', hairStyle: 'bald', glasses: true, top: '#f6f6f6', sleeves: 'long', bottom: '#5a5a60', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  buMelati:  { name: 'Bu Melati', scale: 1.25, skin: '#d9a07a', hair: '#1e1410', hairStyle: 'long', top: '#c25a8a', top2: '#f2d27a', topPattern: 'batik', sleeves: 'short', bottom: '#3a2a4a', bottom2: '#c25a8a', bottomStyle: 'skirt', bottomPattern: 'batik', shoe: '#3a2a1a', shoeStyle: 'sandal' },
  pakUjang:  { name: 'Pak Ujang', scale: 1.24, skin: '#b07a52', hair: '#d8d4cc', hairStyle: 'peci', top: '#6a7a5a', sleeves: 'long', bottom: '#4a4a40', bottomStyle: 'pants', shoe: '#2a2a2a', shoeStyle: 'sandal' },
  makIyah:   { name: 'Mak Iyah', scale: 1.2, skin: '#b8805a', hijab: '#6a8a4a', hairStyle: 'hijab', top: '#e0b060', top2: '#7a4a2a', topPattern: 'batik', sleeves: 'long', bottom: '#7a4a2a', bottom2: '#e0b060', bottomStyle: 'sarung', bottomPattern: 'batik', shoe: '#3a2a1a', shoeStyle: 'sandal', belly: 0.6 },
};
if (typeof module !== 'undefined') module.exports = { NPC_STYLES };

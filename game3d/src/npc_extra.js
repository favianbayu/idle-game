// Gaya voxel tambahan: tokoh romance yang belum ada di npc_styles.js (dari guide 15, 16, 26, 27) dan NPC pengisi (guide 31).
const SMA = { top: '#f4f4f0', sleeves: 'short', bottom: '#7d828c', shoe: '#1c1c20', shoeStyle: 'shoe' };
export const EXTRA_STYLES = {
  kirana:   { name: 'Kirana', scale: 1.26, skin: '#d9a070', hair: '#141010', hairStyle: 'long', top: '#2a9a9a', top2: '#1e1e22', topPattern: 'stripe', sleeves: 'long', bottom: '#2a2a30', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  mei:      { name: 'Mei', scale: 1.18, skin: '#f0cfa8', hair: '#141010', hairStyle: 'bob', glasses: true, top: '#e8d8b0', top2: '#c86a3a', topPattern: 'stripe', sleeves: 'short', bottom: '#4a5a7a', bottomStyle: 'skirt', shoe: '#3a2a2a', shoeStyle: 'shoe' },
  andra:    { name: 'Andra', scale: 1.32, skin: '#b07a52', hair: '#1a1410', hairStyle: 'curly', top: '#e8e2d4', top2: '#3a8ac0', topPattern: 'stripe', sleeves: 'short', bottom: '#4a5a6a', bottomStyle: 'pants', shoe: '#c83a3a', shoeStyle: 'shoe' },
  gilang:   { name: 'Gilang', scale: 1.34, skin: '#8a5a3a', hair: '#141010', hairStyle: 'cap', cap: '#c84a3a', top: '#f2f2ee', sleeves: 'short', bottom: '#3a4a5a', bottomStyle: 'shorts', shoe: '#2a2a2a', shoeStyle: 'sandal' },
  satpam:   { name: 'Satpam', scale: 1.3, skin: '#c48a60', hair: '#1a1410', hairStyle: 'cap', cap: '#1e2a4a', top: '#f2f2ee', top2: '#1e2a4a', topPattern: 'stripe', sleeves: 'short', bottom: '#1e2a4a', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  polisi:   { name: 'Polisi', scale: 1.32, skin: '#c48a60', hair: '#1a1410', hairStyle: 'cap', cap: '#3a3020', top: '#8a7a5a', sleeves: 'short', bottom: '#5a4a3a', bottomStyle: 'pants', shoe: '#1a1a1a', shoeStyle: 'shoe' },
  mandor:   { name: 'Mandor', scale: 1.32, skin: '#b07a52', hairStyle: 'helmet', helmet: '#f2c230', top: '#f28a2a', top2: '#e8e8e8', topPattern: 'stripe', sleeves: 'long', bottom: '#3a4a6a', bottomStyle: 'pants', shoe: '#5a3a2a', shoeStyle: 'shoe' },
  siswiA:   { name: 'Fitri', scale: 1.2, skin: '#e8b48c', hijab: '#f4f4f0', hairStyle: 'hijab', ...SMA, sleeves: 'long', bottomStyle: 'skirt' },
  siswiB:   { name: 'Rina', scale: 1.2, skin: '#f0c4a0', hair: '#2a1810', hairStyle: 'ponytail', ...SMA, bottomStyle: 'skirt' },
  siswaA:   { name: 'Andi', scale: 1.26, skin: '#e0b090', hair: '#1a1410', hairStyle: 'sidepart', glasses: true, ...SMA, bottomStyle: 'pants' },
  siswaB:   { name: 'Bayu', scale: 1.28, skin: '#c98e66', hair: '#1a1410', hairStyle: 'spiky', ...SMA, bottomStyle: 'pants' },
  paskibra: { name: 'Maya', scale: 1.22, skin: '#d9a27a', hair: '#141010', hairStyle: 'bun', ...SMA, bottomStyle: 'skirt' },
};

// Ekspresi & baju Raka otomatis dari nama gerakan game (ANIMS di voxlib.js).
const HIT = new Set(['jab', 'straight', 'hook', 'uppercut', 'kickFront', 'kickHigh', 'slashV', 'slashH', 'thrust', 'spin', 'sweepKick', 'spinKick', 'throwShoulder', 'bagPunch', 'shoot', 'kickBall']);
const FIGHT = new Set(['guard', 'block', 'backstep', 'roll', 'armlock', 'cast', 'rideSport', 'motoLean', 'sprint', 'push', 'climb', 'fishPull']);
const PAIN = new Set(['hurt', 'fall', 'getUp', 'getup', 'grabbed', 'dizzy', 'panic', 'cower']);
const HAPPY = new Set(['taunt', 'wave', 'dance', 'clap', 'cheer', 'fishShow', 'catch', 'raiseHand']);
export function exprFor(anim, i, n) {
  if (PAIN.has(anim)) return 'sakit';
  if (HIT.has(anim)) { const t = i / Math.max(1, n - 1); return t > 0.3 && t < 0.72 ? 'teriak' : 'marah'; }
  if (FIGHT.has(anim)) return 'marah';
  if (HAPPY.has(anim)) return 'nyengir';
  if (anim === 'laugh') return 'ketawa';
  if (anim === 'lie') return 'kedip';
  if (anim === 'idle' && i === 5) return 'kedip';
  return 'biasa';
}
// helm saat naik motor (bukan sepeda)
export const helmFor = anim => anim === 'rideMotor' || anim === 'rideScooter' || anim === 'rideSport' || anim === 'rideTrail' || anim === 'passenger' || anim === 'motoLean';

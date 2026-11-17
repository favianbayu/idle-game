// Gerakan Raka. Format sama dengan ANIMS di game (n frame, fps, pose(t)); gerakan lama dari voxlib tetap bisa dipakai.
import { ANIMS as OLD } from './voxlib.js';
import { POSE0 } from './rig.js';
const TAU = Math.PI * 2, sinT = t => Math.sin(t * TAU), cosT = t => Math.cos(t * TAU);
function keyed(keys) {
  let acc = Object.assign({}, POSE0);
  const full = keys.map(([t, p]) => [t, acc = Object.assign({}, acc, p)]);
  return t => {
    let i = 0;
    while (i < full.length - 2 && t > full[i + 1][0]) i++;
    const [t0, a] = full[i], [t1, b] = full[i + 1];
    let u = Math.max(0, Math.min(1, (t - t0) / (t1 - t0 || 1)));
    u = u * u * (3 - 2 * u);
    const o = {};
    for (const k in a) o[k] = a[k] + (b[k] - a[k]) * u;
    return o;
  };
}
// kuda-kuda: kaki depan-belakang terbuka, lutut turun, kepalan di depan dagu, badan menyerong
const GUARD = { arL: 1.0, elL: 1.75, arR: 0.85, elR: 1.95, spL: 0.3, spR: 0.35, thL: 0.42, thR: -0.34, knL: 0.45, knR: 0.4, lgL: 0.1, lgR: 0.16, lean: 0.16, hp: -0.1, tw: 0.38, hy: -0.3, ftR: 0.25 };
const MINE = {
  stand: { name: 'Berdiri (netral)', n: 1, fps: 1, loop: true, pose: t => ({ lean: 0, arL: 0.03, arR: 0.03, elL: 0.12, elR: 0.12, spL: 0.1, spR: 0.1, knL: 0, knR: 0 }) },
  idle: { name: 'Diam (santai, berat di satu kaki)', n: 8, fps: 4, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: -0.02 + 0.012 * s, sy: 0.55, thL: -0.02, thR: 0.1, knL: 0.04, knR: 0.22, lgL: 0.02, lgR: 0.12, arL: 0.04, arR: 0.1, elL: 0.3 + 0.04 * s, elR: 0.4 + 0.04 * s, spL: 0.16 + 0.02 * s, spR: 0.2 + 0.02 * s,
             hp: -0.05 + 0.02 * s, hy: 0.08 * c, hr: 0.07, tw: 0.06, bob: 0.25 * s }; } },
  walk: { name: 'Jalan (gaya petantang-petenteng)', n: 8, fps: 9, stride: 34, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.04, hp: -0.06, sy: 0.45 * c, tw: 0.2 * s, hr: 0.05 * c,
             thL: 0.46 * s, thR: -0.46 * s, knL: 0.12 + 0.8 * Math.max(0, c) ** 1.5, knR: 0.12 + 0.8 * Math.max(0, -c) ** 1.5,
             ftL: -0.25 * Math.max(0, s) + 0.35 * Math.max(0, -s), ftR: -0.25 * Math.max(0, -s) + 0.35 * Math.max(0, s),
             arL: 0.04 - 0.42 * s, arR: 0.04 + 0.42 * s, elL: 0.3 + 0.3 * Math.max(0, -s), elR: 0.3 + 0.3 * Math.max(0, s), spL: 0.24, spR: 0.24,
             tail: 0.08 + 0.06 * Math.abs(c), bob: 0.5 * Math.abs(s) }; } },
  run: { name: 'Lari', n: 8, fps: 13, stride: 62, loop: true, pose: t => { const s = sinT(t), c = cosT(t);
    return { lean: 0.34, hp: -0.26, tw: 0.26 * s, sy: 0.2 * c,
             thL: 0.2 + 0.95 * s, thR: 0.2 - 0.95 * s, knL: 0.3 + 1.6 * Math.max(0, c), knR: 0.3 + 1.6 * Math.max(0, -c),
             ftL: 0.5 * Math.max(0, -s), ftR: 0.5 * Math.max(0, s),
             arL: 0.25 - 1.0 * s, arR: 0.25 + 1.0 * s, elL: 1.55 + 0.25 * s, elR: 1.55 - 0.25 * s, spL: 0.22, spR: 0.22, jump: 1.0 * Math.abs(s) ** 1.5, tail: 0.5 + 0.15 * c }; } },
  guard: { name: 'Kuda-kuda', n: 6, fps: 8, loop: true, pose: t => { const s = sinT(t);
    return { ...GUARD, knL: 0.45 + 0.1 * s, knR: 0.4 + 0.1 * s, elL: 1.75 + 0.06 * s, elR: 1.95 - 0.06 * s, bob: 0.4 * s, tail: 0.05 }; } },
  jab: { name: 'Jab', n: 6, fps: 16, pose: keyed([[0, GUARD], [0.4, { arL: 1.5, elL: 0.08, spL: 0.05, tw: 0.75, lean: 0.24, thL: 0.55, hy: -0.6 }], [0.6, {}], [1, GUARD]]) },
  straight: { name: 'Pukulan lurus', n: 8, fps: 15, pose: keyed([[0, GUARD], [0.25, { tw: 0.6, arR: 0.5, elR: 2.15 }],
    [0.5, { tw: -0.6, arR: 1.52, elR: 0.05, spR: 0.02, lean: 0.3, hy: 0.45, thL: 0.6, knL: 0.6, arL: 0.7, elL: 2.1, tail: 0.3 }], [0.7, {}], [1, GUARD]]) },
  hook: { name: 'Hook', n: 8, fps: 15, pose: keyed([[0, GUARD], [0.3, { tw: 0.75, arR: 1.3, elR: 1.5, spR: 1.2, lean: 0.1 }],
    [0.55, { tw: -0.85, arR: 1.5, elR: 1.55, spR: 0.25, lean: 0.2, hy: 0.6, tail: 0.3 }], [0.7, {}], [1, GUARD]]) },
  uppercut: { name: 'Uppercut', n: 8, fps: 14, pose: keyed([[0, GUARD], [0.3, { arR: 0.0, elR: 2.2, thL: 0.6, thR: 0.0, knL: 1.0, knR: 0.9, lean: 0.36, tw: 0.45, hp: -0.3 }],
    [0.55, { arR: 2.2, elR: 1.5, thL: 0.3, thR: -0.3, knL: 0.15, knR: 0.15, lean: -0.12, tw: -0.5, hp: 0.0, hy: 0.4, jump: 1.2, tail: -0.1 }], [0.75, { jump: 0 }], [1, GUARD]]) },
  kickFront: { name: 'Tendangan depan', n: 8, fps: 12, pose: keyed([[0, GUARD], [0.3, { thR: 1.3, knR: 2.0, thL: 0, knL: 0.2, lean: -0.1, tw: 0 }],
    [0.5, { thR: 1.55, knR: 0.05, ftR: -0.3, lean: -0.32, hp: 0.25, arL: 0.6, elL: 1.3, arR: -0.5, elR: 0.6, spR: 0.4 }], [0.7, { thR: 1.3, knR: 2.0, lean: -0.1 }], [1, GUARD]]) },
  kickHigh: { name: 'Tendangan tinggi', n: 8, fps: 12, pose: keyed([[0, GUARD], [0.3, { thR: 1.6, knR: 2.2, thL: 0, knL: 0.15, lean: -0.2, tw: 0 }],
    [0.5, { thR: 2.35, knR: 0.08, ftR: -0.4, lean: -0.55, hp: 0.4, arL: 0.4, elL: 1.1, arR: -0.6, elR: 0.5, spR: 0.5, spL: 0.5 }], [0.7, { thR: 1.6, knR: 2.2, lean: -0.2 }], [1, GUARD]]) },
  taunt: { name: 'Provokasi "Sini lu!"', n: 10, fps: 10, loop: true, pose: t => { const s = sinT(t * 2);
    return { lean: -0.1, hp: -0.2, hr: -0.12, hy: 0.1, sy: -0.3, thL: 0.22, thR: -0.15, knL: 0.12, knR: 0.12, lgL: 0.12, lgR: 0.12, arR: 1.35, spR: 0.25, elR: 0.75 + 0.8 * Math.max(0, s), arL: -0.1, elL: 0.5, spL: 0.45 }; } },
  hairFix: { name: 'Sisir rambut pakai jari', n: 10, fps: 8, pose: keyed([[0, {}], [0.3, { arR: 2.5, elR: 0.8, spR: -0.25, hp: -0.12, hr: 0.08 }], [0.65, { arR: 2.95, elR: 0.5, spR: -0.3, hp: -0.2, tail: 0.15 }], [1, {}]]) },
  squat: { name: 'Nongkrong jongkok', n: 4, fps: 3, loop: true, pose: t => ({ lean: 0.35 + 0.02 * sinT(t), hp: -0.3, thL: 1.9, thR: 1.9, knL: 2.6, knR: 2.6, lgL: 0.35, lgR: 0.35, ftL: 0.1, ftR: 0.1, arL: 1.1, arR: 1.1, elL: 0.35, elR: 0.35, spL: 0.3, spR: 0.3, hy: 0.2 * sinT(t) }) },
  hurt: { name: 'Kena pukul', n: 6, fps: 12, pose: keyed([[0, GUARD], [0.35, { lean: -0.4, hp: -0.35, hy: 0.5, tw: -0.4, arL: 0.2, elL: 1.0, arR: -0.3, elR: 0.8, spL: 0.6, spR: 0.6, thL: 0.5, thR: -0.1, knL: 0.3, px: -1.5, tail: -0.2 }], [0.7, {}], [1, GUARD]]) },
  rideSport: { name: 'Naik motor (balap)', n: 4, fps: 6, loop: true, pose: t => ({ lean: 0.62, hp: -0.5 + 0.02 * sinT(t), thL: 1.25, thR: 1.25, knL: 2.05, knR: 2.05, lgL: 0.2, lgR: 0.2, ftL: 0.45, ftR: 0.45, arL: 1.0, arR: 1.0, elL: 0.35, elR: 0.35, spL: 0.08, spR: 0.08, tail: 0.75 + 0.1 * sinT(t), bob: 0.15 * sinT(t) }) },
};
export const ANIMS = { ...OLD, ...MINE };
export const ANIM_LIST = ['stand', 'idle', 'walk', 'run', 'sprint', 'guard', 'jab', 'straight', 'hook', 'uppercut', 'kickFront', 'kickHigh', 'hurt', 'taunt', 'hairFix', 'squat',
  'rideSport', 'wave', 'talk', 'laugh', 'dance', 'scratch', 'think', 'clap', 'sit', 'jump', 'fall', 'getup', 'bow', 'raiseHand', 'salute', 'crouch', 'climb', 'push'];
// ekspresi otomatis mengikuti gerakan
const FIGHT = new Set(['guard', 'jab', 'straight', 'hook', 'uppercut', 'kickFront', 'kickHigh', 'rideSport', 'motoLean', 'sprint', 'push', 'climb']);
export function exprFor(anim, i, n) {
  if (anim === 'hurt' || anim === 'fall' || anim === 'getup') return 'sakit';
  if (FIGHT.has(anim)) { const t = i / Math.max(1, n - 1); return ['jab', 'straight', 'hook', 'uppercut', 'kickFront', 'kickHigh'].includes(anim) && t > 0.3 && t < 0.72 ? 'teriak' : 'marah'; }
  if (anim === 'taunt' || anim === 'wave' || anim === 'dance' || anim === 'clap') return 'nyengir';
  if (anim === 'laugh') return 'ketawa';
  if (anim === 'idle' && i === 5) return 'kedip';
  return 'biasa';
}

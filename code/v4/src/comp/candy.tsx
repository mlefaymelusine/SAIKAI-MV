// W3 (user 10-24: keep the candy, change how it is shown): dragon's beard candy made the way it is really made, a
// loop of sugar stretched, twisted into an 8 and folded over on itself, so one loop becomes two, four, sixteen ...
// tens of thousands of fine strands (Araya, S949A: 从最初的一条线变成两条，又变成四条，再变成十六条…… 而那最后会变成数万根细丝).
// It starts as the red thread, a loop whose two ends touch, and goes white as it multiplies; one strand stays red.
import React from 'react';
import {C} from '../theme';
import {clamp, lerp, rng, smooth} from '../util';

export const A0 = 300, B0 = 180;               // the loop at rest
const NP = 200;                                // points round one loop
const TAU = Math.PI * 2;
const thick = (n: number) => Math.min(64, 4 + 9 * Math.log2(n + 1));
const off = (j: number, n: number) => (n > 1 ? (j / (n - 1) - 0.5) * thick(n) : 0) + (n > 8 ? (rng(j * 31 + n)() - 0.5) * thick(n) / n * 3 : 0);
const RED = [214, 40, 56], SILK = [246, 240, 228];
const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;

/** n loops at rest */
const rest = (n: number, wob: number) => Array.from({length: n}, (_, j) => {
  const d = off(j, n);
  const pts: [number, number][] = [];
  for (let i = 0; i <= NP; i++) {
    const s = (i / NP) * TAU;
    const w = 1 + 0.012 * Math.sin(3 * s + j + wob);
    pts.push([(A0 + d) * w * Math.cos(s), (B0 + d) * w * Math.sin(s)]);
  }
  return {pts, j};
});

/** one fold: n loops -> 2n. u: 0..1 through stretch, twist into an 8, fold the right lobe over, open out again */
const fold = (n: number, u: number) => {
  const st = smooth(0, 0.3, u), tw = smooth(0.22, 0.55, u), fo = smooth(0.5, 0.82, u), ex = smooth(0.8, 1, u);
  const A = A0 * (1 + 0.5 * st), B = B0 * (1 - 0.42 * st);
  const xc = 0.125 * A, psi = Math.PI * fo;
  const cxl = lerp(0, -0.42 * A, fo), hw = lerp(A, 0.57 * A, fo);           // the lobe the fold leaves
  return Array.from({length: n}, (_, j) => {
    const d = off(j, n);
    const pts: [number, number][] = [];
    for (let i = 0; i <= NP * 2; i++) {
      const s = (i / (NP * 2)) * TAU;
      const x0 = (A + d) * Math.cos(s), y0 = (B + d) * Math.sin(s);
      const w = smooth(-0.1 * A, 0.35 * A, x0);
      let x = x0, y = y0 * Math.cos(Math.PI * tw * w);
      const right = x0 > xc;
      if (right) { x = xc + (x0 - xc) * Math.cos(psi); y *= 1 + 0.14 * Math.sin(psi); }
      if (ex > 0) {
        // open the doubled lobe back out to the loop at rest, each half onto its own strand
        const a = Math.atan2(y / B, (x - cxl) / hw);
        const dn = off(2 * j + (right ? 1 : 0), 2 * n);
        const tx = (A0 + dn) * Math.cos(a), ty = (B0 + dn) * Math.sin(a);
        x = lerp(x, tx, ex); y = lerp(y, ty, ex);
      }
      pts.push([x, y]);
    }
    return {pts, j};
  });
};

const pathOf = (pts: [number, number][], draw = 1) => {
  const m = Math.max(2, Math.round(pts.length * draw));
  let d = '';
  for (let i = 0; i < m; i++) d += `${i ? 'L' : 'M'}${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} `;
  return d;
};

export type Fold = {at: number; dur: number};
/** the loop at time t. folds: when each fold happens; draw: the first loop drawn on; cut: 0..1 the loop is cut
 *  into pieces (they are taken over by the candies outside) */
export const SugarLoop: React.FC<{t: number; folds: Fold[]; draw: number; wob: number; fade?: number}> = ({t, folds, draw, wob, fade = 1}) => {
  let n = 1, cur: {pts: [number, number][]; j: number}[] | null = null;
  for (const f of folds) {
    if (t >= f.at + f.dur) { n *= 2; continue; }
    if (t >= f.at) cur = fold(n, (t - f.at) / f.dur);
    break;
  }
  const strands = cur ?? rest(n, wob);
  const nn = cur ? n * 2 : n;
  const silk = clamp(Math.log2(nn) / 4);
  const w = Math.max(0.55, 3.2 / Math.pow(nn, 0.42));
  return (
    <g opacity={fade}>
      {nn >= 16 && <g filter="url(#silkglow)">{strands.filter((_, i) => i % 3 === 0).map((s) => <path key={`g${s.j}`} d={pathOf(s.pts)} stroke={mix(RED, SILK, 1)} strokeWidth={w * 3} fill="none" opacity={0.25} />)}</g>}
      {strands.map((s) => (
        <path key={s.j} d={pathOf(s.pts, draw)} stroke={s.j === 0 ? C.redLine : mix(RED, SILK, silk)} strokeWidth={s.j === 0 ? Math.max(1.4, w * 1.4) : w} fill="none" opacity={s.j === 0 ? 1 : lerp(1, 0.75, silk)} strokeLinejoin="round" />
      ))}
    </g>
  );
};

/** the defs SugarLoop uses (put once inside the svg) */
export const SugarDefs: React.FC = () => (
  <defs>
    <filter id="silkglow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
  </defs>
);

/** a cocoon of dragon's beard candy, fine white strands round a filling; mark: the red thread round the three more */
export const Cocoon: React.FC<{mark?: boolean; seed?: number}> = ({mark, seed = 1}) => {
  const r = rng(seed * 17 + 3);
  return (
    <g>
      <ellipse rx={50} ry={34} fill="#f3eee3" opacity={0.35} filter="url(#silkglow)" />
      <ellipse rx={42} ry={28} fill="#f1ebdf" />
      {Array.from({length: 26}, (_, i) => {
        const y = (r() - 0.5) * 50, k = Math.sqrt(Math.max(0, 1 - (y / 28) ** 2)) * 42, b = (r() - 0.5) * 10;
        return <path key={i} d={`M${-k} ${y} Q0 ${y + b} ${k} ${y + (r() - 0.5) * 4}`} stroke="#d6ccb8" strokeWidth={0.7} fill="none" opacity={0.8} />;
      })}
      {Array.from({length: 34}, (_, i) => {
        const a = r() * TAU, l = 4 + r() * 9, c = Math.cos(a), sn = Math.sin(a);
        return <path key={`f${i}`} d={`M${c * 40} ${sn * 26} q${c * l + sn * 4} ${sn * l - c * 4} ${c * l * 1.7} ${sn * l * 1.5}`} stroke="#ece5d6" strokeWidth={0.6} fill="none" opacity={0.4 + r() * 0.4} />;
      })}
      {mark && <path d="M-7 -28 Q-3 0 -7 28 M6 -28 Q10 0 6 28" stroke={C.redLine} strokeWidth={2.4} fill="none" />}
    </g>
  );
};

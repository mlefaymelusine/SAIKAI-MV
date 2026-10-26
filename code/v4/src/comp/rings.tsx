// C1 (user 10-24: the sewn sword-cuts are out, redesign): the cut face of a tree, its growth rings laid down one a
// year from the heart outward. Each hurt cuts into the wood at the edge it has reached; the rings that come after
// roll over the wound and close it. The scars stay inside, but the rings go on round them: pain is in the past, it
// does not define it. From "we are built to overcome" the growing edge is the red thread.
import React from 'react';
import {C} from '../theme';
import {clamp, eio, eout, lerp, prog, rng} from '../util';

const N = 240;                                   // samples round a ring
const R0 = 10, G = 19;                           // the heart, the width of a year
const TAU = Math.PI * 2;
const R = rng(23);
const HARM = [2, 3, 4, 5, 6].map((i) => ({i, a: (0.5 + R()) / i, ph: R() * TAU}));
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const RAYS = Array.from({length: 28}, () => R() * TAU);       // faint rays from the heart

export type Scar = {at: number; th: number; k: number; d: number; w: number; heal?: number};

/** radius of the (continuous) ring kc at angle th, before any scar */
const base = (kc: number, th: number) => {
  let r = R0 + G * kc + 1.3 * kc * Math.cos(th - 0.6);
  for (const h of HARM) r += (0.9 + 0.55 * kc) * h.a * Math.sin(h.i * th + h.ph);
  return r + 0.7 * Math.sin(7 * th + kc * 1.3);
};

/** one ring as path data: broken where a cut runs through it or a wound is still open, bulging over a healed wound,
 *  with the lips of an open wound turned in */
const ring = (kc: number, scars: Scar[], t: number) => {
  const open = scars.filter((s) => t >= s.at).map((s) => ({...s, o: eout(clamp((t - s.at) / 0.35))}));
  const r = (th: number) => {
    let v = base(kc, th);
    for (const s of open) {
      const m = kc - s.k;
      if (m > 0) v += 0.42 * G * Math.exp(-(((m - 1.4) / 1.6) ** 2)) * Math.exp(-((wrap(th - s.th) / (s.w * 2.6)) ** 2)) * s.o;
    }
    return v;
  };
  const gapW = (th: number) => {
    let g = 0;
    for (const s of open) {
      const m = kc - s.k, dt = Math.abs(wrap(th - s.th));
      const w = m <= 0 ? (m >= -s.d ? s.w * (1 - 0.75 * (-m / s.d)) : 0) : s.w * Math.max(0, 1 - m / (s.heal ?? 2.6));
      if (dt < w * s.o) g = Math.max(g, 1);
    }
    return g;
  };
  let d = '', pen = false;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * TAU;
    const x = Math.cos(th) * r(th), y = Math.sin(th) * r(th);
    pts.push([x, y]);
    if (gapW(th)) { pen = false; continue; }
    d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
    pen = true;
  }
  // lips: where a wound is still closing, the new wood turns in along its edges
  for (const s of open) {
    const m = kc - s.k;
    if (m <= 0 || m >= (s.heal ?? 2.6)) continue;
    const w = s.w * (1 - m / (s.heal ?? 2.6)) * s.o;
    for (const sg of [-1, 1]) {
      const th = s.th + sg * w, rr = r(th), lip = G * 0.9 * (1 - m / (s.heal ?? 2.6));
      d += `M${(Math.cos(th) * rr).toFixed(1)} ${(Math.sin(th) * rr).toFixed(1)} Q${(Math.cos(th - sg * w * 0.5) * (rr - lip * 0.3)).toFixed(1)} ${(Math.sin(th - sg * w * 0.5) * (rr - lip * 0.3)).toFixed(1)} ${(Math.cos(th - sg * w * 0.4) * (rr - lip)).toFixed(1)} ${(Math.sin(th - sg * w * 0.4) * (rr - lip)).toFixed(1)} `;
    }
  }
  return d;
};

/** the dark of a cut: a narrow, ragged slit from the edge it reached in to its depth (it goes in as it opens) */
const wound = (s: Scar, t: number) => {
  const o = eout(clamp((t - s.at) / 0.35));
  if (o <= 0) return '';
  const n = 12, J = rng(Math.round(s.th * 1000) + 7);
  const jl = Array.from({length: n + 1}, () => J() - 0.5), jr = Array.from({length: n + 1}, () => J() - 0.5);
  const outer = base(s.k, s.th) + 2, inner = base(s.k - s.d * o, s.th) - 3;
  const side = (sg: number, j: number[]) => Array.from({length: n + 1}, (_, i) => {
    const f = i / n, rr = lerp(outer, inner, f);
    const th = s.th + 0.25 * s.w * Math.sin(f * Math.PI) + sg * (s.w * (1 - f) ** 0.8 * o + j[i] * s.w * 0.45 * (1 - f * 0.6));
    return `${(Math.cos(th) * rr).toFixed(1)} ${(Math.sin(th) * rr).toFixed(1)}`;
  });
  const L = side(-1, jl), Rt = side(1, jr).reverse();
  return `M${L.join(' L')} L${Rt.join(' L')} Z`;
};

/** the cut face. edge: how many years have grown (continuous); thread: 0..1 the red thread is drawn round the growing edge */
export const TreeRings: React.FC<{t: number; edge: number; scars: Scar[]; thread: number; slash?: {at: number; th: number}[]}> = ({t, edge, scars, thread, slash = []}) => {
  const rings: React.ReactNode[] = [], bands: React.ReactNode[] = [];
  for (let k = 1; k <= Math.floor(edge); k++) {
    const o = clamp((edge - k) / 0.6);
    bands.push(<path key={`b${k}`} d={ring(k - 0.18, scars, t)} stroke="#d3c19f" strokeWidth={G * 0.32} fill="none" opacity={0.55 * o} />);
    rings.push(<path key={k} d={ring(k, scars, t)} stroke={C.ink2} strokeWidth={1.3} fill="none" opacity={0.75 * o} vectorEffect="non-scaling-stroke" />);
    rings.push(<path key={`l${k}`} d={ring(k - 0.32, scars, t)} stroke={C.ink2} strokeWidth={0.8} fill="none" opacity={0.22 * o} vectorEffect="non-scaling-stroke" />);
  }
  const edgeD = ring(edge, scars, t);
  // the wood inside the edge (no gaps: the fill is the whole disc)
  let disc = '';
  for (let i = 0; i <= N; i++) { const th = (i / N) * TAU, rr = base(edge, th) + 3; disc += `${i ? 'L' : 'M'}${(Math.cos(th) * rr).toFixed(1)} ${(Math.sin(th) * rr).toFixed(1)} `; }
  return (
    <g>
      <path d={disc + 'Z'} fill="#e3d6bc" />
      {bands}
      {RAYS.map((th, i) => <path key={`r${i}`} d={`M${(Math.cos(th) * R0 * 2).toFixed(1)} ${(Math.sin(th) * R0 * 2).toFixed(1)} L${(Math.cos(th) * (base(edge, th) - 4)).toFixed(1)} ${(Math.sin(th) * (base(edge, th) - 4)).toFixed(1)}`} stroke="#c7b28c" strokeWidth={0.8} opacity={0.5} vectorEffect="non-scaling-stroke" />)}
      <circle r={R0 * 0.7} fill={C.ink2} opacity={0.6} />
      {rings}
      {scars.map((s, i) => <path key={`w${i}`} d={wound(s, t)} fill={C.ink2} stroke={C.ink} strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
      {/* the growing edge: bark, then the red thread */}
      <path d={edgeD} stroke={C.ink} strokeWidth={3.2} fill="none" opacity={1 - 0.8 * clamp(thread * 2 - 1)} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      {thread > 0 && <path d={edgeD} stroke={C.redLine} strokeWidth={9} fill="none" opacity={0.14} pathLength={1} strokeDasharray={`${thread} 1.0001`} vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
      {thread > 0 && <path d={edgeD} stroke={C.redLine} strokeWidth={2.8} fill="none" pathLength={1} strokeDasharray={`${thread} 1.0001`} vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
      {/* the moment of each hurt: a bright stroke across the edge */}
      {slash.map((s, i) => {
        const k = prog(t, s.at - 0.04, s.at + 0.12, eio), f = 1 - clamp((t - s.at - 0.12) / 0.4);
        if (k <= 0 || f <= 0) return null;
        const rr = base(edge, s.th), a = s.th + Math.PI / 2 + 0.35;
        const cx = Math.cos(s.th) * rr, cy = Math.sin(s.th) * rr, L = G * 6, wd = G * 0.16;
        const x0 = cx - Math.cos(a) * L, y0 = cy - Math.sin(a) * L, x1 = x0 + Math.cos(a) * 2 * L * k, y1 = y0 + Math.sin(a) * 2 * L * k;
        const nx = -Math.sin(a) * wd, ny = Math.cos(a) * wd, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        return <path key={`s${i}`} d={`M${x0} ${y0} Q${mx + nx} ${my + ny} ${x1} ${y1} Q${mx - nx * 0.4} ${my - ny * 0.4} ${x0} ${y0} Z`} fill={C.ink} opacity={f} />;
      })}
    </g>
  );
};


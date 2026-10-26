// Procedural line art: threads, the thread-flower, string figures, flames, waves, stars.
import React from 'react';
import {C} from '../theme';
import {H, W, clamp, eio, lerp, noise1, rng, smooth} from '../util';
import {Path, Svg, useShot} from './core';

/** wavy polyline between two points, animated by `ph` */
export function wavy(x1: number, y1: number, x2: number, y2: number, amp: number, waves: number, ph = 0, seed = 1, n = 64, sag = 0) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    const o = amp * env * (Math.sin(t * waves * Math.PI * 2 + ph) * 0.7 + noise1(t * 4 + ph * 0.3, seed) * 0.5);
    const x = x1 + dx * t + nx * o, y = y1 + dy * t + ny * o + sag * env;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}

/** a red thread that sways gently */
export const Thread: React.FC<{x1: number; y1: number; x2: number; y2: number; amp?: number; waves?: number; seed?: number; draw?: number; width?: number; color?: string; speed?: number; sag?: number; glow?: boolean; opacity?: number}> = ({x1, y1, x2, y2, amp = 30, waves = 1.2, seed = 1, draw = 1, width = 2.6, color = C.redLine, speed = 0.5, sag = 0, glow = true, opacity = 1}) => {
  const {abs} = useShot();
  return <Path d={wavy(x1, y1, x2, y2, amp, waves, abs * speed, seed, 72, sag)} draw={draw} width={width} color={color} glow={glow} opacity={opacity} />;
};

/* ---------- kawara-nadeshiko drawn in thread ---------- */
/** Five petals, each a narrow claw opening into a fan whose outer half is cut into thread-like fringe.
 *  grow 0..1 draws claws, then blades, then the fringe. */
export const ThreadFlower: React.FC<{cx: number; cy: number; r: number; grow: number; color?: string; rot?: number; fringe?: number; width?: number; seed?: number; sway?: number; fill?: number}> = ({cx, cy, r, grow, color = C.redLine, rot = 0, fringe = 15, width = 1.4, seed = 3, sway = 1, fill = 0.14}) => {
  const {abs} = useShot();
  const out: React.ReactNode[] = [];
  for (let p = 0; p < 5; p++) {
    const R = rng(seed * 31 + p);
    const a0 = rot + (p / 5) * Math.PI * 2 - Math.PI / 2 + Math.sin(abs * 0.5 * sway + p) * 0.01;
    const k = clamp(grow * 1.2 - p * 0.04);
    const kb = clamp(k / 0.45), kf = clamp((k - 0.35) / 0.65);
    const ux = Math.cos(a0), uy = Math.sin(a0), vx = -uy, vy = ux;
    const P = (u: number, v: number) => [cx + ux * u * r + vx * v * r, cy + uy * u * r + vy * v * r];
    const pt = (u: number, v: number) => { const q = P(u, v); return `${q[0].toFixed(1)} ${q[1].toFixed(1)}`; };
    // blade outline: claw -> fan; outer edge is a shallow arc
    const W2 = 0.33, U1 = 0.56;
    const blade = `M${pt(0.07, -0.025)} C${pt(0.25, -0.05)} ${pt(0.38, -W2 * 0.9)} ${pt(U1 - 0.02, -W2)} Q${pt(U1 + 0.06, 0)} ${pt(U1 - 0.02, W2)} C${pt(0.38, W2 * 0.9)} ${pt(0.25, 0.05)} ${pt(0.07, 0.025)} Z`;
    out.push(<path key={`b${p}`} d={blade} fill={color} opacity={fill * kb} />);
    out.push(<Path key={`bo${p}`} d={blade} color={color} width={width} draw={kb} glow={false} />);
    // vein
    out.push(<Path key={`v${p}`} d={`M${pt(0.08, 0)} Q${pt(0.3, 0.01)} ${pt(U1 - 0.04, 0)}`} color={color} width={width * 0.7} draw={kb} glow={false} opacity={0.6} />);
    // fringe: a comb of threads leaving the outer edge, splaying slightly, some forked
    for (let i = 0; i < fringe; i++) {
      const v = lerp(-W2 * 0.94, W2 * 0.94, i / (fringe - 1));
      const u0 = U1 + 0.06 * (1 - (v / W2) ** 2) - 0.02;
      const len = (0.30 + 0.16 * (1 - Math.abs(v / W2)) ) * (0.8 + R() * 0.35);
      const splay = v * 0.55 + (R() - 0.5) * 0.06 + Math.sin(abs * 0.9 * sway + i * 0.6 + p) * 0.012 * sway;
      const u1 = u0 + len * Math.cos(splay), v1 = v + len * Math.sin(splay) * 1.0;
      const um = u0 + len * 0.5, vm = v + len * 0.5 * Math.sin(splay) + (R() - 0.5) * 0.03;
      const di = clamp(kf * 1.25 - Math.abs(v) * 0.6);
      out.push(<Path key={`f${p}-${i}`} d={`M${pt(u0, v)} Q${pt(um, vm)} ${pt(u1, v1)}`} color={color} width={width * 0.9} draw={di} glow={false} opacity={0.95} />);
      if (i % 2 === 0) {
        const fu = u0 + len * 0.72, fv = v + len * 0.72 * Math.sin(splay);
        out.push(<Path key={`g${p}-${i}`} d={`M${pt(fu, fv)} L${pt(fu + 0.08, fv + (R() - 0.5) * 0.08)}`} color={color} width={width * 0.7} draw={clamp(di * 1.5 - 0.5)} glow={false} opacity={0.8} />);
      }
    }
  }
  // centre: ring + a few stamens
  const kc = clamp(grow * 2.5);
  out.push(<circle key="ctr" cx={cx} cy={cy} r={r * 0.06} fill="none" stroke={color} strokeWidth={width} opacity={kc} />);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rot;
    out.push(<path key={`s${i}`} d={`M${cx + Math.cos(a) * r * 0.06} ${cy + Math.sin(a) * r * 0.06} L${cx + Math.cos(a) * r * 0.14} ${cy + Math.sin(a) * r * 0.14}`} stroke={color} strokeWidth={width * 0.8} opacity={kc * 0.8} />);
  }
  return <g>{out}</g>;
};

/* ---------- dragon-beard strands: one thread becomes 2, 4, 16 ... ---------- */
export const Strands: React.FC<{x: number; y: number; level: number; color?: string; seed?: number; reach?: number; spreadA?: [number, number]; width?: number; opacity?: number}> = ({x, y, level, color = C.redLine, seed = 9, reach = 900, spreadA = [-2.6, -0.5], width = 1.4, opacity = 0.9}) => {
  const {abs} = useShot();
  const lv = Math.max(0, level);
  const n = Math.pow(2, Math.floor(lv));
  const frac = lv - Math.floor(lv);
  const total = Math.min(n * 2, 512);
  const R = rng(seed);
  const tgt = Array.from({length: 512}, () => [R(), R(), R()]);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const parent = Math.floor(i / 2);
    const up = (parent + 0.5) / n, uc = (i + 0.5) / total;
    const u = lerp(up, uc, eio(frac));
    if (i % 2 === 1 && frac < 0.01) continue;
    const a = lerp(spreadA[0], spreadA[1], u) + Math.sin(abs * 0.4 + i) * 0.02;
    const rr = reach * (0.75 + 0.25 * tgt[i][0]);
    const ex = x + Math.cos(a) * rr, ey = y + Math.sin(a) * rr * 0.75;
    const c1x = x + Math.cos(a + 0.5) * rr * 0.35, c1y = y + Math.sin(a + 0.5) * rr * 0.2 - 40;
    const c2x = x + Math.cos(a - 0.2) * rr * 0.75 + Math.sin(abs * 0.6 + i * 1.3) * 18, c2y = y + Math.sin(a - 0.2) * rr * 0.6 + Math.cos(abs * 0.5 + i) * 14;
    els.push(<path key={i} d={`M${x} ${y} C${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`} stroke={color} strokeWidth={Math.max(0.6, width * 2.2 / Math.sqrt(Math.max(1, total / 4)))} fill="none" opacity={opacity} />);
  }
  return <g>{els}</g>;
};

/** full-frame field of horizontal threads multiplying (climax) */
export const ThreadField: React.FC<{level: number; color?: string; y0?: number; y1?: number; amp?: number}> = ({level, color = C.redLine, y0 = 40, y1 = 1040, amp = 18}) => {
  const {abs} = useShot();
  const n = Math.pow(2, Math.floor(level));
  const frac = level - Math.floor(level);
  const total = Math.min(n * 2, 1024);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const parent = Math.floor(i / 2);
    const yp = lerp(y0, y1, (parent + 0.5) / n), yc = lerp(y0, y1, (i + 0.5) / total);
    const y = lerp(yp, yc, eio(frac));
    if (i % 2 === 1 && frac < 0.01) continue;
    const d = wavy(-60, y, W + 60, y + Math.sin(i * 1.3) * 10, amp, 2.2, abs * 0.9 + i * 0.37, i + 1, 40);
    els.push(<path key={i} d={d} stroke={color} strokeWidth={Math.max(0.7, 5 / Math.sqrt(Math.max(1, total / 2)))} fill="none" opacity={0.92} />);
  }
  return <Svg>{els}</Svg>;
};

/* ---------- the letter S, written by the thread ---------- */
export const S_PATH = 'M1176 262 C1110 196 958 182 884 236 C800 297 822 392 900 432 C980 474 1104 486 1146 566 C1194 657 1124 760 1010 776 C918 789 828 760 772 700';
export const S_PATH_SMALL = (cx: number, cy: number, s: number) =>
  `M${cx + 216 * s} ${cy - 258 * s} C${cx + 150 * s} ${cy - 324 * s} ${cx - 2 * s} ${cy - 338 * s} ${cx - 76 * s} ${cy - 284 * s} C${cx - 160 * s} ${cy - 223 * s} ${cx - 138 * s} ${cy - 128 * s} ${cx - 60 * s} ${cy - 88 * s} C${cx + 20 * s} ${cy - 46 * s} ${cx + 144 * s} ${cy - 34 * s} ${cx + 186 * s} ${cy + 46 * s} C${cx + 234 * s} ${cy + 137 * s} ${cx + 164 * s} ${cy + 240 * s} ${cx + 50 * s} ${cy + 256 * s} C${cx - 42 * s} ${cy + 269 * s} ${cx - 132 * s} ${cy + 240 * s} ${cx - 188 * s} ${cy + 180 * s}`;

/* ---------- cat's cradle: a web that flips into a ladder ---------- */
const hexMix = (a: string, b: string, k: number) => {
  const c = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [c(a), c(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};
export const CatsCradle: React.FC<{form: number; ladder: number; cx?: number; cy?: number; color?: string}> = ({form, ladder, cx = W / 2, cy = H / 2 - 40, color = C.paper}) => {
  const {abs} = useShot();
  const gap = 520, rows = 5, dy = 105;
  const P = (side: number, i: number) => [cx + side * gap / 2 + Math.sin(abs * 0.7 + i + side) * 3, cy + (i - (rows - 1) / 2) * dy + Math.cos(abs * 0.6 + i) * 2];
  const e = eio(clamp(ladder));
  const els: React.ReactNode[] = [];
  // crossing strings (web) that untwist into rungs (ladder)
  for (let i = 0; i < rows - 1; i++) {
    for (const k of [0, 1]) {
      const a = P(-1, i + k), bWeb = P(1, i + 1 - k), bLad = P(1, i + k);
      const bx = lerp(bWeb[0], bLad[0], e), by = lerp(bWeb[1], bLad[1], e);
      const mx = (a[0] + bx) / 2, my = (a[1] + by) / 2 + (1 - e) * 10 + Math.sin(abs + i) * 4;
      const col = hexMix(color, C.redLine, e);         // the strings go red as they untwist
      els.push(<path key={`x${i}${k}`} d={`M${a[0]} ${a[1]} Q${mx} ${my} ${bx} ${by}`} stroke={col} strokeWidth={2.2} fill="none" pathLength={1} strokeDasharray={`${clamp(form * 1.6 - i * 0.15)} 1.0001`} opacity={0.95} />);
    }
  }
  // outer loops: top and bottom always horizontal
  for (const i of [0, rows - 1]) {
    const a = P(-1, i), b = P(1, i);
    els.push(<path key={`o${i}`} d={`M${a[0]} ${a[1]} Q${W / 2} ${a[1] + (i ? 14 : -14)} ${b[0]} ${b[1]}`} stroke={hexMix(color, C.redLine, e)} strokeWidth={2.2} fill="none" pathLength={1} strokeDasharray={`${clamp(form * 1.4)} 1.0001`} />);
  }
  // ladder rails appear
  for (const side of [-1, 1]) {
    const a = P(side, 0), b = P(side, rows - 1);
    els.push(<path key={`r${side}`} d={`M${a[0]} ${a[1] - 40} L${b[0]} ${b[1] + 40}`} stroke={C.redLine} strokeWidth={2.6} opacity={e} />);
  }
  // fingertips (small paper loops)
  for (const side of [-1, 1]) for (let i = 0; i < rows; i++) {
    const p = P(side, i);
    els.push(<circle key={`p${side}${i}`} cx={p[0]} cy={p[1]} r={8} fill="none" stroke={color} strokeWidth={2} opacity={clamp(form * 3)} />);
  }
  return <Svg>{els}</Svg>;
};

/* ---------- hell flames: thin red lines licking upward ---------- */
export const Flames: React.FC<{y?: number; n?: number; height?: number; opacity?: number; seed?: number}> = ({y = H + 20, n = 46, height = 260, opacity = 0.8, seed = 4}) => {
  const {abs} = useShot();
  const R = rng(seed);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = R() * W, h = height * (0.4 + R() * 0.8), ph = R() * 10, sp = 0.6 + R() * 0.9;
    const life = ((abs * sp * 0.35 + ph) % 1);
    const hh = h * Math.sin(life * Math.PI);
    let d = `M${x0} ${y}`;
    const steps = 14;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      const x = x0 + Math.sin(t * 5 + abs * 2.2 * sp + ph) * 18 * t + noise1(t * 3 + abs + ph, i) * 10 * t;
      d += ` L${x.toFixed(1)} ${(y - hh * t).toFixed(1)}`;
    }
    els.push(<path key={i} d={d} stroke={i % 7 === 0 ? '#ff8a5a' : C.redLine} strokeWidth={1 + (1 - life) * 1.2} fill="none" opacity={opacity * Math.sin(life * Math.PI) * 0.9} strokeLinecap="round" />);
  }
  return <Svg>{els}</Svg>;
};

/* ---------- sea of lines ---------- */
export const Waves: React.FC<{y: number; rows?: number; color?: string; freeze?: number}> = ({y, rows = 8, color = C.paper, freeze = 0}) => {
  const {abs} = useShot();
  const t = abs * (1 - freeze * 0.95);
  const els: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const yy = y + r * (26 + r * 4);
    let d = '';
    for (let x = -40; x <= W + 40; x += 16) {
      const v = Math.sin(x * 0.010 + t * (0.7 + r * 0.08) + r) * (6 + r * 2.4) + Math.sin(x * 0.027 - t * 1.1 + r) * 3;
      d += (x === -40 ? 'M' : 'L') + x + ' ' + (yy + v).toFixed(1);
    }
    els.push(<path key={r} d={d} stroke={color} strokeWidth={1.2 + r * 0.25} fill="none" opacity={0.3 + r * 0.08} />);
  }
  return <Svg>{els}</Svg>;
};

/* ---------- stars / star trails swirling ---------- */
export const StarField: React.FC<{n?: number; seed?: number; vortex?: number; cx?: number; cy?: number; trail?: number; opacity?: number}> = ({n = 600, seed = 3, vortex = 0, cx = W / 2, cy = H / 2, trail = 0.05, opacity = 1}) => {
  const {abs} = useShot();
  const R = rng(seed);
  const els: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = R() * W * 1.5 - W * 0.25, y0 = R() * H * 1.6 - H * 0.3, sz = Math.pow(R(), 3) * 2.6 + 0.5, ph = R() * 10;
    const col = R() < 0.12 ? C.araya : R() < 0.06 ? C.redLine : C.paper;
    const dx = x0 - cx, dy = y0 - cy, rad = Math.hypot(dx, dy);
    const w = vortex * 0.09 * (520 / (rad + 140));
    const ang = Math.atan2(dy, dx) + w * abs;
    const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
    const tw = 0.55 + 0.45 * Math.sin(abs * 1.6 + ph * 3);
    if (vortex > 0.02) {
      const L = trail * (1 + vortex * 6) * (520 / (rad + 140));
      const a2 = ang - L;
      const x2 = cx + Math.cos(a2) * rad, y2 = cy + Math.sin(a2) * rad;
      const large = 0;
      els.push(<path key={i} d={`M${x2.toFixed(1)} ${y2.toFixed(1)} A${rad.toFixed(1)} ${rad.toFixed(1)} 0 ${large} 1 ${x.toFixed(1)} ${y.toFixed(1)}`} stroke={col} strokeWidth={sz * 0.8} fill="none" strokeLinecap="round" opacity={opacity * tw} />);
    } else {
      els.push(<circle key={i} cx={x} cy={y} r={sz * 0.8} fill={col} opacity={opacity * tw} />);
    }
  }
  return <Svg>{els}</Svg>;
};

/* ---------- teacup in white line ---------- */
export const Cup: React.FC<{cx: number; cy: number; s?: number; draw?: number; color?: string}> = ({cx, cy, s = 1, draw = 1, color = C.paper}) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    <Path d="M-210 -110 C-200 120 -110 186 0 186 C110 186 200 120 210 -110" color={color} width={2.4} draw={draw} glow={false} />
    <ellipse cx={0} cy={-110} rx={210} ry={40} stroke={color} strokeWidth={2.4} fill="none" pathLength={1} strokeDasharray={`${draw} 1.0001`} />
    <ellipse cx={0} cy={-110} rx={176} ry={30} stroke={color} strokeWidth={1.2} fill="none" opacity={0.5} pathLength={1} strokeDasharray={`${draw} 1.0001`} />
    <Path d="M-86 184 L-76 230 L76 230 L86 184" color={color} width={2.4} draw={draw} glow={false} />
  </g>
);

/* ---------- falling drops ---------- */
export const Drops: React.FC<{x: number; y0: number; y1: number; times: number[]; color?: string}> = ({x, y0, y1, times, color = C.redLine}) => {
  const {abs} = useShot();
  const out: React.ReactNode[] = [];
  times.forEach((st, k) => {
    if (abs < st) return;
    const u = (abs - st) / 0.75;
    if (u > 1.5) return;
    const y = lerp(y0, y1, clamp(u * u));
    if (u <= 1) out.push(<path key={k} d={`M${x} ${y - 22} C${x + 10} ${y - 4} ${x + 10} ${y + 9} ${x} ${y + 10} C${x - 10} ${y + 9} ${x - 10} ${y - 4} ${x} ${y - 22}Z`} fill={color} />);
    else {
      const sp = (u - 1) / 0.5;
      out.push(<ellipse key={k} cx={x} cy={y1 + 2} rx={16 + sp * 80} ry={4 + sp * 7} fill="none" stroke={color} strokeWidth={2.2 * (1 - sp)} opacity={1 - sp} />);
    }
  });
  return <>{out}</>;
};

export {smooth, clamp, lerp, eio};

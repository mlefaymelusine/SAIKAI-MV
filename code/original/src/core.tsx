// Drawing primitives: hand-wobbled paths, a self-drawing ink stroke with a pen tip, amber glow.
import React, {createContext, useContext, useMemo} from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';
import {clamp, eio, noise1, P, prog, rng} from './util';

export const INK = '#1e1c21';
export const AMBER = '#d8923a';
export const VERMIL = '#d48a3a'; // accent only: amber family, never red
export const PAPER = '#eee8db';

/** global time (sec) and ink level, provided by Video */
export const TimeCtx = createContext({g: 0, ink: 1});
export const useInk = () => useContext(TimeCtx).ink;

const f1 = (n: number) => n.toFixed(1);

/** subdivide long segments and wobble them, then Catmull-Rom -> cubic beziers. A third element 1 marks a corner. */
export function hand(pts: P[], o: {seed?: number; jit?: number; closed?: boolean; step?: number} = {}): string {
  if (pts.length < 2) return '';
  const seed = o.seed ?? 1, jit = o.jit ?? 1.6, step = o.step ?? 70;
  const r = rng(seed * 7919 + 13);
  const src = o.closed ? [...pts, pts[0]] : pts;
  type Q = {x: number; y: number; c: boolean};
  const q: Q[] = [];
  let arc = 0;
  for (let i = 0; i < src.length; i++) {
    const [x, y] = src[i];
    const c = src[i].length === 3;
    if (i > 0) {
      const [px, py] = src[i - 1];
      const L = Math.hypot(x - px, y - py);
      const n = Math.floor(L / step);
      const nx = -(y - py) / (L || 1), ny = (x - px) / (L || 1);
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        const a = arc + L * t;
        const w = noise1(a / 140, seed) * jit;
        q.push({x: px + (x - px) * t + nx * w, y: py + (y - py) * t + ny * w, c: false});
      }
      arc += L;
    }
    const jx = (r() - 0.5) * jit, jy = (r() - 0.5) * jit;
    q.push({x: x + jx, y: y + jy, c});
  }
  if (o.closed) { q[q.length - 1] = {...q[0]}; }
  let d = `M${f1(q[0].x)} ${f1(q[0].y)}`;
  for (let i = 0; i < q.length - 1; i++) {
    const p1 = q[i], p2 = q[i + 1];
    let p0 = q[i - 1] ?? (o.closed ? q[q.length - 2] : p1);
    let p3 = q[i + 2] ?? (o.closed ? q[1] : p2);
    if (p1.c) p0 = p1;
    if (p2.c) p3 = p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${f1(c1x)} ${f1(c1y)} ${f1(c2x)} ${f1(c2y)} ${f1(p2.x)} ${f1(p2.y)}`;
  }
  return d;
}

/** plain polyline (no smoothing) for dense generated curves */
export const poly = (pts: number[][], closed = false) =>
  pts.map((p, i) => (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('') + (closed ? 'Z' : '');

type StrokeProps = {
  d: string; t: number; a?: number; b?: number; w?: number; o?: number; pen?: boolean;
  color?: string; ease?: (x: number) => number; rev?: boolean; erase?: [number, number]; bleed?: boolean;
};
/** an ink line that draws itself between a and b (local seconds); rev = un-draw; erase = retract from the start */
export const Stroke: React.FC<StrokeProps> = ({d, t, a = -1, b = 0, w = 3, o = 0.9, pen = false, color = INK, ease = eio, rev = false, erase, bleed = true}) => {
  const ink = useInk();
  let p = prog(t, a, b, ease);
  if (rev) p = 1 - p;
  const q = erase ? prog(t, erase[0], erase[1], ease) : 0;
  if (p <= 0.0005 || q >= p) return null;
  const ww = w * (0.55 + 0.45 * ink), oo = o * (0.45 + 0.55 * ink);
  const dash = p >= 0.9995 && q <= 0 ? undefined : `${(p - q).toFixed(5)} 3`;
  const off = q > 0 ? -q : 0;
  return (
    <g>
      {bleed && <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={ww * 2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={off} opacity={oo * 0.12} />}
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={ww} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={off} opacity={oo} />
      {pen && p < 0.999 && !rev && <PenTip d={d} p={p} w={ww} color={color} />}
    </g>
  );
};

const lenCache = new Map<string, number>();
export const pathLen = (d: string) => {
  let L = lenCache.get(d);
  if (L === undefined) { L = getLength(d); lenCache.set(d, L); }
  return L;
};
export const pointAt = (d: string, p: number) => getPointAtLength(d, clamp(p) * pathLen(d));

const PenTip: React.FC<{d: string; p: number; w: number; color: string}> = ({d, p, w, color}) => {
  const pt = pointAt(d, p);
  return (
    <g>
      <circle cx={pt.x} cy={pt.y} r={w * 2.4} fill={color} opacity={0.1} />
      <circle cx={pt.x} cy={pt.y} r={w * 0.95} fill={color} opacity={0.95} />
    </g>
  );
};

/** soft amber light */
export const Glow: React.FC<{x: number; y: number; r: number; o?: number; color?: string}> = ({x, y, r, o = 1, color = 'amber'}) =>
  o <= 0.002 ? null : <circle cx={x} cy={y} r={r} fill={`url(#g_${color})`} opacity={o} />;

/** camera: [scale, focusX, focusY] eased from -> to over [0,T] */
export const Cam: React.FC<{t: number; T: number; from: number[]; to: number[]; ease?: (x: number) => number; children: React.ReactNode}> = ({t, T, from, to, ease = eio, children}) => {
  const k = prog(t, 0, T, ease);
  const sc = from[0] + (to[0] - from[0]) * k, x = from[1] + (to[1] - from[1]) * k, y = from[2] + (to[2] - from[2]) * k;
  return <g transform={`translate(960 540) scale(${sc.toFixed(5)}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})`}>{children}</g>;
};

/** full-frame SVG layer for a shot */
export const Layer: React.FC<{o?: number; children: React.ReactNode}> = ({o = 1, children}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
    <g filter="url(#rough)">{children}</g>
  </svg>
);

/** filled variable-width brush stroke revealed along its centreline */
export const Brush: React.FC<{pts: number[][]; width: (u: number) => number; t: number; a: number; b: number; o?: number; id: string; ease?: (x: number) => number; color?: string}> = ({pts, width, t, a, b, o = 0.92, id, ease = eio, color = INK}) => {
  const ink = useInk();
  const {outline, center} = useMemo(() => {
    const L: number[] = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const tot = L[L.length - 1];
    const left: number[][] = [], right: number[][] = [];
    for (let i = 0; i < pts.length; i++) {
      const pa = pts[Math.max(0, i - 1)], pb = pts[Math.min(pts.length - 1, i + 1)];
      const dx = pb[0] - pa[0], dy = pb[1] - pa[1], l = Math.hypot(dx, dy) || 1;
      const hw = width(L[i] / tot) / 2;
      left.push([pts[i][0] - (dy / l) * hw, pts[i][1] + (dx / l) * hw]);
      right.push([pts[i][0] + (dy / l) * hw, pts[i][1] - (dx / l) * hw]);
    }
    return {outline: poly([...left, ...right.reverse()], true), center: poly(pts)};
  }, [pts, width]);
  const p = prog(t, a, b, ease);
  if (p <= 0) return null;
  return (
    <g opacity={o * (0.5 + 0.5 * ink)}>
      <mask id={id} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={6000} height={6000}>
        <path d={center} pathLength={1} fill="none" stroke="#fff" strokeWidth={80} strokeLinecap="round" strokeDasharray={p >= 1 ? undefined : `${p} 3`} />
      </mask>
      <path d={outline} fill={color} mask={`url(#${id})`} filter="url(#dry)" />
    </g>
  );
};

/** shared defs: roughen filter, dry-brush filter, glow gradients */
export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="dry" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves={2} seed={11} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.75" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={6} />
      </filter>
      {[['amber', AMBER], ['vermil', VERMIL], ['ink', INK]].map(([k, c]) => (
        <radialGradient key={k} id={`g_${k}`}>
          <stop offset="0%" stopColor={c} stopOpacity={0.62} />
          <stop offset="22%" stopColor={c} stopOpacity={0.34} />
          <stop offset="55%" stopColor={c} stopOpacity={0.1} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </radialGradient>
      ))}
      <linearGradient id="streak" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={AMBER} stopOpacity={0.5} />
        <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);

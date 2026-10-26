// Weather, water and the lantern: elements that move rather than draw.
import React from 'react';
import {AMBER, Glow, INK, Stroke, useInk} from './core';
import {lampCore, lampPath} from './shapes';
import {clamp, fade, noise1, prog, rng, smooth} from './util';

const f1 = (n: number) => n.toFixed(1);

/** lantern that can be drawn (a..b) and lit (lit: 0..1) */
export const Lamp: React.FC<{x: number; y: number; s?: number; t: number; a?: number; b?: number; lit?: number; seed?: number; pen?: boolean; o?: number; flicker?: number}> = ({x, y, s = 1, t, a = -2, b = -1, lit = 0, seed = 1, pen = false, o = 0.9, flicker = 0}) => {
  const [cx, cy] = lampCore(x, y, s);
  const fl = 1 + flicker * (noise1(t * 3.1, seed) * 0.18 + noise1(t * 9.7, seed + 2) * 0.07);
  const L = clamp(lit) * fl;
  return (
    <g>
      <Glow x={cx} y={cy} r={210 * s} o={L} />
      {L > 0 && <rect x={x - 21 * s} y={y - 96 * s} width={42 * s} height={56 * s} fill={AMBER} opacity={0.42 * Math.min(1, L)} />}
      <Stroke d={lampPath(x, y, s, seed)} t={t} a={a} b={b} w={2.6 * Math.sqrt(s)} o={o} pen={pen} />
    </g>
  );
};

/** amber reflection streak under a lamp */
export const Streak: React.FC<{x: number; y: number; w: number; h: number; o: number; t: number}> = ({x, y, w, h, o, t}) => {
  if (o <= 0) return null;
  const r = rng(Math.round(x));
  const bars = [];
  for (let i = 0; i < 9; i++) {
    const yy = y + (i / 9) * h + 3;
    const ww = w * (1 - i / 11) * (0.6 + 0.4 * Math.abs(noise1(t * 0.8 + i * 1.7, i)));
    bars.push(<rect key={i} x={x - ww / 2 + noise1(t * 0.6 + i, 9) * 6} y={yy} width={ww} height={2.4 + r() * 1.5} rx={1.5} fill={AMBER} opacity={o * 0.75 * (1 - i / 10)} />);
  }
  return <g>{bars}</g>;
};

/** short drifting water lines in a band */
export const Ripples: React.FC<{t: number; x0: number; x1: number; y0: number; y1: number; n: number; seed?: number; o?: number; speed?: number}> = ({t, x0, x1, y0, y1, n, seed = 1, o = 1, speed = 14}) => {
  const ink = useInk();
  if (o <= 0) return null;
  const r = rng(seed);
  const out = [];
  const Wd = x1 - x0;
  for (let i = 0; i < n; i++) {
    const bx = r() * Wd, yy = y0 + Math.pow(r(), 1.3) * (y1 - y0), ph = r() * 10, L = 18 + r() * 60;
    const persp = 0.5 + 0.5 * (yy - y0) / (y1 - y0 || 1);
    const x = x0 + ((bx + t * speed * persp) % Wd + Wd) % Wd;
    const a = 0.5 + 0.5 * Math.sin(t * 0.9 + ph);
    const len = L * persp;
    out.push(<path key={i} d={`M${f1(x)} ${f1(yy)}q${f1(len / 2)} ${f1(-2.5 * persp)} ${f1(len)} 0`} stroke={INK} strokeWidth={1.7 * persp * (0.6 + 0.4 * ink)} fill="none" strokeLinecap="round" opacity={o * a * 0.55 * (0.5 + 0.5 * ink)} />);
  }
  return <g>{out}</g>;
};

/** amber flecks twinkling on water */
export const Glints: React.FC<{t: number; x0: number; x1: number; y0: number; y1: number; n: number; seed?: number; o?: number}> = ({t, x0, x1, y0, y1, n, seed = 3, o = 1}) => {
  if (o <= 0) return null;
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), ph = r() * 6.28, sp = 0.6 + r() * 1.2, L = 8 + r() * 26;
    const a = Math.pow(Math.max(0, Math.sin(t * sp + ph)), 3);
    if (a < 0.02) continue;
    out.push(<rect key={i} x={x - L / 2} y={y} width={L} height={2.6} rx={1.3} fill={AMBER} opacity={o * a * 0.9} />);
  }
  return <g>{out}</g>;
};

/** snow as small ink rings, falling and swaying */
export const Snow: React.FC<{t: number; n: number; o?: number; seed?: number; speed?: number}> = ({t, n, o = 1, seed = 5, speed = 40}) => {
  if (o <= 0) return null;
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * 2100 - 90, y0 = r() * 1300, z = 0.4 + r() * 0.8, ph = r() * 6.28;
    const y = ((y0 + t * speed * z) % 1300) - 110;
    const x = x0 + Math.sin(t * 0.6 * z + ph) * 26 * z;
    out.push(<circle key={i} cx={f1(x)} cy={f1(y)} r={f1(2.6 * z + 1)} fill="none" stroke={INK} strokeWidth={1.1 * z + 0.3} opacity={o * (0.35 + 0.35 * z)} />);
  }
  return <g>{out}</g>;
};

/** falling sakura petals (outlined almonds), drifting left */
export const Petals: React.FC<{t: number; n: number; o?: number; seed?: number; box?: number[]}> = ({t, n, o = 1, seed = 8, box = [-100, -100, 2100, 1250]}) => {
  if (o <= 0) return null;
  const r = rng(seed);
  const [bx0, by0, bx1, by1] = box, bw = bx1 - bx0, bh = by1 - by0;
  const out = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * bw, y0 = r() * bh, z = 0.5 + r() * 0.7, ph = r() * 6.28, sp = 0.5 + r();
    const x = bx0 + ((x0 - t * 55 * z) % bw + bw) % bw + Math.sin(t * sp + ph) * 30;
    const y = by0 + ((y0 + t * 38 * z) % bh + bh) % bh;
    const rot = (t * 60 * sp + ph * 57) % 360, k = 9 * z, sq = 0.35 + 0.65 * Math.abs(Math.sin(t * sp * 1.3 + ph));
    out.push(<path key={i} transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(1 ${sq.toFixed(2)})`} d={`M${-k} 0Q0 ${-k * 0.8} ${k} 0Q0 ${k * 0.8} ${-k} 0`} fill="none" stroke={INK} strokeWidth={1.3} opacity={o * (0.4 + 0.3 * z)} />);
  }
  return <g>{out}</g>;
};

/** slanted rain; skip drops inside the shelter function */
export const Rain: React.FC<{t: number; n: number; o?: number; seed?: number; shelter?: (x: number, y: number) => boolean}> = ({t, n, o = 1, seed = 12, shelter}) => {
  if (o <= 0) return null;
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const x0 = r() * 2300 - 150, y0 = r() * 1300, z = 0.5 + r() * 0.6;
    const y = ((y0 + t * 900 * z) % 1300) - 120;
    const x = x0 - (y + 120) * 0.12;
    const L = 26 * z + 10;
    if (shelter && shelter(x, y + L)) continue;
    out.push(<line key={i} x1={f1(x)} y1={f1(y)} x2={f1(x - L * 0.12)} y2={f1(y + L)} stroke={INK} strokeWidth={0.8 + z * 0.6} strokeLinecap="round" opacity={o * (0.2 + 0.25 * z)} />);
  }
  return <g>{out}</g>;
};

/** rain rings on water or ground */
export const Splashes: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; o?: number; seed?: number}> = ({t, n, x0, x1, y0, y1, o = 1, seed = 21}) => {
  if (o <= 0) return null;
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), per = 0.9 + r() * 0.8, ph = r() * per;
    const k = ((t + ph) % per) / per;
    out.push(<ellipse key={i} cx={x} cy={y} rx={4 + k * 22} ry={(4 + k * 22) * 0.25} fill="none" stroke={INK} strokeWidth={1.1} opacity={o * (1 - k) * 0.5} />);
  }
  return <g>{out}</g>;
};

/** fireflies: amber points wandering on noise paths, drifting by `drift` px/s */
export const Fireflies: React.FC<{t: number; n: number; o?: number; seed?: number; box: number[]; drift?: number; appear?: number}> = ({t, n, o = 1, seed = 30, box, drift = 0, appear = 0}) => {
  if (o <= 0) return null;
  const r = rng(seed);
  const [x0, y0, x1, y1] = box;
  const out = [];
  for (let i = 0; i < n; i++) {
    const bx = x0 + r() * (x1 - x0), by = y0 + r() * (y1 - y0), ph = r() * 6.28, sp = 0.6 + r() * 0.8, born = r() * appear;
    const life = smooth(born, born + 2, t);
    if (life <= 0) continue;
    const x = bx + noise1(t * 0.18 * sp + i * 3.1, seed) * 140 + drift * Math.max(0, t - born) * (0.6 + 0.4 * r());
    const y = by + noise1(t * 0.15 * sp + i * 7.3, seed + 1) * 70;
    const blink = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.6 * sp + ph), 2);
    const a = o * life * blink;
    out.push(<g key={i}><Glow x={x} y={y} r={34} o={a} /><circle cx={x} cy={y} r={2.6} fill={AMBER} opacity={Math.min(1, a * 1.3)} /></g>);
  }
  return <g>{out}</g>;
};

/** brush-script word as part of the picture: slow fade with a gentle settle */
export const Word: React.FC<{text: string; x: number; y: number; size: number; t: number; a: number; b: number; f?: number; o?: number; vertical?: boolean; family?: string; spacing?: number; color?: string}> = ({text, x, y, size, t, a, b, f = 1.2, o = 0.85, vertical = false, family = 'MV_brush', spacing = 0, color = INK}) => {
  const k = fade(t, a, b, f);
  if (k <= 0) return null;
  const blur = (1 - smooth(a, a + f * 1.2, t)) * 3;
  return (
    <text x={x} y={y} fontFamily={family} fontSize={size} fill={color} opacity={o * k} textAnchor="middle" dominantBaseline="central"
      letterSpacing={spacing} style={{writingMode: vertical ? 'vertical-rl' : undefined, filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
      {text}
    </text>
  );
};

/** small square seal (ink outline) with one character */
export const Seal: React.FC<{ch: string; x: number; y: number; t: number; a: number; b: number; size?: number}> = ({ch, x, y, t, a, b, size = 54}) => {
  const k = fade(t, a, b, 1.2);
  if (k <= 0) return null;
  const h = ch.length === 1 ? size : size * (0.2 + 0.42 * ch.length);
  return (
    <g opacity={k * 0.8}>
      <rect x={x - size / 2} y={y - h / 2} width={size} height={h} rx={4} fill="none" stroke={INK} strokeWidth={2.2} />
      {ch.length === 1
        ? <text x={x} y={y + 2} fontFamily="MV_brush" fontSize={size * 0.66} fill={INK} textAnchor="middle" dominantBaseline="central">{ch}</text>
        : [...ch].map((c, i) => <text key={i} x={x} y={y + (i - (ch.length - 1) / 2) * size * 0.42 + 1} fontFamily="MV_brush" fontSize={size * 0.4} fill={INK} textAnchor="middle" dominantBaseline="central">{c}</text>)}
    </g>
  );
};

/** ink drop spreading on paper */
export const Blot: React.FC<{x: number; y: number; t: number; a: number; b: number; r: number}> = ({x, y, t, a, b, r}) => {
  const k = prog(t, a, b);
  if (k <= 0) return null;
  return (
    <g>
      <circle cx={x} cy={y} r={r * k * 1.9} fill={INK} opacity={0.08} filter="url(#soft)" />
      <circle cx={x} cy={y} r={r * Math.sqrt(k)} fill={INK} opacity={0.88} />
    </g>
  );
};

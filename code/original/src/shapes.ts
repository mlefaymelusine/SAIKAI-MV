// Geometry for the recurring motifs. Everything returns point lists or path strings in 1920x1080 space.
import {hand, poly} from './core';
import {lerp, noise1, P, rng} from './util';

const T = (pts: P[], x: number, y: number, s: number): P[] =>
  pts.map((p) => (p.length === 3 ? [x + p[0] * s, y + p[1] * s, 1] : [x + p[0] * s, y + p[1] * s]) as P);

/** floor lantern standing at (x,y), ~115*s tall. One continuous line. */
export const lampPts = (x: number, y: number, s = 1): P[] =>
  T([[-34, 2], [34, 2, 1], [7, 2, 1], [7, -40, 1], [21, -40, 1], [21, -96, 1], [28, -96, 1], [0, -114, 1], [-28, -96, 1], [-21, -96, 1], [-21, -40, 1], [-7, -40, 1], [-7, 2, 1]], x, y, s);
export const lampPath = (x: number, y: number, s = 1, seed = 1) => hand(lampPts(x, y, s), {seed, jit: 0.8 * s, step: 40});
/** centre of the lantern's paper box */
export const lampCore = (x: number, y: number, s = 1) => [x, y - 68 * s] as const;

/** paper boat, hull bottom centred at (x,y); 8 vertices so a sheet can morph into it */
export const BOAT: P[] = [[-55, 0, 1], [0, 1, 1], [55, 0, 1], [82, -32, 1], [30, -32, 1], [0, -92, 1], [-30, -32, 1], [-82, -32, 1]];
export const boatPts = (x: number, y: number, s = 1) => T(BOAT, x, y, s);
export const boatPath = (x: number, y: number, s = 1, seed = 2) => hand(boatPts(x, y, s), {seed, jit: 0.7 * s, closed: true, step: 40});

/** door frame + floor (one line) */
export const doorFrame = (seed = 3, dx = 0, dy = 0, rot = 0): string => {
  const c = Math.cos(rot), si = Math.sin(rot);
  const R = (x: number, y: number) => [960 + dx + (x - 960) * c - (y - 560) * si, 560 + dy + (x - 960) * si + (y - 560) * c];
  const pts: P[] = [[420, 920], [780, 920, 1], [780, 200, 1], [1140, 200, 1], [1140, 920, 1], [1500, 920]].map((p) => {
    const [x, y] = R(p[0], p[1]);
    return (p.length === 3 ? [x, y, 1] : [x, y]) as P;
  });
  return hand(pts, {seed, jit: 2});
};
/** door panel hinged at x=780, opened by o (0 closed .. 1 wide) */
export const doorPanel = (o: number) => {
  const fx = lerp(1140, 905, o), sk = 34 * o;
  return {fx, sk, d: hand([[780, 200, 1], [fx, 200 - sk, 1], [fx, 920 + sk, 1], [780, 920, 1]], {seed: 5, jit: 1.2, closed: true})};
};

/** fringed nadeshiko seen from the front: 5 wedge petals with toothed tips. One continuous outline. */
export const nadeshikoPts = (cx: number, cy: number, R: number, seed = 4): number[][] => {
  const r = rng(seed);
  const out: number[][] = [];
  for (let k = 0; k < 5; k++) {
    const th = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    const half = 0.52;
    out.push([cx + Math.cos(th - 0.05) * R * 0.12, cy + Math.sin(th - 0.05) * R * 0.12]);
    const teeth = 9;
    for (let i = 0; i <= teeth * 2; i++) {
      const a = th - half + (i / (teeth * 2)) * half * 2;
      const rr = R * (i % 2 === 0 ? 1 : 0.84 + r() * 0.05) * (0.92 + 0.08 * Math.cos((a - th) * 2.6));
      out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    out.push([cx + Math.cos(th + 0.05) * R * 0.12, cy + Math.sin(th + 0.05) * R * 0.12]);
  }
  out.push(out[0]);
  return out;
};

/** a sheet of letter paper in slight perspective (8 vertices, matching BOAT order) */
export const SHEET: [number, number][] = [[600, 820], [960, 812], [1320, 800], [1290, 550], [1260, 300], [950, 315], [640, 330], [620, 575]];

/** cursive scribble line: looping prolate cycloid with wandering size */
export const scribble = (x0: number, y0: number, x1: number, y1: number, seed: number) => {
  const pts: number[][] = [];
  const n = 260;
  const loops = Math.round((x1 - x0) / 21);
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const ph = u * loops * Math.PI * 2 + noise1(u * 9, seed + 2) * 1.2;
    const amp = 20 * (0.45 + 0.55 * Math.abs(noise1(u * 11, seed)));
    const gap = smoothGap(noise1(u * 4.1, seed + 5)); // word gaps flatten
    pts.push([lerp(x0, x1, u) - Math.sin(ph) * 8 * gap, lerp(y0, y1, u) + noise1(u * 5, seed + 9) * 3 - (1 - Math.cos(ph)) * amp * 0.5 * gap]);
  }
  return poly(pts);
};

/** recursive bare tree; returns strokes with depth for timing */
export const tree = (x: number, y: number, len: number, seed: number) => {
  const r = rng(seed);
  const out: {d: string; depth: number}[] = [];
  const grow = (x: number, y: number, ang: number, L: number, depth: number) => {
    const pts: P[] = [[x, y]];
    let cx = x, cy = y, a = ang;
    for (let i = 0; i < 4; i++) {
      a += (r() - 0.5) * 0.35;
      cx += Math.cos(a) * L / 4; cy += Math.sin(a) * L / 4;
      pts.push([cx, cy]);
    }
    out.push({d: hand(pts, {seed: seed + out.length, jit: 1}), depth});
    if (depth < 5) {
      const n = depth < 1 ? 3 : 2;
      for (let k = 0; k < n; k++) grow(cx, cy, a + (k - (n - 1) / 2) * (0.55 + r() * 0.3), L * (0.62 + r() * 0.12), depth + 1);
    }
  };
  grow(x, y, -Math.PI / 2, len, 0);
  return out;
};

/** yunomi cup: rim ellipse + body, rim centre (cx,cy), half width rx */
export const cupPath = (cx: number, cy: number, rx: number, h: number, seed = 6) => {
  const ry = rx * 0.22, pts: P[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI + (i / 24) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  const bx = rx * 0.86;
  pts.push([cx - rx, cy, 1]);
  pts.push([cx - bx, cy + h, 1]);
  for (let i = 1; i < 12; i++) {
    const a = Math.PI - (i / 12) * Math.PI;
    pts.push([cx + Math.cos(a) * bx, cy + h + Math.sin(a) * ry * 0.8]);
  }
  pts.push([cx + bx, cy + h, 1]);
  pts.push([cx + rx, cy, 1]);
  return hand(pts, {seed, jit: 1, step: 50});
};

/** S-curve centreline (two arcs), centred at (cx,cy), arc radius r */
export const sCurve = (cx: number, cy: number, r: number, n = 160, sweep = 245): number[][] => {
  const pts: number[][] = [];
  const up = [cx, cy - r], lo = [cx, cy + r];
  for (let i = 0; i <= n / 2; i++) { // upper arc: from upper-right, CCW over the top to the middle
    const a = (270 - sweep + (i / (n / 2)) * sweep) * Math.PI / 180;
    pts.push([up[0] + Math.cos(a) * r, up[1] - Math.sin(a) * r]);
  }
  for (let i = 1; i <= n / 2; i++) { // lower arc: from the middle, CW round the right to lower-left
    const a = (90 - (i / (n / 2)) * sweep) * Math.PI / 180;
    pts.push([lo[0] + Math.cos(a) * r, lo[1] - Math.sin(a) * r]);
  }
  return pts;
};
/** offset a polyline sideways */
export const offset = (pts: number[][], d: number) =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [p[0] - (dy / l) * d, p[1] + (dx / l) * d];
  });

/** five-petal blossom outline */
export const blossom = (cx: number, cy: number, r: number, rot = 0) => {
  const pts: number[][] = [];
  for (let i = 0; i <= 150; i++) {
    const a = (i / 150) * Math.PI * 2;
    const k = Math.abs(Math.cos((a * 5) / 2));
    const rr = r * (0.3 + 0.7 * Math.pow(k, 0.5));
    pts.push([cx + Math.cos(a + rot) * rr, cy + Math.sin(a + rot) * rr]);
  }
  return poly(pts, true);
};

/** arched bridge across the river in the cross-section view */
export const bridge = () => {
  const arch: number[][] = [], rail: number[][] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60, x = lerp(470, 1450, u), y = 712 - Math.sin(u * Math.PI) * 240;
    arch.push([x, y]); rail.push([x, y - 46 - Math.sin(u * Math.PI) * 6]);
  }
  return {arch, rail};
};

/** cross-section landscape: two banks and the water between */
export const leftBank: P[] = [[-80, 702], [200, 698], [470, 712], [560, 790], [606, 872]];
export const rightBank: P[] = [[2000, 702], [1720, 698], [1450, 712], [1360, 790], [1314, 872]];
export const LAMP_A = [330, 704] as const;
export const LAMP_B = [1590, 704] as const;

/** a row of reed blades: each a slim curved loop, joined along the ground (one line) */
export const reedRow = (x0: number, x1: number, y: number, hMin: number, hMax: number, seed: number, gap?: [number, number]): P[] => {
  const r = rng(seed), out: P[] = [[x0, y]];
  let x = x0 + 20;
  while (x < x1) {
    if (gap && x > gap[0] && x < gap[1]) { x = gap[1]; out.push([x, y]); continue; }
    const h = hMin + r() * (hMax - hMin), lean = (r() - 0.35) * h * 0.35, w = 7 + r() * 6;
    out.push([x, y, 1], [x + lean * 0.25 - 2, y - h * 0.55], [x + lean, y - h, 1], [x + lean * 0.25 + w * 0.6, y - h * 0.5], [x + w, y, 1]);
    x += w + 18 + r() * 70;
    out.push([x, y + (r() - 0.5) * 3]);
  }
  out.push([x1, y]);
  return out;
};

const smoothGap = (v: number) => (v > 0.5 ? 0.15 : v > 0.35 ? 0.15 + 0.85 * (0.5 - v) / 0.15 : 1);

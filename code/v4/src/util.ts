import {Easing, interpolate} from 'remotion';
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const s = (sec: number) => Math.round(sec * FPS);
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const eio = Easing.bezier(0.65, 0, 0.35, 1);
export const eout = Easing.bezier(0.16, 1, 0.3, 1);
export const ein = Easing.bezier(0.7, 0, 0.84, 0);
/** map x in [a,b] to [0,1] eased */
export const prog = (x: number, a: number, b: number, e = eio) =>
  interpolate(x, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** smooth 1D value noise */
export function noise1(x: number, seed = 1) {
  const i = Math.floor(x), f = x - i;
  const h = (n: number) => { const v = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453; return v - Math.floor(v); };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}
/** wavy polyline path between two points */
export function wavy(x1: number, y1: number, x2: number, y2: number, amp: number, waves: number, phase = 0, seed = 1, n = 60) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    const o = amp * env * (Math.sin(t * waves * Math.PI * 2 + phase) * 0.7 + noise1(t * 4 + phase * 0.3, seed) * 0.5);
    const x = x1 + dx * t + nx * o, y = y1 + dy * t + ny * o;
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d;
}
export const kanjiNum = (n: number) => {
  const d = ['〇', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖'];
  if (n < 10) return d[n];
  return (n >= 20 ? d[Math.floor(n / 10)] : '') + '拾' + (n % 10 ? d[n % 10] : '');
};

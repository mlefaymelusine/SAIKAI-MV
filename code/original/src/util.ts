import {Easing, interpolate} from 'remotion';
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION = 9718;
export const s = (sec: number) => Math.round(sec * FPS);
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const eio = Easing.bezier(0.45, 0, 0.55, 1);
export const eslow = Easing.bezier(0.33, 0, 0.67, 1);
export const eout = Easing.bezier(0.16, 1, 0.3, 1);
export const lin = (x: number) => x;
/** map x in [a,b] to [0,1] eased */
export const prog = (x: number, a: number, b: number, e: (x: number) => number = eio) =>
  interpolate(x, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
/** fade in over [a,a+f], out over [b-f,b] */
export const fade = (x: number, a: number, b: number, f = 1) => smooth(a, a + f, x) * (1 - smooth(b - f, b, x));
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** smooth 1D value noise in [-1,1] */
export function noise1(x: number, seed = 1) {
  const i = Math.floor(x), f = x - i;
  const h = (n: number) => { const v = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453; return v - Math.floor(v); };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}
export type P = [number, number] | [number, number, 1];

// W1 (new, 10-24): two tracks of prints across the paper, seen from above. Small red ones toddle along; big ink
// ones come in behind at a stride, reach her side on "step", and from there keep to her pace beside her.
// User 10-24 (2nd look): slower, a step every 0.56 s, not 0.36.
import React from 'react';
import {C} from '../theme';
import {clamp, eout, rng} from '../util';

/** one shoe print, toe toward +x, length len. side 1 = right foot (the +y side when walking toward +x) */
export const Print: React.FC<{len: number; side: number; color: string; cut?: string}> = ({len, side, color, cut = C.paper}) => {
  const P = (x: number, y: number) => `${(x * len).toFixed(1)} ${(y * len * side).toFixed(1)}`;
  const sole = `M${P(0.02, 0)} C${P(0.02, -0.15)} ${P(0.25, -0.17)} ${P(0.38, -0.1)} C${P(0.5, -0.06)} ${P(0.56, -0.22)} ${P(0.72, -0.21)} C${P(0.9, -0.2)} ${P(1, -0.12)} ${P(1, -0.03)} C${P(1, 0.1)} ${P(0.9, 0.19)} ${P(0.74, 0.19)} C${P(0.58, 0.19)} ${P(0.48, 0.17)} ${P(0.36, 0.16)} C${P(0.22, 0.15)} ${P(0.02, 0.16)} ${P(0.02, 0)} Z`;
  const id = `sole${side > 0 ? 'r' : 'l'}${Math.round(len)}`;
  return (
    <g>
      <defs><clipPath id={id}><path d={sole} /></clipPath></defs>
      <path d={sole} fill={color} />
      <g clipPath={`url(#${id})`}>
        <rect x={0.29 * len} y={-0.3 * len} width={0.06 * len} height={0.6 * len} fill={cut} />
        {[0.56, 0.7, 0.84].map((x) => <path key={x} d={`M${P(x, -0.24)} L${P(x + 0.02, 0.24)}`} stroke={cut} strokeWidth={Math.max(1.2, len * 0.016)} />)}
      </g>
    </g>
  );
};

export type Step = {t: number; x: number; y: number; a: number; side: number; len: number; color: string};

const KID_T0 = 143.0, KID_DT = 0.56, KID_STRIDE = 66, KID_X0 = 300;
/** where the child's newest print is at time t, for the camera */
export const kidX = (t: number) => KID_X0 + (KID_STRIDE / KID_DT) * (t - KID_T0);

/** the two tracks; meet = the time the big prints arrive beside the small ones */
export const tracks = (meet: number): Step[] => {
  const R = rng(141);
  const kid: Step[] = Array.from({length: 20}, (_, k) => ({
    t: KID_T0 + KID_DT * k, x: KID_X0 + KID_STRIDE * k + (R() - 0.5) * 8,
    y: 612 + (k % 2 ? 17 : -17) + (R() - 0.5) * 12, a: (R() - 0.5) * 16 + (k % 2 ? 7 : -7), side: k % 2 ? 1 : -1, len: 70, color: C.red,
  }));
  const kMeet = Math.round((meet - KID_T0) / KID_DT), xMeet = KID_X0 + KID_STRIDE * kMeet;
  const big: Step[] = [];
  for (let j = 4; j >= 1; j--) big.push({t: meet - 0.66 * j, x: xMeet - 214 * j, y: 474 + (j % 2 ? -30 : 30), a: (j % 2 ? -5 : 5) + (R() - 0.5) * 3, side: j % 2 ? -1 : 1, len: 124, color: C.ink2});
  // beside her: one step to her two, the same ground covered
  for (let k = kMeet, n = 0; k < 20; k += 2, n++) big.push({t: KID_T0 + KID_DT * k, x: KID_X0 + KID_STRIDE * k - 24, y: 474 + (n % 2 ? -30 : 30), a: (n % 2 ? -5 : 5) + (R() - 0.5) * 3, side: n % 2 ? -1 : 1, len: 124, color: C.ink2});
  return [...big, ...kid];
};

/** a print is pressed: a quick stamp, then it stays */
export const Prints: React.FC<{t: number; steps: Step[]}> = ({t, steps}) => (
  <g filter="url(#papercut)">
    {steps.map((s, i) => {
      const u = (t - s.t) / 0.14;
      if (u < 0) return null;
      const k = 1 + 0.16 * (1 - eout(clamp(u)));
      return (
        <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.a}) scale(${k})`} opacity={clamp(u * 1.6) * 0.92}>
          <g transform={`translate(${-s.len / 2} 0)`}><Print len={s.len} side={s.side} color={s.color} /></g>
        </g>
      );
    })}
  </g>
);

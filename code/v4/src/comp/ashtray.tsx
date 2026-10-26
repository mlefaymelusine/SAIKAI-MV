// W6 (new, 10-24): the same table late at night, seen from above. Ryoshu is only there as her cigarettes: the
// ashtray fills one end at a time while the smoke drifts off across the table like a grey thread; the cracked cup
// stands empty; the window's moonlight slides over the table as the hours go.
import React from 'react';
import {C} from '../theme';
import {clamp, eout, lerp, rng} from '../util';

const PC = 'url(#papercut)';
export const TRAY = {x: 860, y: 470, r: 200};
export const TABLE_NIGHT = '#2c2934';
const RIM = '#77737d', RIM_HI = '#8c8892', BOWL = '#5b5761', FLOOR = '#4c4852', ASH = '#aaa59e';
const LIT_S = 1.3, BUTT_S = 1.35;
const CORK = '#c99b5c', PAPERW = '#f3eee5', EMBER = '#e2622c';
const REST_A = -38;                                        // the notch the lit one lies in (degrees)

/** a stubbed-out end, toe toward +x: cork filter, a little paper, the crushed black end */
const Butt: React.FC<{bend: number; seed: number}> = ({bend, seed}) => {
  const R = rng(seed);
  return (
    <g>
      <rect x={0} y={-7} width={30} height={14} rx={2} fill={CORK} />
      {Array.from({length: 5}, (_, i) => <circle key={i} cx={4 + R() * 22} cy={-4 + R() * 8} r={1.1} fill="#a8783e" />)}
      <g transform={`rotate(${bend} 30 0)`}>
        <rect x={30} y={-6.5} width={13} height={13} fill={PAPERW} />
        <path d={`M43 -6.5 L48 -8 L52 -3 L55 1 L51 5 L47 8 L43 6.5 Z`} fill="#4b474d" />
      </g>
    </g>
  );
};

/** the one lying in the rest, burning: burn 0..1 of its paper gone, ash = how much of that still hangs on */
const Lit: React.FC<{burn: number; ash: number}> = ({burn, ash}) => {
  const L = 150, paper = L * (1 - 0.8 * burn), a = Math.min(ash, L - paper);
  return (
    <g>
      <rect x={0} y={-7.5} width={46} height={15} rx={2} fill={CORK} />
      <rect x={46} y={-7.5} width={paper - 46} height={15} fill={PAPERW} />
      <rect x={paper} y={-7} width={4} height={14} fill={EMBER} />
      <circle cx={paper + 2} cy={0} r={12} fill={EMBER} opacity={0.18} />
      {a > 0 && <g>
        <rect x={paper + 4} y={-7.2} width={a} height={14.4} rx={3} fill={ASH} />
        {Array.from({length: Math.floor(a / 7)}, (_, i) => <path key={i} d={`M${paper + 8 + i * 7} -7 l1.5 14`} stroke="#8a857e" strokeWidth={1} />)}
      </g>}
    </g>
  );
};

/** where the burning end is, in table coordinates, for the smoke */
export const emberAt = (burn: number): [number, number] => {
  const L = 150, paper = L * (1 - 0.8 * burn), a = (REST_A * Math.PI) / 180, r0 = TRAY.r + 40;
  // the cigarette lies along the radius at angle a, filter outside: its x runs from r0 inward
  const d = r0 - (paper + 2) * LIT_S;
  return [TRAY.x + Math.cos(a) * d, TRAY.y + Math.sin(a) * d];
};

const BUTTS = (() => {
  const R = rng(196);
  return Array.from({length: 24}, (_, i) => {
    const ang = R() * Math.PI * 2, rad = 20 + Math.sqrt(R()) * 74;
    return {x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, a: R() * 360, bend: (R() - 0.5) * 50, seed: 300 + i};
  });
})();
const SPECKS = (() => {
  const R = rng(197);
  return Array.from({length: 90}, () => { const ang = R() * Math.PI * 2, rad = Math.sqrt(R()) * 124; return {x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, r: 1 + R() * 2.4}; });
})();

/** the ashtray; drops = the times the ends come into it (those before t are lying there); settle = seconds an end
 *  takes to fade in and settle (0 = the old quick drop) */
export const Ashtray: React.FC<{t: number; drops: number[]; burn: number; ash: number; litOn: number; settle?: number}> = ({t, drops, burn, ash, litOn, settle = 0}) => {
  const landed = drops.filter((d) => d <= t).length;
  return (
    <g transform={`translate(${TRAY.x} ${TRAY.y})`}>
      <g filter={PC}>
        <circle r={TRAY.r} fill={RIM} />
        <circle r={TRAY.r - 5} fill="none" stroke={RIM_HI} strokeWidth={5} />
        {[REST_A, REST_A + 120, REST_A + 240].map((a) => <rect key={a} x={TRAY.r - 54} y={-15} width={56} height={30} rx={8} fill={BOWL} transform={`rotate(${a})`} />)}
        <circle r={TRAY.r - 48} fill={BOWL} />
        <circle r={TRAY.r - 72} fill={FLOOR} />
      </g>
      {SPECKS.slice(0, 20 + landed * 3).map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={ASH} opacity={0.55} />)}
      <g filter={PC}>
        {BUTTS.slice(0, landed).map((b, i) => {
          const u = clamp((t - drops[i]) / (settle || 0.18));
          const k = lerp(settle ? 1.06 : 1.35, 1, eout(u));
          return <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.a}) scale(${k * BUTT_S})`} opacity={settle ? eout(u) : clamp(u * 3)}><g transform="translate(-27 0)"><Butt bend={b.bend} seed={b.seed} /></g></g>;
        })}
        {litOn > 0 && <g transform={`rotate(${REST_A}) translate(${TRAY.r + 40} 0) scale(${-LIT_S} ${LIT_S})`} opacity={litOn}><Lit burn={burn} ash={ash} /></g>}
      </g>
    </g>
  );
};

/** smoke off the ember: a few grey strands, each point carried off by the air from when it left the ember */
export const Smoke: React.FC<{t: number; from: [number, number]; on: number}> = ({t, from, on}) => (
  <g opacity={on}>
    {[0, 1, 2].map((k) => {
      let d = '';
      for (let i = 0; i <= 90; i++) {
        const age = i * 0.06, te = t - age;
        const x = from[0] - age * (70 + k * 14) + 26 * Math.sin(age * 1.3 + te * 0.7 + k * 2) * Math.min(1, age);
        const y = from[1] - age * (54 - k * 10) + 34 * Math.sin(age * 0.9 - te * 0.5 + k) * Math.min(1, age * 0.7);
        d += `${i ? ' L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      return <path key={k} d={d} stroke="#c9c3cf" strokeWidth={2.2 - k * 0.5} fill="none" opacity={0.75 - k * 0.2} strokeLinecap="round" />;
    })}
  </g>
);

/** the table from above: grain, the moonlight off the window (slide 0..1 over the hours), the empty cracked glass,
 *  an empty pack */
export const NightTable: React.FC<{slide: number}> = ({slide}) => {
  const dx = lerp(240, -260, slide);
  return (
    <g>
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M-100 ${40 + i * 80 + (i % 3) * 9} C500 ${30 + i * 80} 1300 ${60 + i * 80} 2100 ${44 + i * 80}`} stroke="#4a4654" strokeWidth={1.4} fill="none" opacity={0.6} />)}
      <g transform={`translate(${dx} 0)`} opacity={0.2}>
        <path d="M980 -60 L1700 -60 L1520 760 L800 760 Z" fill="#c8c0e4" />
        <path d="M1340 -60 L1160 760 M890 350 L1610 350" stroke={TABLE_NIGHT} strokeWidth={22} />
      </g>
      {/* the glass from W5 seen from above (user 10-24: the cup there is a glass now): the rim, the smaller heavy
          bottom inside it, the crack, empty; a dried ring on the table where it ran out */}
      <ellipse cx={1590} cy={372} rx={150} ry={64} fill="none" stroke="#8fa3b5" strokeWidth={3} opacity={0.28} />
      <g transform="translate(1440 320)">
        <circle r={112} fill="#dfe8ee" opacity={0.08} />
        <circle r={93} fill="#dfe8ee" opacity={0.1} />
        <circle r={93} fill="none" stroke="#c9d6df" strokeWidth={2.4} opacity={0.55} />
        <circle r={78} fill="none" stroke="#c9d6df" strokeWidth={1.4} opacity={0.35} />
        <circle r={112} fill="none" stroke="#e8eef2" strokeWidth={5} opacity={0.8} />
        <path d="M-78 -44 A90 90 0 0 1 -30 -86" stroke={C.white} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
        <path d="M78 46 L92 36 L84 22 L100 12 L94 0" stroke={C.ink} strokeWidth={2.6} fill="none" opacity={0.85} />
      </g>
      {/* an empty pack, crushed */}
      <g transform="translate(470 720) rotate(-18)" filter={PC}>
        <path d="M-70 -46 L66 -40 L74 44 L-64 50 Z" fill={C.red} />
        <path d="M-70 -46 L66 -40 L64 -16 L-68 -20 Z" fill={C.white} />
        <path d="M-20 -30 L10 6 L-6 40" stroke={C.redDark} strokeWidth={3} fill="none" opacity={0.6} />
      </g>
    </g>
  );
};

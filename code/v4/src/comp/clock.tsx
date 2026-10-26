// W3 (user 10-24, 3rd look: the dragon's-beard candy was unclear for "you'd rather spend our limited time together",
// and too fast). A cut-paper wall clock: the hour hand is a slim indigo hand (4th look: not the sword), the minute
// hand is the red thread, tied round the centre pin with it. The thread comes slowly round; on "together" it lies
// along the indigo hand for a moment, then goes on. The dial (user: make something of it): white hydrangea florets
// (Araya's flower, W4's) stand at the hours as shut buds; each one the thread passes opens, and the dial behind the
// thread's sweep takes a warm light, the time spent. The four it opens fall on rather / spend / limited / together;
// nothing opens after they meet.
import React from 'react';
import {C} from '../theme';
import {LooseFloret} from './belljar';

export const CLOCK_R = 372;

const Face: React.FC = () => (
  <g>
    <circle r={CLOCK_R + 22} fill={C.paper2} filter="url(#clockShadow)" />
    <circle r={CLOCK_R} fill={C.ink2} />
    <circle r={CLOCK_R - 10} fill="none" stroke="#3a3341" strokeWidth={3} />
    {Array.from({length: 60}, (_, i) => {
      const big = i % 5 === 0;
      return <rect key={i} x={big ? -5 : -1.6} y={-(CLOCK_R - 24)} width={big ? 10 : 3.2} height={big ? 34 : 12} fill={big ? C.paper : C.paper2} opacity={big ? 0.95 : 0.6} transform={`rotate(${i * 6})`} />;
    })}
  </g>
);

/** the hour hand (user 10-24, 4th look: no sword, an indigo hand): a slim indigo hand, Araya's colour, with an open
 *  ring near the tip and a small counterweight behind the pin, pointing up at 0 deg. */
const INDIGO = '#3a4597', INDIGO_LT = '#6470c8';
const Hand: React.FC = () => (
  <g filter="url(#clockShadow)">
    <path d="M-7 8 L-4 -172 L4 -172 L7 8 Z" fill={INDIGO} />
    <path d="M-5 50 L-4.5 8 L4.5 8 L5 50 Z" fill={INDIGO} />
    <path d="M0 -188 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 Z M0 -188 m-9 0 a9 9 0 1 1 18 0 a9 9 0 1 1 -18 0 Z" fill={INDIGO} fillRule="evenodd" />
    <path d="M-7 -201 L0 -246 L7 -201 Z" fill={INDIGO} />
    <circle cy={56} r={12} fill={INDIGO} />
    <path d="M-3.5 0 L-2 -168 M-2.5 -214 L0 -240" stroke={INDIGO_LT} strokeWidth={1.6} opacity={0.8} strokeLinecap="round" />
  </g>
);

/** the minute hand: the red thread, from the pin out past the sheath's tip, pointing up at 0 deg */
const Thread: React.FC<{t: number; len?: number}> = ({t, len = 330}) => {
  const sag = 5 * Math.sin(t * 0.9);
  const d = `M0 -14 C${sag} ${-len * 0.35} ${-sag} ${-len * 0.7} 0 ${-len}`;
  return (
    <g>
      <path d={d} stroke="#28040c" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={d} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M0 ${-len} l-5 -12 M0 ${-len} l4 -13`} stroke={C.red} strokeWidth={2.4} fill="none" />
    </g>
  );
};

/** a white hydrangea floret at an hour: a shut grey bud that opens white. o 0..1 */
const HourFloret: React.FC<{o: number; r: number}> = ({o, r}) => (
  <g>
    {o < 1 && <g opacity={1 - o} transform={`rotate(${45 - 30 * o}) scale(${0.42 + 0.3 * o})`}><LooseFloret r={r} color="#5d5566" /></g>}
    {o > 0 && <g opacity={Math.min(1, o * 1.6)} transform={`rotate(${30 * (1 - o)}) scale(${0.5 + 0.5 * o})`}><LooseFloret r={r} color={C.white} /></g>}
  </g>
);
const HOUR_R = 296;
const HOUR_A = Array.from({length: 12}, (_, k) => (k * 30 > 180 ? k * 30 - 360 : k * 30));   // -150..180, as the hands run
const pt = (a: number, r: number) => `${(r * Math.sin((a * Math.PI) / 180)).toFixed(2)} ${(-r * Math.cos((a * Math.PI) / 180)).toFixed(2)}`;

/** hour/minute in degrees clockwise from 12 (continuous, not wrapped); from: the minute hand's angle when the shot
 *  began (the sweep and the florets count from there); last: the last hour that opens, the one the two hands meet on
 *  (user 10-24: the 1 o'clock the thread goes on to stays a bud); meet 0..1 (the warm light while they lie together) */
export const WallClock: React.FC<{t: number; hour: number; minute: number; from: number; last: number; meet: number}> = ({t, hour, minute, from, last, meet}) => {
  const span = minute - from, R = CLOCK_R - 11;
  return (
    <g>
      <defs>
        <filter id="clockShadow" x="-50%" y="-20%" width="200%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="3.5" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <radialGradient id="clockGlow">
          <stop offset="0" stopColor="#ffd9b8" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffd9b8" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="clockSpent" cx="0" cy="0" r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2d3b0" stopOpacity={0.2} />
          <stop offset="1" stopColor="#f2d3b0" stopOpacity={0.07} />
        </radialGradient>
      </defs>
      <Face />
      {span > 0.3 && <path d={`M0 0 L${pt(from, R)} A${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${pt(minute, R)} Z`} fill="url(#clockSpent)" />}
      {HOUR_A.map((a, k) => {
        const o = a > from && a <= last ? Math.min(1, Math.max(0, (minute - a + 4) / 10)) : 0;
        const e = 1 - (1 - o) ** 3;
        return <g key={k} transform={`translate(${pt(a, HOUR_R)}) rotate(${a})`}><HourFloret o={e} r={33} /></g>;
      })}
      {meet > 0 && <circle r={CLOCK_R * 0.8} fill="url(#clockGlow)" opacity={meet} />}
      <g transform={`rotate(${hour})`}><Hand /></g>
      <g transform={`rotate(${minute})`}><Thread t={t} /></g>
      {/* the pin, the thread wound round it and the hand together: the two are tied */}
      <circle r={20} fill="#28040c" />
      <circle r={17} fill={C.red} />
      {[13, 9, 5].map((r) => <circle key={r} r={r} fill="none" stroke={C.redDark} strokeWidth={1.6} />)}
      <circle r={3.5} fill={C.paper} />
    </g>
  );
};

/** the minute hand's lead over the hour hand (deg) at time t: slow all the way, slower still as it arrives, lingering
 *  along the sheath, then going on. 0 at `meet`. */
export function clockGap(t: number, t0: number, meet: number, leave: number): number {
  const v = (x: number) => {
    if (x < meet - 2.36) return 14;
    if (x < meet) { const u = (x - (meet - 2.36)) / 2.36; return 1.2 + (14 - 1.2) * (0.5 + 0.5 * Math.cos(Math.PI * u)); }
    if (x < leave) return 1.2;
    if (x < leave + 1) { const u = x - leave; return 1.2 + (10 - 1.2) * (0.5 - 0.5 * Math.cos(Math.PI * u)); }
    return 10;
  };
  const a = Math.min(t, meet), b = Math.max(t, meet), n = 400, h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += v(a + (i + 0.5) * h) * h;
  return t < meet ? -s : s;
}

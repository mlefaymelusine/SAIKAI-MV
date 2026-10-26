// W4 (new, 10-24): the white hydrangea under a glass bell jar on a stand, at night, in the rain. The rain runs off
// the glass and never reaches it; under the glass it goes dull and nods, and on "enough" a floret falls.
import React from 'react';
import {C} from '../theme';
import {clamp, rng} from '../util';

export const JAR = {cx: 960, top: 170, base: 836, R: 312};
const {cx, top, base, R} = JAR;
const shoulder = top + R;
export const JAR_PATH = `M${cx - R} ${base} L${cx - R} ${shoulder} A${R} ${R} 0 0 1 ${cx + R} ${shoulder} L${cx + R} ${base}`;
const GLASS = 'rgba(236,232,244,0.05)', EDGE = 'rgba(236,232,244,0.6)';

/** a point on the glass, s 0..1 from the top of the dome down one side (dir -1 left, 1 right) to the stand */
const onGlass = (s: number, dir: number): [number, number] => {
  const arc = (Math.PI / 2) * R, side = base - shoulder, L = arc + side, d = s * L;
  if (d < arc) { const th = d / R; return [cx + dir * Math.sin(th) * R, shoulder - Math.cos(th) * R]; }
  return [cx + dir * R, shoulder + (d - arc)];
};

/** the stand under the jar */
export const Stand: React.FC = () => (
  <g filter="url(#papercut)">
    <path d={`M${cx - R - 56} ${base} L${cx + R + 56} ${base} L${cx + R + 44} ${base + 50} L${cx - R - 44} ${base + 50} Z`} fill="#3b2d2a" />
    <ellipse cx={cx} cy={base} rx={R + 56} ry={22} fill="#4a3934" />
    <ellipse cx={cx} cy={base} rx={R + 6} ry={13} fill="#2e2321" />
  </g>
);

/** the glass, drawn over what is inside it */
export const Jar: React.FC = () => (
  <g>
    <path d={`${JAR_PATH} Z`} fill={GLASS} />
    <path d={JAR_PATH} stroke={EDGE} strokeWidth={3.2} fill="none" />
    <ellipse cx={cx} cy={base} rx={R} ry={12} stroke={EDGE} strokeWidth={2} fill="none" opacity={0.6} />
    {/* the knob, and the light along the glass */}
    <path d={`M${cx - 18} ${top + 2} Q${cx - 20} ${top - 26} ${cx} ${top - 30} Q${cx + 20} ${top - 26} ${cx + 18} ${top + 2}`} stroke={EDGE} strokeWidth={3} fill={GLASS} />
    <path d={`M${cx - R + 34} ${base - 40} L${cx - R + 34} ${shoulder} A${R - 34} ${R - 34} 0 0 1 ${cx - 120} ${top + 52}`} stroke="rgba(255,255,255,0.22)" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d={`M${cx + R - 30} ${shoulder + 40} L${cx + R - 30} ${base - 120}`} stroke="rgba(255,255,255,0.12)" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const RAIN = (() => {
  const r = rng(171);
  return Array.from({length: 150}, () => ({x: r() * 2400 - 240, ph: r(), v: 1700 + r() * 500, len: 34 + r() * 30, o: 0.18 + r() * 0.3}));
})();
const BEADS = (() => {
  const r = rng(172);
  return Array.from({length: 26}, () => ({s0: r() * 0.35, t0: r() * 6, dur: 1.6 + r() * 1.8, dir: r() < 0.5 ? -1 : 1, size: 3 + r() * 3}));
})();
const RINGS = (() => {
  const r = rng(173);
  return Array.from({length: 40}, () => ({x: r() * 2100 - 90, y: base + 64 + r() * 200, ph: r() * 0.9}));
})();

/** rain outside the glass (clipped off it), beads that run down the glass, rings on the wet ground */
export const Rain: React.FC<{t: number; dx?: number}> = ({t, dx = 0.14}) => (
  <g>
    <defs>
      <clipPath id="outsideJar"><path clipRule="evenodd" d={`M-400 -400 H2400 V1500 H-400 Z ${JAR_PATH} Z`} /></clipPath>
    </defs>
    <g clipPath="url(#outsideJar)">
      {RAIN.map((d, i) => {
        const span = 1400, y = ((t * d.v + d.ph * span) % span) - 120;
        return <path key={i} d={`M${d.x + y * dx} ${y} l${d.len * dx} ${d.len}`} stroke={C.paper} strokeWidth={1.6} opacity={d.o} />;
      })}
    </g>
    {BEADS.map((b, i) => {
      const cyc = (t + b.t0) % (b.dur + 0.6);
      const u = cyc / b.dur;
      if (u > 1) return null;
      const s = b.s0 + (1 - b.s0) * u * u;
      const [x, y] = onGlass(s, b.dir), [x0, y0] = onGlass(Math.max(b.s0, s - 0.05), b.dir);
      return (
        <g key={i} opacity={0.75 * clamp(u * 6) * clamp((1 - u) * 8)}>
          <path d={`M${x0} ${y0} L${x} ${y}`} stroke={C.paper} strokeWidth={b.size * 0.5} opacity={0.4} strokeLinecap="round" />
          <circle cx={x} cy={y} r={b.size} fill={C.paper} opacity={0.8} />
        </g>
      );
    })}
    {RINGS.map((g, i) => {
      const u = ((t * 1.1 + g.ph) % 1);
      return <ellipse key={i} cx={g.x} cy={g.y} rx={6 + u * 40} ry={2 + u * 8} stroke={C.paper} strokeWidth={1.4} fill="none" opacity={0.35 * (1 - u)} />;
    })}
  </g>
);

/** one floret that has come off, as the hydrangea draws them */
export const LooseFloret: React.FC<{r: number; color: string}> = ({r, color}) => (
  <g>
    {[0, 90, 180, 270].map((a) => <ellipse key={a} cx={r * 0.44} cy={0} rx={r * 0.46} ry={r * 0.3} transform={`rotate(${a})`} fill={color} />)}
    <circle r={r * 0.12} fill={C.paperShade} />
  </g>
);

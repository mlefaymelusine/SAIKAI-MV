// The v4 cut-paper objects. Flat colour, one cut edge, a soft paper shadow; each drawn around (0,0).
// Rule (brief §二.7): the first frame of each is one clean silhouette you can name without a caption.
import React from 'react';
import {C, F} from '../theme';
import {clamp, eio, lerp, rng} from '../util';

const PC = 'url(#papercut)';

/* ---------- the ball of red yarn (prologue, played back in C4) ---------- */
/** wind 0..1: the winding arcs are laid one after another, the red ball fills in under them */
export const YarnBall: React.FC<{r?: number; wind?: number; line?: string}> = ({r = 150, wind = 1, line = C.paper}) => {
  // user 10-24: the white lines denser, wound like the 3D ball (P2): many thin turns in a few crossing bands
  const arcs = 30;
  const R = rng(5);
  const fill = clamp(wind * 1.6);
  return (
    <g filter={PC}>
      <circle r={r * lerp(0.35, 1, eio(fill))} fill={C.red} />
      {Array.from({length: arcs}, (_, i) => {
        const a = (i % 5) * 36 + (R() - 0.5) * 22, ry = r * (0.14 + R() * 0.84);
        const k = clamp(wind * arcs * 1.05 - i);
        return (
          <g key={i} transform={`rotate(${a})`}>
            <ellipse rx={r * 0.97} ry={ry} fill="none" stroke={line} strokeWidth={1.4} opacity={0.7} pathLength={1} strokeDasharray={`${k} 1.0001`} clipPath="url(#ballclip)" />
          </g>
        );
      })}
      <defs><clipPath id="ballclip"><circle r={r * 0.98} /></clipPath></defs>
    </g>
  );
};

/* ---------- kawara-nadeshiko: five flat red petals, a few notches cut in each ---------- */
const PETAL = (() => {
  // claw at the centre, fan opening outward; the outer edge has five shallow V notches
  const pts: string[] = ['M0 -6', 'C34 -10 66 -36 90 -56'];
  const n = 4;
  for (let i = 0; i <= n; i++) {
    const a = lerp(-0.5, 0.5, i / n);
    const ro = 152, ri = 118;
    const x = Math.cos(a) * ro, y = Math.sin(a) * ro;
    pts.push(`L${x.toFixed(1)} ${y.toFixed(1)}`);
    if (i < n) {
      const am = lerp(-0.5, 0.5, (i + 0.5) / n);
      pts.push(`L${(Math.cos(am) * ri).toFixed(1)} ${(Math.sin(am) * ri).toFixed(1)}`);
    }
  }
  pts.push('L90 56', 'C66 36 34 10 0 6 Z');
  return pts.join(' ');
})();
/** open 0..1: the petals unfold one by one from the centre, each over about a third of the range (10-25, after the
 *  full film: they opened too quickly) */
export const Nadeshiko: React.FC<{open: number; s?: number}> = ({open, s = 1}) => (
  <g filter={PC} transform={`scale(${s})`}>
    {Array.from({length: 5}, (_, i) => {
      const k = eio(clamp(open * 3.4 - i * 0.6));
      const a = -90 + i * 72 + (1 - k) * -26;
      return (
        <g key={i} transform={`rotate(${a}) scale(${lerp(0.15, 1, k)} ${lerp(0.05, 1, k)})`} opacity={clamp(k * 4)}>
          <path d={PETAL} fill={C.red} />
          <path d="M18 0 Q60 0 92 0" stroke={C.redDark} strokeWidth={3} opacity={0.55} />
        </g>
      );
    })}
    <circle r={22 * clamp(open * 3)} fill={C.redDark} />
    <circle r={9 * clamp(open * 3)} fill={C.paper} />
  </g>
);

/* ---------- a tako-wiener (Japanese octopus sausage), after the user's reference: a round dome, the skirt cut into
   legs whose ends curl outward and show the paler cut face; no face drawn ---------- */
const SAUSAGE = '#d0625b', SAUSAGE_DK = '#b34c47', CUT = '#f2b9a8';
// [root x, angle (0 = straight down, + = out to the right), length, behind]
const TAKO_LEGS: [number, number, number, boolean][] = [
  [-30, -74, 30, true], [30, 74, 30, true], [-12, -30, 30, true], [12, 30, 30, true],
  [-38, -58, 34, false], [38, 58, 34, false], [-18, -20, 37, false], [18, 20, 37, false], [0, 5, 36, false],
];
const TakoLeg: React.FC<{l: [number, number, number, boolean]}> = ({l: [x, a, L, back]}) => {
  const w = 11, sg = a >= 0 ? 1 : -1;
  return (
    <g transform={`translate(${x} 10) rotate(${-a})`}>
      <path d={`M${-w} 0 C${-w - 1} ${L * 0.5} ${-w + 2} ${L * 0.85} ${sg * 2} ${L} C${w - 2} ${L * 0.85} ${w + 1} ${L * 0.5} ${w} 0 Z`} fill={back ? SAUSAGE_DK : SAUSAGE} />
      {/* the end rolls back on itself and shows the pale cut face */}
      <path d={`M${-w + 1} ${L - 7} C${-w + 2} ${L + 4} ${w - 2} ${L + 4} ${w - 1} ${L - 7} C${w * 0.4} ${L - 2} ${-w * 0.4} ${L - 2} ${-w + 1} ${L - 7} Z`} fill={CUT}
        transform={`translate(0 -1) rotate(${sg * (Math.abs(a) > 40 ? 34 : 14)} 0 ${L - 4})`} />
    </g>
  );
};
export const TakoWiener: React.FC = () => (
  <g>
    {TAKO_LEGS.filter((l) => l[3]).map((l, i) => <TakoLeg key={i} l={l} />)}
    <path d="M-31 -18 C-34 -52 -19 -72 0 -72 C19 -72 34 -52 31 -18 C31 -4 35 6 44 14 C22 21 -22 21 -44 14 C-35 6 -31 -4 -31 -18 Z" fill={SAUSAGE} />
    {TAKO_LEGS.filter((l) => !l[3]).map((l, i) => <TakoLeg key={i} l={l} />)}
    {[-27, -9, 9, 27].map((x) => <path key={x} d={`M${x} 10 Q${x * 1.08} 26 ${x * 1.15} 36`} stroke={SAUSAGE_DK} strokeWidth={2} fill="none" strokeLinecap="round" />)}
    <ellipse cx={-14} cy={-50} rx={7} ry={12} transform="rotate(24 -14 -50)" fill="#fff4ee" opacity={0.6} />
  </g>
);

/* ---------- bento: a black box, rice, an umeboshi, a crooked octopus sausage ---------- */
export const Bento: React.FC = () => (
  <g filter={PC}>
    <rect x={-230} y={-150} width={460} height={300} rx={26} fill={C.ink} />
    <rect x={-210} y={-130} width={420} height={260} rx={16} fill={C.ink2} stroke={C.red} strokeWidth={4} />
    <rect x={-200} y={-120} width={210} height={240} rx={10} fill={C.white} />
    <circle cx={-95} cy={0} r={24} fill={C.red} />
    <rect x={10} y={-120} width={8} height={240} fill={C.ink} />
    {/* tamagoyaki */}
    <rect x={40} y={60} width={140} height={52} rx={8} fill={C.paper2} />
    <path d="M86 60 L86 112 M134 60 L134 112" stroke={C.ink2} strokeWidth={3} />
    {/* the octopus sausage, cut a little crooked */}
    <g transform="translate(108 -14) rotate(-12) scale(0.95)"><TakoWiener /></g>
  </g>
);

/* ---------- the red randoseru (front), with a name tag ---------- */
/** name: the crooked name written on the tag (outro); empty tag otherwise */
export const Randoseru: React.FC<{name?: string; s?: number; grey?: boolean}> = ({name, s = 1, grey}) => {
  const body = grey ? C.grey : C.red, dark = grey ? '#6d6862' : C.redDark;
  return (
    <g filter={PC} transform={`scale(${s})`}>
      <path d="M-86 -150 Q-96 -196 -50 -200 M86 -150 Q96 -196 50 -200" stroke={dark} strokeWidth={16} fill="none" strokeLinecap="round" />
      <rect x={-130} y={-170} width={260} height={300} rx={40} fill={body} />
      <path d="M-130 -110 Q-130 -176 -66 -176 L66 -176 Q130 -176 130 -110 L130 56 Q130 84 102 84 L-102 84 Q-130 84 -130 56 Z" fill={dark} />
      <rect x={-18} y={64} width={36} height={52} rx={6} fill={C.paper2} />
      <rect x={-11} y={74} width={22} height={26} rx={3} fill={dark} />
      {/* name tag hanging at the side */}
      <g transform="translate(96 -40) rotate(8)">
        <line x1={0} y1={-26} x2={0} y2={0} stroke={C.ink2} strokeWidth={2} />
        <rect x={-34} y={0} width={68} height={92} rx={6} fill={C.white} stroke={C.ink2} strokeWidth={2} />
        {name && [...name].map((ch, i) => (
          <text key={i} x={-2 + (i % 2 ? 4 : -3)} y={30 + i * 26} fontFamily={F.brush} fontSize={25} fill={C.ink} textAnchor="middle" transform={`rotate(${[-9, 7, -4][i % 3]} ${-2} ${22 + i * 26})`}>{ch}</text>
        ))}
      </g>
    </g>
  );
};

/* ---------- a white hydrangea (Araya: "it looks like me") ---------- */
export const FLORETS = (() => {
  const R = rng(23);
  const out: {x: number; y: number; r: number; a: number; tone: number}[] = [];
  for (let i = 0; i < 64; i++) {
    const ang = R() * Math.PI * 2, rad = Math.sqrt(R()) * 180;
    out.push({x: Math.cos(ang) * rad * 1.08, y: Math.sin(ang) * rad * 0.86 - 10, r: 30 + R() * 10, a: R() * 90, tone: R()});
  }
  return out.sort((p, q) => p.y - q.y);
})();
/** grow 0..1: florets open from the centre outward; reds: indices that a drop of blood has reached */
/** a hydrangea leaf in its own frame: base at the origin, pointing along +x; broad ovate with a drawn-out tip,
 *  a toothed margin, a midrib and paired veins. bend curls it (positive = towards +y). */
const leafShape = (len: number, wid: number, bend: number, seed: number) => {
  const R = rng(seed);
  const N = 34, half = (t: number) => wid * Math.pow(t, 0.55) * Math.pow(1 - t, 0.85) * 1.9;
  const at = (t: number, v: number) => [t * len, v + bend * t * t * len];
  const side = (sg: number) => Array.from({length: N + 1}, (_, i) => {
    const t = i / N, tooth = t > 0.12 && t < 0.94 && i % 2 === 1 ? 4 + R() * 2.5 : 0;
    const q = at(t, sg * (half(t) + tooth)); return `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  });
  const top = side(-1), bot = side(1).reverse();
  const outline = `M${top.join(' L')} L${bot.join(' L')} Z`;
  const upper = `M${top.join(' L')} L${Array.from({length: N + 1}, (_, i) => { const q = at(1 - i / N, 0); return `${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }).join(' L')} Z`;
  const mid = at(0.5, 0), tip = at(0.97, 0);
  const rib = `M0 0 Q${mid[0].toFixed(1)} ${mid[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`;
  const veins = [0.2, 0.33, 0.46, 0.59, 0.72].flatMap((t) => [-1, 1].map((sg) => {
    const a = at(t, 0), b = at(Math.min(0.97, t + 0.17), sg * half(t + 0.1) * 0.82);
    const c = at(t + 0.07, sg * half(t) * 0.4);
    return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }));
  return {outline, upper, rib, veins};
};
// user 10-24 (the purple hydrangea CG, as reference): the leaves were too dark and stuck out at odd angles. Now
// broad, toothed, a warm yellow-green as if the light were on them, in two opposite pairs under the head.
const LEAVES = [                                  // [base x, base y, angle deg, length, width, bend, shade]
  [-12, 150, 166, 250, 92, -0.12, 0],             // the upper pair, out to either side and a little down
  [12, 150, 14, 245, 90, 0.12, 0],
  [-6, 182, 126, 175, 74, -0.05, 0.35],           // the lower pair, turned toward us, so shorter
  [6, 182, 56, 170, 72, 0.06, 0.35],
].map(([x, y, a, l, w, b, sh], i) => ({x, y, a, l, sh, ...leafShape(l, w, b, 40 + i)}));
const LEAF_BASE = '#6d7c30', LEAF_MID = '#97a443', LEAF_TIP = '#bdb85a', LEAF_SH = '#4f5c24', VEIN = '#d6d28a', STEM = '#5e6b2a';
const WILT_LEAF = '#7a6538', WILT_FLO = '#b4a689';
/** grow: the old one-knob opening (florets from the centre out, leaves fade in). For a growing plant (R2):
 *  stem 0..1 draws the stem up from the ground, leaves 0..1 unfolds the lower pair then the upper, open[i]
 *  overrides each floret's opening. wilt 0..1 (W4): the leaves hang and brown, the head nods and goes dull. */
export const Hydrangea: React.FC<{grow: number; red?: number[]; redK?: number[]; stem?: number; leaves?: number; open?: number[]; wilt?: number; lod?: number; plain?: boolean}> = ({grow, red = [], redK = [], stem = 1, leaves, open, wilt = 0, lod = 1, plain}) => (
  <g filter={plain ? undefined : PC}>
    <defs>
      {LEAVES.map((l, i) => (
        <linearGradient key={i} id={`hleaf${i}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={l.l} y2={0}>
          <stop offset="0" stopColor={LEAF_BASE} /><stop offset="0.55" stopColor={LEAF_MID} /><stop offset="1" stopColor={LEAF_TIP} />
        </linearGradient>
      ))}
    </defs>
    {stem > 0 && <path d="M-8 330 Q-2 230 -4 150" stroke={STEM} strokeWidth={9} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={stem < 1 ? `${stem} 1.0001` : undefined} />}
    {LEAVES.map((l, i) => {
      const k = leaves === undefined ? 1 : eio(clamp(leaves * 2.2 - [0.75, 0.9, 0, 0.15][i]));
      if (k <= 0) return null;
      const a = l.a + (l.a > 90 ? -1 : 1) * wilt * 34;
      return (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${a}) scale(${k} ${k * lerp(1, 0.8, wilt)})`} opacity={leaves === undefined ? clamp(grow * 3) : 1}>
          <path d={l.outline} fill={`url(#hleaf${i})`} />
          <path d={l.upper} fill={LEAF_SH} opacity={0.35 + l.sh * 0.5} />
          {wilt > 0 && <path d={l.outline} fill={WILT_LEAF} opacity={wilt * 0.6} />}
          <path d={l.rib} stroke={VEIN} strokeWidth={2.4} fill="none" opacity={0.85 * (1 - wilt * 0.6)} />
          {l.veins.map((v, j) => <path key={j} d={v} stroke={VEIN} strokeWidth={1.3} fill="none" opacity={0.6 * (1 - wilt * 0.6)} />)}
        </g>
      );
    })}
    <g transform={wilt > 0 ? `rotate(${wilt * 16} 0 150) translate(0 ${wilt * 24})` : undefined}>
      {FLORETS.map((f0, i) => {
        // lod 2 / 3 (far heads in the field): every other / every third floret, each a little bigger
        if (lod > 1 && i % lod !== 0) return null;
        const f = lod > 1 ? {...f0, r: f0.r * (lod === 2 ? 1.24 : 1.42)} : f0;
        const order = Math.hypot(f.x, f.y) / 200;
        const k = (open ? eio(clamp(open[i] ?? 0)) : eio(clamp(grow * 1.6 - order * 0.6))) * (1 - 0.18 * wilt);
        if (k <= 0) return null;
        const ri = red.indexOf(i);
        const rk = ri >= 0 ? redK[ri] ?? 1 : 0;
        const base = f.tone < 0.35 ? C.paper2 : C.white;
        return (
          <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.a + wilt * 20}) scale(${k})`}>
            {[0, 90, 180, 270].map((a) => (
              <ellipse key={a} cx={f.r * 0.48} cy={0} rx={f.r * 0.52} ry={f.r * 0.36} transform={`rotate(${a})`} fill={base} />
            ))}
            {wilt > 0 && [0, 90, 180, 270].map((a) => (
              <ellipse key={'w' + a} cx={f.r * 0.44} cy={0} rx={f.r * 0.48 * (1 - wilt * 0.2)} ry={f.r * 0.3 * (1 - wilt * 0.3)} transform={`rotate(${a})`} fill={WILT_FLO} opacity={clamp(wilt * 1.2 - f.tone * 0.3)} />
            ))}
            {rk > 0 && [0, 90, 180, 270].map((a) => (
              <ellipse key={'r' + a} cx={f.r * 0.48} cy={0} rx={f.r * 0.52} ry={f.r * 0.36} transform={`rotate(${a})`} fill={C.red} opacity={rk} />
            ))}
            <circle r={f.r * 0.12} fill={rk > 0.5 ? C.redDark : C.paperShade} />
          </g>
        );
      })}
    </g>
  </g>
);

/** user 10-24 (2nd look): not one hydrangea but a bush, as in the CG. The heads behind the main one, back to front:
 *  [x, y, scale, rotate, flip, how far back (0 = as bright as the main one)] in the main one's own frame */
export const BUSH: [number, number, number, number, number, number][] = [
  [-575, 118, 0.44, -12, 1, 0.64],
  [585, 110, 0.46, 12, -1, 0.64],
  [-360, 70, 0.58, -9, -1, 0.5],
  [350, 60, 0.62, 8, 1, 0.48],
  [-190, -30, 0.78, -5, 1, 0.3],
  [215, -45, 0.76, 6, -1, 0.3],
];
/** the heads of the bush behind the main one, each grown by its own stem/leaves/grow; they recede toward back (the
 *  ground colour) by how far back they stand */
export const HydrangeaBush: React.FC<{heads: {stem?: number; leaves?: number; grow: number}[]; back?: string; id?: string}> = ({heads, back = C.ink, id = 'bush'}) => {
  const rgb = [1, 3, 5].map((o) => parseInt(back.slice(o, o + 2), 16) / 255);
  return (
    <g>
      <defs>
        {BUSH.map(([, , , , , far], i) => (
          <filter key={i} id={`${id}${i}`} colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              {(['R', 'G', 'B'] as const).map((ch, j) => {
                const F = ch === 'R' ? 'feFuncR' : ch === 'G' ? 'feFuncG' : 'feFuncB';
                return React.createElement(F, {key: ch, type: 'linear', slope: 1 - far, intercept: rgb[j] * far});
              })}
            </feComponentTransfer>
          </filter>
        ))}
      </defs>
      {BUSH.map(([x, y, k, r, fl], i) => {
        const h = heads[i];
        if (!h || (h.grow <= 0 && (h.stem ?? 1) <= 0)) return null;
        return (
          <g key={i} filter={`url(#${id}${i})`}>
            <g transform={`translate(${x} ${y}) rotate(${r}) scale(${k * fl} ${k})`}><Hydrangea grow={h.grow} stem={h.stem} leaves={h.leaves} /></g>
          </g>
        );
      })}
    </g>
  );
};

/** the florets in the order they open, the middle first; and when each opens if the first opens at T, then 2, 4 and
 *  16 more, gap seconds apart, and the rest over rest seconds after that */
export const FLORET_ORDER = FLORETS.map((f, i) => [i, Math.hypot(f.x, f.y)] as [number, number]).sort((p, q) => p[1] - q[1]).map(([i]) => i);
export const floretOpenTimes = (T: number, gap: number, rest: number) => {
  const at: number[] = [];
  let n = 0;
  [1, 2, 4, 16].forEach((g, gi) => { for (let k = 0; k < g; k++) at[FLORET_ORDER[n++]] = T + gi * gap + k * 0.03; });
  const left = FLORET_ORDER.length - n;
  for (let k = 0; n < FLORET_ORDER.length; k++) at[FLORET_ORDER[n++]] = T + 4 * gap + (k / left) * rest;
  return at;
};
/** the green buds, set (from t0 over dur, the middle first) before they open; open[i] 0..1 takes each away */
export const Buds: React.FC<{abs: number; open: number[]; t0: number; dur: number}> = ({abs, open, t0, dur}) => (
  <g filter={PC}>
    {FLORET_ORDER.map((i, n) => {
      const k = eio(clamp((abs - t0 - (n / FLORET_ORDER.length) * dur) / 0.4));
      if (k <= 0 || open[i] > 0.6) return null;
      const f = FLORETS[i];
      return <g key={i} opacity={1 - open[i] / 0.6}><circle cx={f.x} cy={f.y} r={f.r * 0.36 * k} fill="#a9b46a" /><circle cx={f.x - 2} cy={f.y - 2} r={f.r * 0.12 * k} fill="#cfd59a" /></g>;
    })}
  </g>
);

/** user 10-25: not a bush but a field of them filling most of the frame (the corners too), on a ground seen from a
 *  little above: rows going back up the frame, smaller and darker the further off. Screen coordinates at the V4 / R2
 *  / R3 framing, where the main head stands at the front in the middle (translate(940 420) scale(0.95), its foot at
 *  y 733). b: where a head's stem meets the ground (draw order); y: the middle of its head; d: how far it is from the
 *  main head (the field opens outward from it). Far rows draw every second or third floret (lod). */
export type FieldHead = {x: number; y: number; b: number; s: number; flip: number; rot: number; row: number; lod: number; d: number; seed: number};
export const FIELD_MAIN = {x: 940, y: 410, b: 733, s: 0.95};
// rows by where they stand [ground y, how dark, gap round the main head]: behind it the field goes back up the frame
// into the dark; beside and in front of it only out at the sides, into the lower corners; a dark clearing round the
// main head, so it stays the one we look at
const FIELD_ROWS: [number, number, number][] = [[230, 0.8, 0], [310, 0.7, 0], [400, 0.58, 250], [500, 0.46, 290], [620, 0.3, 330], [800, 0.16, 430], [980, 0.2, 520], [1180, 0.26, 600], [1480, 0.3, 660]];
const fieldScale = (b: number) => (0.95 * (b + 150)) / 883;
export const FIELD_FAR = FIELD_ROWS.map(([, far]) => far);
export const FIELD: FieldHead[] = (() => {
  const R = rng(57), out: FieldHead[] = [];
  const M = FIELD_MAIN;
  FIELD_ROWS.forEach(([by, , gap], row) => {
    const s0 = fieldScale(by), dx = 380 * s0;
    for (let x = -80 - R() * dx * 0.5; x < 2000; x += dx * (0.85 + R() * 0.3)) {
      if (Math.abs(x - M.x) < gap) continue;
      const b = by + (R() - 0.5) * 60 * s0, s = fieldScale(b) * (0.9 + R() * 0.18);
      const y = b - 300 * s + (b < 560 ? 46 : 0);                                              // a little dark left above the back rows
      if (b < M.b && Math.abs(x - M.x) < 150 && y > M.y - 110) continue;                       // wholly behind the main head
      out.push({x, y, b, s, flip: R() < 0.5 ? -1 : 1, rot: (R() - 0.5) * 24, row, lod: s < 0.55 ? 3 : s < 0.9 ? 2 : 1, d: Math.hypot((x - M.x) / 1.3, y - M.y), seed: R()});
    }
  });
  return out.sort((p, q) => p.b - q.b);
})();
/** the field: part 'back' (behind the main head) or 'front'; each head opens by grow(h) 0..1 (florets from its middle
 *  out, its leaves as a dark mass under it); red(h) the florets a drop has reached; sway (R2) moves them in the air;
 *  lift 0..1 brings the far rows up out of the dark */
export const HydrangeaField: React.FC<{part: 'back' | 'front'; grow: (h: FieldHead) => number; red?: (h: FieldHead) => {red: number[]; redK: number[]} | undefined; t?: number; sway?: number; lift?: number; back?: string; id?: string}> = ({part, grow, red, t = 0, sway = 0, lift = 0, back = C.ink, id = 'field'}) => {
  const rgb = [1, 3, 5].map((o) => parseInt(back.slice(o, o + 2), 16) / 255);
  const heads = FIELD.filter((h) => (part === 'back' ? h.b < FIELD_MAIN.b : h.b >= FIELD_MAIN.b));
  const rows = [...new Set(heads.map((h) => h.row))];
  return (
    <g>
      <defs>
        {rows.map((r) => {
          const far = FIELD_FAR[r] * (1 - 0.45 * lift);
          return (
            <filter key={r} id={`${id}${r}`} colorInterpolationFilters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d" />
              <feDropShadow in="d" dx="3" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.4" result="s" />
              <feComponentTransfer in="s">
                {(['R', 'G', 'B'] as const).map((ch, j) => React.createElement(ch === 'R' ? 'feFuncR' : ch === 'G' ? 'feFuncG' : 'feFuncB', {key: ch, type: 'linear', slope: 1 - far, intercept: rgb[j] * far}))}
              </feComponentTransfer>
            </filter>
          );
        })}
      </defs>
      {rows.map((r) => (
        <g key={r} filter={`url(#${id}${r})`}>
          {heads.filter((h) => h.row === r).map((h, i) => {
            const g = grow(h);
            if (g <= 0) return null;
            const k = 0.55 + 0.45 * eio(clamp(g * 1.6));
            const sw = sway * (Math.sin(t * 0.9 + h.x * 0.004 + h.seed * 6) * 1.6 + Math.sin(t * 0.37 + h.seed * 9) * 1.0);
            const rd = red?.(h);
            return (
              <g key={i} transform={`rotate(${sw} ${h.x} ${h.b}) translate(${h.x} ${h.y}) rotate(${h.rot}) scale(${h.s * k * h.flip} ${h.s * k})`}>
                {/* far off, its leaves only a dark mass under the head; nearer, the leaves themselves */}
                {h.lod === 3 && <ellipse cx={0} cy={110} rx={150} ry={70} fill={LEAF_SH} opacity={0.8 * clamp((g - 0.35) * 2)} />}
                <Hydrangea grow={g} stem={0} leaves={h.lod === 3 ? 0 : clamp((g - 0.3) * 1.6)} lod={h.lod} plain red={rd?.red} redK={rd?.redK} />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

/* ---------- the five fathers as five things ---------- */
export const Ticket: React.FC<{grey?: boolean}> = ({grey}) => (
  <g filter={PC}>
    <path d="M-120 -60 L120 -60 L120 -16 A16 16 0 0 0 120 16 L120 60 L-120 60 L-120 16 A16 16 0 0 0 -120 -16 Z" fill={grey ? C.grey : C.gold} />
    <path d="M52 -52 L52 52" stroke={grey ? '#6d6862' : '#8e7330'} strokeWidth={3} strokeDasharray="6 7" />
    <text x={-30} y={18} fontFamily={F.sc} fontWeight={500} fontSize={54} textAnchor="middle" fill={grey ? '#6d6862' : '#7a5f22'}>券</text>
    <circle cx={86} cy={0} r={14} fill="none" stroke={grey ? '#6d6862' : '#8e7330'} strokeWidth={3} />
  </g>
);
/** Rien's picture book, closed; nicked: the top-right corner has been cut away. The cover (user 10-24: the spiral
 *  meant nothing): the book they never finished, the race of the monkey and the frog (lore: 「猴蛙赛跑的结果」,
 *  「这只猴子的眼睛到底长什么样」), for ages 3 to 8; the bookmark ribbon keeps their place. */
const MOLE = '#2f2a2e', MOLE_PINK = '#e9a7a4', POO = '#8a5a2e', SOIL = '#7a5a40';
/** which cover the book has (user 10-25): 'mole' everywhere it is first seen (I2, B1, R1); 'bough' (3rd look) her
 *  randoseru with the Golden Bough in it, for when it closes at the end (O2, the Blender texture only); 'emblem' (the
 *  sign of the House of Spiders, our own drawing of it) had that place before; 'spider' was the other proposal */
export type BookCover = 'mole' | 'spider' | 'emblem' | 'bough';
export const BOOK_COVER: BookCover = 'mole';
const EMBLEM_BG = '#1b1520';
/** the House of Spiders sign, redrawn: a ring of twisted rope behind four wings of web, a needle through, a knot of
 *  white crescents at the heart. Centred on 0 0, about 170 across. */
export const SpiderHouseEmblem: React.FC<{red?: string; bg?: string}> = ({red = C.red, bg = EMBLEM_BG}) => {
  const UR = [[6, -6], [26, -40], [52, -66], [80, -74], [94, -60], [90, -32], [68, -14], [30, -5]];
  const LR = [[6, 6], [36, 5], [66, 12], [88, 30], [84, 58], [60, 68], [36, 56], [16, 28]];
  const wings = [UR, LR].flatMap((w) => [w, w.map(([x, y]) => [-x, y])]);
  const smooth = (pts: number[][]) => {
    const m = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const n = pts.length, st = m(pts[n - 1], pts[0]);
    return `M${st.join(' ')} ` + pts.map((q, i) => `Q${q.join(' ')} ${m(q, pts[(i + 1) % n]).join(' ')}`).join(' ') + ' Z';
  };
  const R = rng(91);
  return (
    <g>
      <defs>{wings.map((w, i) => <clipPath key={i} id={`emw${i}`}><path d={smooth(w)} /></clipPath>)}</defs>
      {/* the rope: short slanted strands round a circle */}
      {Array.from({length: 60}, (_, i) => {
        const a = (i / 60) * Math.PI * 2, r = 68;
        return <rect key={i} x={-3.8} y={-8} width={7.6} height={16} rx={3.6} fill={red} transform={`translate(${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}) rotate(${((a * 180) / Math.PI + 90 + 40).toFixed(1)})`} />;
      })}
      {/* the needle */}
      <path d="M0 -92 L3.2 -24 L0 0 L-3.2 -24 Z M0 92 L2.4 24 L0 0 L-2.4 24 Z" fill={red} />
      {/* the wings, each a web */}
      {wings.map((w, i) => {
        const far = w.map(([x, y]) => Math.hypot(x, y));
        const tip = w[far.indexOf(Math.max(...far))];
        return (
          <g key={i}>
            <path d={smooth(w)} fill={bg} />
            <g clipPath={`url(#emw${i})`}>
              {w.map(([x, y], k) => <path key={k} d={`M0 0 L${x * 1.3} ${y * 1.3}`} stroke={red} strokeWidth={1.6} />)}
              {[0.35, 0.55, 0.75, 0.92].map((f, k) => (
                <path key={'a' + k} d={`M${w.map(([x, y], j) => `${(x * (f + (R() - 0.5) * 0.08)).toFixed(1)} ${(y * (f + (R() - 0.5) * 0.08)).toFixed(1)}`).join(' L')}`} stroke={red} strokeWidth={1.2} fill="none" />
              ))}
              <path d={`M${tip[0] * 0.2} ${tip[1] * 0.2} L${tip[0]} ${tip[1]}`} stroke={red} strokeWidth={2.4} />
            </g>
            <path d={smooth(w)} fill="none" stroke={red} strokeWidth={3} />
          </g>
        );
      })}
      {/* the small barbs either side */}
      <path d="M-78 -4 L-90 1 L-78 7 Z M78 -4 L90 1 L78 7 Z" fill={red} />
      {/* the knot: five white crescents turning round a red eye */}
      <circle r={17} fill={bg} stroke={red} strokeWidth={2.6} />
      {Array.from({length: 5}, (_, i) => (
        <path key={i} d="M3 -13 Q12 -10 12 -1 Q8 -8 1 -9 Z" fill={C.white} transform={`rotate(${i * 72})`} />
      ))}
      <circle r={4.5} fill={red} />
      <circle r={1.6} fill={bg} />
    </g>
  );
};
/** user 10-25 (3rd look, after the official CG of it as reference): Araya's words are still going when the book shuts,
 *  so its cover is hers: her red randoseru, the flap thrown back, and standing up out of it the Golden Bough in its
 *  case, the branches lit gold in the window. Our own drawing, flat cut paper; centred on 11 0 like the other covers. */
const BOUGH_BG = '#18110f', BRONZE = '#4b3a22', BRONZE_LT = '#86693a', GOLD_HI = '#fff3c6';
const boughBranches = () => {
  const R = rng(57), out: {d: string; w: number}[] = [];
  const grow = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    const bend = (R() - 0.5) * 0.5;
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    const cx = x + Math.cos(a + bend) * len * 0.55, cy = y + Math.sin(a + bend) * len * 0.55;
    out.push({d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, w});
    if (depth === 0) return;
    const spread = 0.42 + R() * 0.2;
    grow(x2, y2, a - spread, len * (0.68 + R() * 0.12), w * 0.68, depth - 1);
    grow(x2, y2, a + spread, len * (0.68 + R() * 0.12), w * 0.68, depth - 1);
  };
  out.push({d: 'M10 6 Q9 -8 10 -24', w: 4});
  grow(10, -24, -Math.PI / 2 - 0.5, 17, 2.8, 3);
  grow(10, -24, -Math.PI / 2 + 0.5, 17, 2.8, 3);
  grow(10, -16, -Math.PI / 2 - 1.15, 12, 2, 2);
  grow(10, -14, -Math.PI / 2 + 1.1, 12, 2, 2);
  return out;
};
const BOUGH = boughBranches();
const MOTES = (() => { const R = rng(73); return Array.from({length: 16}, () => ({x: 11 + (R() - 0.5) * 150, y: -110 + R() * 120, r: 0.7 + R() * 1.1})); })();
export const BoughCover: React.FC = () => (
  <g transform="translate(11 8) scale(0.86) translate(-11 0)">
    <defs>
      <radialGradient id="bgGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffcf6a" stopOpacity={0.55} />
        <stop offset="0.45" stopColor="#e8902c" stopOpacity={0.2} />
        <stop offset="1" stopColor="#e8902c" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="bgFloor" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#b9a68a" stopOpacity={0.32} />
        <stop offset="1" stopColor="#b9a68a" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="bgWin" cx="0.5" cy="0.62" r="0.62">
        <stop offset="0" stopColor={GOLD_HI} />
        <stop offset="0.5" stopColor="#ffc548" />
        <stop offset="1" stopColor="#d9801c" />
      </radialGradient>
      <linearGradient id="bgLit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffb340" stopOpacity={0.42} />
        <stop offset="0.5" stopColor="#ffb340" stopOpacity={0.08} />
        <stop offset="1" stopColor="#ffb340" stopOpacity={0} />
      </linearGradient>
      <clipPath id="bgWinClip"><rect x={-7} y={-73} width={34} height={92} rx={8} /></clipPath>
      <clipPath id="bgFace"><path d="M-46 -6 Q-46 -12 -40 -12 L56 -14 Q62 -14 62 -8 L63 88 Q63 96 55 96 L-38 98 Q-45 98 -45 90 Z" /></clipPath>
      <filter id="bgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
    </defs>
    <ellipse cx={11} cy={-36} rx={96} ry={90} fill="url(#bgGlow)" />
    <ellipse cx={14} cy={98} rx={92} ry={18} fill="url(#bgFloor)" />
    {/* the flap, thrown back over the top and hanging down behind, white piping along its edge */}
    <path d="M50 -30 Q84 -34 88 -6 L90 70 Q90 92 74 94 L66 94 L64 -18 Z" fill={C.redDark} />
    <path d="M52 -29 Q82 -32 85 -6 L87 70 Q87 89 74 91" stroke={C.paper2} strokeWidth={1.1} fill="none" strokeDasharray="3 2.2" opacity={0.8} />
    {/* the side of the bag */}
    <path d="M60 -14 L74 -24 L76 84 L62 97 Z" fill="#8f1322" />
    {/* the open top: the dark inside, the white lining along the back */}
    <path d="M-44 -11 L-28 -27 L76 -25 L60 -14 Z" fill="#2c0b0c" />
    <path d="M-28 -27 L76 -25 L74 -21 L-26 -23 Z" fill={C.paper2} />
    <path d="M-24 -25 L72 -23" stroke={C.redDark} strokeWidth={0.7} strokeDasharray="2.4 1.8" />
    {/* the Golden Bough in its case, standing up out of the bag, leaning over to the right against its rim (user 10-25) */}
    <g transform="translate(10 0) rotate(15 10 20)">
      <ellipse cx={10} cy={-34} rx={40} ry={62} fill="#ffc048" opacity={0.28} filter="url(#bgBlur)" />
      <rect x={-17} y={-84} width={54} height={112} rx={11} fill={BRONZE} />
      <rect x={-12} y={-79} width={44} height={102} rx={9} fill={BRONZE_LT} />
      <rect x={-7} y={-73} width={34} height={92} rx={8} fill="url(#bgWin)" />
      <g clipPath="url(#bgWinClip)">
        <g filter="url(#bgBlur)" opacity={0.7}>{BOUGH.map((b, i) => <path key={i} d={b.d} stroke={GOLD_HI} strokeWidth={b.w * 2.2} fill="none" strokeLinecap="round" />)}</g>
        {BOUGH.map((b, i) => <path key={i} d={b.d} stroke="#fffaf0" strokeWidth={b.w} fill="none" strokeLinecap="round" />)}
        {[[0, -40], [22, -52], [4, -14], [18, -30], [-2, -60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={0.9} fill="#fffaf0" />)}
      </g>
      {/* the cap: a band, then a dome with two lit slots either side of a bar */}
      <rect x={-15} y={-88} width={50} height={6} rx={2} fill={BRONZE_LT} />
      <path d="M-13 -88 L-13 -98 Q-13 -108 -2 -108 L22 -108 Q33 -108 33 -98 L33 -88 Z" fill="#33281a" />
      <path d="M-8 -91 Q-8 -101 2 -102 L6 -102 L6 -91 Z M28 -91 Q28 -101 18 -102 L14 -102 L14 -91 Z" fill="#f5c45a" />
      <rect x={7.5} y={-109} width={5} height={21} rx={1.5} fill={BRONZE_LT} />
    </g>
    {/* the front of the bag, lit from above by the bough */}
    <g clipPath="url(#bgFace)">
      <rect x={-50} y={-20} width={120} height={124} fill={C.red} />
      <rect x={-50} y={-20} width={120} height={124} fill="url(#bgLit)" />
      <path d="M-50 2 L70 0 L70 6 L-50 8 Z" fill={C.redDark} opacity={0.6} />
      {/* the pocket, its zip pulls, the name tag */}
      <rect x={-34} y={30} width={84} height={58} rx={7} fill="none" stroke={C.redDark} strokeWidth={2} />
      <path d="M-25 34 l-2 9 M-21 34 l1 9" stroke={C.paper2} strokeWidth={1.4} strokeLinecap="round" />
      <g transform="translate(16 50) rotate(-2)">
        <rect x={-18} y={-6.5} width={36} height={14} rx={1.5} fill="#ead9d3" />
        <rect x={-16.5} y={-5} width={33} height={11} fill="none" stroke={C.redDark} strokeWidth={0.5} strokeDasharray="1.4 1" />
        {/* her name in katakana, written by hand, as on the CG (user 10-26) */}
        <text x={0} y={3.6} fontFamily={F.brush} fontSize={8.6} fill={C.ink} textAnchor="middle" letterSpacing={0.8} transform="rotate(-2)">アラヤ</text>
      </g>
    </g>
    {/* the loops for the straps at either side, a little heart rivet on each */}
    {[[-52, 16, -30], [44, 14, 66]].map(([x0, y, x1], i) => (
      <g key={i}>
        <rect x={x0} y={y} width={x1 - x0} height={9} rx={4} fill={C.redDark} />
        <path d={`M${i ? x0 + 6 : x1 - 6} ${y + 6} l-1.6 -1.8 a1 1 0 0 1 1.6 -1 a1 1 0 0 1 1.6 1 Z`} fill={C.paper2} />
      </g>
    ))}
    {MOTES.map((m, i) => (
      <g key={i}>
        <circle cx={m.x} cy={m.y} r={m.r * 2.6} fill="#ffc048" opacity={0.18} />
        <circle cx={m.x} cy={m.y} r={m.r} fill="#ffd982" />
      </g>
    ))}
  </g>
);
export const PictureBook: React.FC<{grey?: boolean; nicked?: boolean; cover?: BookCover}> = ({grey, nicked, cover = BOOK_COVER}) => {
  const g = (c: string) => (grey ? C.grey : c);
  return (
    <g filter={PC}>
      <defs>
        <clipPath id="nick"><path d="M-200 -200 L-36 -203 L192 34 L200 200 L-200 200 Z" /></clipPath>
      </defs>
      <g clipPath={nicked ? 'url(#nick)' : undefined}>
        <rect x={-92} y={-120} width={184} height={240} rx={6} fill={grey ? C.greyLight : cover === 'emblem' ? EMBLEM_BG : cover === 'bough' ? BOUGH_BG : C.paper} />
        <rect x={-92} y={-120} width={22} height={240} fill={grey ? C.grey : C.ink2} />
        {cover === 'emblem' && <g transform="translate(11 -4) scale(0.84)"><SpiderHouseEmblem /></g>}
        {cover === 'bough' && <BoughCover />}
        {/* user 10-24 (2nd look): our own cover for 是谁嗯嗯在我的头上: the little mole, the poop on its head.
            10-25: no title or words on it, only the picture, a little bigger and in the middle */}
        {cover === 'spider' && (
          <>
            <rect x={-60} y={-102} width={142} height={200} rx={5} fill={grey ? '#c9c3b8' : C.white} />
            {/* the thread, coming down off the top of the book, the spider hanging from it by the tip of its body */}
            <path d="M13 -126 C12 -90 15 -50 13 -12" stroke={g(C.red)} strokeWidth={1.8} fill="none" />
            <g transform="translate(13 -12) scale(1.35)">
              {[-1, 1].map((sd) => [0, 1, 2, 3].map((k) => (
                <path key={sd * 10 + k} d={`M${sd * 3} ${17 + k * 2.4} q${sd * (8 + k * 1.5)} ${-9 + k * 4.5} ${sd * (13 + k * 2)} ${[-1, 4, 10, 15][k]}`} stroke={g(C.ink)} strokeWidth={1.5} fill="none" strokeLinecap="round" />
              )))}
              <ellipse cx={0} cy={8} rx={7.5} ry={9.5} fill={g(C.ink)} />
              <ellipse cx={0} cy={21} rx={5} ry={4.6} fill={g(C.ink)} />
              <circle cx={-1.8} cy={23.4} r={0.9} fill={C.white} /><circle cx={1.8} cy={23.4} r={0.9} fill={C.white} />
            </g>
          </>
        )}
        {cover === 'mole' && (
        <g transform="translate(11 -6) scale(1.05) translate(-11 -10)">
        <rect x={-58} y={-54} width={138} height={128} rx={5} fill={grey ? '#c9c3b8' : C.white} />
        {/* the grass, the molehill it came up out of */}
        <path d="M-58 52 Q0 46 80 52 L80 74 L-58 74 Z" fill={g('#9aae74')} />
        <path d="M-34 56 C-24 40 -8 34 11 34 C30 34 46 40 56 56 Z" fill={g(SOIL)} />
        {[-50, -40, 62, 72].map((x) => <path key={x} d={`M${x} 52 l2 -7 l2 7`} stroke={g('#7f9a5c')} strokeWidth={1.6} fill="none" />)}
        <g transform="translate(11 26)">
          {/* the mole: velvet black, a pink snout and pink spade hands, eyes shut tight; it looks up */}
          <ellipse cx={0} cy={6} rx={24} ry={21} fill={g(MOLE)} />
          <ellipse cx={-21} cy={14} rx={8} ry={5} fill={g(MOLE_PINK)} transform="rotate(-30 -21 14)" />
          <ellipse cx={21} cy={14} rx={8} ry={5} fill={g(MOLE_PINK)} transform="rotate(30 21 14)" />
          <ellipse cx={0} cy={6} rx={6} ry={4.4} fill={g(MOLE_PINK)} />
          <path d="M-11 -3 q3 -2 6 0 M5 -3 q3 -2 6 0" stroke={g(MOLE_PINK)} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          {/* and on its head */}
          <path d="M-13 -13 Q0 -20 13 -13 Q11 -8 0 -8 Q-11 -8 -13 -13 Z" fill={g(POO)} />
          <path d="M-9 -19 Q0 -24 9 -19 Q8 -14 0 -14 Q-8 -14 -9 -19 Z" fill={g(POO)} />
          <path d="M-5 -24 Q0 -28 5 -24 Q4 -20 0 -20 Q-4 -20 -5 -24 Z" fill={g(POO)} />
          <path d="M-2 -26 Q2 -31 5 -34 Q5 -29 3 -26 Z" fill={g(POO)} />
          <path d="M-7 -17 Q0 -20 7 -17 M-4 -22 Q0 -24 4 -22" stroke="#5e3b1c" strokeWidth={0.9} fill="none" opacity={0.7} />
        </g>
        </g>
        )}
      </g>
      {/* the bookmark; on the cover it closes with at the end, the Blender ribbon takes its place (it goes red) */}
      {cover !== 'bough' && <path d="M-40 118 L-40 176 L-30 166 L-20 176 L-20 118" fill={C.grey} />}
    </g>
  );
};
/** the corner that the slash took off the book (falls on its own) */
export const BookCorner: React.FC = () => (
  <g filter={PC}><path d="M44 -120 L92 -120 L92 -70 Z" fill={C.paper} /></g>
);
export const Bear: React.FC<{color?: string}> = ({color = C.purple}) => {
  const light = C.purpleLight;
  return (
    <g filter={PC}>
      <circle cx={-52} cy={-120} r={26} fill={color} />
      <circle cx={52} cy={-120} r={26} fill={color} />
      <circle cx={-52} cy={-120} r={12} fill={light} />
      <circle cx={52} cy={-120} r={12} fill={light} />
      <ellipse cx={0} cy={40} rx={74} ry={84} fill={color} />
      <ellipse cx={-78} cy={20} rx={24} ry={44} fill={color} transform="rotate(24 -78 20)" />
      <ellipse cx={78} cy={20} rx={24} ry={44} fill={color} transform="rotate(-24 78 20)" />
      <ellipse cx={-42} cy={118} rx={32} ry={26} fill={color} />
      <ellipse cx={42} cy={118} rx={32} ry={26} fill={color} />
      <circle cx={0} cy={-84} r={64} fill={color} />
      <ellipse cx={0} cy={-64} rx={26} ry={20} fill={light} />
      <circle cx={-22} cy={-96} r={6} fill={C.ink} />
      <circle cx={22} cy={-96} r={6} fill={C.ink} />
      <ellipse cx={0} cy={-70} rx={8} ry={6} fill={C.ink} />
      <ellipse cx={0} cy={44} rx={40} ry={46} fill={light} />
    </g>
  );
};
/** Calisto's bone knife */
export const BoneKnife: React.FC<{grey?: boolean}> = ({grey}) => (
  <g filter={PC} transform="rotate(-90)">
    <path d="M-30 -14 L150 -18 Q196 -14 214 4 Q170 14 120 16 L-30 14 Z" fill={grey ? C.greyLight : C.white} />
    <path d="M-30 4 L150 4" stroke={grey ? C.grey : C.paperShade} strokeWidth={3} />
    <rect x={-150} y={-20} width={124} height={40} rx={14} fill={grey ? C.grey : C.paper2} />
    <circle cx={-158} cy={0} r={24} fill={grey ? C.grey : C.paper2} />
    {[-128, -104, -80, -56].map((x) => <path key={x} d={`M${x} -19 L${x + 8} 19`} stroke={grey ? '#6d6862' : C.paperShade} strokeWidth={4} />)}
  </g>
);
/** the Little Finger's veil (the first 地慧星, Ryōshū's mother) */
export const Veil: React.FC<{color?: string; opacity?: number}> = ({color = C.greyLight, opacity = 0.85}) => (
  <g filter={PC} opacity={opacity}>
    <path d="M-70 -110 Q0 -150 70 -110 Q110 0 130 120 Q104 104 84 126 Q62 104 40 128 Q18 106 -2 128 Q-24 104 -44 128 Q-66 104 -86 126 Q-106 104 -130 120 Q-110 0 -70 -110 Z" fill={color} />
    {[-60, -20, 20, 60].map((x) => <path key={x} d={`M${x * 0.5} -110 Q${x * 0.8} 0 ${x} 118`} stroke={C.ink2} strokeWidth={2} fill="none" opacity={0.35} />)}
  </g>
);

/* ---------- a safe, as an icon (for the play-back) ---------- */
export const SafeIcon: React.FC<{line?: string}> = ({line = C.paper}) => (
  <g filter={PC}>
    <rect x={-110} y={-120} width={220} height={230} rx={10} fill={C.ink} />
    <rect x={-92} y={-102} width={184} height={194} rx={6} fill="none" stroke={line} strokeWidth={2.5} />
    <circle cx={10} cy={-14} r={40} fill="none" stroke={line} strokeWidth={2.5} />
    <circle cx={10} cy={-14} r={14} fill={line} />
    <rect x={-6} y={44} width={64} height={12} rx={6} fill={line} />
    <rect x={-96} y={110} width={30} height={14} fill={C.ink} />
    <rect x={66} y={110} width={30} height={14} fill={C.ink} />
  </g>
);

/* ---------- yunomi (a cylindrical teacup), side view ---------- */
/** level 0..1 of tea inside (a flat band behind the cup wall) */
export const Yunomi: React.FC<{level?: number; crack?: number; water?: string}> = ({level = 0, crack = 0, water = C.greyLight}) => (
  <g filter={PC}>
    <defs><clipPath id="cupin"><path d="M-104 -120 L104 -120 L95 104 Q93 132 66 132 L-66 132 Q-93 132 -95 104 Z" /></clipPath></defs>
    <path d="M-110 -128 L110 -128 L100 108 Q98 140 70 140 L-70 140 Q-98 140 -100 108 Z" fill={C.white} stroke={C.ink} strokeWidth={4} />
    <g clipPath="url(#cupin)">
      <rect x={-120} y={lerp(132, -110, level)} width={240} height={300} fill={water} opacity={0.75} />
    </g>
    <path d="M-110 -128 L110 -128" stroke={C.ink} strokeWidth={4} />
    <path d="M-98 70 L98 70" stroke={C.ink} strokeWidth={2} opacity={0.4} />
    {crack > 0 && <path d="M20 140 L26 122 L16 108 L28 92 L20 78" stroke={C.ink} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={`${crack} 1.0001`} />}
  </g>
);

/* ---------- the hand: palm up; close 0 = open flat .. 1 = a fist ---------- */
/** hand = colour of the paper hand, cut = colour of the cut lines; holds: 'sheath' | 'thread' | none */
export const Hand: React.FC<{close: number; hand?: string; cut?: string; holds?: 'sheath' | 'thread'; threadColor?: string; wrist?: number}> = ({close, hand = C.ink, cut = C.paper, holds, threadColor = C.redLine, wrist = 520}) => {
  const th = lerp(0, 168, eio(clamp(close))) * (Math.PI / 180);
  const fingers = [
    {x: -74, y: -78, L: 150, w: 46},
    {x: -24, y: -90, L: 172, w: 48},
    {x: 26, y: -86, L: 160, w: 46},
    {x: 74, y: -68, L: 118, w: 40},
  ];
  const cap = (x: number, y: number, len: number, w: number, key: string) => {
    const y2 = y - len;
    return <path key={key} d={`M${x} ${y} L${x} ${y2}`} stroke={hand} strokeWidth={w} strokeLinecap="round" />;
  };
  const capCut = (x: number, y: number, len: number, w: number, key: string) => {
    const y2 = y - len;
    return <path key={key} d={`M${x} ${y} L${x} ${y2}`} stroke={cut} strokeWidth={w + 7} strokeLinecap="round" />;
  };
  const tA = lerp(-128, -12, eio(clamp(close * 1.1 - 0.1))) * (Math.PI / 180);
  const tl = lerp(128, 112, clamp(close));
  const tx0 = -96, ty0 = 34;
  const tx1 = tx0 + Math.cos(tA) * tl, ty1 = ty0 + Math.sin(tA) * tl;
  return (
    <g filter={PC}>
      {/* wrist and palm */}
      <path d={`M-82 96 L-74 ${wrist} L74 ${wrist} L82 96 Z`} fill={hand} />
      <path d="M-104 -84 Q-118 70 -78 118 L78 118 Q112 70 100 -78 Q-4 -104 -104 -84 Z" fill={hand} />
      {holds === 'sheath' && (
        <g transform="rotate(-8)">
          <rect x={-250} y={-6} width={500} height={38} rx={14} fill={C.white} stroke={C.ink} strokeWidth={3.5} />
          <rect x={-250} y={-6} width={30} height={38} rx={10} fill={C.ink} />
          <rect x={150} y={-10} width={16} height={46} rx={4} fill={C.white} stroke={C.ink} strokeWidth={3} />
        </g>
      )}
      {holds === 'thread' && <path d="M-300 30 C-150 10 -60 40 20 20 C120 0 200 30 340 10" stroke={threadColor} strokeWidth={3} fill="none" />}
      {/* fingers: foreshortened as they fold over toward the viewer and down across the palm */}
      {fingers.map((f, i) => {
        const len = f.L * Math.cos(th * (1 - i * 0.03));
        return <React.Fragment key={i}>{capCut(f.x, f.y, len, f.w, 'c' + i)}</React.Fragment>;
      })}
      {fingers.map((f, i) => {
        const len = f.L * Math.cos(th * (1 - i * 0.03));
        return <React.Fragment key={i}>{cap(f.x, f.y, len, f.w, 'f' + i)}</React.Fragment>;
      })}
      {/* thumb */}
      <path d={`M${tx0} ${ty0} L${tx1} ${ty1}`} stroke={cut} strokeWidth={60} strokeLinecap="round" />
      <path d={`M${tx0} ${ty0} L${tx1} ${ty1}`} stroke={hand} strokeWidth={52} strokeLinecap="round" />
      <path d={`M${tx0 + 6} ${ty0 + 40} Q-40 70 0 96`} stroke={cut} strokeWidth={3} fill="none" opacity={0.6 * (1 - close)} />
    </g>
  );
};

/* ---------- a fist from the side, thumb on top, little finger out (pinky promise) ---------- */
/** hooked 0..1 bends the little finger: curl 'down' (hers) or 'up' (the child's, which comes from below);
 *  tipOnly draws only the bent end again, so the two fingers pass over and under each other */
export const pinkyPath = (k: number, curl: 'up' | 'down') => {
  const e = eio(clamp(k)), sg = curl === 'down' ? 1 : -1;
  return `M40 92 C${lerp(110, 96, e)} ${92 + sg * lerp(2, 4, e)} ${lerp(170, 146, e)} ${92 + sg * lerp(2, 18, e)} ${lerp(210, 150, e)} ${92 + sg * lerp(0, 56, e)}`;
};
export const PinkyFist: React.FC<{color: string; cut?: string; hooked: number; curl?: 'up' | 'down'; tipOnly?: boolean}> = ({color, cut = C.paper, hooked, curl = 'down', tipOnly}) => {
  const d = pinkyPath(hooked, curl);
  if (tipOnly) return <path d={d} stroke={color} strokeWidth={30} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="0 0.6 0.4 1" />;
  return (
    <g filter={PC}>
      {/* the forearm, out from the heel of the fist, down and back at about 38 degrees */}
      <path d="M-74 4 L-1010 736 L-900 880 L34 114 Z" fill={color} />
      <rect x={-74} y={-80} width={118} height={196} rx={42} fill={color} />
      {/* three curled fingers seen from the side: a scalloped front edge, cut apart by short paper lines */}
      {[-46, 8, 60].map((y) => <ellipse key={y} cx={40} cy={y} rx={30} ry={27} fill={color} />)}
      {[-19, 35, 86].map((y) => <path key={y} d={`M${y === 86 ? 30 : 22} ${y + 2} Q48 ${y - 2} 70 ${y + 4}`} stroke={cut} strokeWidth={4} fill="none" strokeLinecap="round" />)}
      {/* the thumb lies along the top, its tip over the first knuckle */}
      <path d="M-28 -66 Q24 -70 50 -60" stroke={cut} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-46 -84 Q14 -98 60 -80" stroke={color} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={d} stroke={cut} strokeWidth={38} fill="none" strokeLinecap="round" />
      <path d={d} stroke={color} strokeWidth={30} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ---------- dragon's beard candy: a cocoon of fine strands ---------- */
export const Candy: React.FC<{mark?: string}> = ({mark}) => (
  <g filter={PC}>
    <ellipse rx={34} ry={22} fill={C.white} stroke={mark ?? C.ink2} strokeWidth={mark ? 3.5 : 1.6} />
    {[-12, -4, 4, 12].map((y) => <path key={y} d={`M-28 ${y * 0.9} Q0 ${y * 1.4} 28 ${y * 0.9}`} stroke={C.paperShade} strokeWidth={1.2} fill="none" />)}
  </g>
);

/* ---------- two figures from behind, sitting on the parapet (figure 2) ---------- */
/** origin = the parapet top between them; lean 0..1 Araya leans toward her mother */
export const RoofBacks: React.FC<{lean?: number; thread?: number}> = ({lean = 0, thread = 1}) => (
  <g>
    {/* Ryoshu: the coat over her shoulders, a strip of collar, the bob cut square above it */}
    <g transform="translate(-92 0)">
      <path d="M-100 0 Q-104 -96 -78 -132 Q-50 -150 -22 -152 L22 -152 Q50 -150 78 -132 Q104 -96 100 0 Z" fill={C.ink} stroke={C.paper} strokeWidth={4} paintOrder="stroke" />
      <path d="M-18 -148 L-14 -168 L14 -168 L18 -148 Z" fill={C.white} />
      <path d="M-56 -160 L-58 -214 Q-56 -264 0 -268 Q56 -264 58 -214 L56 -160 Z" fill={C.ink} stroke={C.paper} strokeWidth={4} paintOrder="stroke" />
      <path d="M-74 -128 Q-90 -64 -84 -6" stroke={C.paper} strokeWidth={1.6} fill="none" opacity={0.45} />
      <path d="M74 -128 Q90 -64 84 -6" stroke={C.paper} strokeWidth={1.6} fill="none" opacity={0.45} />
    </g>
    {/* Araya: small, her long straight hair down to the waist */}
    <g transform={`translate(96 0) rotate(${-7 * lean} 0 0)`}>
      <path d="M-56 0 Q-60 -64 -40 -88 Q-24 -100 0 -100 Q24 -100 40 -88 Q60 -64 56 0 Z" fill={C.navy} stroke={C.paper} strokeWidth={4} paintOrder="stroke" />
      <path d="M-40 -34 L-44 -122 Q-44 -170 0 -174 Q44 -170 44 -122 L40 -34 Q20 -26 0 -32 Q-20 -26 -40 -34 Z" fill={C.navyDeep} stroke={C.paper} strokeWidth={4} paintOrder="stroke" />
    </g>
    {/* the thread between their hands, slack on the parapet */}
    <path d="M6 -30 Q16 -4 30 -6 Q38 -8 42 -26" stroke={C.redLine} strokeWidth={2.4} fill="none" opacity={thread} />
  </g>
);

/* ---------- a slice of watermelon ---------- */
export const Watermelon: React.FC = () => (
  <g filter={PC}>
    <path d="M-70 0 L70 0 L0 -96 Z" fill={C.red} />
    <path d="M-76 0 L76 0 L76 10 L-76 10 Z" fill={C.ink2} />
    {[[-20, -20], [10, -30], [0, -56], [-36, -8], [34, -10]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={3} ry={5} fill={C.ink} />)}
  </g>
);

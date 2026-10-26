// C2 (user 10-24, the rooftop key image, as reference only): out through a dark doorway onto the roof at night.
// A blue-violet sky going pale toward the horizon (tools/starsky.py c2), a full moon and a crescent; the two of them
// from behind, as silhouettes: Ryōshū kneeling, her sword on her back; little Araya with a white bow. Between them a
// lunch box that gives off a little light; her red cup and her red randoseru; hydrangeas either side of the door.
// The red thread runs from the end of the sheath to Araya's hand (rule: thread and sheath together = connected).
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {C} from '../theme';
import {H, W, lerp, rng} from '../util';

export const HORIZON_Y = 770, SILL = 880;
const SIL = '#0b0914', RIM = '#c4b6f4';
const OPEN_L = 190, OPEN_R = 1730;

/** a silhouette with a thin light edge along its upper left */
const Rimmed: React.FC<{d: string; o?: number}> = ({d, o = 0.75}) => (
  <>
    <path d={d} fill={RIM} opacity={o} transform="translate(-1.6 -2.2)" />
    <path d={d} fill={SIL} />
  </>
);

export const Moons: React.FC<{t: number}> = ({t}) => {
  const tw = 1 + 0.03 * Math.sin(t * 1.3);
  return (
    <g>
      <defs>
        <radialGradient id="moonGlow"><stop offset="0" stopColor="#f6f0ff" stopOpacity={0.55} /><stop offset="0.35" stopColor="#c9bdf6" stopOpacity={0.18} /><stop offset="1" stopColor="#8c7fe0" stopOpacity={0} /></radialGradient>
        <mask id="crescent"><circle r={22} fill="#fff" /><circle cx={8} cy={-7} r={19.5} fill="#000" /></mask>
      </defs>
      <circle cx={720} cy={130} r={170 * tw} fill="url(#moonGlow)" />
      <circle cx={720} cy={130} r={40} fill="#fbf8ff" />
      <circle cx={850} cy={215} r={70 * tw} fill="url(#moonGlow)" opacity={0.7} />
      <g transform="translate(850 215)"><circle r={22} fill="#fbf8ff" mask="url(#crescent)" /></g>
    </g>
  );
};

/** the far edge of the roof, with the town low behind it at either side */
const Town: React.FC = () => {
  const r = rng(52);
  const blocks: React.ReactNode[] = [];
  for (const [x0, x1] of [[OPEN_L - 40, 560], [1380, OPEN_R + 40]] as [number, number][]) {
    let x = x0;
    while (x < x1) {
      const w = 40 + r() * 90, h = 20 + r() * (x0 < 900 ? 110 - (x - x0) * 0.15 : 30 + (x - 1380) * 0.25);
      blocks.push(<rect key={`b${x}`} x={x} y={HORIZON_Y - h} width={w} height={h + 2} fill="#28224f" />);
      for (let i = 0; i < 4; i++) if (r() < 0.5) blocks.push(<rect key={`w${x}${i}`} x={x + 6 + r() * (w - 16)} y={HORIZON_Y - h + 8 + r() * Math.max(4, h - 20)} width={4} height={5} fill="#f2dcb4" opacity={0.35 + r() * 0.3} />);
      x += w + 2;
    }
  }
  return <g>{blocks}</g>;
};

/** a bush of hydrangea heads in the night: dark leaves, blue-violet florets catching the light from the sky */
const FLO = ['#4f52c4', '#6a66d8', '#8c84ea', '#b2a8f4'];
const Bush: React.FC<{cx: number; cy: number; seed: number; flip?: boolean}> = ({cx, cy, seed, flip}) => {
  const r = rng(seed);
  const heads = Array.from({length: 7}, () => ({x: (r() - 0.5) * 260, y: -r() * 170, s: 0.7 + r() * 0.5}));
  const leaves = Array.from({length: 26}, () => ({x: (r() - 0.5) * 300, y: -r() * 160 + 20, a: r() * 180, s: 0.7 + r() * 0.6}));
  return (
    <g transform={`translate(${cx} ${cy}) scale(${flip ? -1 : 1} 1)`}>
      {leaves.map((l, i) => <ellipse key={`l${i}`} cx={l.x} cy={l.y} rx={30 * l.s} ry={15 * l.s} fill={i % 3 ? '#131932' : '#1b2442'} transform={`rotate(${l.a} ${l.x} ${l.y})`} />)}
      {heads.sort((a, b) => a.y - b.y).map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y}) scale(${h.s})`}>
          <ellipse rx={50} ry={40} fill="#2a2b6e" />
          {Array.from({length: 34}, (_, j) => {
            const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 42, x = Math.cos(a) * d, y = Math.sin(a) * d * 0.8;
            const lit = (-y - x * 0.3) / 50;                         // lit from the sky, above
            const c = FLO[Math.max(0, Math.min(3, Math.round(1.5 + lit * 1.6 + (r() - 0.5))))];
            return (
              <g key={j} transform={`translate(${x} ${y}) rotate(${r() * 90})`}>
                {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={0} cy={-5} rx={3.6} ry={5.2} fill={c} transform={`rotate(${k * 90})`} />)}
                <circle r={1.4} fill="#1d1a48" />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

/** the roof between the far edge and the door sill */
const Roof: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="roofFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a4088" /><stop offset="0.25" stopColor="#2c2558" /><stop offset="1" stopColor="#17132e" />
      </linearGradient>
    </defs>
    <rect x={OPEN_L - 40} y={HORIZON_Y} width={OPEN_R - OPEN_L + 80} height={SILL - HORIZON_Y + 4} fill="url(#roofFloor)" />
    <path d={`M${OPEN_L - 40} ${HORIZON_Y} L${OPEN_R + 40} ${HORIZON_Y}`} stroke="#d8cdf2" strokeWidth={2} opacity={0.6} />
    {[-3, -2, -1, 0, 1, 2, 3].map((k) => <path key={k} d={`M${960 + k * 120} ${HORIZON_Y} L${960 + k * 330} ${SILL}`} stroke="#5a4f9a" strokeWidth={1} opacity={0.25} />)}
  </g>
);

/** the two of them, from behind. lean: 0..1 Araya leans in to her mother */
export const Pair: React.FC<{lean: number; t: number}> = ({lean, t}) => {
  const ryo = 'M700 880 C696 840 712 812 728 800 C726 760 722 716 730 690 C736 670 758 664 780 660 L820 660 C842 664 864 670 870 690 C878 716 874 760 872 800 C888 812 904 840 900 880 Z';
  const ryoHead = 'M800 588 C820 588 834 604 834 628 C834 652 838 690 842 720 L758 720 C762 690 766 652 766 628 C766 604 780 588 800 588 Z';
  const hilt = 'M736 520 L748 517 L760 590 L748 593 Z';
  const sheath = 'M752 600 L764 596 L918 872 L904 880 Z';
  const ara = 'M1045 880 C1044 850 1056 826 1062 812 C1058 828 1046 838 1050 842 C1054 846 1062 836 1066 828 C1064 800 1066 776 1074 766 C1084 760 1094 758 1100 758 C1106 758 1118 760 1128 766 C1136 774 1138 792 1138 812 C1144 826 1156 850 1155 880 Z';
  const araHead = 'M1100 702 C1116 702 1126 714 1126 730 C1126 748 1128 772 1132 800 L1068 800 C1072 772 1074 748 1074 730 C1074 714 1084 702 1100 702 Z';
  const a = lean * -5;
  const glow = 0.85 + 0.15 * Math.sin(t * 2.1) * Math.sin(t * 0.7);
  return (
    <g>
      <defs>
        <radialGradient id="boxGlow"><stop offset="0" stopColor="#fff3e2" stopOpacity={0.7} /><stop offset="0.4" stopColor="#f4dcc4" stopOpacity={0.2} /><stop offset="1" stopColor="#f4dcc4" stopOpacity={0} /></radialGradient>
      </defs>
      {/* the lunch box between them */}
      <ellipse cx={955} cy={866} rx={110 * glow} ry={70 * glow} fill="url(#boxGlow)" />
      <rect x={921} y={852} width={68} height={27} rx={3} fill="#efe7f4" />
      <path d="M921 860 L989 860" stroke="#b8acd0" strokeWidth={2} />
      {/* her sword, on her back, under her */}
      <Rimmed d={sheath} o={0.5} />
      <Rimmed d={ryo} />
      <g transform={`rotate(${lean * 3} 800 660)`}><Rimmed d={ryoHead} />
        {/* the hair down her back, the arms at her sides: thin lines of the sky's light */}
        <path d="M770 650 C764 700 760 760 764 812 M830 650 C836 700 840 760 838 812" stroke={RIM} strokeWidth={1.2} fill="none" opacity={0.28} />
      </g>
      <path d="M736 700 C732 740 736 790 748 830 M864 700 C868 740 864 790 852 830" stroke={RIM} strokeWidth={1.2} fill="none" opacity={0.22} />
      <Rimmed d={hilt} />
      <path d="M738 596 L768 588" stroke={SIL} strokeWidth={7} strokeLinecap="round" />
      {/* Araya */}
      <g transform={`rotate(${a} 1100 880)`}>
        <Rimmed d={ara} />
        <Rimmed d={araHead} />
        <g transform="translate(1078 716) rotate(-20)">
          <ellipse cx={-10} cy={0} rx={11} ry={6.5} fill="#f4f0fa" transform="rotate(-25 -10 0)" />
          <ellipse cx={10} cy={0} rx={11} ry={6.5} fill="#f4f0fa" transform="rotate(25 10 0)" />
          <path d="M-2 2 L-8 18 L-3 16 M2 2 L8 18 L3 16" stroke="#f4f0fa" strokeWidth={3} fill="none" />
          <circle r={4} fill="#ffffff" />
        </g>
      </g>
      {/* the thread: from the end of the sheath, along the roof, to her hand */}
      <path d={`M912 878 C960 892 1010 892 ${lerp(1050, 1043, lean)} ${lerp(838, 840, lean)}`} stroke={C.redLine} strokeWidth={5} fill="none" opacity={0.25} />
      <path d={`M912 878 C960 892 1010 892 ${lerp(1050, 1043, lean)} ${lerp(838, 840, lean)}`} stroke={C.redLine} strokeWidth={2.2} fill="none" />
      {/* her red cup and her red randoseru */}
      <path d="M1270 856 L1294 856 L1291 880 L1273 880 Z" fill={C.red} />
      <path d="M1270 856 L1294 856" stroke="#f4b0b6" strokeWidth={1.6} />
      <g transform="translate(1372 880) scale(0.8)">
        <path d="M-44 0 L-44 -52 Q-44 -70 -26 -70 L26 -70 Q44 -70 44 -52 L44 0 Z" fill="#a8131f" />
        <path d="M-40 -66 Q-40 -76 -24 -76 L24 -76 Q40 -76 40 -66 L40 -22 Q0 -14 -40 -22 Z" fill={C.red} />
        <rect x={-5} y={-30} width={10} height={9} rx={2} fill="#e8c46a" />
        <path d="M-30 -70 Q-34 -98 -14 -100 M30 -70 Q34 -98 14 -100" stroke="#a8131f" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M-44 -52 L-52 -48 L-52 -4 L-44 0" fill="#7a0d1b" />
      </g>
    </g>
  );
};

/** user 10-24 (2nd look): the two of them redrawn by gpt-image (gen/r3, c2_pair_N: the sword straight, the cup and
 *  the randoseru in the same hand). The image is laid over Pair's own frame: base x 620..1500, y 400..987, moved by dy
 *  so the feet sit on the sill line. Araya (x > split) leans in on "with me"; the thread is still ours, from the end
 *  of the scabbard along the roof to her side. Only she leans: her cup and randoseru (x > items) stay where they are
 *  (10-25, after the full film: they tipped up with her). */
const PAIR_IMG: Record<number, {dy: number; split: number; items?: number; tip: [number, number]; side: [number, number]; box: [number, number]; pivot: [number, number]}> = {
  1: {dy: -38.5, split: 1061, items: 1239, tip: [870, 852], side: [1090, 866], box: [999, 860], pivot: [1144, 880]},
  2: {dy: -17, split: 1066, tip: [960, 840], side: [1090, 870], box: [1032, 858], pivot: [1160, 880]},
  3: {dy: 2, split: 1080, tip: [934, 800], side: [1105, 866], box: [1035, 852], pivot: [1172, 878]},
};
export const PairImage: React.FC<{n: number; lean: number; t: number}> = ({n, lean, t}) => {
  const P = PAIR_IMG[n], S = 880 / 1536, src = staticFile(`img4/c2pair_${n}.png`);
  const [hold] = useState(() => delayRender(`c2 pair ${n}`));     // an svg <image> is not waited for by itself
  useEffect(() => { const im = new Image(); im.onload = im.onerror = () => continueRender(hold); im.src = src; }, [hold, src]);
  const img = (clip: string) => <image href={src} x={620} y={400 + P.dy} width={880} height={1024 * S} clipPath={clip} />;
  const glow = 0.85 + 0.15 * Math.sin(t * 2.1) * Math.sin(t * 0.7);
  const [tx, ty] = P.tip, [sx, sy] = P.side;
  // along the roof just in front of the sill (below it the doorway's floor would cover it), past the lunch box
  const fy = SILL - 5;
  const thread = `M${tx} ${ty} C${tx + 6} ${fy - 6} ${tx + 26} ${fy} ${tx + 60} ${fy} L${sx - 40} ${fy} C${sx - 18} ${fy} ${sx - 8} ${sy + 6} ${lerp(sx, sx - 6, lean)} ${sy}`;
  return (
    <g>
      <defs>
        <radialGradient id="boxGlow2"><stop offset="0" stopColor="#fff3e2" stopOpacity={0.7} /><stop offset="0.4" stopColor="#f4dcc4" stopOpacity={0.2} /><stop offset="1" stopColor="#f4dcc4" stopOpacity={0} /></radialGradient>
        <clipPath id="pairL"><rect x={0} y={0} width={P.split} height={1200} /></clipPath>
        <clipPath id="pairR"><rect x={P.split} y={0} width={(P.items ?? 2400) - P.split} height={1200} /></clipPath>
        <clipPath id="pairI"><rect x={P.items ?? 2400} y={0} width={1200} height={1200} /></clipPath>
      </defs>
      <ellipse cx={P.box[0]} cy={P.box[1] + 6} rx={110 * glow} ry={70 * glow} fill="url(#boxGlow2)" />
      {img('url(#pairL)')}
      <g transform={`rotate(${lean * -4} ${P.pivot[0]} ${P.pivot[1]})`}>{img('url(#pairR)')}</g>
      {P.items !== undefined && img('url(#pairI)')}
      <path d={thread} stroke={C.redLine} strokeWidth={5} fill="none" opacity={0.25} />
      <path d={thread} stroke={C.redLine} strokeWidth={2.2} fill="none" />
    </g>
  );
};

/** the doorway we look out of: the stair-head is dark, the light from the sky falls in on the walls and floor */
export const Doorway: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="wallL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#3b3470" /><stop offset="0.5" stopColor="#1a1630" /><stop offset="1" stopColor="#09070f" /></linearGradient>
      <linearGradient id="wallR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3b3470" /><stop offset="0.5" stopColor="#1a1630" /><stop offset="1" stopColor="#09070f" /></linearGradient>
      <radialGradient id="floorPool" cx="0.5" cy="0" r="0.75"><stop offset="0" stopColor="#3a3268" /><stop offset="0.6" stopColor="#15112a" /><stop offset="1" stopColor="#08060e" /></radialGradient>
    </defs>
    <path d={`M0 -40 L${OPEN_L} -40 L${OPEN_L} ${SILL} L0 ${H + 40} Z`} fill="url(#wallL)" />
    <path d={`M${W} -40 L${OPEN_R} -40 L${OPEN_R} ${SILL} L${W} ${H + 40} Z`} fill="url(#wallR)" />
    <path d={`M0 ${H + 40} L${OPEN_L} ${SILL} L${OPEN_R} ${SILL} L${W} ${H + 40} Z`} fill="url(#floorPool)" />
    <rect x={OPEN_L - 16} y={-40} width={16} height={SILL + 40} fill="#07050c" />
    <rect x={OPEN_R} y={-40} width={16} height={SILL + 40} fill="#07050c" />
    <path d={`M${OPEN_L - 16} ${SILL} L${OPEN_R + 16} ${SILL}`} stroke="#07050c" strokeWidth={10} />
    <path d={`M${OPEN_L} ${SILL - 5} L${OPEN_R} ${SILL - 5}`} stroke="#8a7fc8" strokeWidth={1.5} opacity={0.5} />
  </g>
);

/** the whole outside, in front of the sky */
export const RoofScene: React.FC<{lean: number; t: number; pairImg?: number}> = ({lean, t, pairImg}) => (
  <g>
    <Town />
    <Roof />
    <g transform={`translate(${OPEN_L + 40} ${SILL + 14}) scale(1.35)`}><Bush cx={0} cy={0} seed={11} /></g>
    <g transform={`translate(${OPEN_R - 40} ${SILL + 14}) scale(1.35)`}><Bush cx={0} cy={0} seed={23} flip /></g>
    <g transform={`translate(960 ${SILL}) scale(1.55) translate(-960 ${-SILL})`}>{pairImg ? <PairImage n={pairImg} lean={lean} t={t} /> : <Pair lean={lean} t={t} />}</g>
  </g>
);

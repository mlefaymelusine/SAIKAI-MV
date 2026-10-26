// Old film for the memories (user, 10-24): V3 plays a strip of early memories slowly across a light table,
// C4 runs the same strip back fast. Faded warm colour, lifted blacks, grain, dust, a scratch, a little flicker.
import React from 'react';
import {C, F} from '../theme';
import {W, clamp, rng} from '../util';
import {useShot} from './core';
import {Bento, Hydrangea, Nadeshiko, Randoseru, SafeIcon, Watermelon, YarnBall} from './objects';

export const FW = 520, FH = 390, GAP = 34, MARGIN = 74;         // frame, frame line, sprocket margin
export const PITCH = FW + GAP;
export const STRIP_H = FH + MARGIN * 2;
const BASE = '#1b140f';                                          // the celluloid between and around the frames

/* ---------- memories, each drawn in an FW x FH box centred on 0,0 ---------- */
const shoe = (len: number, wid: number, fill: string, inner: string, strap?: string) => (
  <g>
    <path d={`M0 ${-len / 2} C${wid * 0.62} ${-len / 2} ${wid * 0.55} ${len * 0.1} ${wid * 0.5} ${len * 0.28} C${wid * 0.46} ${len * 0.48} ${wid * 0.2} ${len / 2} 0 ${len / 2} C${-wid * 0.2} ${len / 2} ${-wid * 0.46} ${len * 0.48} ${-wid * 0.5} ${len * 0.28} C${-wid * 0.55} ${len * 0.1} ${-wid * 0.62} ${-len / 2} 0 ${-len / 2} Z`} fill={fill} />
    <ellipse cx={0} cy={-len * 0.2} rx={wid * 0.33} ry={len * 0.24} fill={inner} />
    {strap && <rect x={-wid * 0.5} y={-len * 0.02} width={wid} height={len * 0.07} rx={2} fill={strap} />}
  </g>
);
/** the genkan: her big black shoes and the small red ones, set side by side, toes to the door */
const Shoes: React.FC = () => (
  <g>
    <rect x={-FW / 2} y={-FH / 2} width={FW} height={150} fill="#b98f5e" />
    {[-150, -120, -96].map((y) => <path key={y} d={`M${-FW / 2} ${y} Q0 ${y + 4} ${FW / 2} ${y - 2}`} stroke="#9a7246" strokeWidth={2} fill="none" />)}
    <rect x={-FW / 2} y={-46} width={FW} height={10} fill="#8a6440" />
    <rect x={-FW / 2} y={-36} width={FW} height={FH / 2 + 36} fill="#b7b1a4" />
    <path d={`M${-FW / 2} 70 L${FW / 2} 74 M-40 -36 L-60 ${FH / 2} M170 -36 L190 ${FH / 2}`} stroke="#a29b8d" strokeWidth={2} />
    <g transform="translate(-142 70) rotate(-6)">{shoe(196, 74, C.ink, '#3a3238')}</g>
    <g transform="translate(-52 72) rotate(5)">{shoe(196, 74, C.ink, '#3a3238')}</g>
    <g transform="translate(74 100) rotate(-4)">{shoe(122, 52, C.red, C.redDark, C.redDark)}</g>
    <g transform="translate(136 101) rotate(6)">{shoe(122, 52, C.red, C.redDark, C.redDark)}</g>
  </g>
);
/** a pillar with her height marked on it, year by year */
const Heights: React.FC = () => (
  <g>
    <rect x={-FW / 2} y={-FH / 2} width={FW} height={FH} fill={C.paper} />
    <rect x={-FW / 2} y={150} width={FW} height={FH / 2 - 150} fill="#b98f5e" />
    <rect x={-70} y={-FH / 2} width={120} height={350} fill="#c79f6c" />
    {[-60, -36, -8, 22, 41].map((x, i) => <path key={i} d={`M${x} ${-FH / 2} Q${x + (i % 2 ? 4 : -3)} -20 ${x + 2} 150`} stroke="#ad8352" strokeWidth={1.6} fill="none" />)}
    {[[118, '3'], [66, '4'], [22, '5'], [-26, '6'], [-64, '7']].map(([y, age], i) => (
      <g key={i}>
        <path d={`M-62 ${y} L42 ${(y as number) - 2}`} stroke={C.ink2} strokeWidth={2.4} />
        <text x={58} y={(y as number) + 9} fontFamily={F.brush} fontSize={26} fill={C.ink2} transform={`rotate(${[-4, 3, -2, 5, -3][i]} 58 ${y})`}>{age}さい</text>
      </g>
    ))}
  </g>
);
const on = (bg: string, node: React.ReactNode, s: number, x = 0, y = 0) => (
  <g>
    <rect x={-FW / 2} y={-FH / 2} width={FW} height={FH} fill={bg} />
    <g transform={`translate(${x} ${y}) scale(${s})`}>{node}</g>
  </g>
);
export const MEMORIES: Record<string, React.ReactNode> = {
  shoes: <Shoes />,
  heights: <Heights />,
  bento: on('#b98f5e', <Bento />, 0.82, 0, 6),
  randoseru: on(C.paper, <Randoseru name="阿赖耶" />, 0.78, -10, 10),
  hydrangea: on(C.ink2, <Hydrangea grow={1} />, 0.62, 0, -20),
  nadeshiko: on(C.paper, <Nadeshiko open={1} />, 1.0),
  safe: on(C.ink, <SafeIcon />, 0.9),
  yarn: on(C.ink, <YarnBall r={120} />, 1.0),
  melon: on('#1c2236', <Watermelon />, 0.8),
};

/** a strip of film. reel: memory keys; at: which frame (float) sits at the centre; blur: horizontal motion blur */
export const FilmStrip: React.FC<{reel: string[]; at: number; id: string; cx?: number; cy?: number; rot?: number; scale?: number; blur?: number}> = ({reel, at, id, cx = W / 2, cy = 520, rot = 0, scale = 1, blur = 0}) => {
  const {f} = useShot();
  const R = rng(f * 13 + 5);                     // dust changes every frame
  const S = rng(Math.floor(f / 5) * 7 + 1);     // a scratch lasts a few frames
  const span = Math.ceil(W / PITCH) + 2;
  const first = Math.floor(at) - span, last = Math.ceil(at) + span;
  const holes: React.ReactNode[] = [];
  const HP = PITCH / 8;                          // eight holes a frame
  for (let k = Math.floor((at - span) * 8); k <= (at + span) * 8; k++) {
    const x = k * HP - at * PITCH;
    for (const y of [-STRIP_H / 2 + MARGIN / 2, STRIP_H / 2 - MARGIN / 2]) holes.push(<rect key={`${k}${y}`} x={x - 13} y={y - 18} width={26} height={36} rx={5} fill="#f3ead6" opacity={0.92} />);
  }
  const frames: React.ReactNode[] = [];
  for (let i = Math.max(0, first); i <= Math.min(reel.length - 1, last); i++) {
    const x = (i - at) * PITCH;
    frames.push(
      <g key={i} transform={`translate(${x} 0)`}>
        <g clipPath={`url(#clip-${id})`}>
          <g filter={`url(#old-${id})`}>{MEMORIES[reel[i]]}</g>
          <rect x={-FW / 2} y={-FH / 2} width={FW} height={FH} fill={`url(#vig-${id})`} />
        </g>
      </g>,
    );
  }
  // dust and hair on the gate, a scratch down the film
  const dust = Array.from({length: 9}, (_, i) => {
    const x = (R() - 0.5) * W, y = (R() - 0.5) * FH, r = 1 + R() * 3.2, light = R() < 0.4;
    return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * (0.6 + R())} fill={light ? '#fff6e6' : '#1a120c'} opacity={0.5 + R() * 0.4} />;
  });
  const sx = (S() - 0.5) * W * 0.9;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale})`}>
      <defs>
        <clipPath id={`clip-${id}`}><rect x={-FW / 2} y={-FH / 2} width={FW} height={FH} rx={10} /></clipPath>
        <filter id={`old-${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0.42" />
          <feComponentTransfer>
            <feFuncR type="linear" slope={0.9} intercept={0.09} />
            <feFuncG type="linear" slope={0.84} intercept={0.07} />
            <feFuncB type="linear" slope={0.7} intercept={0.05} />
          </feComponentTransfer>
        </filter>
        <radialGradient id={`vig-${id}`} cx="50%" cy="50%" r="72%">
          <stop offset="55%" stopColor="#1b120a" stopOpacity={0} />
          <stop offset="100%" stopColor="#1b120a" stopOpacity={0.55} />
        </radialGradient>
        <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 89} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.04  2.2 0 0 0 -1.05" />
        </filter>
        <filter id={`mb-${id}`} x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
      </defs>
      <g filter={blur > 0.5 ? `url(#mb-${id})` : undefined}>
        <rect x={-W} y={-STRIP_H / 2} width={W * 2} height={STRIP_H} fill={BASE} />
        {holes}
        {frames}
      </g>
      <rect x={-W} y={-STRIP_H / 2} width={W * 2} height={STRIP_H} filter={`url(#grain-${id})`} opacity={0.55} />
      {dust}
      <path d={`M${sx} ${-STRIP_H / 2} L${sx + (S() - 0.5) * 14} ${STRIP_H / 2}`} stroke="#fff3df" strokeWidth={1.1} opacity={0.18 + S() * 0.25} />
      <rect x={-W} y={-STRIP_H / 2} width={W * 2} height={STRIP_H} fill="#000" opacity={0.03 + R() * 0.06} />
    </g>
  );
};

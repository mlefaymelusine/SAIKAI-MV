// Verse 3, final chorus, outro (3:43 - 5:24)
import React from 'react';
import {AMBER, Cam, Glow, hand, INK, poly, Stroke, VERMIL} from './core';
import {Glints, Lamp, Ripples, Snow, Splashes, Word, Seal} from './fx';
import {blossom, boatPath, bridge, cupPath, doorFrame, LAMP_A, LAMP_B, lampPath, leftBank, nadeshikoPts, rightBank, sCurve} from './shapes';
import {clamp, eslow, fade, lerp, lin, P, prog, rng, smooth} from './util';
import type {Shot} from './scenes1';

// 21. "What do I know about love? / How can I recreate what I've never had?" — the door, traced again and again; it stays shut
const doors21 = [doorFrame(211, -14, 6, -0.012), doorFrame(212, 10, -4, 0.008), doorFrame(213, 0, 0, 0)];
const panel21 = hand([[780, 200, 1], [1140, 200, 1], [1140, 920, 1], [780, 920, 1]], {seed: 214, jit: 1.5, closed: true});
export const S21: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 560]} to={[1.05, 960, 560]}>
    {doors21.map((d, i) => <Stroke key={i} d={d} t={t} a={0.3 + i * 2.6} b={2.7 + i * 2.6} w={2.4} o={0.3 + i * 0.22} pen />)}
    <Stroke d={panel21} t={t} a={7.0} b={8.4} w={2} o={0.5} />
  </Cam>
);

// 22. "All I know is that I must keep you thriving" — a sprout
const ground22 = hand([[200, 820], [600, 816], [900, 822], [1020, 812], [1400, 820], [1720, 816]], {seed: 221, jit: 2});
const stemPts: P[] = [[960, 818], [956, 760], [966, 700], [958, 620], [962, 540], [956, 470], [960, 400]];
const stem22 = hand(stemPts, {seed: 222, jit: 1.5});
const coty = [hand([[958, 700], [915, 672], [880, 676], [918, 694], [958, 704]], {seed: 223, jit: 0.6}), hand([[962, 700], [1004, 670], [1040, 672], [1002, 694], [962, 704]], {seed: 224, jit: 0.6})];
const leaves = [[620, -1], [540, 1], [470, -1]].map(([y, s], i) => hand([[960, y], [960 + s * 50, y - 36], [960 + s * 96, y - 30], [960 + s * 52, y - 6], [960, y + 6]], {seed: 225 + i, jit: 0.6}));
export const S22: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.18, 960, 720]} to={[1.3, 960, 720]}>
    <Stroke d={ground22} t={t} a={0.2} b={2.4} w={2.4} pen />
    <Stroke d={stem22} t={t} a={2.4} b={6.6} w={2.2} pen ease={lin} />
    {coty.map((d, i) => <Stroke key={i} d={d} t={t} a={3.6 + i * 0.4} b={4.6 + i * 0.4} w={1.8} />)}
    <Lamp x={560} y={818} s={0.8} t={t} lit={0.75} flicker={1} />
  </Cam>
);

// 23. "If nutrients are what you lack / I will water you with every drop of blood I have" — amber drops; it grows and flowers
const bloom = poly(nadeshikoPts(0, 0, 120, 9), true);
export const S23: Shot = ({t, T}) => {
  const drops = Array.from({length: 7}, (_, i) => {
    const t0 = 1.0 + i * 1.15, k = (t - t0) / 1.0;
    return {k, x: 960 + ((i * 37) % 60) - 30};
  });
  const bl = prog(t, 7.4, 10.6, eslow);
  return (
    <Cam t={t} T={T} from={[1.3, 960, 720]} to={[1.0, 960, 560]} ease={eslow}>
      <Stroke d={ground22} t={t} w={2.4} />
      <Stroke d={stem22} t={t} a={-6} b={7.6} w={2.2} ease={lin} />
      {coty.map((d, i) => <Stroke key={i} d={d} t={t} w={1.8} />)}
      {leaves.map((d, i) => <Stroke key={i} d={d} t={t} a={2.0 + i * 1.6} b={3.2 + i * 1.6} w={1.8} />)}
      <Lamp x={560} y={818} s={0.8} t={t} lit={0.75} flicker={1} />
      {drops.map((d, i) => d.k > 0 && d.k < 1.4 ? (
        d.k < 1 ? <path key={i} transform={`translate(${d.x} ${lerp(80, 805, d.k * d.k)})`} d="M0 -14C4 -6 8 -1 8 4A8 8 0 0 1 -8 4C-8 -1 -4 -6 0 -14Z" fill={VERMIL} opacity={0.85} />
          : <ellipse key={i} cx={d.x} cy={815} rx={6 + (d.k - 1) * 60} ry={(6 + (d.k - 1) * 60) * 0.22} fill="none" stroke={VERMIL} strokeWidth={1.6} opacity={(1.4 - d.k) * 2} />
      ) : null)}
      <g transform={`translate(960 392) scale(${(0.15 + 0.85 * bl).toFixed(3)} ${(0.08 + 0.42 * bl).toFixed(3)})`}>
        {bl > 0 && <path d={bloom} fill={VERMIL} opacity={0.38 * bl} filter="url(#soft)" />}
        <path d={bloom} fill="none" stroke={INK} strokeWidth={2.4 / (0.5 + 0.5 * bl)} opacity={0.85 * smooth(7.4, 8.0, t)} vectorEffect="non-scaling-stroke" />
      </g>
    </Cam>
  );
};

// the cross-section river used for the finale
const lb = hand(leftBank, {seed: 241, jit: 2}), rb = hand(rightBank, {seed: 242, jit: 2});
const water = hand([[606, 874], [800, 870], [1000, 877], [1314, 872]], {seed: 243, jit: 1.5});
const br = bridge();
const archD = hand(br.arch.filter((_, i) => i % 6 === 0).map((p) => p as P), {seed: 244, jit: 1.5});
const railD = hand(br.rail.filter((_, i) => i % 6 === 0).map((p) => p as P), {seed: 245, jit: 1.5});
const postsD = br.arch.filter((_, i) => i % 6 === 3).map((p, i) => hand([[p[0], p[1]], [p[0], br.rail[i * 6 + 3][1]]], {seed: 246 + i, jit: 0.8}));

// 24. "But now I know that / Sacrifice is the easy path" — one bank and its lantern quietly un-draw
export const S24: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 600]} to={[1.04, 960, 620]}>
    <Stroke d={lb} t={t} w={2.8} erase={[1.0, 5.2]} />
    <Stroke d={rb} t={t} w={2.8} />
    <Stroke d={water} t={t} w={2.2} />
    <Ripples t={t} x0={620} x1={1300} y0={882} y1={1060} n={30} seed={24} />
    <Lamp x={LAMP_A[0]} y={LAMP_A[1]} t={t} lit={0.9 * (1 - smooth(0.6, 3.6, t))} o={0.9 * (1 - smooth(2.0, 4.6, t))} />
    <Lamp x={LAMP_B[0]} y={LAMP_B[1]} t={t} lit={0.85} flicker={1} seed={2} />
  </Cam>
);

// 25. "My absence cannot ever change the fact / I wanted the very best for you, believe me" — redrawn, and the bridge is finished
export const S25: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.04, 960, 620]} to={[1.0, 960, 560]}>
    <Stroke d={lb} t={t} a={0.0} b={1.8} w={3} pen />
    <Stroke d={rb} t={t} w={2.8} />
    <Stroke d={water} t={t} w={2.2} />
    <Lamp x={LAMP_A[0]} y={LAMP_A[1]} t={t} a={1.2} b={2.6} lit={prog(t, 2.6, 4.0)} pen flicker={1} />
    <Lamp x={LAMP_B[0]} y={LAMP_B[1]} t={t} lit={0.9} flicker={1} seed={2} />
    <Stroke d={archD} t={t} a={2.8} b={7.4} w={3} pen ease={eslow} />
    <Stroke d={railD} t={t} a={4.6} b={8.6} w={2.4} pen ease={eslow} />
    {postsD.map((d, i) => <Stroke key={i} d={d} t={t} a={6.0 + i * 0.25} b={6.6 + i * 0.25} w={1.8} />)}
    <Ripples t={t} x0={620} x1={1300} y0={882} y1={1060} n={30} seed={25} />
    {[0, 1, 2].map((i) => {
      const u = ((t * 0.035 + i * 0.33) % 1);
      return <path key={i} d={boatPath(lerp(560, 1360, u), 900 + i * 40, 0.45 + i * 0.12, 250 + i)} fill="none" stroke={INK} strokeWidth={1.8} opacity={0.8 * fade(u, 0, 1, 0.08) * smooth(3, 5, t)} />;
    })}
    <Glints t={t} x0={640} x1={1280} y0={890} y1={1060} n={40} o={smooth(6, 9, t)} />
  </Cam>
);

// 26. "Our threads can never be cut / And S is not for sayonara" — two lines from the two lanterns weave one S
const SC = [960, 190, 95] as const;
const sm = sCurve(SC[0], SC[1], SC[2], 120, 210);
const half = sm.length >> 1;
const upper = sm.slice(0, half + 1), lower = sm.slice(half).reverse();
const threadA = hand([[330, 630], [450, 540], [620, 432], [760, 380], [860, 392], ...lower.filter((_, i) => i % 5 === 0).map((p) => p as P)], {seed: 261, jit: 1.2});
const threadB = hand([[1590, 630], [1500, 480], [1380, 330], [1240, 170], [1100, 40], ...upper.filter((_, i) => i % 5 === 0).map((p) => p as P)], {seed: 262, jit: 1.2});
const Scene26Base: React.FC<{t: number; o?: number}> = ({t, o = 1}) => (
  <g opacity={o}>
    <Stroke d={lb} t={t} w={2.8} />
    <Stroke d={rb} t={t} w={2.8} />
    <Stroke d={water} t={t} w={2.2} />
    <Stroke d={archD} t={t} w={3} />
    <Stroke d={railD} t={t} w={2.4} />
    {postsD.map((d, i) => <Stroke key={i} d={d} t={t} w={1.8} />)}
    <Ripples t={t} x0={620} x1={1300} y0={882} y1={1060} n={30} seed={26} />
  </g>
);
export const S26: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 560]} to={[1.08, 960, 420]}>
    <Scene26Base t={t} o={1 - 0.35 * smooth(1, 5, t)} />
    <Lamp x={LAMP_A[0]} y={LAMP_A[1]} t={t} lit={1} flicker={1} />
    <Lamp x={LAMP_B[0]} y={LAMP_B[1]} t={t} lit={1} flicker={1} seed={2} />
    <Stroke d={threadA} t={t} a={0.4} b={6.6} w={2.8} pen ease={eslow} />
    <Stroke d={threadB} t={t} a={0.4} b={6.6} w={2.8} pen ease={eslow} />
    <Glow x={960} y={190} r={260} o={smooth(6.0, 7.6, t) * 0.8} />
  </Cam>
);

// 27. "Will you forgive me at last?" — the two ends tie a knot; the two lights lean together
const knot = poly(Array.from({length: 241}, (_, i) => {
  const a = (i / 240) * Math.PI * 2;
  return [960 + (Math.sin(a) + 2 * Math.sin(2 * a)) * 24, 194 + (Math.cos(a) - 2 * Math.cos(2 * a)) * 24];
}), true);
export const S27: Shot = ({t, T}) => {
  const lean = smooth(4, 12, t);
  return (
    <Cam t={t} T={T} from={[1.08, 960, 420]} to={[0.96, 960, 540]} ease={eslow}>
      <Scene26Base t={t} o={0.65} />
      <g opacity={1 - 0.55 * smooth(0.5, 3, t)}>
        <Stroke d={threadA} t={t} w={2.8} />
        <Stroke d={threadB} t={t} w={2.8} />
      </g>
      <Stroke d={knot} t={t} a={0.6} b={4.6} w={3} pen ease={eslow} />
      <Lamp x={LAMP_A[0]} y={LAMP_A[1]} t={t} lit={1} flicker={1} />
      <Lamp x={LAMP_B[0]} y={LAMP_B[1]} t={t} lit={1} flicker={1} seed={2} />
      <Glow x={lerp(330, 760, lean)} y={lerp(636, 400, lean)} r={lerp(210, 420, lean)} o={0.8 * lean} />
      <Glow x={lerp(1590, 1160, lean)} y={lerp(636, 400, lean)} r={lerp(210, 420, lean)} o={0.8 * lean} />
      <Glow x={960} y={190} r={300} o={0.8 * smooth(1, 5, t)} />
      <Snow t={t} n={50} o={smooth(9, 13, t) * 0.7} seed={270} speed={32} />
    </Cam>
  );
};

// 28. outro: the whole film as one long scroll, a single line running under all of it
const SCROLL = 5200;
const scrollBase = hand(Array.from({length: 40}, (_, i) => [-200 + (i / 39) * (SCROLL + 400), 760 + Math.sin(i * 0.9) * 8] as P), {seed: 281, jit: 2});
const motifs: {x: number; d: string; s: number}[] = [
  {x: 300, d: doorFrame(282), s: 0.3},
  {x: 800, d: poly(nadeshikoPts(960, 470, 175, 4), true), s: 0.42},
  {x: 1300, d: boatPath(960, 700, 2.2), s: 0.42},
  {x: 1800, d: poly(Array.from({length: 120}, (_, i) => { const a = (-112 + (i / 119) * 336) * Math.PI / 180; return [960 + Math.cos(a) * 330, 520 + Math.sin(a) * 330]; })), s: 0.3},
  {x: 2300, d: cupPath(880, 650, 72, 104, 164) + cupPath(1060, 650, 72, 104, 165), s: 0.5},
  {x: 2800, d: blossom(960, 520, 120, 0), s: 0.5},
  {x: 3300, d: cupPath(960, 470, 190, 300, 181), s: 0.32},
  {x: 3800, d: hand([[470, 712], [960, 472], [1450, 712]], {seed: 283}), s: 0.4},
];
export const S28: Shot = ({t, T}) => {
  const px = lerp(500, 4500, prog(t, 0, T, lin));
  return (
    <Cam t={t} T={T} from={[0.85, 500, 600]} to={[0.85, 4500, 600]} ease={lin}>
      <Stroke d={scrollBase} t={t} a={-4} b={T + 4} w={2.6} pen ease={lin} />
      {motifs.map((m, i) => (
        <g key={i} transform={`translate(${m.x} 760) scale(${m.s}) translate(-960 -${m.d === motifs[0].d ? 920 : 720})`} opacity={0.75 * smooth(m.x - 1500, m.x - 900, px)}>
          <path d={m.d} fill="none" stroke={INK} strokeWidth={2.4 / m.s} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <g transform="translate(4300 0)">
        <Lamp x={0} y={760} s={0.8} t={t} lit={smooth(12, 15, t)} />
        <Lamp x={110} y={760} s={0.8} t={t} lit={smooth(12.6, 15.6, t)} seed={2} />
      </g>
      <Snow t={t} n={40} o={0.5} seed={280} speed={28} />
    </Cam>
  );
};

// 29. the line ends; the pen lifts; paper
const lastLine = hand([[-100, 760], [400, 756], [800, 762], [1100, 758], [1260, 740], [1320, 700]], {seed: 291, jit: 2});
export const S29: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 560]} to={[1.04, 960, 540]}>
    <g opacity={1 - smooth(9.5, 13, t)}>
      <Stroke d={lastLine} t={t} a={0.0} b={4.6} w={2.6} pen ease={(x) => 1 - Math.pow(1 - x, 2.2)} />
      <Lamp x={1150} y={758} s={0.6} t={t} lit={0.7 * (1 - smooth(5, 9, t))} />
      <Lamp x={1230} y={752} s={0.6} t={t} lit={0.7 * (1 - smooth(5, 9, t))} seed={2} />
    </g>
    <Word text="SAIKAI" x={960} y={500} size={64} t={t} a={6.0} b={T - 0.4} f={2} o={0.8} family="MV_en" spacing={14} />
    <Seal ch="再会" x={960} y={600} t={t} a={7.2} b={T - 0.4} size={36} />
    <Word text="Mili — Saikai   ·   fan-made music video" x={960} y={1000} size={20} t={t} a={8.0} b={T - 0.6} f={2} o={0.45} family="MV_en" spacing={2} />
  </Cam>
);

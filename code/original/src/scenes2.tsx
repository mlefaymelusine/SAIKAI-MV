// Interlude, verse 2, the instrumental bridge (2:04 - 3:43)
import React from 'react';
import {AMBER, Brush, Cam, hand, INK, poly, Stroke} from './core';
import {Blot, Fireflies, Lamp, Petals, Rain, Ripples, Seal, Splashes} from './fx';
import {blossom, cupPath, reedRow} from './shapes';
import {clamp, eslow, lerp, lin, noise1, P, prog, rng, smooth} from './util';
import type {Shot} from './scenes1';

// 12. spring: a branch reaches in, blossoms open, petals fall
const branchMain = hand([[2060, 230], [1800, 270], [1560, 330], [1330, 352], [1120, 400], [930, 430]], {seed: 121, jit: 3});
const twigs = [
  [[1700, 290], [1640, 220], [1600, 170]], [[1450, 342], [1420, 440], [1370, 500]], [[1250, 370], [1180, 300], [1150, 250]], [[1060, 412], [1010, 480]],
].map((p, i) => hand(p as P[], {seed: 122 + i, jit: 1.5}));
const blossoms12 = [[1600, 168], [1650, 300], [1372, 502], [1520, 330], [1150, 246], [1210, 395], [1008, 484], [940, 425], [1300, 345], [1430, 455]];
export const S12: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 1120, 430]} to={[1.07, 1040, 470]}>
    <Stroke d={branchMain} t={t} a={0.3} b={4.4} w={3.4} pen />
    {twigs.map((d, i) => <Stroke key={i} d={d} t={t} a={2.0 + i * 0.6} b={3.0 + i * 0.6} w={2.2} />)}
    {blossoms12.map(([x, y], i) => {
      const k = prog(t, 3.2 + i * 0.36, 4.4 + i * 0.36, (x) => 1 - Math.pow(1 - x, 3));
      return k > 0 ? <g key={i} transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
        <path d={blossom(x, y, 22 + (i % 3) * 5, i)} fill="none" stroke={INK} strokeWidth={1.8} opacity={0.85} />
        <circle cx={x} cy={y} r={3} fill={INK} opacity={0.7} />
      </g> : null;
    })}
    <Petals t={t} n={26} o={smooth(4, 7, t)} />
    <Seal ch="春" x={300} y={830} t={t} a={2.2} b={9.6} />
  </Cam>
);

// 13. an empty chair by the window; the window's shadow slides across the floor
const win = hand([[1150, 190, 1], [1660, 190, 1], [1660, 700, 1], [1150, 700, 1]], {seed: 131, jit: 1.5, closed: true});
const winGrid = [
  ...[1278, 1405, 1532].map((x) => hand([[x, 192], [x, 698]], {seed: x, jit: 1})),
  ...[318, 445, 572].map((y) => hand([[1152, y], [1658, y]], {seed: y, jit: 1})),
];
const floor13 = hand([[-100, 862], [600, 858], [1300, 866], [2100, 860]], {seed: 132, jit: 2});
const chair = [
  hand([[640, 864, 1], [640, 642, 1], [882, 642, 1], [882, 864, 1]], {seed: 133, jit: 1.2}),
  hand([[640, 642, 1], [672, 600, 1], [672, 430, 1], [852, 430, 1], [852, 600, 1], [882, 642, 1]], {seed: 134, jit: 1.2}),
  hand([[672, 600], [852, 600]], {seed: 135, jit: 1}),
  hand([[672, 488], [852, 488]], {seed: 136, jit: 1}),
];
export const S13: Shot = ({t, T}) => {
  const sx = lerp(0, -260, t / T);
  return (
    <Cam t={t} T={T} from={[1.0, 980, 560]} to={[1.08, 900, 600]}>
      <Stroke d={floor13} t={t} w={2.6} />
      <Stroke d={win} t={t} a={0.3} b={3.0} w={2.8} pen />
      {winGrid.map((d, i) => <Stroke key={i} d={d} t={t} a={2.2 + i * 0.25} b={2.9 + i * 0.25} w={1.6} o={0.75} />)}
      {chair.map((d, i) => <Stroke key={i} d={d} t={t} a={3.2 + i * 1.1} b={4.6 + i * 1.1} w={2.6} pen={i < 2} />)}
      <g opacity={0.5 * smooth(2.5, 5, t)} transform={`translate(${sx} 0)`}>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={1050 + i * 120} y1={872} x2={900 + i * 150} y2={1080} stroke={INK} strokeWidth={1.2} opacity={0.4} />)}
        {[0, 1, 2].map((i) => <line key={i} x1={1050 - i * 40} y1={900 + i * 55} x2={1530 + i * 20} y2={900 + i * 55} stroke={INK} strokeWidth={1.2} opacity={0.35} />)}
      </g>
      <Lamp x={990} y={862} s={0.7} t={t} lit={0} />
      <Petals t={t + 30} n={7} o={smooth(1, 4, t) * 0.8} box={[1160, 200, 1650, 690]} seed={13} />
    </Cam>
  );
};

// 14. "I knew I must step up" — steps climb from the bank
const steps: P[] = [[160, 900]];
for (let i = 0; i < 9; i++) { const x = 300 + i * 82, y = 900 - i * 52; steps.push([x, y, 1], [x, y - 52, 1]); }
steps.push([1100, 432]);
const stepsD = hand(steps, {seed: 141, jit: 1.6});
const rail14 = hand([[300, 760], [700, 530], [1100, 300]], {seed: 142, jit: 2});
const posts14 = [0, 3, 6, 8].map((i) => { const x = 300 + i * 82, y = 900 - i * 52; return hand([[x + 4, y - 52], [x + 4, y - 150]], {seed: 143 + i, jit: 1}); });
export const S14: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.16, 480, 760]} to={[1.16, 860, 560]}>
    <Stroke d={stepsD} t={t} a={0.2} b={5.0} w={3} pen ease={lin} />
    {posts14.map((d, i) => <Stroke key={i} d={d} t={t} a={1.2 + i * 1.0} b={1.8 + i * 1.0} w={2.2} />)}
    <Stroke d={rail14} t={t} a={3.6} b={6.2} w={2.4} />
    <Ripples t={t} x0={900} x1={2000} y0={700} y1={900} n={24} seed={14} o={0.8} />
  </Cam>
);

// 15. "You deserve the world and more" — one enso, a lantern inside
const ensoPts = Array.from({length: 180}, (_, i) => {
  const u = i / 179, a = (-112 + u * 336) * Math.PI / 180, r = 330 * (1 + noise1(u * 4, 15) * 0.03);
  return [960 + Math.cos(a) * r, 520 + Math.sin(a) * r];
});
const ensoW = (u: number) => 8 + 30 * Math.pow(1 - u, 0.7) * (0.8 + 0.2 * Math.sin(u * 9)) + (u < 0.04 ? 14 * (1 - u / 0.04) : 0);
export const S15: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 540]} to={[1.07, 960, 540]}>
    <Brush pts={ensoPts} width={ensoW} t={t} a={0.6} b={3.0} id="enso15" ease={(x) => 1 - Math.pow(1 - x, 1.8)} />
    <Lamp x={960} y={700} s={0.9} t={t} a={2.8} b={4.4} lit={prog(t, 4.4, 6.0)} pen seed={2} />
  </Cam>
);

// 16. "The truth is that you'd rather / Spend our limited time together" — two cups, the steam braids
const table = hand([[380, 758], [1540, 758]], {seed: 161, jit: 1.5});
const tableLegs = [hand([[470, 760], [470, 900]], {seed: 162, jit: 1}), hand([[1450, 760], [1450, 900]], {seed: 163, jit: 1})];
const cupL = cupPath(790, 650, 72, 104, 164), cupR = cupPath(1130, 650, 72, 104, 165);
const steam = (x0: number, dir: number, t: number, seed: number) => {
  const pts: P[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, y = 625 - u * 420;
    const pull = smooth(0.15, 0.85, u) * (960 - x0) * 0.9;
    pts.push([x0 + pull + Math.sin(u * 7 + t * 1.1 * dir + seed) * 26 * u, y]);
  }
  return hand(pts, {seed, jit: 0.5});
};
export const S16: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 580]} to={[1.1, 960, 520]}>
    <Stroke d={table} t={t} a={0.2} b={2.0} w={2.8} pen />
    {tableLegs.map((d, i) => <Stroke key={i} d={d} t={t} a={1.6} b={2.4} w={2.6} />)}
    <Stroke d={cupL} t={t} a={1.8} b={3.8} w={2.6} pen />
    <Stroke d={cupR} t={t} a={2.6} b={4.6} w={2.6} pen />
    <g opacity={smooth(4.6, 7.0, t) * 0.8}>
      <Stroke d={steam(790, 1, t, 1)} t={t} w={1.8} o={0.7} bleed={false} />
      <Stroke d={steam(1130, -1, t, 2.4)} t={t} w={1.8} o={0.7} bleed={false} />
    </g>
  </Cam>
);

// 17. "Protection alone is not enough" — an umbrella over the lantern, rain all round
const ground17 = hand([[-100, 880], [700, 876], [1300, 884], [2100, 878]], {seed: 171, jit: 2});
const umb = (() => {
  const apex: [number, number] = [930, 330], pts: P[] = [];
  const ribs = 8;
  for (let i = 0; i <= ribs; i++) {
    const u = i / ribs, x = lerp(690, 1170, u), y = 545 - Math.sin(u * Math.PI) * 30;
    if (i > 0) pts.push([lerp(690, 1170, u - 0.5 / ribs), y - 22]);
    pts.push([x, y, 1]);
  }
  const canopy = hand([[690, 545, 1], [740, 420], [840, 350], [apex[0], apex[1], 1], [1020, 350], [1120, 420], [1170, 545, 1]], {seed: 172, jit: 1.5});
  const edge = hand(pts, {seed: 173, jit: 1});
  const ribsD = Array.from({length: ribs - 1}, (_, i) => { const u = (i + 1) / ribs; return hand([apex, [lerp(690, 1170, u), 545 - Math.sin(u * Math.PI) * 30]], {seed: 174 + i, jit: 1}); });
  const shaft = hand([[apex[0], apex[1] - 30], [910, 600], [880, 880]], {seed: 182, jit: 1});
  return {canopy, edge, ribsD, shaft};
})();
const shelter17 = (x: number, y: number) => x > 680 && x < 1180 && y > 360;
export const S17: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.06, 960, 560]} to={[1.0, 960, 580]}>
    <Stroke d={ground17} t={t} w={2.6} />
    <Stroke d={umb.canopy} t={t} a={0.3} b={2.4} w={2.8} pen />
    <Stroke d={umb.edge} t={t} a={2.0} b={3.6} w={2.2} pen />
    {umb.ribsD.map((d, i) => <Stroke key={i} d={d} t={t} a={3.0 + i * 0.15} b={3.8 + i * 0.15} w={1.4} o={0.7} />)}
    <Stroke d={umb.shaft} t={t} a={3.6} b={4.6} w={2.6} />
    <Lamp x={1010} y={880} s={1} t={t} lit={0.85} flicker={2.5} seed={2} />
    <Rain t={t} n={220} o={smooth(0, 1.5, t)} shelter={shelter17} />
    <Splashes t={t} n={26} x0={0} x1={1920} y0={884} y1={1020} o={smooth(0.5, 2, t)} />
  </Cam>
);

// 18. "Providing cannot fill an empty cup thirsting for love" — rain into a cracked cup that never fills
const cup18 = cupPath(960, 470, 190, 300, 181);
const crack18 = hand([[1110, 520], [1094, 580, 1], [1120, 640, 1], [1098, 700, 1], [1118, 770]], {seed: 183, jit: 0.6});
const ground18 = hand([[-100, 860], [700, 856], [1300, 864], [2100, 858]], {seed: 184, jit: 2});
export const S18: Shot = ({t, T}) => {
  const lvl = 690 + Math.sin(t * 1.7) * 5;
  const drips = Array.from({length: 5}, (_, i) => { const per = 1.5, k = ((t + i * 0.3) % per) / per; return {y: 775 + k * k * 85, o: k < 0.9 ? 1 : (1 - k) * 10}; });
  return (
    <Cam t={t} T={T} from={[1.0, 960, 560]} to={[1.12, 960, 600]}>
      <Stroke d={ground18} t={t} w={2.4} />
      <Stroke d={cup18} t={t} a={0.3} b={3.6} w={2.8} pen />
      <Stroke d={crack18} t={t} a={4.0} b={5.6} w={2} pen />
      <g opacity={smooth(5, 7, t)}>
        <path d={`M${790} ${lvl}q85 -8 170 0t170 0`} fill="none" stroke={INK} strokeWidth={1.6} opacity={0.6} />
        {drips.map((d, i) => i === 0 ? <ellipse key={i} cx={1116} cy={d.y} rx={2.6} ry={4} fill={INK} opacity={0.6 * d.o} /> : null)}
        <Splashes t={t} n={3} x0={1080} x1={1150} y0={864} y1={872} seed={18} />
      </g>
      <Rain t={t} n={110} o={0.8} seed={19} />
      <Splashes t={t} n={8} x0={800} x1={1120} y0={470} y1={500} seed={20} o={0.8} />
    </Cam>
  );
};

// 19. "I questioned myself a lot —" — the line wanders and knots itself
const tangle = (() => {
  const pts: number[][] = [];
  for (let i = 0; i <= 900; i++) {
    const u = i / 900;
    if (u < 0.12) { const k = u / 0.12; pts.push([lerp(-80, 760, k), 560 + Math.sin(k * 5) * 40]); continue; }
    const k = (u - 0.12) / 0.88, R = 240 * (1 - 0.75 * k) + 30;
    const a = k * 44 + noise1(k * 9, 3) * 1.4;
    pts.push([960 + Math.cos(a) * R * (1 + 0.35 * noise1(k * 13, 5)) - 200 * (1 - smoothK(k)), 540 + Math.sin(a * 1.13) * R * 0.8 * (1 + 0.35 * noise1(k * 11, 7))]);
  }
  return poly(pts);
})();
function smoothK(k: number) { return clamp(k * 6); }
export const S19: Shot = ({t, T}) => {
  const end = (() => { const pts = tangle.split('L'); const last = pts[pts.length - 1].replace('M', '').split(' ').map(Number); return last; })();
  return (
    <Cam t={t} T={T} from={[1.0, 900, 540]} to={[1.2, 960, 540]}>
      <Stroke d={tangle} t={t} a={0.4} b={8.4} w={2} o={0.85} pen ease={(x) => x * (0.7 + 0.3 * x)} bleed={false} />
      <Blot x={end[0]} y={end[1]} t={t} a={8.4} b={10.4} r={12} />
    </Cam>
  );
};

// 20. instrumental: summer night, reeds, fireflies cross the river between the two lanterns
const far20 = hand([[-300, 430], [400, 426], [1100, 434], [1800, 427], [2400, 432]], {seed: 201, jit: 2});
const near20 = hand([[-300, 770], [400, 766], [1100, 774], [1800, 767], [2400, 772]], {seed: 202, jit: 2});
const reeds20 = hand(reedRow(-300, 2300, 1090, 90, 300, 203), {seed: 204, jit: 1.2, step: 200});
const moon = hand(Array.from({length: 30}, (_, i) => { const a = -1.9 + (i / 29) * 5.9; return [330 + Math.cos(a) * 70, 200 + Math.sin(a) * 70] as P; }), {seed: 205, jit: 1});
export const S20: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.2, 760, 760]} to={[1.0, 960, 560]} ease={eslow}>
    <Stroke d={far20} t={t} w={2.4} a={-1} b={0} />
    <Stroke d={near20} t={t} w={2.4} a={0.3} b={4.0} pen />
    <Ripples t={t} x0={-200} x1={2200} y0={445} y1={760} n={50} seed={20} o={0.8} />
    <Lamp x={300} y={770} s={0.9} t={t} lit={0.9} flicker={1} />
    <Lamp x={1640} y={430} s={0.6} t={t} lit={0.8} flicker={1} seed={2} />
    <Stroke d={moon} t={t} a={5.0} b={8.5} w={1.8} o={0.6} />
    <Stroke d={reeds20} t={t} a={1.0} b={12.0} w={1.8} o={0.75} ease={lin} />
    <Fireflies t={t} n={30} box={[100, 520, 1000, 1000]} appear={10} drift={28} seed={31} />
    <Fireflies t={t} n={12} box={[1100, 380, 1900, 720]} appear={16} seed={32} />
    <Seal ch="蛍" x={1740} y={880} t={t} a={3.0} b={12.0} />
  </Cam>
);

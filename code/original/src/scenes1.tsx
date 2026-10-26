// Intro, verse 1 and chorus 1 (0:00 - 2:04)
import React from 'react';
import {AMBER, Cam, Glow, hand, INK, poly, Stroke, VERMIL} from './core';
import {Blot, Glints, Lamp, Ripples, Seal, Snow, Streak, Word} from './fx';
import {BOAT, reedRow, boatPath, boatPts, doorFrame, doorPanel, nadeshikoPts, offset, scribble, sCurve, SHEET, tree} from './shapes';
import {clamp, eslow, fade, lerp, lin, noise1, P, prog, rng, smooth} from './util';

export type Shot = React.FC<{t: number; T: number}>;

const farBank1 = hand([[300, 560], [520, 556], [760, 563], [980, 554], [1200, 561], [1420, 555], [1700, 561], [2200, 558]], {seed: 11, jit: 2});
const nearBank1 = hand([[2200, 762], [1700, 758], [1300, 766], [900, 757], [500, 764], [100, 759], [-300, 762]], {seed: 12, jit: 2});

// 1. paper, a drop of ink, the far bank, the title; then the near bank and two lanterns
export const S01: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.2, 760, 520]} to={[1.0, 960, 600]} ease={eslow}>
    <Blot x={300} y={560} t={t} a={1.2} b={2.4} r={6} />
    <Stroke d={farBank1} t={t} a={2.2} b={12.5} w={3} pen ease={eslow} />
    <Word text="SAIKAI" x={960} y={410} size={132} t={t} a={5.8} b={15} f={1.6} o={0.86} family="MV_en" spacing={26} />
    <Seal ch="再会" x={960} y={515} t={t} a={8.0} b={15} size={46} />
    <Stroke d={nearBank1} t={t} a={14.6} b={22} w={3} pen ease={eslow} />
    <Ripples t={t} x0={0} x1={1920} y0={580} y1={745} n={46} o={smooth(17, 23, t)} />
    <Lamp x={430} y={762} s={1} t={t} a={20.2} b={23.4} lit={prog(t, 23.6, 26)} pen />
    <Lamp x={1500} y={560} s={0.6} t={t} a={22.6} b={25} lit={prog(t, 26.4, 28.6) * 0.75} seed={2} pen />
  </Cam>
);

// 2. "When I was young and lost" — a small lantern alone among reeds
const reeds = hand(reedRow(80, 1760, 830, 120, 360, 21, [540, 760]), {seed: 22, jit: 1.2, step: 200});
export const S02: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.3, 640, 680]} to={[1.04, 900, 600]}>
    <Stroke d={reeds} t={t} a={-0.6} b={4.8} w={1.9} o={0.75} pen ease={lin} />
    <Lamp x={640} y={830} s={0.8} t={t} lit={0.85} flicker={1} />
  </Cam>
);

// 3. "You showed up, and had my doors unlocked" — the door opens, light spills
export const S03: Shot = ({t, T}) => {
  const o = prog(t, 4.4, 8.6, eslow);
  const {fx, sk, d} = doorPanel(o);
  return (
    <Cam t={t} T={T} from={[1.0, 960, 560]} to={[1.12, 960, 580]}>
      {o > 0 && (
        <g>
          <path d={`M${fx} ${200 - sk}L1140 200L1140 920L${fx} ${920 + sk}Z`} fill={AMBER} opacity={0.4 * o} />
          <path d={`M${fx} ${920 + sk}L1140 920L1640 1100L${lerp(1140, 980, o)} 1100Z`} fill="url(#streak)" opacity={o} />
          <Glow x={1060} y={560} r={520} o={o * 0.9} />
        </g>
      )}
      <Stroke d={doorFrame()} t={t} a={0.3} b={3.8} w={3} pen />
      <Stroke d={d} t={t} a={2.6} b={4.4} w={2.6} pen />
      <Stroke d={hand([[fx - 30 + 6 * o, 568], [fx - 30 + 6 * o, 600]], {seed: 9, jit: 0.4})} t={t} a={4.0} b={4.3} w={2.4} />
      <circle cx={fx - 30 + 6 * o} cy={562} r={5} fill="none" stroke={INK} strokeWidth={2.2} opacity={smooth(3.9, 4.3, t) * 0.85} />
    </Cam>
  );
};

// 4. "Like threads, petals unfold / A red kawara-nadeshiko"
const threads = [0, 1, 2].map((k) => {
  const r = rng(40 + k), pts: P[] = [];
  const y0 = 360 + k * 170;
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    pts.push([lerp(-80, 860, u), lerp(y0, 470, Math.pow(u, 1.6)) + Math.sin(u * 7 + k * 2) * 60 * (1 - u)]);
  }
  for (let i = 1; i <= 14; i++) { // curl round the centre
    const a = Math.PI + k * 2.1 + i * 0.55, rr = 110 * (1 - i / 16) + r() * 6;
    pts.push([960 + Math.cos(a) * rr, 470 + Math.sin(a) * rr]);
  }
  return hand(pts, {seed: 43 + k, jit: 2});
});
const flowerPts = nadeshikoPts(960, 470, 175, 4);
const flower = poly(flowerPts, true);
const stem = hand([[960, 560], [952, 700], [930, 860], [940, 1100]], {seed: 47, jit: 2});
const leaf1 = hand([[945, 780], [870, 740], [800, 742], [870, 770], [945, 790]], {seed: 48, jit: 1});
const leaf2 = hand([[936, 880], [1010, 830], [1080, 832], [1015, 860], [936, 892]], {seed: 49, jit: 1});
export const S04: Shot = ({t, T}) => {
  const fill = prog(t, 8.6, 12.4, eslow);
  return (
    <Cam t={t} T={T} from={[1.0, 960, 540]} to={[1.1, 960, 520]}>
      <g opacity={1 - smooth(7.6, 10.2, t)}>
        {threads.map((d, k) => <Stroke key={k} d={d} t={t} a={0.6 + k * 0.5} b={5.4 + k * 0.4} w={1.8} o={0.75} pen={k === 1} />)}
      </g>
      {fill > 0 && <path d={flower} fill={VERMIL} opacity={0.34 * fill} filter="url(#soft)" />}
      <Stroke d={flower} t={t} a={6.4} b={11.0} w={2.6} pen ease={eslow} />
      <circle cx={960} cy={470} r={10} fill="none" stroke={INK} strokeWidth={2} opacity={smooth(10.6, 11.4, t) * 0.8} />
      <Stroke d={stem} t={t} a={10.6} b={12.6} w={2.6} />
      <Stroke d={leaf1} t={t} a={11.6} b={12.8} w={2.2} />
      <Stroke d={leaf2} t={t} a={12.2} b={13.4} w={2.2} />
    </Cam>
  );
};

// 5. "You have shown me that I am still capable of caring for someone else" — a letter, written, folded into a boat
const sheetD = (k: number) => {
  const tgt = boatPts(960, 700, 3.1);
  const pts: P[] = SHEET.map((p, i) => [lerp(p[0], tgt[i][0], k), lerp(p[1], tgt[i][1], k), 1] as P);
  return hand(pts, {seed: 50, jit: 1.6 * (1 - k) + 1, closed: true, step: 60});
};
const sheet0 = sheetD(0);
const lines = Array.from({length: 7}, (_, i) => {
  const y = 390 + i * 58, x0 = 690 + i * -3, x1 = i === 6 ? 980 : 1220 - i * 4;
  return scribble(x0, y + i * -1.5, x1, y - 12 - i * 2, 60 + i);
});
export const S05: Shot = ({t, T}) => {
  const fold = prog(t, 10.2, 13.2, eslow);
  return (
    <Cam t={t} T={T} from={[1.05, 960, 560]} to={[1.0, 960, 580]}>
      {fold <= 0 ? <Stroke d={sheet0} t={t} a={0.2} b={2.8} w={2.6} pen /> : <Stroke d={sheetD(fold)} t={t} w={2.6 + fold * 0.6} />}
      <g opacity={1 - smooth(9.4, 10.6, t)}>
        {lines.map((d, i) => <Stroke key={i} d={d} t={t} a={2.9 + i * 1.0} b={3.85 + i * 1.0} w={1.7} o={0.8} pen ease={lin} bleed={false} />)}
      </g>
      <Word text="再" x={960} y={668} size={44} t={t} a={12.6} b={40} f={1} o={0.7} />
    </Cam>
  );
};

// 6. "That I still bare the same innocence inside" — the boat goes on the water; first snow
const far6 = hand([[-200, 432], [300, 428], [800, 436], [1300, 427], [1800, 434], [2300, 430]], {seed: 61, jit: 2});
const near6 = hand([[-200, 900], [400, 896], [1000, 904], [1600, 897], [2300, 902]], {seed: 62, jit: 2});
export const S06: Shot = ({t, T}) => {
  const bx = lerp(760, 1180, t / T), by = 690 + Math.sin(t * 1.3) * 4, rot = Math.sin(t * 0.9) * 1.6;
  return (
    <Cam t={t} T={T} from={[1.0, 900, 620]} to={[1.07, 1020, 640]}>
      <Stroke d={far6} t={t} a={0.1} b={3.2} w={2.8} pen />
      <Stroke d={near6} t={t} w={2.8} />
      <Ripples t={t} x0={-100} x1={2000} y0={450} y1={880} n={60} seed={6} />
      <Lamp x={330} y={900} s={1.2} t={t} lit={0.9} flicker={1} />
      <g transform={`translate(${bx} ${by}) rotate(${rot})`}>
        <path d={boatPath(0, 0, 1.4)} fill="none" stroke={INK} strokeWidth={2.6} opacity={0.88} strokeLinejoin="round" />
        <text x={0} y={-24} fontFamily="MV_brush" fontSize={20} fill={INK} textAnchor="middle" dominantBaseline="central" opacity={0.65}>再</text>
        <g transform="scale(1 -0.55)" opacity={0.18}>
          <path d={boatPath(0, -4, 1.4)} fill="none" stroke={INK} strokeWidth={2.4} />
        </g>
      </g>
      <Snow t={t} n={50} o={smooth(8.6, 12, t) * 0.8} seed={66} />
      <Seal ch="冬" x={1540} y={330} t={t} a={9.4} b={14.6} />
    </Cam>
  );
};

// 7. "Cause now I know that / Pain cannot define the past" — winter river, a bare tree
const tree7 = tree(1360, 476, 170, 71);
export const S07: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.08, 820, 600]} to={[1.08, 1120, 600]}>
    <Stroke d={far6} t={t} w={2.8} />
    <Stroke d={near6} t={t} w={2.8} />
    {tree7.map((b, i) => <Stroke key={i} d={b.d} t={t} a={0.6 + b.depth * 0.9} b={1.8 + b.depth * 0.95} w={Math.max(1.1, 3.4 - b.depth * 0.45)} o={0.85} pen={i === 0} />)}
    <Ripples t={t} x0={-100} x1={2100} y0={450} y1={880} n={60} seed={7} />
    <Lamp x={300} y={900} s={1.2} t={t} lit={0.9} flicker={1} />
    <g transform={`translate(${lerp(640, 900, t / T)} ${700 + Math.sin(t * 1.2) * 3})`}>
      <path d={boatPath(0, 0, 0.8)} fill="none" stroke={INK} strokeWidth={2.2} opacity={0.85} />
    </g>
    <Snow t={t + 12} n={150} o={0.9} seed={66} speed={46} />
  </Cam>
);

// 8. "We are built to overcome endless mishaps / You know, it is not so bad" — boats down a diagonal river
const riverC = (u: number) => [lerp(-150, 2100, u), lerp(330, 860, u) + Math.sin(u * 3.2) * 50];
const bankA8 = hand(Array.from({length: 12}, (_, i) => { const [x, y] = riverC(i / 11); return [x, y - lerp(70, 190, i / 11)] as P; }), {seed: 81, jit: 2.5});
const bankB8 = hand(Array.from({length: 12}, (_, i) => { const [x, y] = riverC(i / 11); return [x, y + lerp(70, 190, i / 11)] as P; }), {seed: 82, jit: 2.5});
const rocks8 = [[0.42, -30], [0.6, 40], [0.71, -60]].map(([u, o], i) => {
  const [x, y] = riverC(u);
  return {x, y: y + o, d: hand([[x - 26, y + o + 6], [x - 14, y + o - 14], [x + 12, y + o - 16], [x + 28, y + o + 6]], {seed: 83 + i, jit: 1.5})};
});
export const S08: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.0, 960, 560]} to={[1.1, 1060, 600]}>
    <Stroke d={bankA8} t={t} a={-1} b={0} w={2.8} />
    <Stroke d={bankB8} t={t} a={0.0} b={3.6} w={2.8} pen />
    {rocks8.map((r, i) => (
      <g key={i}>
        <Stroke d={r.d} t={t} w={2.2} a={1 + i * 0.4} b={1.8 + i * 0.4} />
        {[0, 1].map((j) => <path key={j} d={`M${r.x + 30} ${r.y + 4 + j * 9}q${16 + j * 8} ${-6} ${34 + j * 12} 4`} fill="none" stroke={INK} strokeWidth={1.5} opacity={0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i + j))} />)}
      </g>
    ))}
    {Array.from({length: 11}, (_, i) => {
      const u = ((i / 11 + t * 0.028) % 1);
      const [x, y] = riverC(u);
      const s = lerp(0.35, 1.0, u), off = Math.sin(i * 2.3) * lerp(30, 90, u);
      const a = fade(u, 0, 1, 0.08);
      return <g key={i} transform={`translate(${x} ${y + off + Math.sin(t * 1.4 + i) * 3}) rotate(${Math.sin(t + i) * 3 + 8})`} opacity={a}>
        <path d={boatPath(0, 0, s, 90 + i)} fill="none" stroke={INK} strokeWidth={2.2} opacity={0.85} />
      </g>;
    })}
    <Glints t={t} x0={300} x1={1900} y0={430} y1={820} n={70} o={smooth(2, 5, t)} />
  </Cam>
);

// 9. "When you are with me / Cherish as long as we last" — two lanterns, a path of light between them
const pathLight = Array.from({length: 40}, (_, i) => {
  const u = i / 39;
  return [lerp(330, 1620, u), lerp(860, 450, u) + Math.sin(u * Math.PI) * 30];
});
export const S09: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.16, 520, 640]} to={[1.16, 1420, 540]}>
    <Stroke d={far6} t={t} w={2.8} />
    <Stroke d={near6} t={t} w={2.8} />
    <Ripples t={t} x0={-100} x1={2100} y0={450} y1={880} n={60} seed={9} />
    <Lamp x={330} y={900} s={1.2} t={t} lit={1} flicker={1} />
    <Lamp x={1620} y={432} s={0.75} t={t} lit={0.4 + 0.6 * smooth(0.5, 2.5, t)} flicker={1} seed={2} />
    {pathLight.map(([x, y], i) => {
      const u = i / 39, k = smooth(1.2 + u * 3.5, 2.0 + u * 3.5, t);
      const tw = 0.6 + 0.4 * Math.sin(t * 2.4 + i * 1.7);
      return k > 0 ? <rect key={i} x={x - 14} y={y} width={28} height={2.6} rx={1.3} fill={AMBER} opacity={k * tw * 0.85} /> : null;
    })}
  </Cam>
);

// 10. "Cause S is not for sayonara" — the river from above bends into a great S
const sC = sCurve(960, 540, 215);
const sA = hand(offset(sC, 48).filter((_, i) => i % 8 === 0).map((p) => p as P), {seed: 101, jit: 3});
const sB = hand(offset(sC, -48).filter((_, i) => i % 8 === 0).map((p) => p as P), {seed: 102, jit: 3});
const sMid = poly(sC);
export const S10: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[1.14, 960, 540]} to={[0.98, 960, 540]}>
    <Stroke d={sA} t={t} a={0.0} b={3.0} w={3} pen />
    <Stroke d={sB} t={t} a={0.15} b={3.15} w={3} pen />
    <path d={sMid} pathLength={1} fill="none" stroke={AMBER} strokeWidth={5} strokeLinecap="round" strokeDasharray="0.12 3" strokeDashoffset={-prog(t, 2.2, 5.2, lin) * 1.12 + 0.12} opacity={0.75 * smooth(2.2, 2.8, t)} />
    {[0.2, 0.47, 0.75].map((u, i) => {
      const k = (u + t * 0.03) % 1, p = sC[Math.floor(k * (sC.length - 1))];
      return <path key={i} d={boatPath(p[0], p[1] + 10, 0.32, 110 + i)} fill="none" stroke={INK} strokeWidth={1.6} opacity={0.8 * smooth(1.2, 2.2, t)} />;
    })}
  </Cam>
);

// 11. "Let memories play back" — everything un-draws; ghosts of earlier pictures rewind past
export const S11: Shot = ({t, T}) => (
  <Cam t={t} T={T} from={[0.98, 960, 540]} to={[1.04, 960, 540]}>
    <Stroke d={sA} t={t} a={0.2} b={3.2} w={3} rev />
    <Stroke d={sB} t={t} a={0.3} b={3.3} w={3} rev />
    <g transform="translate(-180 40) scale(0.62) translate(400 160)" opacity={fade(t, 2.0, 7.2, 0.8)}>
      <Stroke d={doorFrame(3)} t={t} a={3.4} b={7.0} w={3.6} o={0.5} rev />
    </g>
    <g transform="translate(560 120) scale(0.5) translate(480 180)" opacity={fade(t, 4.0, 9.0, 0.8)}>
      <Stroke d={flower} t={t} a={5.4} b={8.8} w={4} o={0.5} rev />
    </g>
    <g opacity={fade(t, 6.0, 11.0, 0.8)}>
      <Stroke d={boatPath(960, 650, 1.6)} t={t} a={7.4} b={10.8} w={2.6} o={0.5} rev />
    </g>
    <Lamp x={760} y={880} s={0.7} t={t} lit={fade(t, 8.6, 13.4, 1.4) * 0.8} o={0.5 * fade(t, 8.6, 13.4, 1.4)} />
    <Lamp x={1160} y={880} s={0.7} t={t} lit={fade(t, 9.4, 13.4, 1.4) * 0.8} o={0.5 * fade(t, 9.4, 13.4, 1.4)} seed={2} />
  </Cam>
);

// W5, second design (user 10-24, 2nd look): close and frontal, at table height. A tall clear glass stands in front
// of Araya, who has her chin on her folded arms behind it; two thirds of her face is seen through the glass (and,
// below the water line, through the water, magnified, as in the user's reference). The tap above drips into it,
// one drop every other beat. 10-25: the glass is cracked from the start; only a thin layer stands in the bottom,
// below the crack. A drop does not visibly lift it (3rd look), it only rings out over it; as much runs out through the
// crack onto the table, so it never fills.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {C} from '../theme';
import {clamp, eout, lerp, smooth} from '../util';

const PC = 'url(#papercut)';
const WATER = '#9fb1c4', WATER_DK = '#7f93a8', GLASS_EDGE = '#3a3a44';
const SKIN = '#f0dcc6', HAIR = '#2b2128', BLOUSE = C.white, VEST = C.navy;
const TABLE_Y = 905;                                         // Behind (the r3 gpt layout): the front edge of its table
/** the room behind the glass: wall, the table top, Araya with her chin on her folded arms */
const HEAD_DY = 60;                                           // her head, lower than the first try: eyes under the water line
export const Behind: React.FC<{t: number; eyes: boolean; look: number}> = ({t, eyes, look}) => {
  const br = Math.sin(t * 1.3) * 2.5;                         // breathing
  const ex = look * -6;                                       // her eyes on the glass
  return (
    <g>
      <rect x={-200} y={-200} width={2400} height={1100} fill={C.paper} />
      <rect x={-200} y={820} width={2400} height={TABLE_Y - 820} fill={C.paperShade} />
      <path d={`M-200 820 L2200 820`} stroke={C.ink2} strokeWidth={1.6} opacity={0.3} />
      <g filter={PC}>
        <g transform={`translate(0 ${HEAD_DY})`}>
          {/* the long hair behind, down over her shoulders onto the arms */}
          <path d={`M832 ${430 + br} C820 330 930 296 1040 296 C1160 296 1262 336 1252 ${440 + br} C1290 560 1312 700 1344 832 L736 832 C778 700 818 560 832 ${430 + br} Z`} fill={HAIR} />
          <path d={`M900 ${360 + br} C960 330 1120 330 1180 ${360 + br}`} stroke="#4a3b46" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
          {/* shoulders: the navy vest over the white blouse */}
          <path d={`M700 840 C716 ${770 + br} 790 ${724 + br} 880 ${716 + br} L1200 ${716 + br} C1290 ${726 + br} 1360 ${772 + br} 1380 840 Z`} fill={VEST} />
          {/* the face, chin down on the arms */}
          <path d={`M882 ${520 + br} C882 ${430 + br} 950 ${392 + br} 1040 ${392 + br} C1130 ${392 + br} 1198 ${430 + br} 1198 ${520 + br} C1198 ${650 + br} 1130 ${768 + br * 0.4} 1040 ${784} C950 ${768 + br * 0.4} 882 ${650 + br} 882 ${520 + br} Z`} fill={SKIN} />
          {eyes && [975, 1105].map((x) => (
            <g key={x}>
              <ellipse cx={x + ex} cy={622 + br} rx={12} ry={17} fill={HAIR} />
              <circle cx={x + ex - 4} cy={616 + br} r={3.6} fill={C.white} />
            </g>
          ))}
          {/* the straight fringe and the locks down either side of the face */}
          <path d={`M860 ${548 + br} C846 ${420 + br} 928 ${346 + br} 1040 ${344 + br} C1152 ${346 + br} 1234 ${420 + br} 1220 ${548 + br} L1196 ${548 + br} L1188 ${540 + br} L892 ${540 + br} L884 ${548 + br} Z`} fill={HAIR} />
          <path d={`M860 ${540 + br} C856 640 866 720 880 770 L914 770 C902 700 896 640 900 ${540 + br} Z`} fill={HAIR} />
          <path d={`M1220 ${540 + br} C1224 640 1214 720 1200 770 L1166 770 C1178 700 1184 640 1180 ${540 + br} Z`} fill={HAIR} />
        </g>
        {/* the folded arms on the table, her chin on them: the right forearm over the left, the cuffs, a hand */}
        <path d="M560 900 C552 850 590 812 650 806 L1430 806 C1492 812 1530 850 1522 900 Z" fill={BLOUSE} />
        <path d="M1000 900 C1040 860 1110 826 1200 812" stroke={C.paperShade} strokeWidth={4} fill="none" />
        <path d="M660 812 C648 840 648 872 662 898 M1418 812 C1432 840 1432 872 1418 898" stroke={C.paperShade} strokeWidth={4} fill="none" />
        <path d="M1206 818 C1240 808 1280 812 1296 830 C1300 846 1288 860 1262 862 C1236 862 1214 850 1206 836 Z" fill={SKIN} />
      </g>
    </g>
  );
};

/** Araya redrawn by gpt-image, placed in the frame: r3 (gen/r3/out/w5_*) over the layout of Behind; r4 (user 10-24 22:01:
 *  her head tilted on her left forearm, faceless, an indigo streak; gen/r4/out/w5_tilt_*) is the whole frame, its
 *  1536x1024 covering y -100..1180. Image layers in svg are not waited for by themselves. */
export const GIRLS: Record<string, {src: string; x: number; y: number; w: number; h: number}> = {
  eyes: {src: 'img4/w5girl_eyes.png', x: 300, y: 130, w: 1320, h: 880},
  blank: {src: 'img4/w5girl_blank.png', x: 300, y: 160, w: 1320, h: 880},
  tilt: {src: 'img4/w5girl_tilt_2x.jpg', x: 0, y: -100, w: 1920, h: 1280},
  tilt2: {src: 'img4/w5girl_tilt2_2x.jpg', x: 0, y: -100, w: 1920, h: 1280},
};
const BehindImage: React.FC<{t: number; which: string}> = ({t, which}) => {
  const G = GIRLS[which], src = staticFile(G.src);
  const [hold] = useState(() => delayRender(`w5 girl ${which}`));
  useEffect(() => { const im = new Image(); im.onload = im.onerror = () => continueRender(hold); im.src = src; }, [hold, src]);
  const br = Math.sin(t * 1.3) * 0.004;                       // breathing, about her arms
  return (
    <g>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#e9dfca" />
      <g transform={`translate(1000 700) scale(${1 + br}) translate(-1000 -700)`}><image href={src} x={G.x} y={G.y} width={G.w} height={G.h} preserveAspectRatio="none" /></g>
    </g>
  );
};

/* The perspective of the close shot (user 10-24 22:01: it was wrong; the glass stood flat, in front of the table).
   One low camera, H cm above the table top at about her face height; the glass D cm away, K px per cm there. A
   horizontal circle of radius r at height h is an ellipse of half-height r*(H-h)/D: seen from above below the eye line
   (the base, the water), from below above it (the rim, just above). The base sits on the table top, low in the frame;
   she rests further back, higher up. */
const H = 13, D = 55, K = 45;
const PX = 900, BASE_Y = 985, R_TOP = 4.3, R_BOT = 3.6, GH = 14, WALL = 0.3, FLOOR = 1.0, FULL = 12.6;
const yAt = (h: number) => BASE_Y - h * K;
const rAt = (h: number, inner = false) => (R_BOT + ((R_TOP - R_BOT) * h) / GH - (inner ? WALL : 0)) * K;
const eAt = (h: number, inner = false) => (rAt(h, inner) * (H - h)) / D;
/** points along half an ellipse at height h: the near half (towards us) or the far one, from left to right */
const half = (h: number, inner: boolean, near: boolean, n = 24) => {
  const r = rAt(h, inner), e = eAt(h, inner), y = yAt(h);
  return Array.from({length: n + 1}, (_, i) => {
    const th = Math.PI * (1 - i / n);
    return `${(PX + r * Math.cos(th)).toFixed(1)} ${(y + (near ? 1 : -1) * e * Math.sin(th)).toFixed(1)}`;
  });
};
const INSIDE = `M${PX - rAt(GH)} ${yAt(GH)} L${half(FLOOR, true, true).join(' L')} L${PX + rAt(GH)} ${yAt(GH)} Z`;
const SILHOUETTE = `M${PX - rAt(GH)} ${yAt(GH)} L${half(0, false, true).join(' L')} L${PX + rAt(GH)} ${yAt(GH)}`;
const SOLID = `M${half(FLOOR, false, true).join(' L')} L${half(0, false, true).reverse().join(' L')} Z`;
export const SPOUT: [number, number] = [PX + 6, 296];
/** the height of the water (cm) for a level 0..1 of the inside, and its line on screen */
const hOf = (level: number) => lerp(FLOOR, FULL, clamp(level));
export const waterY = (level: number) => yAt(hOf(level));
export const TOP_Y = BASE_Y;
/** the front of the glass at height h, at x = PX + f·r: on the near curve of that height's ellipse */
const nearY = (h: number, f: number, inner = false) => yAt(h) + Math.abs(eAt(h, inner)) * Math.sqrt(1 - f * f);
// the crack (user 10-25: cracked from the start): up the near wall on the right, from just above the inside floor to
// half way up, with one branch; it goes right through. What stands below its foot stays (a thin layer in the bottom);
// what comes in above it runs out there, straight down the outside of the wall to the table (user 10-25, 4th look: not
// off and away behind the glass), and spreads there round the foot of the glass into a slowly widening pool
const CF = 0.72, CRACK_FOOT_H = 1.35;
const CRACK = [[CRACK_FOOT_H, 0], [1.9, 7], [2.8, -5], [3.7, 8], [4.5, -3], [5.4, 6], [6.3, -6], [7.1, 2]].map(([h, j]) => [PX + rAt(h) * CF + j, nearY(h, CF)]);
const BRANCH = [CRACK[4], [CRACK[4][0] + 16, CRACK[4][1] - 22], [CRACK[4][0] + 12, CRACK[4][1] - 44], [CRACK[4][0] + 26, CRACK[4][1] - 62]];
const FOOT: [number, number] = [CRACK[0][0] + 3, CRACK[0][1]];            // where it comes through, outside
const TABLE_AT: [number, number] = [PX + rAt(0) * CF + 3, nearY(0, CF)];   // where it reaches the table: straight below
const FALL = 0.62;                                                           // a drop's fall (s)

// the water (user 10-25, 2nd look): the layer that the crack cannot reach stands in the bottom all along. A drop
// does not lift it to the eye (3rd look), only rings out over it; the crack lets as much out again, most of it in
// the second after (TAU), and that is what the pool on the table grows by.
const L_REST = (CRACK_FOOT_H - FLOOR) / (FULL - FLOOR), L_DROP = 0.016, TAU = 1.1;
const POOL0 = 30, POOL_K = 167000;                                            // the pool before the first drop; px² per level run out
/** the pool on the table, radius R (px at the glass): a film of even depth, so its area goes with what has run out. It
 *  starts where the trickle meets the table, at the foot of the glass, and spreads from there; the glass stands in it
 *  and holds it back, so it grows out towards us and a little to the right (user's sketch), with a ragged edge. Worked
 *  on the table seen from straight above (u across, v towards us, px at the glass), then put through the view. */
const pool = (R: number) => {
  const pu = rAt(0) * CF, pv = rAt(0) * Math.sqrt(1 - CF * CF);
  const cu = pu + R * 0.45 * 0.3, cv = pv + R * 0.45 * 0.95, n = 72;
  const view = (u: number, v: number) => { const q = D / (D - v / K); return [PX + u * q, BASE_Y - H * K + H * K * q]; };
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.09 * Math.sin(3 * a + 1.1) + 0.06 * Math.sin(5 * a + 2.3) + 0.035 * Math.sin(8 * a + 0.4 + R * 0.01);
    return view(cu + R * k * Math.cos(a), cv + R * k * Math.sin(a));
  });
  const m = (a: number[], b: number[]) => `${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`;
  return `M${m(pts[n - 1], pts[0])} ` + pts.map((q, i) => `Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${m(q, pts[(i + 1) % n])}`).join(' ') + ' Z';
};

/** the whole close shot: the cracked glass with a thin layer in the bottom. drops: times the drops leave the tap */
export const GlassClose: React.FC<{t: number; drops: number[]; girl?: string}> = ({t, drops, girl = 'tilt'}) => {
  const lands = drops.map((d) => d + FALL);
  // how far each drop's water has run out by now (0..1 of it); the level is the rest over what stands
  const out = lands.map((l) => (t <= l ? 0 : 1 - Math.exp(-(t - l) / TAU)));
  const above = lands.reduce((v, l, k) => v + (t > l ? L_DROP * smooth(0, 0.12, t - l) * (1 - out[k]) : 0), 0);
  const level = L_REST;
  const hw = hOf(level), wy = yAt(hw), wr = rAt(hw, true), we = Math.abs(eAt(hw, true));
  const sx = 1.04, wx = 1.45, wv = 1.06;                      // the empty glass, the water: how much they magnify
  const fall = (st: number) => {
    const u = (t - st) / FALL;
    if (u < 0 || u > 1) return null;
    const y = lerp(SPOUT[1] + 10, wy, u * u);
    return <path key={st} d={`M${SPOUT[0]} ${y - 22} C${SPOUT[0] + 9} ${y - 4} ${SPOUT[0] + 9} ${y + 8} ${SPOUT[0]} ${y + 9} C${SPOUT[0] - 9} ${y + 8} ${SPOUT[0] - 9} ${y - 4} ${SPOUT[0]} ${y - 22}Z`} fill={WATER} stroke={WATER_DK} strokeWidth={1.4} />;
  };
  /** after it lands: rings out over the surface, one after another, and a bead down the outside as the crack lets it out */
  const landed = (l: number) => {
    const a = t - l;
    if (a < 0 || a > 2.4) return null;
    const bead = clamp((a - 0.35) / 1.1), by = lerp(FOOT[1], TABLE_AT[1], bead * bead), bx = lerp(FOOT[0], TABLE_AT[0], bead);
    return (
      <g key={l}>
        {[0, 0.22, 0.44].map((d, j) => {
          const ring = clamp((a - d) / 1.2), rx = 6 + eout(ring) * (wr - 16) * (1 - j * 0.18);
          return ring > 0 && ring < 1 && <ellipse key={j} cx={SPOUT[0]} cy={wy} rx={rx} ry={Math.max(1.2, (rx * we) / wr)} fill="none" stroke={WATER_DK} strokeWidth={(2 - j * 0.5) * (1 - ring)} opacity={(1 - ring) * (1 - j * 0.25)} />;
        })}
        {bead > 0 && bead < 1 && <circle cx={bx} cy={by} r={4.4} fill={WATER} stroke={WATER_DK} strokeWidth={1.2} />}
      </g>
    );
  };
  // the trickle down the outside: as thick as the crack is letting out now, never quite dry
  const flow = above / L_DROP;
  const run = lands.reduce((v, l, k) => v + L_DROP * out[k], 0);
  const prx = Math.sqrt(POOL0 * POOL0 + POOL_K * run);
  return (
    <g>
      <defs>
        {/* what is seen through the glass: her, the table, its shadow, the pool round the foot of the glass */}
        <g id="w5behind">
          <BehindImage t={t} which={girl} />
          <ellipse cx={PX + 14} cy={BASE_Y + 8} rx={rAt(0) + 22} ry={eAt(0) + 10} fill="#6b5a40" opacity={0.16} />
          <path d={pool(prx)} fill={WATER} opacity={0.7} stroke={WATER_DK} strokeWidth={1.6} />
        </g>
        <clipPath id="w5in"><path d={INSIDE} /></clipPath>
        <clipPath id="w5dry"><rect x={0} y={-100} width={1920} height={wy + 100} /></clipPath>
        <clipPath id="w5wet"><path d={`M${PX - wr} ${wy} L${half(hw, true, false).join(' L')} L${PX + wr + 40} ${wy} L${PX + wr + 40} 1200 L${PX - wr - 40} 1200 Z`} /></clipPath>
      </defs>
      <use href="#w5behind" />
      {/* through the glass: above the water a little wider; through the water much wider (a lens) */}
      <g clipPath="url(#w5in)">
        <g clipPath="url(#w5dry)">
          <g transform={`translate(${PX} 0) scale(${sx} 1) translate(${-PX} 0)`}><use href="#w5behind" /></g>
          <rect x={0} y={-100} width={1920} height={1300} fill="#e8eef2" opacity={0.14} />
        </g>
        <g clipPath="url(#w5wet)">
          <g transform={`translate(${PX} ${wy}) scale(${wx} ${wv}) translate(${-PX} ${-wy})`}><use href="#w5behind" /></g>
          <rect x={0} y={-100} width={1920} height={1300} fill={WATER} opacity={0.24} />
        </g>
      </g>
      {/* the heavy base: solid glass between the inside floor and the bottom */}
      <path d={SOLID} fill="#dfe8ec" opacity={0.6} />
      <path d={`M${half(FLOOR, true, false).join(' L')} L${half(FLOOR, true, true).reverse().join(' L')} Z`} fill="none" stroke={GLASS_EDGE} strokeWidth={1.6} opacity={0.35} />
      <path d={`M${half(0, false, true, 24).slice(4, 11).join(' L')}`} fill="none" stroke={C.white} strokeWidth={4} opacity={0.75} strokeLinecap="round" />
      {/* the water's surface, almost edge-on near the eye line */}
      <ellipse cx={PX} cy={wy} rx={wr} ry={Math.max(2.5, we)} fill="#d4e0e8" opacity={0.55} stroke={WATER_DK} strokeWidth={1.6} />
      {/* the walls catching the light */}
      <path d={`M${PX - rAt(GH - 0.8) + 26} ${yAt(GH - 0.8)} L${PX - rAt(FLOOR + 0.6) + 22} ${yAt(FLOOR + 0.6)}`} stroke={C.white} strokeWidth={14} opacity={0.5} strokeLinecap="round" />
      <path d={`M${PX - rAt(GH - 1.5) + 52} ${yAt(GH - 1.5)} L${PX - rAt(GH - 6.5) + 50} ${yAt(GH - 6.5)}`} stroke={C.white} strokeWidth={5} opacity={0.55} strokeLinecap="round" />
      <path d={`M${PX + rAt(GH - 0.6) - 20} ${yAt(GH - 0.6)} L${PX + rAt(FLOOR + 0.4) - 18} ${yAt(FLOOR + 0.4)}`} stroke={GLASS_EDGE} strokeWidth={6} opacity={0.16} strokeLinecap="round" />
      {/* the wet track down the outside of the base, and the trickle in it */}
      <path d={`M${FOOT[0]} ${FOOT[1]} L${TABLE_AT[0]} ${TABLE_AT[1]}`} stroke={WATER} strokeWidth={6} strokeLinecap="round" opacity={0.45} />
      <path d={`M${FOOT[0]} ${FOOT[1]} L${TABLE_AT[0]} ${TABLE_AT[1]}`} stroke={WATER_DK} strokeWidth={1.4 + 2.6 * clamp(flow)} strokeLinecap="round" opacity={0.5 + 0.4 * clamp(flow)} />
      {lands.map(landed)}
      {/* the cut-paper keyline: walls, the bottom's near curve, the rim; the crack */}
      <path d={SILHOUETTE} fill="none" stroke={C.ink} strokeWidth={3.6} strokeLinejoin="round" />
      <ellipse cx={PX} cy={yAt(GH)} rx={rAt(GH)} ry={Math.max(5, Math.abs(eAt(GH)))} fill="none" stroke={C.ink} strokeWidth={3.2} />
      <path d={`M${CRACK.map((p) => p.join(' ')).join(' L')}`} stroke={C.ink} strokeWidth={3} fill="none" strokeLinejoin="miter" />
      <path d={`M${BRANCH.map((p) => p.join(' ')).join(' L')}`} stroke={C.ink} strokeWidth={2.2} fill="none" />
      <path d={`M${CRACK.map(([x, y]) => `${x + 3} ${y + 1}`).join(' L')}`} stroke={C.white} strokeWidth={1.6} fill="none" opacity={0.7} />
      {/* the tap, coming down into the frame */}
      <g filter={PC}>
        <path d={`M560 -20 L560 110 Q560 150 620 150 L${SPOUT[0] - 40} 150 Q${SPOUT[0]} 150 ${SPOUT[0]} 190 L${SPOUT[0]} ${SPOUT[1]}`} stroke={C.grey} strokeWidth={30} fill="none" />
        <path d={`M568 -20 L568 108 Q568 142 620 142 L${SPOUT[0] - 40} 142`} stroke={C.greyLight} strokeWidth={4} fill="none" opacity={0.8} />
        <rect x={SPOUT[0] - 21} y={SPOUT[1] - 8} width={42} height={16} rx={4} fill="#6f6a64" />
      </g>
      {drops.map(fall)}
    </g>
  );
};

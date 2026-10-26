// W5 (user 10-24): Araya in her teens (the school uniform of the hydrangea CG: white blouse, navy vest, long dark
// hair with a straight fringe) sits at the table, her head on her hand, watching the tap drip into a cracked cup;
// the water runs out of the crack as fast as it comes. A paper doll with no face: she is known by her clothes and
// her hair. Navy is Araya's colour.
import React from 'react';
import {C} from '../theme';
import {clamp, lerp, smooth} from '../util';
import {Yunomi} from './objects';

const PC = 'url(#papercut)';
export const TABLE_Y = 740, TABLE_FRONT = 905;
export const CUP_X = 1180, CUP_S = 0.95;
export const CUP_Y = TABLE_Y - 140 * CUP_S;            // the cup's own origin (its bottom sits on the table)
export const SPOUT: [number, number] = [CUP_X - 4, 336];
const WATER = '#9fb1c4', WATER_DK = '#7f93a8';
const SKIN = '#f0dcc6', HAIR = '#2b2128', BLOUSE = C.white, VEST = C.navy;

/** the room: wall, the table (its top seen a little from above, then its front), the tap on the wall */
export const Room: React.FC = () => (
  <g>
    <rect x={-200} y={TABLE_Y} width={2400} height={TABLE_FRONT - TABLE_Y} fill={C.paperShade} />
    <path d={`M-200 ${TABLE_Y} L2200 ${TABLE_Y}`} stroke={C.ink2} strokeWidth={2} opacity={0.5} />
    <rect x={-200} y={TABLE_FRONT} width={2400} height={400} fill="#c7bba5" />
    <path d={`M-200 ${TABLE_FRONT} L2200 ${TABLE_FRONT}`} stroke={C.ink2} strokeWidth={2.4} opacity={0.6} />
    <g filter={PC}>
      <rect x={1520} y={186} width={34} height={120} rx={6} fill={C.greyLight} />
      <path d={`M1530 246 L${SPOUT[0] + 40} 246 Q${SPOUT[0]} 246 ${SPOUT[0]} 286 L${SPOUT[0]} ${SPOUT[1]}`} stroke={C.grey} strokeWidth={22} fill="none" strokeLinecap="butt" />
      <path d={`M1530 240 L${SPOUT[0] + 40} 240 Q${SPOUT[0] - 6} 240 ${SPOUT[0] - 6} 286`} stroke={C.greyLight} strokeWidth={3} fill="none" opacity={0.8} />
      <rect x={SPOUT[0] - 15} y={SPOUT[1] - 6} width={30} height={12} rx={3} fill="#6f6a64" />
      <path d="M1330 234 L1330 206 M1306 206 L1354 206" stroke={C.grey} strokeWidth={9} strokeLinecap="round" />
    </g>
  </g>
);

/** Araya at the table, her head leaning on her right hand toward the cup. sink: 0..1 it goes down onto it a little more */
export const Araya: React.FC<{t: number; sink: number}> = ({t, sink}) => {
  const br = Math.sin(t * 1.6) * 2;                          // breathing
  const tilt = 11 + 5 * sink, dy = sink * 6;
  const head = `rotate(${tilt} 632 ${522 + br}) translate(0 ${dy + br})`;
  return (
    <g filter={PC}>
      {/* hair behind, turning with the head */}
      <path transform={head} d="M584 356 C522 414 500 560 516 700 L640 700 C652 600 664 470 650 372 Z" fill={HAIR} />
      <rect transform={head} x={613} y={470} width={36} height={96} fill={SKIN} />
      {/* body: blouse, navy vest */}
      <path d={`M520 ${TABLE_Y + 4} C516 640 530 ${560 + br} 580 ${536 + br} L690 ${534 + br} C730 ${548 + br} 744 640 742 ${TABLE_Y + 4} Z`} fill={BLOUSE} />
      <path d={`M540 ${TABLE_Y + 4} C536 650 548 ${580 + br} 586 ${552 + br} L630 ${600 + br} L676 ${552 + br} C716 ${574 + br} 726 650 722 ${TABLE_Y + 4} Z`} fill={VEST} />
      <path d={`M604 ${536 + br} L630 ${574 + br} L656 ${536 + br}`} stroke={C.paperShade} strokeWidth={3} fill="none" />
      {/* her upper arm down to the elbow on the table, the forearm up to her jaw */}
      <path d={`M700 ${540 + br} C748 590 790 660 802 ${TABLE_Y - 2} L842 ${TABLE_Y - 2} C832 650 790 580 730 ${532 + br} Z`} fill={BLOUSE} />
      <path d={`M806 ${TABLE_Y - 2} C790 660 742 ${580 + dy} 704 ${522 + dy + br} L734 ${504 + dy + br} C772 ${560 + dy} 830 650 842 ${TABLE_Y - 2} Z`} fill={BLOUSE} />
      <path d={`M700 ${528 + dy + br} L734 ${510 + dy + br}`} stroke={C.paperShade} strokeWidth={4} />
      {/* head, the straight fringe, the hair over the crown and down behind */}
      <g transform={head}>
        <ellipse cx={640} cy={430} rx={60} ry={72} fill={SKIN} />
        <path d="M576 446 C566 380 590 344 640 342 C690 342 712 372 708 410 L700 410 L700 398 L612 398 C606 420 604 440 600 470 Z" fill={HAIR} />
        <path d="M576 446 C572 500 584 540 600 560 L612 470 Z" fill={HAIR} />
      </g>
      {/* the hand cupping her jaw: the heel of it under the chin, the fingers up along the cheek */}
      <path d={`M694 ${532 + dy + br} C676 ${514 + dy + br} 672 ${490 + dy + br} 688 ${476 + dy + br} C694 ${456 + dy + br} 700 ${440 + dy + br} 712 ${438 + dy + br} C724 ${438 + dy + br} 728 ${452 + dy + br} 726 ${470 + dy + br} C734 ${490 + dy + br} 734 ${512 + dy + br} 724 ${526 + dy + br} Z`} fill={SKIN} />
      <path d={`M700 ${470 + dy + br} L704 ${448 + dy + br} M712 ${474 + dy + br} L716 ${446 + dy + br}`} stroke="#d9bfa6" strokeWidth={2} />
    </g>
  );
};

/** the cup with its water; drips from the tap (times), the leak from the crack, the pool on the table */
export const LeakingCup: React.FC<{t: number; level: number; crack: number; leak: number; drops: number[]}> = ({t, level, crack, leak, drops}) => {
  const surf = CUP_Y + lerp(132, -110, level) * CUP_S;        // the water's top, on screen
  const crackX = CUP_X + 22 * CUP_S, crackY = CUP_Y + 110 * CUP_S;
  const pool = clamp(leak);
  const fall = (st: number) => {
    const u = (t - st) / 0.42;
    if (u < 0 || u > 1.6) return null;
    if (u <= 1) {
      const y = lerp(SPOUT[1] + 8, surf, u * u);
      return <path key={st} d={`M${SPOUT[0]} ${y - 16} C${SPOUT[0] + 7} ${y - 3} ${SPOUT[0] + 7} ${y + 6} ${SPOUT[0]} ${y + 7} C${SPOUT[0] - 7} ${y + 6} ${SPOUT[0] - 7} ${y - 3} ${SPOUT[0]} ${y - 16}Z`} fill={WATER} />;
    }
    const sp = (u - 1) / 0.6;
    return <ellipse key={st} cx={SPOUT[0]} cy={surf + 2} rx={10 + sp * 40} ry={3 + sp * 5} fill="none" stroke={WATER_DK} strokeWidth={2 * (1 - sp)} opacity={1 - sp} />;
  };
  // what runs out of the crack: a thin wavering line down the cup to the table while it leaks
  const run = crack > 0.6 && leak > 0;
  let d = `M${crackX} ${crackY}`;
  for (let i = 1; i <= 8; i++) { const u = i / 8; d += ` L${(crackX + 2 + Math.sin(u * 7 + t * 9) * 1.6).toFixed(1)} ${lerp(crackY, TABLE_Y + 4, u).toFixed(1)}`; }
  // the pool spreads toward the front edge of the table, then drips over it
  const px = crackX + 40 + 80 * pool, prx = 30 + 170 * pool, pry = 6 + 30 * pool;
  const over = smooth(0.8, 1, pool);
  const edgeDrops = [0, 0.7, 1.3, 1.8, 2.3, 2.7].map((o) => {
    const st = 186.8 + o, u = (t - st) / 0.5;
    if (u < 0 || u > 1) return null;
    const y = lerp(TABLE_FRONT + 4, 1120, u * u);
    return <ellipse key={st} cx={px + 60} cy={y} rx={5} ry={8} fill={WATER} opacity={0.9} />;
  });
  return (
    <g>
      {pool > 0 && <ellipse cx={px} cy={TABLE_Y + 8 + pry * 0.9} rx={prx} ry={pry} fill={WATER} opacity={0.55} />}
      {over > 0 && <path d={`M${px + 60} ${TABLE_FRONT - 4} L${px + 60} ${TABLE_FRONT + 10 + over * 8}`} stroke={WATER} strokeWidth={6} strokeLinecap="round" opacity={0.8} />}
      {edgeDrops}
      <g transform={`translate(${CUP_X} ${CUP_Y}) scale(${CUP_S})`}><Yunomi level={level} crack={crack} water={WATER} /></g>
      {run && <path d={d} stroke={WATER_DK} strokeWidth={2.6} fill="none" opacity={0.85 * clamp(leak * 4)} />}
      {drops.map(fall)}
    </g>
  );
};

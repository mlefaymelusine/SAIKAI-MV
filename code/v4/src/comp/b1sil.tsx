// B1, second design (user 10-26, a friend's idea, after the Canto IX CGs as reference): the bridge as a play of
// silhouettes on black. Rien sits slumped against a wall on the right, as he was left after the cut; Ryoshu stands on
// the left. First the past: the young Ryoshu, long-haired, facing him, the blade still down. Then a blink, and on the
// same spot the Ryoshu of now, her hair short, her back to him. Hand-drawn shapes here; FIGS swaps in cleaned-up
// images when they exist (public/img4/b1/*.png, white on transparent, recoloured by mask).
import React from 'react';
import {staticFile} from 'remotion';
import {C} from '../theme';

const PAPER = C.paper, RED = C.red;
export const FLOOR_Y = 880;
export const RYO_X = 600, RIEN_X = 1450;

/** the young Ryoshu, standing, facing right; feet at 0 0, about 640 tall. (As the official Ryoshu_Past sprite and the CG
 *  of the cut) the long hair down to the hips, a fitted zip-up jacket, slim trousers, chunky sneakers; one hand holds the
 *  drawn blade low, its point reaching out towards him */
export const PastRyoshu: React.FC<{color: string}> = ({color}) => (
  <g fill={color} stroke="none">
    {/* the long hair, falling straight down her back to the hips */}
    <path d="M24 -626 C-6 -654 -50 -628 -46 -584 C-52 -520 -60 -420 -56 -318 L-42 -312 L-30 -330 C-28 -420 -20 -500 -14 -546 Z" />
    <ellipse cx={8} cy={-590} rx={30} ry={36} />
    <path d="M34 -604 L46 -588 L36 -582 Z" />
    <path d="M-4 -560 L14 -560 L16 -534 L-6 -534 Z" />
    {/* the jacket, close at the waist, to the hips */}
    <path d="M-28 -534 C-10 -550 22 -548 32 -532 C40 -490 36 -440 30 -404 C34 -372 38 -346 36 -318 L-38 -314 C-38 -348 -32 -380 -28 -410 C-36 -460 -38 -500 -28 -534 Z" />
    {/* slim trousers, a short step towards him, chunky sneakers */}
    <path d="M2 -326 L34 -326 L32 -180 L42 -26 L16 -24 L8 -180 Z M-34 -326 L0 -326 L-4 -180 L-20 -26 L-46 -26 L-32 -180 Z" />
    <path d="M12 -30 L44 -30 Q70 -22 70 -6 L70 0 L8 0 Z M-50 -30 L-18 -30 Q-4 -22 -4 -6 L-4 0 L-54 0 Z" />
    {/* the far arm at her side; the near arm reaching down and forward, the hand on the hilt */}
    <path d="M-10 -516 Q-22 -450 -16 -390" stroke={color} strokeWidth={18} strokeLinecap="round" fill="none" />
    <path d="M14 -520 Q30 -440 62 -370" stroke={color} strokeWidth={19} strokeLinecap="round" fill="none" />
    <path d="M42 -380 L86 -360" stroke={color} strokeWidth={11} strokeLinecap="round" />
    <ellipse cx={88} cy={-358} rx={8} ry={14} transform="rotate(24 88 -358)" />
    {/* the blade, held low and level, a slight curve, the point towards him */}
    <path d="M90 -364 Q250 -350 408 -300 Q250 -338 88 -352 Z" />
  </g>
);

/** the Ryoshu of now, on the same spot, her back to him: facing left, the bob, the jacket over her shoulders, the blade let down
 *  behind her, its point trailing back towards him */
export const NowRyoshu: React.FC<{color: string}> = ({color}) => (
  <g fill={color} stroke="none">
    <ellipse cx={-10} cy={-586} rx={30} ry={35} transform="rotate(-14 -10 -586)" />
    <path d="M-34 -592 L-48 -574 L-36 -570 Z" />
    {/* the bob, cut straight at the jaw */}
    <path d="M38 -560 C44 -606 30 -640 -6 -640 C-44 -638 -54 -606 -48 -568 L-44 -546 L-26 -552 L-24 -570 L18 -566 L20 -544 L40 -548 Z" />
    <path d="M-8 -556 L14 -556 L16 -530 L-10 -530 Z" />
    {/* (as the official sprite) the black jacket worn over the shoulders like a cape, hanging to mid-thigh */}
    <path d="M-40 -534 C-24 -552 26 -554 44 -534 C58 -470 66 -380 66 -296 L36 -300 L30 -320 L-30 -320 L-58 -300 C-58 -380 -54 -470 -40 -534 Z" />
    {/* slim trousers, a short stride, flat shoes */}
    <path d="M-36 -322 L-4 -322 L-12 -24 L-14 0 L-56 0 Q-58 -10 -38 -18 Z M4 -322 L34 -322 L30 -20 L48 -2 L46 4 L10 4 L8 -20 Z" />
    {/* the arm down at her side, the hand on the hilt, the blade let down behind her */}
    <path d="M18 -516 Q30 -420 20 -346" stroke={color} strokeWidth={20} strokeLinecap="round" fill="none" />
    <path d="M6 -350 L40 -322" stroke={color} strokeWidth={10} strokeLinecap="round" />
    <ellipse cx={40} cy={-320} rx={8} ry={12} transform="rotate(50 40 -320)" />
    <path d="M38 -326 Q150 -190 236 -8 Q140 -180 32 -314 Z" />
  </g>
);

/** Rien, sitting on the floor slumped back against the wall on the right, facing left: the head fallen forward, one
 *  leg out along the floor, the other knee up, one arm down with the fist on the floor. Hip at 0 0 */
export const Rien: React.FC<{color: string}> = ({color}) => (
  <g fill={color} stroke="none">
    {/* the far leg, knee up */}
    <path d="M-10 -44 L-128 -168 L-196 -16" stroke={color} strokeWidth={42} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    <path d="M-176 -36 L-236 -30 Q-250 -8 -232 0 L-182 0 Z" />
    {/* the jacket, the back against the wall, its skirts on the floor */}
    <path d="M-42 -8 C-48 -100 -32 -200 -8 -250 C10 -266 42 -266 54 -246 C60 -180 64 -90 60 -6 Z" />
    <path d="M-64 0 L74 0 L60 -44 L-48 -40 Z" />
    {/* the head, fallen forward onto the chest, short hair */}
    <ellipse cx={-26} cy={-258} rx={32} ry={36} transform="rotate(-34 -26 -258)" />
    <path d="M-50 -276 C-50 -312 -12 -320 14 -300 C26 -288 22 -266 12 -252 Z" />
    <path d="M-52 -236 L-64 -222 L-50 -218 Z" />
    {/* the near leg, out along the floor, the shoe turned up */}
    <path d="M-20 -26 L-170 -42 L-298 -24" stroke={color} strokeWidth={46} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    <path d="M-292 -4 L-330 -10 L-340 -72 L-312 -78 L-296 -44 Z" />
    {/* the near arm, hanging, the fist on the floor */}
    <path d="M-10 -232 L-34 -128 L-72 -20" stroke={color} strokeWidth={28} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    <circle cx={-76} cy={-16} r={19} />
  </g>
);

// Ryoshu's katana, drawn here rather than generated (user 10-26: generated, it never read as hers; 02:44: the blade far
// too thin, and the grip and the way it is worn looked up). Measured off the official sprite (her 650 units there are
// 1824 px): the hilt 91 long and 12.5 wide, bound with seven diamonds (cut out here), a cap at the pommel; the tsuba 44
// across, seen nearly edge-on with a rim cut round its face; blade and scabbard about 18 wide and 390 long, the last
// part of the scabbard bound in cloth (slits) with a strip hanging from its end; two red cords tied near the pommel,
// hanging about 50 with knotted ends. In its own frame: the tsuba at 0 0, the hilt towards -u, the blade or scabbard
// towards +u, +v the side its frame turns down.
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
const HILT = `M-91 -5.2 C-60 -5.6 -30 -6.2 -10 -6.2 L-10 6.2 C-30 6.2 -60 5.6 -91 5.2 Z ${[-18, -29, -40, -51, -62, -73, -84].map((u) => `M${u - 4.2} 0 L${u} -3.2 L${u + 4.2} 0 L${u} 3.2 Z`).join(' ')}`;
/** one cord or strip hanging from x0 y0, swinging more towards its end, a knot or tassel at the end */
const hang = (x0: number, y0: number, len: number, w0: number, w1: number, t: number, ph: number, lean: number, amp: number, period: number) => {
  const n = 14, l: string[] = [], r: string[] = [];
  let ex = x0;
  for (let i = 0; i <= n; i++) {
    const s = i / n, y = y0 + s * len, hw = (w0 + (w1 - w0) * s) / 2;
    const x = x0 + lean * s + Math.sin((t * 2 * Math.PI) / period + ph + s * 0.9) * amp * Math.pow(s, 1.6);
    l.push(`${(x - hw).toFixed(2)} ${y.toFixed(2)}`); r.unshift(`${(x + hw).toFixed(2)} ${y.toFixed(2)}`);
    ex = x;
  }
  const ey = y0 + len;
  return `M${l.join(' L')} L${(ex - w1 * 1.3).toFixed(2)} ${(ey + 4).toFixed(2)} L${(ex - w1 * 0.9).toFixed(2)} ${(ey + 12).toFixed(2)} L${(ex + w1 * 0.9).toFixed(2)} ${(ey + 12).toFixed(2)} L${(ex + w1 * 1.3).toFixed(2)} ${(ey + 4).toFixed(2)} L${r.join(' L')} Z`;
};
/** the scabbard, edge up as it is worn, so its far end sags a little below the line it leaves the belt on */
const scabbard = () => {
  const L = 400, vc = (u: number) => 14 * (u / L) ** 2, hw = (u: number) => 8.8 - 0.8 * (u / L);
  const top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= 20; i++) { const u = 10 + ((L - 10) * i) / 20; top.push(`${u.toFixed(1)} ${(vc(u) - hw(u)).toFixed(2)}`); bot.unshift(`${u.toFixed(1)} ${(vc(u) + hw(u)).toFixed(2)}`); }
  // the cloth binding on its last part, as slits crossing it one way and the other
  const slits = Array.from({length: 8}, (_, i) => {
    const u = 236 + i * 21, c = vc(u), h = hw(u) - 1.6, k = i % 2 ? 4.5 : -4.5;
    return `M${u - k - 0.9} ${c - h} L${u - k + 0.9} ${c - h} L${u + k + 0.9} ${c + h} L${u + k - 0.9} ${c + h} Z`;
  }).join(' ');
  return {body: `M${top.join(' L')} L${bot.join(' L')} Z ${slits}`, cap: `M${L - 2} ${vc(L) - 8.6} L${L + 7} ${vc(L) - 8.2} L${L + 7} ${vc(L) + 8.2} L${L - 2} ${vc(L) + 8.6} Z`, end: [L - 14, vc(L - 14) + hw(L - 14)] as const};
};
const Katana: React.FC<{color: string; t: number; x: number; y: number; rot: number; sheathed?: boolean; tie: number; amp: number; period: number}> = ({color, t, x, y, rot, sheathed, tie, amp, period}) => {
  const a = (rot * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const at = (u: number, v: number) => [x + u * ca - v * sa, y + u * sa + v * ca] as const;
  const [px, py] = at(tie, 0);
  const sc = sheathed ? scabbard() : undefined;
  const [ex, ey] = sc ? at(sc.end[0], sc.end[1]) : [0, 0];
  return (
    <g fill={color} stroke="none">
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <path fillRule="evenodd" d={HILT} />
        <path d="M-98 -5 Q-99.5 0 -98 5 L-90 5.8 L-90 -5.8 Z" />
        <path d="M-11 -6.8 L-5 -6.8 L-5 6.8 L-11 6.8 Z" />
        <path fillRule="evenodd" d={`${ell(0, 0, 7, 22)} ${ell(0, 0, 5, 18.4)} ${ell(0, 0, 3.2, 16)}`} />
        {sc ? (
          <>
            <path d="M5 -9.2 L12 -9.2 L12 9.2 L5 9.2 Z" />
            <path fillRule="evenodd" d={sc.body} />
            <path d={sc.cap} />
          </>
        ) : (
          <>
            <path d="M5 -7.6 L13 -7.2 L13 7.2 L5 7.6 Z" />
            {/* the blade, edge down, the slight curve lifting its point */}
            <path d="M11 -7.5 Q190 -9.5 354 -17 L370 -19.5 Q358 -11 348 -5.5 Q190 4.8 11 7.5 Z" />
          </>
        )}
      </g>
      {/* the red cords: a knot with two small loops, two ends hanging */}
      <path fillRule="evenodd" d={`${ell(px - 6.5, py + 1.5, 4.6, 2.8)} ${ell(px - 6.5, py + 1.5, 2.4, 1.1)} ${ell(px + 6, py + 2.5, 4.4, 2.7)} ${ell(px + 6, py + 2.5, 2.2, 1.0)}`} />
      <ellipse cx={px} cy={py + 1} rx={4.6} ry={4} />
      <path d={hang(px - 1.5, py + 2.5, 56, 4.2, 3.4, t, 0, -3, amp, period)} />
      <path d={hang(px + 1.5, py + 2.5, 48, 3.8, 3.0, t, 1.3, 4, amp, period)} />
      {sc && <path d={hang(ex, ey - 2, 30, 6, 5, t, 2.1, 1.5, amp * 0.6, period)} />}
    </g>
  );
};
/** the young Ryoshu: one hand on the hilt just behind the tsuba, the rest of the hilt running back under her forearm to
 *  her hip, the blade held low and level towards him (round 6's fist at 110 -358) */
export const PastSword: React.FC<{color: string; t: number}> = ({color, t}) => (
  <Katana color={color} t={t} x={129.5} y={-353.5} rot={13} tie={-70} amp={6.5} period={5.6} />
);
/** the Ryoshu of now: worn at the left hip, thrust through the belt edge up, the tsuba at the front of her waist, the
 *  hilt rising forwards, the scabbard sloping back and down past the jacket (about 30 degrees) */
export const NowSword: React.FC<{color: string; t: number}> = ({color, t}) => (
  <Katana color={color} t={t} x={-77} y={-392} rot={30} sheathed tie={-80} amp={3} period={6.4} />
);

/** cleaned-up figures (white on transparent): when present they replace the drawn ones */
// gpt-image round 6 (gen/r6: my sketches + the CGs + the official sprites as references; the Ryoshu of now redone in
// round 7, gen/r7), cut to masks by tools/b1mask.py (the young Ryoshu's sword cut away: PastSword redraws it);
// placed in each figure's own units: the Ryoshus by the middle of the legs, Rien by his back, all by the floor
export const FIGS: Partial<Record<'past' | 'now' | 'rien', {src: string; x: number; y: number; w: number; h: number}>> = {
  past: {src: 'img4/b1/past.png', x: -55.2, y: -652.0, w: 182.7, h: 654.0},
  now: {src: 'img4/b1/now.png', x: -82.1, y: -652.0, w: 182.6, h: 654.1},
  rien: {src: 'img4/b1/rien.png', x: -400.4, y: -306.5, w: 468.4, h: 308.0},
};

const Fig: React.FC<{which: 'past' | 'now' | 'rien'; color: string; children: React.ReactNode}> = ({which, color, children}) => {
  const f = FIGS[which];
  if (!f) return <>{children}</>;
  const id = `b1fig_${which}`;
  return (
    <>
      <defs><mask id={id}><image href={staticFile(f.src)} x={f.x} y={f.y} width={f.w} height={f.h} /></mask></defs>
      <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={color} mask={`url(#${id})`} />
    </>
  );
};

/** the scene: now = 0 the past, 1 the present (switched while the eyes are shut); light: the shaft from above right;
 *  t: seconds (the cords on the swords sway) */
export const B1Scene: React.FC<{now: boolean; light?: number; t?: number}> = ({now, light = 1, t = 0}) => (
  <g>
    <defs>
      <linearGradient id="b1shaft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={PAPER} stopOpacity={0.0} />
        <stop offset="1" stopColor={PAPER} stopOpacity={0.09} />
      </linearGradient>
    </defs>
    <path d={`M${RIEN_X + 120} -40 L${RIEN_X + 330} -40 L${RIEN_X + 150} ${FLOOR_Y + 40} L${RIEN_X - 380} ${FLOOR_Y + 40} Z`} fill="url(#b1shaft)" opacity={light} />
    <g transform={`translate(${RIEN_X} ${FLOOR_Y})`}><Fig which="rien" color={PAPER}><Rien color={PAPER} /></Fig></g>
    <g transform={`translate(${RYO_X} ${FLOOR_Y})`}>
      {now ? (
        <>
          <Fig which="now" color={RED}><NowRyoshu color={RED} /></Fig>
          {FIGS.now && <NowSword color={RED} t={t} />}
        </>
      ) : (
        <>
          <Fig which="past" color={RED}><PastRyoshu color={RED} /></Fig>
          {FIGS.past && <PastSword color={RED} t={t} />}
        </>
      )}
    </g>
  </g>
);

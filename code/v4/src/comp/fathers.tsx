// The five fathers (I2, and cut in B1). User 10-24: like v1 S27, by the names they called her (Japanese, no
// modelling), with their things; five hang, and many more key words in a colour near the background hang down
// among them at random lengths, so the picture is full and the slash has more to cut.
// Names (ch9): Thumb 券券, Index (Rien) 女儿 → 娘, Middle 闺女 → 嬢ちゃん, Ring calls her by name ヨシヒデ,
// Little (Shiomi, her mother) never once calls her anything → ——.
// Things: Thumb's ticket (kept), Rien's picture book (user 10-24: 是谁嗯嗯在我的头上, the mole), Middle's purple bear (she
// wanted it red: 「紫色的，也不坏」), Ring's hat (Callisto's white top hat, the holed cloud brim, and Tibia, his bone
// sword), Shiomi's kiseru.
import React from 'react';
import {C, F} from '../theme';
import {W, clamp, eout, lerp, prog, rng, smooth} from '../util';
import {BookCorner, PictureBook, Ticket} from './objects';

const PC = 'url(#papercut)';
const TOP = -40;                                   // where every thread hangs from

/* ---------- the things ---------- */
const PURPLE = C.purple, PURPLE_LT = C.purpleLight, PURPLE_DK = '#6a43a6', BOW = '#55328c';
/** Middle's bear, a big plush one, hung by a loop at the top of its head; (0,0) is the loop. User 10-24 (2nd look:
 *  the body looked wrong): redrawn as a proper sewn teddy, hanging: a big round head with a muzzle, a pear-shaped body,
 *  short thick arms hanging down at its sides, short legs dangling with round foot pads, soft fuzzy edges, seams. */
const fuzz = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 34, amp = 0.035) => {
  const r = (rot * Math.PI) / 180, pts: string[] = [];
  for (let i = 0; i <= n * 4; i++) {
    const a = (i / (n * 4)) * Math.PI * 2, k = 1 + amp * Math.abs(Math.sin((a * n) / 2));
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push(`${(cx + x * Math.cos(r) - y * Math.sin(r)).toFixed(1)} ${(cy + x * Math.sin(r) + y * Math.cos(r)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};
export const PlushBear: React.FC<{grey?: boolean}> = ({grey}) => {
  const c = grey ? C.grey : PURPLE, lt = grey ? C.greyLight : PURPLE_LT, dk = grey ? '#6f6a64' : PURPLE_DK, bw = grey ? '#6f6a64' : BOW;
  const seam = {stroke: dk, strokeWidth: 1.8, strokeDasharray: '4 4', fill: 'none', opacity: 0.8} as const;
  return (
    <g filter={PC}>
      <path d="M-7 14 Q-8 -2 0 -2 Q8 -2 7 14" stroke={C.paper2} strokeWidth={3} fill="none" />
      {/* legs dangling a little apart, the soles' round pads toward us */}
      {[-1, 1].map((k) => (
        <g key={`l${k}`}>
          <path d={fuzz(k * 36, 268, 30, 36, -k * 8)} fill={c} />
          <ellipse cx={k * 38} cy={284} rx={18} ry={13} fill={lt} transform={`rotate(${-k * 8} ${k * 38} 284)`} />
        </g>
      ))}
      {/* the body, a pear, its belly patch */}
      <path d={fuzz(0, 206, 66, 74)} fill={c} />
      <ellipse cx={0} cy={216} rx={38} ry={46} fill={lt} />
      <path d="M0 140 L0 170" {...seam} />
      {/* arms hanging at its sides, angled a little out, paw pads at the ends */}
      {[-1, 1].map((k) => (
        <g key={`a${k}`}>
          <path d={fuzz(k * 62, 196, 22, 44, -k * 22)} fill={c} />
          <path d={`M${k * 50} ${162} Q${k * 58} ${172} ${k * 70} ${168}`} {...seam} />
          <ellipse cx={k * 76} cy={230} rx={13} ry={11} fill={lt} transform={`rotate(${-k * 22} ${k * 76} 230)`} />
        </g>
      ))}
      {/* the ribbon at the neck */}
      <path d="M-4 140 L-38 124 Q-44 140 -38 156 Z M4 140 L38 124 Q44 140 38 156 Z" fill={bw} />
      <path d="M-4 144 L-16 174 L-9 172 L-5 178 Z M4 144 L16 174 L9 172 L5 178 Z" fill={bw} />
      {/* ears, the head, its centre seam, the muzzle, nose and mouth, button eyes */}
      {[-1, 1].map((k) => <g key={`e${k}`}><path d={fuzz(k * 56, 30, 26, 25, 0, 20)} fill={c} /><circle cx={k * 56} cy={32} r={13} fill={lt} /></g>)}
      <path d={fuzz(0, 80, 76, 64, 0, 40, 0.03)} fill={c} />
      <path d="M0 18 L0 74" {...seam} />
      <ellipse cx={0} cy={104} rx={30} ry={22} fill={lt} />
      <path d="M-9 94 Q0 89 9 94 Q7 102 0 104 Q-7 102 -9 94 Z" fill={C.ink} />
      <path d="M0 104 L0 111 M-10 114 Q-5 110 0 111 Q5 110 10 114" stroke={C.ink} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {[-1, 1].map((k) => <g key={`y${k}`}><circle cx={k * 27} cy={76} r={7.5} fill={C.ink} /><circle cx={k * 27 - 2.4} cy={73.6} r={2.2} fill={C.paper} opacity={0.85} /></g>)}
    </g>
  );
};
/** Ring's hat (user 10-24, 2nd look, from Callisto's official art): a white top hat with a gold band and a huge
 *  two-lobed brim eaten through with holes like bone; his bone sword Tibia hangs behind it. (0,0) is the top of the
 *  crown. */
const rand = (k: number) => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// the brim: the outline of three ellipses (two lobes and the middle) seen from the centre, a little hand-cut wobble
const LOBES: [number, number, number, number][] = [[-124, 172, 130, 74], [126, 158, 132, 78], [0, 180, 100, 64]];
const BRIM_C: [number, number] = [0, 168];
const brimR = (a: number) => {
  const dx = Math.cos(a), dy = Math.sin(a);
  let r = 0;
  for (const [ex, ey, rx, ry] of LOBES) {
    // farthest t with ((BRIM_C + t*d - e)/r)^2 = 1
    const ox = (BRIM_C[0] - ex) / rx, oy = (BRIM_C[1] - ey) / ry, vx = dx / rx, vy = dy / ry;
    const A = vx * vx + vy * vy, B = 2 * (ox * vx + oy * vy), Cc = ox * ox + oy * oy - 1, disc = B * B - 4 * A * Cc;
    if (disc > 0) r = Math.max(r, (-B + Math.sqrt(disc)) / (2 * A));
  }
  return r * (1 + 0.022 * Math.sin(a * 7 + 1) + 0.014 * Math.sin(a * 13 + 2));
};
const inBrim = (x: number, y: number, m: number) => {
  const a = Math.atan2(y - BRIM_C[1], x - BRIM_C[0]);
  return Math.hypot(x - BRIM_C[0], y - BRIM_C[1]) < brimR(a) * m;
};
const HAT_HOLES = (() => {
  const out: [number, number, number][] = [];
  for (let k = 0; out.length < 52 && k < 4000; k++) {
    const x = -255 + 510 * rand(k), y = 80 + 180 * rand(k + 0.5), s = 8 + 8 * rand(k + 0.25);
    if (!inBrim(x, y, 0.84) || (Math.abs(x) < 50 && y < 166)) continue;
    if (out.some(([px, py, ps]) => Math.hypot((x - px) / 1.15, (y - py) * 1.45) < (s + ps) * 1.22)) continue;
    out.push([x, y, s]);
  }
  return out;
})();
const cloudBrim = () => {
  const pts: string[] = [];
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * Math.PI * 2, r = brimR(a);
    pts.push(`${(BRIM_C[0] + Math.cos(a) * r).toFixed(1)} ${(BRIM_C[1] + Math.sin(a) * r).toFixed(1)}`);
  }
  // each hole an uneven blob, flattened by the brim's perspective, turned a little this way or that
  const holes = HAT_HOLES.map(([x, y, s], k) => {
    const n = 16, q: string[] = [], rot = (rand(k + 9) - 0.5) * 1.2, el = 1 + 0.5 * rand(k + 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, w = 1 + 0.2 * Math.sin(a * 2 + 6 * rand(k + 4)) + 0.12 * Math.sin(a * 3 + 6 * rand(k + 5));
      const lx = Math.cos(a) * s * el * w, ly = Math.sin(a) * s * w;
      q.push(`${(x + lx * Math.cos(rot) - ly * Math.sin(rot)).toFixed(1)} ${(y + (lx * Math.sin(rot) + ly * Math.cos(rot)) * 0.66).toFixed(1)}`);
    }
    return `M${q.join(' L')} Z`;
  });
  return `M${pts.join(' L')} Z ${holes.join(' ')}`;
};
const BRIM = cloudBrim();
/** Tibia: a long sword of bone. A knuckle at the top, a cage of ribs for the guard, then the blade, slit through,
 *  with long barbs sweeping down one side to the point. Local: handle up, point down. */
const Tibia: React.FC<{grey?: boolean}> = ({grey}) => {
  const bone = grey ? C.grey : '#86352a', dark = grey ? '#6f6a64' : '#4e1414', light = grey ? C.greyLight : '#c47d5e';
  const rib = (y: number, L: number, s: number) =>
    `M${s * 6} ${y - 5} C${s * L * 0.55} ${y - 15} ${s * L} ${y - 4} ${s * (L + 5)} ${y + 15} L${s * (L - 3)} ${y + 17} C${s * (L - 7)} ${y + 5} ${s * L * 0.5} ${y + 2} ${s * 6} ${y + 5} Z`;
  return (
    <g transform="translate(46 140) rotate(26)">
      {/* the barbs, behind the blade */}
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const yb = -130 + j * 64, L = 96 - j * 11, D = 92 - j * 6;
        return <path key={j} d={`M10 ${yb} Q${12 + L * 0.45} ${yb + 6} ${12 + L} ${yb + D} Q${12 + L * 0.35} ${yb + D * 0.5} 8 ${yb + 38} Z`} fill={j % 2 ? bone : dark} />;
      })}
      {/* the shaft and blade */}
      <path d="M-9 -330 C-11 -200 -19 -60 -17 40 C-15 150 -6 240 0 306 C7 240 18 150 18 40 C18 -60 11 -200 9 -330 Z" fill={bone} />
      <path d="M-4 -320 C-6 -200 -10 -60 -9 40 C-8 150 -3 230 0 290" stroke={light} strokeWidth={3} fill="none" opacity={0.55} />
      <path d="M6 -300 C8 -150 12 0 11 80" stroke={dark} strokeWidth={2} fill="none" opacity={0.7} />
      {[-110, -60, -10, 40].map((y, i) => <ellipse key={y} cx={1} cy={y} rx={4 - i * 0.4} ry={15} fill={C.ink} />)}
      {/* the cage of ribs, longer on the barbed side */}
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={`r${i}`} d={rib(-292 + i * 24, 58 - i * 4, 1)} fill={i % 2 ? bone : light} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={`l${i}`} d={rib(-288 + i * 24, 40 - i * 3, -1)} fill={i % 2 ? dark : bone} />)}
      {/* the knuckle */}
      <path d="M-12 -326 C-24 -340 -21 -364 -8 -366 C-2 -357 3 -357 8 -368 C23 -364 23 -340 12 -326 Z" fill={bone} />
      <path d="M-6 -350 Q0 -344 6 -352" stroke={dark} strokeWidth={2} fill="none" />
    </g>
  );
};
export const WideHat: React.FC<{grey?: boolean}> = ({grey}) => {
  const c = grey ? C.greyLight : C.white, shade = grey ? C.grey : '#ddd6c8', under = grey ? '#6f6a64' : '#a99f8e', gold = grey ? '#8d8780' : C.gold, goldLt = grey ? C.greyLight : '#e3c878';
  return (
    <g filter={PC} transform="rotate(-5)">
      <Tibia grey={grey} />
      {/* the brim: its underside showing at the front edge and in the holes, then the top */}
      <path d={BRIM} fill={under} fillRule="evenodd" transform="translate(0 6)" />
      <path d={BRIM} fill={c} fillRule="evenodd" />
      <path d={BRIM} fill="none" stroke={shade} strokeWidth={1.4} />
      <ellipse cx={0} cy={153} rx={62} ry={16} fill={under} opacity={0.45} />
      {/* the crown, a little wider at the top, the top seen from just above, the gold band */}
      <defs>
        <linearGradient id={`hatCrown${grey ? 'G' : ''}`} x1="-55" y1="0" x2="55" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={grey ? '#8d8780' : '#d3cab9'} />
          <stop offset="0.32" stopColor={grey ? C.greyLight : '#efe9de'} />
          <stop offset="0.55" stopColor={grey ? C.greyLight : '#e6dfd2'} />
          <stop offset="1" stopColor={grey ? '#7d7770' : '#bfb5a2'} />
        </linearGradient>
      </defs>
      <path d="M-55 6 Q-44 78 -47 150 Q0 160 47 150 Q44 78 55 6 Z" fill={`url(#hatCrown${grey ? 'G' : ''})`} stroke={under} strokeWidth={1.4} />
      <ellipse cx={0} cy={6} rx={55} ry={13} fill={grey ? C.greyLight : '#fffdf7'} stroke={under} strokeWidth={1.4} />
      <path d="M-50 100 Q0 110 50 100" stroke={gold} strokeWidth={2.5} fill="none" />
      <path d="M-49 114 Q0 124 49 114 L48 133 Q0 143 -48 133 Z" fill={gold} />
      <path d="M-49 118 Q0 128 49 118" stroke={goldLt} strokeWidth={2} fill="none" />
    </g>
  );
};
/** Shiomi's kiseru, tied at the middle of its stem; (0,0) is the knot. smoke: 0..1 the thin smoke from the bowl */
export const Kiseru: React.FC<{grey?: boolean; t: number; smoke?: number}> = ({grey, t, smoke = 1}) => {
  const metal = grey ? C.greyLight : '#b9ad92', metalDk = grey ? C.grey : '#857a62', stem = grey ? C.grey : '#5d4a3a';
  let d = '';
  for (let i = 0; i <= 30; i++) {
    const u = i / 30;
    d += `${i ? 'L' : 'M'}${(166 + u * 18 + Math.sin(u * 5.5 - t * 1.4) * 14 * u).toFixed(1)} ${(-22 - u * 230).toFixed(1)} `;
  }
  return (
    <g>
      {smoke > 0 && (
        <g opacity={smoke}>
          <defs>
            <linearGradient id="kiseruSmoke" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor={C.paper} stopOpacity={0.55} />
              <stop offset="1" stopColor={C.paper} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={d} stroke="url(#kiseruSmoke)" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>
      )}
      <g filter={PC} transform="rotate(-7)">
        <path d="M-176 -3.5 L-112 -6 L-112 6 L-176 3.5 Q-180 0 -176 -3.5 Z" fill={metal} />
        <path d="M-172 -1 L-116 -2.5" stroke={C.paper} strokeWidth={1.2} opacity={0.6} />
        <rect x={-114} y={-5.5} width={228} height={11} fill={stem} />
        {[-70, -20, 34, 84].map((x) => <path key={x} d={`M${x} -5.5 L${x} 5.5`} stroke="#3f3127" strokeWidth={2} />)}
        <path d="M112 -6 L152 -6 Q160 -6 162 -16 L162 -22 L180 -22 L178 -14 Q172 6 150 6 L112 6 Z" fill={metal} />
        <path d="M162 -22 L180 -22 L179 -18 L163 -18 Z" fill={metalDk} />
        <path d="M116 -2.5 L150 -2.5" stroke={C.paper} strokeWidth={1.2} opacity={0.6} />
      </g>
      <path d="M-4 -6 L-4 6 M2 -6 L2 6" stroke={C.paper} strokeWidth={1.6} opacity={0.8} />
    </g>
  );
};

/* ---------- who hangs where ---------- */
type Father = {key: string; call: string; x: number; hook: number; s: number; bottom: number};
export const FATHERS: Father[] = [
  {key: 'ticket', call: '券券', x: 300, hook: 520, s: 0.85, bottom: 124},
  {key: 'book', call: '娘', x: 630, hook: 474, s: 0.85, bottom: 300},
  {key: 'bear', call: '嬢ちゃん', x: 960, hook: 490, s: 0.78, bottom: 300},
  {key: 'hat', call: 'ヨシヒデ', x: 1280, hook: 470, s: 0.64, bottom: 250},
  {key: 'pipe', call: '', x: 1620, hook: 560, s: 0.9, bottom: 30},
];
const thing = (key: string, grey: boolean, nicked: boolean, t: number, smoke: number) =>
  key === 'ticket' ? <g transform="translate(0 60)"><Ticket grey={grey} /></g>
    : key === 'book' ? <g transform="translate(0 122)"><PictureBook nicked={nicked} /></g>
      : key === 'bear' ? <PlushBear grey={grey} />
        : key === 'hat' ? <WideHat grey={grey} />
          : <Kiseru grey={grey} t={t} smoke={smoke} />;

/** a name written down the thread, one character under another; '' is a long dash, the name never said */
const NAME = 54;
const CallName: React.FC<{text: string; y0: number; o: number}> = ({text, y0, o}) => {
  if (!text) return <path d={`M0 ${y0} L0 ${y0 + 2 * NAME}`} stroke={C.paper} strokeWidth={3} opacity={o * 0.9} />;
  const small = 'ゃゅょっ';
  return (
    <g opacity={o}>
      {[...text].map((ch, i) => (
        <text key={i} x={small.includes(ch) ? NAME * 0.12 : 0} y={y0 + (i + 0.5) * NAME - (small.includes(ch) ? NAME * 0.1 : 0)} fontFamily={F.brush} fontSize={NAME} textAnchor="middle" dominantBaseline="central"
          fill={C.paper} stroke={C.ink} strokeWidth={9} paintOrder="stroke" strokeLinejoin="round">{ch}</text>
      ))}
    </g>
  );
};
const nameTop = (f: Father) => f.hook - 34 - (f.call ? [...f.call].length : 2) * NAME;

/* ---------- the faint words ---------- */
const WORDS = [
  '鉄則', '敬語', '弾丸', 'クリーム', '指令', '代行者', '絵本', 'モグラ', 'ティビア', '栞', '結末', '千本の針', '兄弟', '仕返し', 'ぬいぐるみ', '紫',
  '刺青', '帳簿', '芸術', '帽子', '絵の具', '作品', '大師', '人体', '煙管', '煙', '刀法', '鞘', '血', '枷', '金枝', '赤い糸', '蜘蛛の巣',
  '家族', '父', '掟', '忠誠', '跡継ぎ', '蜘蛛の糸', '愛', '名前', '教材', '家', '娘',
];
type Faint = {x: number; len: number; word: string; size: number; o: number; amp: number; fr: number; ph: number; far: boolean; at: number};
export const FAINT: Faint[] = (() => {
  const r = rng(909);
  const out: Faint[] = [];
  let tries = 0;
  while (out.length < WORDS.length && tries++ < 4000) {
    const x = 40 + r() * (W - 80);
    if (FATHERS.some((f) => Math.abs(f.x - x) < 64)) continue;
    if (out.some((o) => Math.abs(o.x - x) < 22)) continue;
    const word = WORDS[out.length];
    const size = 20 + Math.round(r() * 16);
    out.push({x, len: 250 + r() * (860 - [...word].length * size), word, size, o: 0.1 + r() * 0.12, amp: 0.4 + r() * 1.0, fr: 0.45 + r() * 0.6, ph: r() * 6.3, far: r() < 0.35, at: r()});
  }
  return out;
})();
const FaintWord: React.FC<{f: Faint}> = ({f}) => (
  <g filter={f.far ? 'url(#soft)' : undefined}>
    <path d={`M0 0 L0 ${f.len}`} stroke={C.paper} strokeWidth={1} opacity={f.o * 0.55} />
    {[...f.word].map((ch, i) => (
      <text key={i} x={0} y={f.len + (i + 0.5) * f.size * 1.02} fontFamily={F.jp} fontSize={f.size} textAnchor="middle" dominantBaseline="central" fill={C.paper} opacity={f.o}>{ch}</text>
    ))}
  </g>
);

/* ---------- a thread hung from (x, TOP) that a slash may cut ----------
   The content is drawn in the thread's own frame (0,0 at the top, +y down). Cut, it is drawn twice: the stub,
   clipped above the cut, still hanging (and jerked by the cut); the rest, clipped below, falling away. */
const SLOPE = -80 / (W + 200);                          // the slash: from (-100, 190) to (W+100, 110)
export const slashY = (x: number) => 190 + SLOPE * (x + 100);
type Fall = {dx: number; dy: number; rot: number; o: number; py?: number};   // py: what it turns about (default the cut)
const CutThread: React.FC<{id: string; x: number; drop: number; theta: number; cut: {at: number; theta: number; jerk: number} | null; fall: Fall; t: number; children: (part: 'stub' | 'rest' | 'whole') => React.ReactNode}> = ({id, x, drop, theta, cut, fall, t, children}) => {
  if (!cut || t < cut.at) return <g transform={`translate(${x} ${TOP - drop}) rotate(${theta})`}>{children('whole')}</g>;
  const sc = slashY(x) - TOP, far = 3000;
  const up = `M${-far} ${-far} L${far} ${-far} L${far} ${sc + SLOPE * far} L${-far} ${sc - SLOPE * far} Z`;
  const dn = `M${-far} ${sc - SLOPE * far} L${far} ${sc + SLOPE * far} L${far} ${far} L${-far} ${far} Z`;
  return (
    <>
      <defs>
        <clipPath id={`cu${id}`}><path d={up} /></clipPath>
        <clipPath id={`cd${id}`}><path d={dn} /></clipPath>
      </defs>
      <g transform={`translate(${x} ${TOP}) rotate(${theta + cut.jerk})`}><g clipPath={`url(#cu${id})`}>{children('stub')}</g></g>
      <g transform={`translate(${x} ${TOP}) rotate(${cut.theta})`}>
        <g transform={`translate(${fall.dx} ${fall.dy}) rotate(${fall.rot} 0 ${fall.py ?? sc})`} opacity={fall.o}><g clipPath={`url(#cd${id})`}>{children('rest')}</g></g>
      </g>
    </>
  );
};

/** appear: when the first of them is let down; spacing: seconds between the five; cutAt: the slash, or null.
 *  floor: where what falls lands. Four are cut, fall and go grey; Rien's thread does not cut (「你的那把刀是无法斩断
 *  蜘蛛丝的，女儿」), the blade only takes the corner off the book. */
export const FatherRow: React.FC<{t: number; appear: number; spacing?: number; cutAt: number | null; floor?: number}> = ({t, appear, spacing = 0.8, cutAt, floor = 930}) => {
  const cut = cutAt !== null && t >= cutAt;
  const dt = cut ? t - cutAt! : 0;
  return (
    <g>
      {/* the faint words, let down at random through the first seconds */}
      {FAINT.map((f, i) => {
        const at = appear - 0.6 + f.at * (spacing * 5 + 1.2);
        const k = eout(clamp((t - at) / 1.8));
        if (k <= 0) return null;
        const theta = f.amp * Math.sin(t * f.fr + f.ph);
        const ct = cutAt !== null ? cutAt + 0.06 * (f.x / W) : 0;
        const d = Math.max(0, t - ct);
        const fall: Fall = {dx: (f.ph - 3) * 9 * d, dy: 0.5 * 2200 * d * d, rot: (f.ph - 3) * 9 * d, o: 1 - smooth(0.15, 1.1, d)};
        return (
          <g key={i} opacity={k}>
            <CutThread id={`f${i}`} x={f.x} drop={(1 - k) * (f.len + 300)} theta={theta} t={t} fall={fall}
              cut={cutAt !== null ? {at: ct, theta: f.amp * Math.sin(ct * f.fr + f.ph), jerk: 7 * Math.exp(-d * 1.6) * Math.sin(d * 9 + f.ph)} : null}>
              {(part) => <g opacity={part === 'stub' ? 1 - 0.4 * smooth(0, 2, d) : 1}><FaintWord f={f} /></g>}
            </CutThread>
          </g>
        );
      })}
      {/* the five */}
      {FATHERS.map((f, i) => {
        const at = appear + i * spacing;
        const k = eout(clamp((t - at) / 1.6));
        if (k <= 0) return null;
        const isBook = f.key === 'book';
        const theta = Math.sin(t * 0.9 + i * 1.3) * 1.1 + (cut && isBook ? 5 * Math.exp(-dt * 0.45) * Math.sin(dt * 2.6) : 0);
        const ct = cutAt !== null ? cutAt + 0.06 * (f.x / W) : 0;
        const d = Math.max(0, t - ct);
        const fk = prog(t, ct, ct + 1.0, (x) => x * x);
        const restDy = floor - (f.hook + f.bottom * f.s);
        const fall: Fall = {dx: 0, dy: fk * restDy, rot: fk * (i % 2 ? 1 : -1) * (f.key === 'pipe' ? 4 : 16), o: 1, py: f.hook - TOP + f.bottom * f.s * 0.5};
        const greyK = cutAt !== null && !isBook ? smooth(ct + 0.3, ct + 1.6, t) : 0;
        const wordO = 1 - smooth(ct + 0.05, ct + 0.6, t);
        const smoke = (1 - (cutAt !== null ? smooth(ct, ct + 0.3, t) : 0));
        const body = (part: 'stub' | 'rest' | 'whole') => (
          <>
            <path d={`M0 0 L0 ${f.hook - TOP}`} stroke={C.paper} strokeWidth={1.5} opacity={part === 'rest' ? 0.75 * wordO : 0.75} />
            <g transform={`translate(0 ${-TOP})`}>
              <CallName text={f.call} y0={nameTop(f)} o={part === 'rest' ? wordO : 1} />
              <g transform={`translate(0 ${f.hook}) scale(${f.s})`}>
                <g opacity={1 - greyK}>{thing(f.key, false, cut && isBook, t, smoke)}</g>
                {greyK > 0 && <g opacity={greyK}>{thing(f.key, true, false, t, 0)}</g>}
              </g>
            </g>
          </>
        );
        return (
          <g key={f.key} opacity={k}>
            {isBook ? (
              <g transform={`translate(${f.x} ${TOP - (1 - k) * (f.hook + 400)}) rotate(${theta})`}>{body('whole')}</g>
            ) : (
              <CutThread id={`m${i}`} x={f.x} drop={(1 - k) * (f.hook + 400)} theta={theta} t={t} fall={fall}
                cut={cutAt !== null ? {at: ct, theta: Math.sin(ct * 0.9 + i * 1.3) * 1.1, jerk: 9 * Math.exp(-d * 1.3) * Math.sin(d * 8 + i)} : null}>
                {body}
              </CutThread>
            )}
            {cut && isBook && (
              <>
                <g transform={`translate(${f.x + 30 * prog(t, cutAt!, cutAt! + 1.2)} ${f.hook + 122 * f.s + prog(t, cutAt!, cutAt! + 1.1, (x) => x * x) * (floor - f.hook - 130)}) rotate(${prog(t, cutAt!, cutAt! + 1.1) * 70}) scale(${f.s})`} opacity={1 - smooth(cutAt! + 1.5, cutAt! + 3, t) * 0.4}>
                  <g transform="translate(0 -2)"><BookCorner /></g>
                </g>
                {/* the blade glances off the spider's thread */}
                {dt < 0.35 && (
                  <g transform={`translate(${f.x} ${slashY(f.x)})`} opacity={1 - dt / 0.35}>
                    {Array.from({length: 7}, (_, j) => {
                      const a = (j / 7) * Math.PI * 2 + 0.3, l = lerp(10, 46, dt / 0.35) * (j % 2 ? 0.6 : 1);
                      return <path key={j} d={`M${Math.cos(a) * l * 0.4} ${Math.sin(a) * l * 0.4} L${Math.cos(a) * l} ${Math.sin(a) * l}`} stroke={C.white} strokeWidth={2} />;
                    })}
                  </g>
                )}
              </>
            )}
          </g>
        );
      })}
    </g>
  );
};

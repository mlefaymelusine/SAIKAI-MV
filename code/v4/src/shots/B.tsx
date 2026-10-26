// Chorus 1 and the interlude (1:26 – 2:23): the scars, the roof, the S, the play-back, the web, the five fathers.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../theme';
import {H, W, clamp, eio, eout, lerp, prog, rng, smooth} from '../util';
import {CUE} from '../cues';
import {QUOTES} from '../timeline';
import {Flash, Path, Seq, Shot, SubBand, Svg, Wash, useShot} from '../comp/core';
import {wavy} from '../comp/lines';
import {Bento, Hydrangea, Nadeshiko, Randoseru, RoofBacks, SafeIcon, Watermelon, YarnBall} from '../comp/objects';
import {FATHERS, FatherRow} from '../comp/fathers';
import {Moons, RoofScene, Doorway} from '../comp/rooftop';
import {FilmStrip, PITCH} from '../comp/film';
import {Scar, TreeRings} from '../comp/rings';
import {LightTable} from './A';

/* C1 86–96.6  6–8 pain cannot define the past (user 10-24: the sewn cuts are out). The cut face of a tree: the rings
   grow out from the heart, a year at a time, and the view draws back with them. "Pain", "define", "past": each is a
   cut into the edge the wood has reached, and the rings that follow roll over it and close it. "We are built to
   overcome endless mishaps": small hurts come faster, each grown over in turn, and the red thread goes round the
   growing edge. The scars stay inside; the rings go on round them. (comp/rings.tsx) */
const EDGE: [number, number][] = [[86.0, 0.3], [CUE.pain, 6], [CUE.past, 11], [CUE.overcome, 14.5], [96.6, 21.5]];
const edgeAt = (t: number) => {
  let e = EDGE[0][1];
  for (let i = 0; i < EDGE.length - 1; i++) if (t >= EDGE[i][0]) e = lerp(EDGE[i][1], EDGE[i + 1][1], clamp((t - EDGE[i][0]) / (EDGE[i + 1][0] - EDGE[i][0])));
  return e;
};
const C1_SCARS: Scar[] = (() => {
  const big: [number, number, number, number][] = [[CUE.pain, -0.75, 4.5, 0.12], [CUE.define, 2.55, 3.6, 0.09], [CUE.past, 1.3, 3, 0.075]];
  const r = rng(91);
  const small = [92.35, 92.8, 93.5, 93.95, 94.4, 94.8, 95.2, 95.55, 95.9].map((at, i) => [at, -2.6 + i * 2.39 + (r() - 0.5) * 0.5, 1.3 + r() * 0.9, 0.035 + r() * 0.03] as [number, number, number, number]);
  return [...big.map(([at, th, d, w]) => ({at, th, k: edgeAt(at), d, w})), ...small.map(([at, th, d, w]) => ({at, th, k: edgeAt(at), d, w, heal: 2}))];
})();
const C1: React.FC = () => {
  const {abs} = useShot();
  const sc = lerp(3.0, 0.88, eio(prog(abs, 86.0, 96.4, (x) => x)));
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Svg>
        <g transform={`translate(960 515) scale(${sc})`}>
          <TreeRings t={abs} edge={edgeAt(abs)} scars={C1_SCARS} thread={prog(abs, CUE.overcome, CUE.overcome + 1.1, eio)} slash={C1_SCARS.slice(0, 3).map((s) => ({at: s.at, th: s.th}))} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/* C2 96.6–106.5  9–11 not so bad, when you are with me: the rooftop key image (user 10-24, reference only;
   comp/rooftop.tsx). Out through the dark doorway: the sky turns slowly (tools/starsky.py c2), two moons, the two
   of them from behind; on "with me" Araya leans in. We drift toward the door; a star falls on "cherish". */
const SKY_C2 = 324;
const C2_PAIR = 1;          // which of the gpt-image pairs (gen/r3/out/c2_pair_N, public/img4/c2pair_N); 0 = the old SVG pair
const C2: React.FC = () => {
  const {abs} = useShot();
  const k = prog(abs, 96.2, 107, (x) => x);
  const sc = (n: number): React.CSSProperties => ({transform: `scale(${lerp(1, n, eio(k))})`, transformOrigin: '960px 840px'});
  const star = prog(abs, 103.1, 103.8, (x) => x);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={sc(1.03)}>
        <Seq name="skyC2" frames={SKY_C2} keys={[[96.2, 1], [96.2 + (SKY_C2 - 1) / 30, SKY_C2]]} />
        <Svg>
          <Moons t={abs} />
          {star > 0 && star < 1 && <path d={`M${lerp(1520, 1330, star)} ${lerp(90, 230, star)} L${lerp(1520, 1330, star) + 70} ${lerp(90, 230, star) - 52}`} stroke="#f6f0ff" strokeWidth={2} opacity={Math.sin(star * Math.PI)} strokeLinecap="round" />}
        </Svg>
      </AbsoluteFill>
      <AbsoluteFill style={sc(1.07)}><Svg><RoofScene lean={prog(abs, CUE.withMe, CUE.withMe + 1.4, eio)} t={abs} pairImg={C2_PAIR} /></Svg></AbsoluteFill>
      <AbsoluteFill style={sc(1.15)}><Svg><Doorway /></Svg></AbsoluteFill>
    </AbsoluteFill>
  );
};

/* C3 106.5–111.2  12 'S' is not for sayonara: SAYONARA is cut after the S, the rest falls grey; S· ; it grows back as SAIKAI */
const C3: React.FC = () => {
  const {abs} = useShot();
  const cut = CUE.sayonara1;
  const fall = prog(abs, cut + 0.05, cut + 1.1, (x) => x * x);
  const grow = prog(abs, CUE.saikaiGrow, CUE.saikaiGrow + 0.9, eout);
  const fs = 136, ls = '0.24em', left = 470;
  const inO = smooth(CUE.sOn - 0.3, CUE.sOn + 0.3, abs);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', left, top: 330, display: 'flex', fontFamily: F.en, fontSize: fs, letterSpacing: ls, color: C.ink, opacity: inO, whiteSpace: 'nowrap'}}>
        <span>S</span>
        <span style={{position: 'relative'}}>
          {abs < cut + 1.2 && (
            <span style={{display: 'inline-block', transform: `translate(${fall * 30}px, ${fall * 420}px) rotate(${fall * 9}deg)`, color: abs < cut ? C.ink : C.grey, opacity: 1 - fall}}>AYONARA</span>
          )}
          <span style={{position: 'absolute', left: 0, top: 0, color: C.red, opacity: smooth(cut + 0.15, cut + 0.5, abs) * (1 - grow)}}>·</span>
          <span style={{position: 'absolute', left: 0, top: 0, opacity: grow, clipPath: `inset(0 ${100 - grow * 100}% 0 0)`}}>AIKAI</span>
        </span>
      </div>
      <Svg>
        {abs > cut - 0.04 && abs < cut + 0.5 && <path d={`M${left + 105} ${420 - 6} L${W + 60} ${420 + 18}`} stroke={C.redLine} strokeWidth={lerp(5, 0.5, prog(abs, cut, cut + 0.5))} />}
      </Svg>
    </AbsoluteFill>
  );
};

/* C4 111.2–116.6  13 let memories play back: the film from V3 runs back fast, newest first, smeared with speed;
   then the dark (user, 10-24: an old film reel rewinding, with an old-film look) */
const REWIND = ['yarn', 'safe', 'nadeshiko', 'shoes', 'bento', 'heights', 'randoseru', 'hydrangea', 'melon'];
const rewindAt = (t: number) => {
  // user 10-24 (everything slower): an even sine ease, so the middle of the rewind runs half as fast as the cubic did
  const p = prog(t, 110.95, 115.75, (x) => x);
  const e = 0.5 - 0.5 * Math.cos(Math.PI * p);
  return lerp(REWIND.length - 1, 0, e);
};
const C4: React.FC = () => {
  const {abs} = useShot();
  const at = rewindAt(abs);
  const speed = Math.abs(rewindAt(abs + 1 / 30) - at) * PITCH;      // px per video frame
  return (
    <AbsoluteFill>
      <LightTable />
      <Svg><FilmStrip reel={REWIND} at={at} id="c4" cy={470} rot={-2.5} scale={1.16} blur={Math.min(34, speed * 0.5)} /></Svg>
      <Wash a={115.4} b={116.8} color={C.ink} />
    </AbsoluteFill>
  );
};

/* I1 116.6–129.8  the House of Spiders: the 3D web tunnel (kept from v1), the only time we enter it */
const Seal: React.FC<{text: string; x: number; y: number; size: number; at: number}> = ({text, x, y, size, at}) => {
  const {abs} = useShot();
  const k = clamp((abs - at) / 0.25);
  if (abs < at) return null;
  const w = size * 0.42, h = size;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${lerp(1.6, 1, eout(k))}) rotate(-3deg)`, opacity: clamp(k * 3)}}>
      <svg width={w} height={h} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <filter id="sealRough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>
        </defs>
        <g filter="url(#sealRough)">
          <rect x={3} y={3} width={w - 6} height={h - 6} rx={6} fill={C.red} />
          <rect x={10} y={10} width={w - 20} height={h - 20} rx={3} fill="none" stroke={C.paper} strokeWidth={3} />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', color: C.paper, fontFamily: F.brush, fontSize: (size / text.length) * 0.8, lineHeight: 1}}>{text}</div>
    </div>
  );
};
const I1: React.FC = () => {
  const {abs} = useShot();
  return (
  <AbsoluteFill style={{background: C.ink}}>
    <Seq name="webtunnel" frames={390} keys={[[116.8, 1], [129.8, 390]]} />
    {/* the web is busy behind the quote: darken the bottom band while it is up */}
    <SubBand o={smooth(QUOTES[0].from - 0.8, QUOTES[0].from, abs) * (1 - smooth(QUOTES[0].to, QUOTES[0].to + 0.8, abs))} />
    <Seal text="蜘蛛の巣" x={260} y={340} size={300} at={CUE.sealIn} />
  </AbsoluteFill>
  );
};

/* I2 129.8–143  the fathers who raised her, by the names they called her and the things she remembers them by
   (comp/fathers.tsx). The faint words come down first; then, close, the camera goes along the row as each of the
   five is let down, and draws back to the whole row. */
const I2_AT = CUE.fathersIn, I2_GAP = 1.7;
const I2: React.FC = () => {
  const {abs} = useShot();
  const keys = FATHERS.map((f, i) => [I2_AT + i * I2_GAP + 0.6, f.x] as [number, number]);
  let cx = keys[0][1];
  for (let i = 1; i < keys.length; i++) if (abs > keys[i - 1][0]) cx = lerp(keys[i - 1][1], keys[i][1], prog(abs, keys[i - 1][0], keys[i][0]));
  const out = prog(abs, I2_AT + 4 * I2_GAP + 0.9, I2_AT + 4 * I2_GAP + 3.6);
  const z = lerp(1.45, 1, out) * lerp(1, 1.03, prog(abs, I2_AT + 4 * I2_GAP + 3.6, 143.4, (x) => x));
  const cam = `translate(${W / 2} ${H / 2}) scale(${z}) translate(${-lerp(cx, W / 2, out)} ${-lerp(470, 520, out)})`;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Svg><g transform={cam}><FatherRow t={abs} appear={I2_AT} spacing={I2_GAP} cutAt={null} /></g></Svg>
    </AbsoluteFill>
  );
};

export const PartB: React.FC = () => (
  <>
    <Shot id="C1"><C1 /></Shot>
    <Shot id="C2" still><C2 /></Shot>
    <Shot id="C3"><C3 /></Shot>
    <Shot id="C4"><C4 /></Shot>
    <Shot id="I1"><I1 /></Shot>
    <Shot id="I2"><I2 /></Shot>
  </>
);

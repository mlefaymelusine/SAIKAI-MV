// Prologue and verse 1 (0:00 – 1:26): the thread, the ball of yarn, the web, the safe, the flower, the walk, the hydrangea.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F} from '../theme';
import {H, W, clamp, eio, eout, lerp, prog, rng, smooth} from '../util';
import {CUE} from '../cues';
import {Path, Pic, Seq, Shot, SubBand, Svg, Wash, useShot} from '../comp/core';
import {CatsCradle, Thread, ThreadFlower, wavy} from '../comp/lines';
import {Buds, FIELD_MAIN, FieldHead, Hydrangea, HydrangeaField, Nadeshiko, floretOpenTimes} from '../comp/objects';
import {FilmStrip} from '../comp/film';

/* P1 0–12  (user 10-24: the plain thread opening is out; the v1 folding screen back, its picture redrawn) the screen
   with the burning ox-cart of 地獄変 (comp/hellscreen.ts), its flames moving; its title. From 5.8 it folds up and is
   carried off to either side; behind it, the dark, and one red thread let down into it, which P2 winds into a ball.
   User 10-24 (4th look): the CSS panels split apart as they opened; the screen is now modelled in Blender
   (blender/screen.py -> seq/screenFold, transparent webp), a pair of three-panel screens folding on their hinges,
   the picture coming frame by frame from the ScreenTex composition; and the ox redrawn with gpt-image.
   User 10-24 (4th/5th look): the thread's tip butted hard onto P2's thread fading in below it, like two blocks end
   to end. Letting it on down onto the ball broke the sense of it (who ties half a thread to a ball of yarn?); so it
   is as it was, one thread already on the ball, let down as before to (753.8, 442) by 11.6, but its lower end fades
   out into the dark over its last FADE px, and in the cross-fade P2's thread, the very same line (tools/yarn.py),
   comes up under that fade, so the two meet softly. */
const FADE = 170;
const SCREEN_N = 334;
const P1: React.FC = () => {
  const {abs} = useShot();
  const tipY = lerp(-40, 442.0, prog(abs, 7.0, 11.6, eout));
  const titleO = smooth(9.2, 10.2, abs) * (1 - smooth(10.9, 11.7, abs));
  // the same hanging thread as tools/yarn.py's free thread before it straightens (its sway down to (TX, TY))
  const TX = 753.8, TY = 442.0, sx = TX + 60 * Math.sin(abs * 1.1), sy = -60;
  let thread = '';
  if (tipY > sy) for (let i = 0; i <= 40; i++) {
    const y = lerp(sy, tipY, i / 40), u = Math.min(1, (y - sy) / (TY - sy));
    thread += `${i ? 'L' : 'M'}${(lerp(sx, TX, u) + 18 * Math.sin(u * 3 + 0.6 * abs) * (1 - u)).toFixed(1)} ${y.toFixed(1)} `;
  }
  const fade = (id: string, col: string) => (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={tipY - FADE} x2={0} y2={tipY}>
      <stop offset={0} stopColor={col} stopOpacity={1} />
      <stop offset={1} stopColor={col} stopOpacity={0} />
    </linearGradient>
  );
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Svg>
        <defs>{fade('p1edge', '#28040c')}{fade('p1red', '#c41a2e')}</defs>
        {thread && <path d={thread} stroke="url(#p1edge)" strokeWidth={21} fill="none" />}
        {thread && <path d={thread} stroke="url(#p1red)" strokeWidth={19} fill="none" />}
      </Svg>
      <Seq name="screenFold" ext="webp" frames={SCREEN_N} keys={[[0, 1], [(SCREEN_N - 1) / 30, SCREEN_N]]} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: F.jp, fontSize: 30, letterSpacing: '0.3em', marginRight: '-0.3em', color: C.paper2, opacity: smooth(1.2, 2.4, abs) * (1 - smooth(5.6, 6.6, abs))}}>地獄変</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 970, textAlign: 'center', fontFamily: F.jp, fontSize: 20, color: C.paper2, opacity: smooth(2.0, 3.0, abs) * (1 - smooth(5.6, 6.6, abs))}}>芥川龍之介「地獄変」より</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: titleO, color: C.paper}}>
        <div style={{fontFamily: F.en, fontWeight: 400, fontSize: 92, letterSpacing: '0.55em', marginRight: '-0.55em'}}>SAIKAI</div>
        <div style={{fontFamily: F.en, fontStyle: 'italic', fontSize: 34, marginTop: 6, color: C.paper2}}>Mili</div>
        <div style={{fontFamily: F.en, fontSize: 19, letterSpacing: '0.42em', marginTop: 28, color: C.paper2, opacity: 0.8}}>LIMBUS COMPANY · CANTO IX</div>
      </div>
      <Wash a={0} b={2.2} color="#000" out />
    </AbsoluteFill>
  );
};

/* P2 12–29.6  the thread winds itself into a ball of yarn (user 10-24: the old ball was too plain). tools/yarn.py:
   one red thread wound turn by turn as a real 3D path, in crossing bands like a hand-wound ball. User 10-24 (3rd look):
   a quarter of the speed; the camera comes down the thread and finds the ball already well wound, winding on slowly;
   it ends on the ball with its thread going up, the first end running on down out of the bottom (a knot in one thread);
   at the end we drift on down that thread into V0's cat's cradle. */
const YARN_N = 571;
const P2: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Seq name="yarnP2" frames={YARN_N} keys={[[11.2, 1], [11.2 + (YARN_N - 1) / 30, YARN_N]]} />
  </AbsoluteFill>
);

/* V0 29.6–35.1  0 young and lost: a cat's-cradle web on black paper; (user 10-26) as in the earlier version, the
   white web then untwists into a ladder and goes red, slowly, before the cut */
const V0: React.FC = () => {
  const {abs} = useShot();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <CatsCradle form={prog(abs, 29.8, 32.9, (x) => x)} ladder={prog(abs, 32.9, 34.8)} cy={470} />
    </AbsoluteFill>
  );
};

/* V1 35.1–44.2  1 doors unlocked: the square time-safe (Blender). The dial turns from "showed up",
   the door swings on "unlocked", the light inside spills out and the frame goes into it. */
const V1: React.FC = () => {
  const {abs} = useShot();
  const push = lerp(1, 1.9, prog(abs, 42.6, 44.8, (x) => x * x));
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Seq name="safe" frames={240} keys={[[34.6, 1], [CUE.showedUp, 1], [39.6, 90], [CUE.unlocked - 0.2, 118], [CUE.unlocked, 120], [44.5, 236]]} z={push} origin="910px 530px" />
      <SubBand o={1 - prog(abs, 42.6, 43.6)} />
      <Wash a={43.5} b={44.7} color={C.paper} />
    </AbsoluteFill>
  );
};

/* V2 44.2–57.6  2–3 like threads, petals unfold / a red kawara-nadeshiko: the thread draws in and the flower opens;
   then the camera draws back (50.3–55.7) and the riverbank fills with nadeshiko drawn in grey thread, opening
   outward from her; a river runs behind. Only the one the thread leads to is red. (user: 50–55 s needed a change) */
const PULL = 0.45;                              // camera scale at the end of the pull-back
const FIELD = (() => {                          // the riverbank in final-screen coordinates, the red flower at (1000, 540)
  const R = rng(57);
  const out: {x: number; y: number; r: number; rot: number; ph: number; t0: number; bend: number; seed: number}[] = [];
  let guard = 0;
  while (out.length < 28 && guard++ < 4000) {
    const x = 40 + R() * 1840, y = 390 + R() * 600;
    if (Math.hypot(x - 1000, y - 540) < 150) continue;
    if (y > 840 && x > 560 && x < 1360) continue;                     // keep the subtitle clear
    const r = lerp(30, 74, (y - 390) / 600) * (0.85 + R() * 0.3);
    if (out.some((o) => Math.hypot(o.x - x, o.y - y) < (o.r + r) * 1.15)) continue;
    const d = Math.hypot(x - 1000, (y - 540) * 1.3);
    out.push({x, y, r, rot: R() * 1.2, ph: R() * 6.28, t0: 50.8 + (d / 1150) * 3.2 + R() * 0.3, bend: (R() - 0.5) * 50, seed: 1 + Math.floor(R() * 90)});
  }
  return out.sort((a, b) => a.y - b.y);
})();
const RIVER = [200, 226, 251, 274, 296, 317];
const V2: React.FC = () => {
  const {abs} = useShot();
  const open = prog(abs, CUE.petals - 0.2, 51.2, (x) => x);              // 10-25: slower (was to 49.6)
  const breathe = 1 + 0.012 * Math.sin(abs * 0.9);
  const settle = lerp(-8, 0, prog(abs, CUE.petals, 52, eout)) + 1.5 * Math.sin(abs * 0.8);
  const k = prog(abs, 50.3, 55.7, eio);
  const s = lerp(1, PULL, k);
  const cx = lerp(960, 1000, k), cy = lerp(450, 540, k);
  const world = `translate(${cx} ${cy}) scale(${s}) translate(-960 -450)`;            // the red flower lives at (960, 450)
  const field = `translate(${cx} ${cy}) scale(${s / PULL}) translate(-1000 -540)`;     // the bank, drawn as it ends up
  const river = smooth(51.4, 54.2, abs);
  const pale = '#958c7f';
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Svg>
        <g transform={field}>
          {/* the far bank and the river behind */}
          <g opacity={river}>
            <path d="M-400 186 Q500 172 1000 182 T2400 176" stroke={pale} strokeWidth={1.4} fill="none" opacity={0.7} />
            <rect x={-400} y={190} width={2800} height={140} fill="#ddd5c6" opacity={0.55} />
            {RIVER.map((y, i) => (
              <path key={i} d={`M-400 ${y} Q300 ${y - 5} 1000 ${y} T2400 ${y}`} stroke={pale} strokeWidth={1.1} fill="none" opacity={0.55}
                strokeDasharray={`${70 + i * 23} ${40 + i * 17}`} strokeDashoffset={-abs * (38 + i * 9)} />
            ))}
            <path d="M-400 342 Q400 352 1000 344 T2400 348" stroke={pale} strokeWidth={1.6} fill="none" />
          </g>
          {/* the bank: nadeshiko in grey thread, opening outward from hers */}
          {FIELD.map((f, i) => {
            const g = prog(abs, f.t0, f.t0 + 2.8, eio);
            if (g <= 0) return null;
            const sway = 2.4 * Math.sin(abs * 1.1 + f.ph);
            const stem = f.r * 2.6;
            return (
              <g key={i} transform={`rotate(${sway} ${f.x} ${f.y + stem})`}>
                <Path d={`M${f.x + f.bend * 0.3} ${f.y + stem} Q${f.x + f.bend} ${f.y + stem * 0.5} ${f.x} ${f.y + f.r * 0.1}`} color={pale} width={1.1} draw={g} glow={false} opacity={0.8} />
                <Path d={`M${f.x + f.bend * 0.55} ${f.y + stem * 0.62} q${f.r * 0.5} ${-f.r * 0.2} ${f.r * 0.9} ${-f.r * 0.55}`} color={pale} width={1} draw={clamp(g * 1.6 - 0.4)} glow={false} opacity={0.7} />
                <ThreadFlower cx={f.x} cy={f.y} r={f.r} grow={g} color={pale} rot={f.rot} fringe={9} width={1.05} seed={f.seed} sway={0.6} fill={0.1} />
              </g>
            );
          })}
        </g>
        <g transform={world}>
          <Thread x1={-1700} y1={1150} x2={960} y2={450} amp={70} waves={1.3} seed={11} width={2.2} draw={prog(abs, 44.3, CUE.petals)} glow={false} speed={0.3} />
          <g transform={`translate(960 450) rotate(${settle}) scale(${1.3 * breathe})`}><Nadeshiko open={open} /></g>
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center', color: C.ink2, opacity: smooth(CUE.nadeshikoLabel, CUE.nadeshikoLabel + 1.6, abs) * 0.9}}>
        <span style={{fontFamily: F.sc, fontWeight: 300, fontSize: 22, letterSpacing: 8}}>河原抚子</span>
        <span style={{fontFamily: F.en, fontStyle: 'italic', fontSize: 22, marginLeft: 18}}>Dianthus superbus</span>
      </div>
    </AbsoluteFill>
  );
};

/* V3 57.6–71.6  4 caring for someone else: the first reel of film (user, 10-24). Early memories go slowly past
   on a light table, stopping a moment on each: her shoes and the small red ones by the door, the bento with the
   octopus sausage, her height cut into the pillar year by year, the randoseru, the white hydrangea (into V4).
   C4 runs the same film back fast. */
export const REEL = ['shoes', 'bento', 'heights', 'randoseru', 'hydrangea'];
export const LightTable: React.FC = () => (
  <>
    <AbsoluteFill style={{background: '#e8ddc4'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 55% at 50% 46%, rgba(255,251,240,0.95) 0%, rgba(255,248,232,0.35) 55%, rgba(232,221,196,0) 100%)'}} />
  </>
);
const V3: React.FC = () => {
  const {abs} = useShot();
  const u = lerp(-0.45, REEL.length - 1 + 0.15, prog(abs, 57.0, 72.2, (x) => x));
  // slow on each frame, never a whip to the next (user 10-24, 2nd look: slower): the strip keeps creeping, at its
  // slowest a seventh of its mean speed on each memory and at most 1.85 times it in between
  const v = u - 0.25;
  const at = v - (0.85 * Math.sin(2 * Math.PI * v)) / (2 * Math.PI);
  return (
    <AbsoluteFill>
      <LightTable />
      <Svg><FilmStrip reel={REEL} at={at} id="v3" cy={470} rot={-2.5} scale={1.28} /></Svg>
    </AbsoluteFill>
  );
};

/* V4 71.6–86.0  5 the same innocence (user 10-25): close on one white hydrangea in green bud on black paper; its florets
   open 1, 2, 4, 16, then all (moved here from R2); from "innocence" the field opens round it, outward from it, until it
   fills most of the frame, as the camera eases back. R2 and R3 come back to this same field, already open. */
const V4_OPEN = floretOpenTimes(74.0, 0.9, 1.8);
const V4: React.FC = () => {
  const {abs} = useShot();
  const z = lerp(1.3, 1, prog(abs, 74.0, 85.4, eio));
  const open = V4_OPEN.map((t) => clamp((abs - t) / 0.8));
  const fieldGrow = (h: FieldHead) => clamp((abs - (CUE.innocence - 0.6 + (h.d / 1100) * 4.6 + h.seed * 0.5)) / 2.6);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '940px 500px'}}>
        <Svg>
          <HydrangeaField part="back" grow={fieldGrow} id="v4f" />
          <g transform={`translate(${FIELD_MAIN.x} 420) scale(${FIELD_MAIN.s})`}>
            <Hydrangea grow={1} open={open} />
            <Buds abs={abs} open={open} t0={71.6} dur={1.6} />
          </g>
          <HydrangeaField part="front" grow={fieldGrow} id="v4g" />
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PartA: React.FC = () => (
  <>
    <Shot id="P1" still><P1 /></Shot>
    <Shot id="P2" still><P2 /></Shot>
    <Shot id="V0"><V0 /></Shot>
    <Shot id="V1"><V1 /></Shot>
    <Shot id="V2"><V2 /></Shot>
    <Shot id="V3"><V3 /></Shot>
    <Shot id="V4"><V4 /></Shot>
  </>
);

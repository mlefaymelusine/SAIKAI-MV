// Father's voice, the last chorus, the outro (3:43 – 5:24).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from '../theme';
import {H, W, clamp, eio, eout, lerp, prog, smooth} from '../util';
import {CUE} from '../cues';
import {THANKS} from '../timeline';
import {Flash, Path, Seq, Shot, Svg, Wash, useShot} from '../comp/core';
import {Drops} from '../comp/lines';
import {Prints, Step} from '../comp/footprints';
import {FIELD_MAIN, FLORETS, FieldHead, Hydrangea, HydrangeaField} from '../comp/objects';
import sheathLine from '../data/sheath_line.json';
import outroPole from '../data/outro_pole.json';

/* R1 223–231.4  21–22 what do I know about love: Rien's picture book (Blender). The spider that walks its web
   three thousand rounds; then the last page, which is blank. */
const R1: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    {/* lifted and shrunk a little so the subtitles sit below the book */}
    <AbsoluteFill style={{transform: 'translateY(-70px) scale(0.9)', transformOrigin: '50% 0%'}}>
      <Seq name="bookOpen" frames={210} keys={[[222.6, 1], [223.4, 17], [225.0, 59], [CUE.howCan - 0.1, 95], [227.6, 134], [CUE.neverHad - 0.4, 160], [230.8, 200], [231.8, 210]]} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/* R2 231.4–238  23 all I know is that I must keep you thriving (user 10-25): back to the field of V4, all of it open,
   at night; the air moves through it, and on "thriving" the light comes up over it, the far rows out of the dark. (The
   bud that opens 1, 2, 4, 16 has gone to V4: nothing opens a second time.) */
const FieldView: React.FC<{z: number; sway: number; lift: number; red?: (h: FieldHead) => {red: number[]; redK: number[]} | undefined; mainRed?: {red: number[]; redK: number[]}; id: string; children?: React.ReactNode}> = ({z, sway, lift, red, mainRed, id, children}) => {
  const {abs} = useShot();
  const sw = sway * (Math.sin(abs * 0.9 + 2.3) * 1.2 + Math.sin(abs * 0.37 + 1.1) * 0.8);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '940px 520px'}}>
        <Svg>
          <HydrangeaField part="back" grow={() => 1} red={red} t={abs} sway={sway} lift={lift} id={id + 'b'} />
          <g transform={`rotate(${sw} ${FIELD_MAIN.x} ${FIELD_MAIN.b}) translate(${FIELD_MAIN.x} 420) scale(${FIELD_MAIN.s})`}>
            <Hydrangea grow={1} red={mainRed?.red} redK={mainRed?.redK} />
          </g>
          <HydrangeaField part="front" grow={() => 1} red={red} t={abs} sway={sway} lift={lift} id={id + 'f'} />
          {children}
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const R2: React.FC = () => {
  const {abs} = useShot();
  const z = lerp(1.14, 1.05, prog(abs, 231.4, 238.0, (x) => x));
  return <FieldView z={z} sway={prog(abs, 231.4, 233.4)} lift={prog(abs, CUE.thriving - 0.4, CUE.thriving + 1.6, eio)} id="r2" />;
};

/* R3 238–249.7  24–25 every drop of blood I have (user 10-25): red drops fall on the field as it stands, here and there
   across it; where each lands the red spreads out through the florets round it, over several heads at once. */
const R3_DROPS: [number, number, number][] = [   // [time, x, y] (where it lands, in the field's frame)
  [CUE.water, 940, 400], [CUE.every, 430, 330], [CUE.drop, 1460, 300], [244.7, 250, 170],
  [CUE.blood, 1680, 640], [246.4, 1120, 190], [247.3, 200, 700], [CUE.have, 1700, 170],
];
const R3_LAND = 0.75;                                   // comp/lines.tsx Drops: the fall
const redOf = (abs: number, pts: [number, number, number][]) => {
  const red: number[] = [], redK: number[] = [];
  pts.forEach(([wx, wy, i]) => {
    let v = 0;
    R3_DROPS.forEach(([t, x, y], k) => {
      const a = abs - t - R3_LAND;
      if (a <= 0) return;
      const n = 0.82 + 0.36 * (((i * 7919 + k * 104729) % 97) / 97);          // a ragged edge
      const R = (40 + 200 * eout(clamp(a / 4.2))) * n;
      v = Math.max(v, clamp((R - Math.hypot(wx - x, (wy - y) * 1.25)) / 46));
    });
    if (v > 0) { red.push(i); redK.push(v); }
  });
  return {red, redK};
};
const R3: React.FC = () => {
  const {abs} = useShot();
  const z = lerp(1.05, 1.0, prog(abs, 238.0, 249.7, (x) => x));
  const fieldRed = (h: FieldHead) => {
    if (abs < R3_DROPS[0][0] + R3_LAND) return undefined;
    return redOf(abs, FLORETS.map((f, i) => [h.x + f.x * h.s * h.flip, h.y + f.y * h.s, i] as [number, number, number]));
  };
  const mainRed = redOf(abs, FLORETS.map((f, i) => [FIELD_MAIN.x + f.x * FIELD_MAIN.s, 420 + f.y * FIELD_MAIN.s, i] as [number, number, number]));
  return (
    <FieldView z={z} sway={1 - 0.5 * prog(abs, 238, 241)} lift={1 - 0.5 * prog(abs, 240.0, 246.0, eio)} red={fieldRed} mainRed={mainRed} id="r3">
      {R3_DROPS.map(([t, x, y], k) => <Drops key={k} x={x} y0={-60} y1={y} times={[t]} />)}
    </FieldView>
  );
};

/* G1 249.7–266.8  26–29 (user 10-24, 2nd look: the one picture held 17 s with a slow push was too long; from "My
   absence" start close on the two faces and draw back to the framing of the run, new pictures before that).
   G1a 249.7–255.4 "But now I know that / Sacrifice is the easy path": the footprints of W1, from above. The small red
   pair and the big ink pair stand side by side; the big ones turn and walk away, a step to every beat, straight and
   even, out of the frame: leaving is the easy path. The small ones take one step after them and stop.
   G1b 255.4–266.8 "My absence cannot ever change the fact / I wanted the very best for you": the reunion (figure 3),
   close on the two faces, drawn back in one move to the framing tools/reunion_sheath.py's run starts from
   (seq/reunionHug 187..528, rendered by that script). */
const G1_PULL = 255.4;
const G1_STEPS: Step[] = (() => {
  const st: Step[] = [
    {t: 0, x: 700, y: 626, a: -4, side: -1, len: 70, color: C.red}, {t: 0, x: 706, y: 660, a: 5, side: 1, len: 70, color: C.red},
    {t: 0, x: 690, y: 470, a: -3, side: -1, len: 124, color: C.ink2}, {t: 0, x: 700, y: 530, a: 3, side: 1, len: 124, color: C.ink2},
  ];
  const ang = (-24 * Math.PI) / 180, beat = 0.909;
  for (let k = 1; k <= 7; k++) {
    const side = k % 2 ? -1 : 1, off = side * 30;
    st.push({t: 250.3 + (k - 1) * beat, x: 700 + Math.cos(ang) * 214 * k - Math.sin(ang) * off, y: 500 + Math.sin(ang) * 214 * k + Math.cos(ang) * off, a: -24 + side * 3, side, len: 124, color: C.ink2});
  }
  st.push({t: 254.5, x: 790, y: 612, a: -18, side: -1, len: 70, color: C.red});   // one step after them, and no more
  return st;
})();
const G1a: React.FC = () => {
  const {abs} = useShot();
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: `scale(${lerp(1.0, 1.04, prog(abs, 249.2, G1_PULL, (x) => x))})`, transformOrigin: '760px 600px'}}>
        <Svg><Prints t={abs} steps={G1_STEPS.map((s) => (s.t === 0 ? {...s, t: 240} : s))} /></Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const G1: React.FC = () => {
  const {abs} = useShot();
  if (abs < G1_PULL) return <G1a />;
  return <AbsoluteFill style={{background: C.paper}}><Seq name="reunionHug" frames={528} keys={[[G1_PULL, 187], [249.2 + 527 / 30, 528]]} /></AbsoluteFill>;
};

/* G2–G4 266.8–280.4 are one rendered run (tools/reunion_sheath.py): Araya comes away as points of light from her
   hair ends, night falls and the light turns with the stars round Ryoshu; at "forgive me" it comes down and builds
   the white sheath round her blade from both ends (the sword strips kept from v3, user OK) */
const RUN_FRAMES = 408;
const ReunionRun: React.FC = () => <Seq name="reunionSheath" frames={RUN_FRAMES} keys={[[266.8, 1], [266.8 + (RUN_FRAMES - 1) / 30, RUN_FRAMES]]} />;

/* G2 266.8–270  30 our threads in red can never be cut */
const G2: React.FC = () => <AbsoluteFill style={{background: C.ink}}><ReunionRun /></AbsoluteFill>;

/* G3 270–274.8  31 and S is not for sayonara: over the night, 再见; the 见 is cut away, 会 grows in its place: 再会 */
const G3: React.FC = () => {
  const {abs} = useShot();
  const cut = CUE.sayonara2;
  const fall = prog(abs, cut + 0.05, cut + 1.0, (x) => x * x);
  const grow = prog(abs, CUE.saikai2, CUE.saikai2 + 0.8, eout);
  const fs = 190, top = 230, x1 = 1380, x2 = 1600;          // right of Ryoshu, clear of her head
  const out = 1 - smooth(274.1, 274.7, abs);
  const glow = '0 0 18px rgba(14,11,16,0.8)';
  const cell = (ch: string, x: number, style: React.CSSProperties) => (
    <div style={{position: 'absolute', left: x - fs / 2, top, width: fs, textAlign: 'center', fontFamily: F.sc, fontWeight: 500, fontSize: fs, lineHeight: 1, textShadow: glow, ...style}}>{ch}</div>
  );
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <ReunionRun />
      <AbsoluteFill style={{opacity: out}}>
        {cell('再', x1, {color: C.paper, opacity: smooth(270.1, 270.6, abs)})}
        {abs < cut + 1.1 && cell('见', x2, {color: abs < cut ? C.paper : C.grey, opacity: smooth(270.3, 270.8, abs) * (1 - fall), transform: `translate(${fall * 40}px, ${fall * 380}px) rotate(${fall * 14}deg)`})}
        {cell('会', x2, {color: C.paper, opacity: grow, transform: `translateY(${(1 - grow) * 30}px)`})}
        <div style={{position: 'absolute', left: x1 - fs / 2, width: x2 - x1 + fs, top: top + fs + 40, textAlign: 'center', fontFamily: F.en, fontSize: 30, letterSpacing: '0.7em', marginRight: '-0.7em', color: C.paper2, opacity: smooth(CUE.saikai2 + 0.5, CUE.saikai2 + 1.3, abs)}}>SAIKAI</div>
        <Svg>{abs > cut - 0.04 && abs < cut + 0.5 && <path d={`M${x1 + 60} ${top + fs * 0.62} L${W + 60} ${top + fs * 0.42}`} stroke={C.redLine} strokeWidth={lerp(6, 0.5, prog(abs, cut, cut + 0.5))} />}</Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* G4 274.8–280.4  32 will you forgive me at last: the three phrases light up on the sheath, along its middle,
   one on each of "forgive", "me", "at last". The sheath's centre line (box space, 1560x152) is measured from
   sheathed_h.png into data/sheath_line.json as [u, centre v, height]. */
const PHRASES: [string, number][] = [['三生缘分', CUE.forgive], ['三千世界', CUE.me], ['三世因果', CUE.atLast]];
const LINE = sheathLine as [number, number, number][];
const lineAt = (u: number) => {
  let i = 0;
  while (i < LINE.length - 2 && LINE[i + 1][0] < u) i++;
  const [u0, v0] = LINE[i], [u1, v1] = LINE[i + 1];
  const k = clamp((u - u0) / (u1 - u0));
  return {v: lerp(v0, v1, k), ang: (Math.atan2(v1 - v0, u1 - u0) * 180) / Math.PI};
};
const PITCH = 52, GAP = 70, U0 = 345, FS = 40;
const SW = 1560, SH = 152;                     // the sheath's box
/** the three phrases along the sheath, in box space; o fades them all */
const Phrases: React.FC<{o?: number}> = ({o = 1}) => {
  const {abs} = useShot();
  return (
    <>
      {PHRASES.map(([t, at], k) => {
        const on = smooth(at - 0.05, at + 0.35, abs) * o;
        return [...t].map((ch, i) => {
          const u = U0 + k * (4 * PITCH + GAP) + i * PITCH + PITCH / 2;
          const {v, ang} = lineAt(u);
          return (
            <div key={t + i} style={{position: 'absolute', left: u - 30, top: v - 30, width: 60, height: 60, lineHeight: '60px', textAlign: 'center', transform: `rotate(${ang}deg)`, fontFamily: F.sc, fontWeight: 500, fontSize: FS, color: '#c9c5ff', opacity: on, textShadow: `0 0 ${lerp(30, 12, clamp((abs - at) / 0.8))}px ${C.violet}, 0 0 4px ${C.violet}`}}>{ch}</div>
          );
        });
      })}
    </>
  );
};
const G4: React.FC = () => {
  const {abs} = useShot();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <ReunionRun />
      <div style={{position: 'absolute', left: (W - SW) / 2, top: 400, width: SW, height: SH, transform: `rotate(-4deg) scale(${lerp(1.0, 1.04, prog(abs, 274.5, 280.4))})`}}>
        <Phrases />
      </div>
      <Flash at={CUE.sheathed} dur={0.7} color={C.paper} peak={0.5} />
    </AbsoluteFill>
  );
};

/* The outro (280.4–323.95), as agreed 10-24 (order changed on the 2nd look): the white sheath, its words lit, the red
   thread tied round it, drawn back into the turning sky; the book closes; the sky again under the credits; I.L.Y.T. The sky is tools/starsky.py 'outro', whose
   pole sits behind the sheath, so the sheath is the still point everything turns round. data/outro_pole.json is
   where the pole is on screen each frame, and how far the view has widened (focal / focal at the start). */
const POLE = outroPole as [number, number, number][];
const SKY_N = POLE.length;
const SkyOutro: React.FC = () => <Seq name="skyOutro" frames={SKY_N} keys={[[280.0, 1], [280.0 + (SKY_N - 1) / 30, SKY_N]]} />;
const poleAt = (t: number) => POLE[Math.max(0, Math.min(SKY_N - 1, Math.round((t - 280.0) * 30)))];
const BACK0 = 284.6, BACK1 = 299.6;            // the draw-back (as the sky's camera)
const KU = 792, KNOT_V = 80;                   // where the thread leaves the sheath (box space, the bare middle)
const WRAPS = [742, 758, 774];
/** the sheath, on the pole, with the thread tied round it and running down out of the frame */
const TiedSheath: React.FC<{phrases?: number}> = ({phrases = 0}) => {
  const {abs} = useShot();
  const k = abs < 305 ? smooth(BACK0, BACK1, abs) : 1;
  const [px, py, fr] = poleAt(abs);
  const cx = px, cy = py + (476 - 473.14) * (1 - k);
  const sc = 1.04 * fr * lerp(1, 0.62, k);       // the view widens, and the sheath goes further off into the sky
  const a = (-4 * Math.PI) / 180;
  const toScreen = (u: number, v: number) => [cx + sc * ((u - SW / 2) * Math.cos(a) - (v - SH / 2) * Math.sin(a)), cy + sc * ((u - SW / 2) * Math.sin(a) + (v - SH / 2) * Math.cos(a))];
  const [kx, ky] = toScreen(KU, KNOT_V);
  const bx = kx + 70 + 22 * Math.sin(abs * 0.6), by = H + 90;
  const L = by - ky;
  const tail = `M${bx} ${by} C${bx + 40 * Math.sin(abs * 0.45 + 1)} ${ky + L * 0.72} ${kx - 26} ${ky + L * 0.36} ${kx} ${ky}`;
  const rise = prog(abs, 281.8, 283.6);          // the thread comes up from below ...
  const wrap = (i: number) => prog(abs, 283.5 + i * 0.36, 283.9 + i * 0.36);   // ... goes round three times ...
  const bow = prog(abs, 284.6, 285.2);           // ... and is tied off
  const lw = lerp(3.0, 1.8, k);
  const box: React.CSSProperties = {position: 'absolute', left: cx - SW / 2, top: cy - SH / 2, width: SW, height: SH, transform: `rotate(-4deg) scale(${sc})`, transformOrigin: '50% 50%'};
  return (
    <>
      {/* a soft light round it once it is far off, so it reads as one of the stars */}
      <div style={{position: 'absolute', left: cx - 420, top: cy - 260, width: 840, height: 520, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(236,228,212,0.16), rgba(236,228,212,0))', opacity: k}} />
      <div style={box}>
        <Img src={staticFile('img/sheathed_h.png')} style={{width: '100%', height: '100%'}} />
        {phrases > 0 && <Phrases o={phrases} />}
        <svg viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {WRAPS.map((u, i) => {
            const {v} = lineAt(u);
            return <Path key={i} d={`M${u - 8} ${v - 38} Q${u + 6} ${v} ${u + 8} ${v + 38}`} color={C.redLine} width={3.4} draw={wrap(i)} />;
          })}
          <Path d={`M${KU} ${KNOT_V} c-16 -2 -26 8 -18 14 c7 5 16 -6 18 -14 c4 8 16 17 22 10 c6 -7 -8 -12 -22 -10 M${KU} ${KNOT_V} l-10 16 M${KU} ${KNOT_V} l7 18`} color={C.redLine} width={3} draw={bow} />
        </svg>
      </div>
      <Svg><Path d={tail} color={C.redLine} width={lw} draw={rise} glow /></Svg>
    </>
  );
};

/* O1 280.4–301.0  one take on from G4: the sky comes up round the sheath; the thread rises from below and ties round
   its middle; we draw back and the arcs grow round it. The three phrases stay lit on the sheath while it is tied and
   after (user 10-24, 2nd look). */
const O1: React.FC = () => {
  const {abs} = useShot();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <SkyOutro />
      <AbsoluteFill style={{background: C.ink, opacity: 1 - smooth(280.6, 283.2, abs)}} />
      <TiedSheath phrases={1} />
    </AbsoluteFill>
  );
};

/* O2 301.0–308.7  Rien's picture book, open at its blank last page, closes (I.L.Y.T. has gone to the very end,
   user 10-24 2nd look) */
const O2: React.FC = () => {
  const {abs} = useShot();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `scale(${lerp(0.9, 0.95, prog(abs, 300.3, 308.7))})`}}>
        <Seq name="bookClose" frames={90} keys={[[CUE.bookClose, 1], [307.8, 90]]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* O3 308.7–318.6  on the last hit: the sky again, a little further off; the sheath at the pole, its words still lit,
   its thread running down; "Thanks for coming to find me!" in the middle; credits; then it all sinks to black */
const O3: React.FC = () => {
  const {abs} = useShot();
  const credits = ['Music  —  Mili「SAIKAI」', 'Characters & Story  —  Project Moon『Limbus Company』Canto IX', 'A non-commercial fan work'];
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <SkyOutro />
      <TiedSheath phrases={1} />
      {/* what she means to say to her mother when she finds her, alone in the middle, under the sheath (user 10-25) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', opacity: smooth(THANKS.from, THANKS.from + 1.4, abs) * (1 - smooth(THANKS.to - 1.2, THANKS.to, abs))}}>
        <div style={{fontFamily: F.sc, fontWeight: 500, fontSize: 52, letterSpacing: '0.24em', marginRight: '-0.24em', color: C.paper, textShadow: '0 0 18px rgba(8,6,10,0.95), 0 0 6px rgba(8,6,10,0.9)'}}>{THANKS.zh}</div>
        <div style={{fontFamily: F.en, fontStyle: 'italic', fontSize: 30, marginTop: 14, color: C.paper2, textShadow: '0 0 12px rgba(8,6,10,0.95)'}}>{THANKS.en}</div>
      </div>
      <div style={{position: 'absolute', right: 140, top: 150, textAlign: 'right', color: C.paper, opacity: smooth(CUE.credits, CUE.credits + 1.6, abs) * (1 - smooth(316.8, 318.2, abs))}}>
        {credits.map((c, i) => <div key={i} style={{fontFamily: F.en, fontSize: i === 2 ? 20 : 24, letterSpacing: 2, marginTop: i ? 16 : 0, fontStyle: i === 2 ? 'italic' : 'normal', opacity: i === 2 ? 0.7 : 0.92}}>{c}</div>)}
      </div>
      {/* the sky sinks to black with the credits, ready for I.L.Y.T. (user 10-26) */}
      <AbsoluteFill style={{background: C.ink, opacity: smooth(316.6, 318.6, abs)}} />
    </AbsoluteFill>
  );
};

/* O4 318.6–323.95  the very end (user 10-24, 2nd look): I.L.Y.T., still, as the last of the music dies away. No cut
   to it (user 10-26): the sky has sunk to black at the end of O3, and after a beat the letters come up out of the
   black */
const O4: React.FC = () => {
  const {abs, from} = useShot();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', opacity: smooth(from + 0.4, from + 2.2, abs)}}>
        <div style={{fontFamily: F.en, fontSize: 168, letterSpacing: '0.18em', marginRight: '-0.18em', color: C.paper}}>
          I<span style={{color: C.redLine}}>.</span>L<span style={{color: C.redLine}}>.</span>Y<span style={{color: C.redLine}}>.</span>T<span style={{color: C.redLine}}>.</span>
        </div>
      </div>
      <Wash a={CUE.fadeOut} b={323.9} color="#000" />
    </AbsoluteFill>
  );
};

export const PartD: React.FC = () => (
  <>
    <Shot id="R1"><R1 /></Shot>
    <Shot id="R2"><R2 /></Shot>
    <Shot id="R3"><R3 /></Shot>
    <Shot id="G1" still><G1 /></Shot>
    <Shot id="G2" still><G2 /></Shot>
    <Shot id="G3" still><G3 /></Shot>
    <Shot id="G4" still><G4 /></Shot>
    <Shot id="O1" still><O1 /></Shot>
    <Shot id="O2"><O2 /></Shot>
    <Shot id="O3" still><O3 /></Shot>
    <Shot id="O4" still><O4 /></Shot>
  </>
);

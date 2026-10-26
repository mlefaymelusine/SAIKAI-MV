// Verse 2 and the bridge (2:23 – 3:43): the randoseru, the city, dragon's beard, the safe shut, the cup, one thread, the first draw.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {FPS, H, W, clamp, eio, lerp, prog, smooth} from '../util';
import {CUE} from '../cues';
import {Flash, Seq, Shot, SubBand, Svg, Wash, useShot} from '../comp/core';
import {FLORETS, Hydrangea} from '../comp/objects';
import {JAR, Jar, LooseFloret, Rain, Stand} from '../comp/belljar';
import {Ashtray, NightTable, Smoke, TABLE_NIGHT, TRAY, emberAt} from '../comp/ashtray';
import {GlassClose} from '../comp/glasscup';
import {WallClock, clockGap} from '../comp/clock';
import {Prints, kidX, tracks} from '../comp/footprints';
import {FatherRow, slashY} from '../comp/fathers';
import {B1Scene} from '../comp/b1sil';
import {B1_SIL} from '../timeline';
import {A0, B0, Cocoon, Fold, SugarDefs, SugarLoop} from '../comp/candy';

/* W1 143–149.4  14 I knew I must step up (new, 10-24): footprints across the paper, from above. Small red ones
   toddle along; big ink ones come in behind at a stride, reach her side on "step" and from there keep her pace;
   then we draw back to see both tracks (comp/footprints.tsx) */
const W1_STEPS = tracks(CUE.stepUp);
const W1: React.FC = () => {
  const {abs} = useShot();
  const back = prog(abs, 146.6, 149.4, eio);
  const cam = lerp(kidX(abs) - 900, 430 - 960, back);           // follow her, then swing back over both tracks
  const z = lerp(1, 0.72, back);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '960px 540px'}}>
        <Svg><g transform={`translate(${-cam} 0)`}><Prints t={abs} steps={W1_STEPS} /></g></Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* W2 149.4–156.7  15 you deserve the world and more: the city from the roof, then the camera tilts up off it into
   the turning sky (Blender roofT with a clear sky, composited over tools/starsky.py through the same camera) */
const SKY_W2 = 246;
const W2: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Seq name="skyW2" frames={SKY_W2} keys={[[149.0, 1], [149.0 + (SKY_W2 - 1) / 30, SKY_W2]]} />
    <SubBand />
  </AbsoluteFill>
);

/* W3 156.7–171.4  16–17 the truth is that you'd rather spend our limited time together: dragon's beard candy, made
   the way it is made (comp/candy.tsx). The red thread closes into a loop; on "rather", "spend", "limited" it is
   stretched, twisted into an 8 and folded, 1 -> 2 -> 4 -> 16, then faster to tens of thousands of white strands
   (one stays red). On "together" it is cut into candies: Mom's eight, mine five (Araya: 妈妈就是比我多吃了三个). */
const FOLDS: Fold[] = [
  {at: CUE.rather, dur: 1.5}, {at: CUE.spend, dur: 1.4}, {at: CUE.limited, dur: 0.8}, {at: CUE.limited + 0.8, dur: 0.7},
  {at: CUE.limited + 1.5, dur: 0.5}, {at: CUE.limited + 2.0, dur: 0.42},
];
const W3Candy: React.FC = () => {
  const {abs} = useShot();
  const cut = CUE.together;
  const slash = prog(abs, cut - 0.05, cut + 0.12, eio), slashOut = 1 - smooth(cut + 0.12, cut + 0.5, abs);
  const breath = Math.sin(abs * 1.3);
  const scale = lerp(0.92, 1.06, prog(abs, 157.0, cut, (x) => x));
  const slot = (row: number, i: number): [number, number] => [960 + (i - 3.5) * 124, row === 0 ? 420 : 610];
  const pieces = Array.from({length: 13}, (_, k) => ({k, row: k < 8 ? 0 : 1, i: k < 8 ? k : k - 8}));
  const flyK = (k: number) => prog(abs, cut + 0.15 + k * 0.05, cut + 1.05 + k * 0.05, eio);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(60,52,70,0.55), rgba(14,11,16,0) 62%)'}} />
      <Svg>
        <SugarDefs />
        {abs < cut + 0.6 && (
          <g transform={`translate(960 470) rotate(${breath * 2}) scale(${scale})`}>
            <SugarLoop t={abs} folds={FOLDS} draw={prog(abs, 157.0, 158.6, eio)} wob={abs * 0.8} fade={1 - smooth(cut + 0.1, cut + 0.5, abs)} />
          </g>
        )}
        {/* the cut, across the whole loop */}
        {slash > 0 && slashOut > 0 && <path d={`M${lerp(560, 1380, 0)} 700 L${lerp(560, 1380, slash)} ${lerp(700, 250, slash)}`} stroke={C.paper} strokeWidth={3} opacity={slashOut} />}
        {/* the pieces fly to their places and close into candies */}
        {pieces.map(({k, row, i}) => {
          const f = flyK(k);
          if (f <= 0) return null;
          const a = (k / 13) * Math.PI * 2 - Math.PI / 2;
          const [sx, sy] = [960 + Math.cos(a) * A0 * scale, 470 + Math.sin(a) * B0 * scale];
          const [tx, ty] = slot(row, i);
          const x = lerp(sx, tx, f), y = lerp(sy, ty, f) - Math.sin(f * Math.PI) * 60;
          return (
            <g key={k} transform={`translate(${x} ${y}) rotate(${lerp((a * 180) / Math.PI + 90, 0, f)}) scale(${lerp(0.5, 1.15, f)})`}>
              <path d="M-50 0 Q0 -10 50 0" stroke="#f3eee3" strokeWidth={6} fill="none" opacity={1 - smooth(0.5, 0.9, f)} />
              <g opacity={smooth(0.45, 0.95, f)}><Cocoon mark={row === 0 && i >= 5} seed={k} /></g>
            </g>
          );
        })}
        {/* who ate what */}
        <g opacity={smooth(cut + 1.3, cut + 2.0, abs)} fontFamily={F.brush} fill={C.paper2} fontSize={34}>
          <text x={960 - 3.5 * 124 - 96} y={432} textAnchor="end">ママ</text>
          <text x={960 - 3.5 * 124 - 96} y={622} textAnchor="end">わたし</text>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/* W3 (user 10-24, 3rd look: the candy is unclear under this line, and too fast; kept above as W3Candy). The truth is
   that you'd rather spend our limited time together: a cut-paper wall clock (comp/clock.tsx). The hour hand is her
   sword in its white sheath and hardly moves; the minute hand is the red thread, tied round the pin with it. It comes
   slowly round from seven o'clock, slower as it arrives; on "together" it lies along the sheath for a moment, a little
   warm light, then goes on its way. */
const W3_CLOCK = true;
const W3: React.FC = () => {
  const {abs} = useShot();
  if (!W3_CLOCK) return <W3Candy />;
  const hour = lerp(-14, 4, prog(abs, 156.7, 171.4, (x) => x));
  const minute = hour + clockGap(abs, 156.7, CUE.together, CUE.together + 1.25);
  const meet = smooth(CUE.together - 0.5, CUE.together + 0.2, abs) * (1 - smooth(CUE.together + 1.3, CUE.together + 2.6, abs));
  const z = lerp(1.0, 1.08, prog(abs, 156.7, 171.4, (x) => x));   // the clock clear of the lyrics
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(60,52,70,0.55), rgba(14,11,16,0) 62%)'}} />
      <Svg>
        <g transform={`translate(960 468) scale(${z})`}><WallClock t={abs} hour={hour} minute={minute} from={-14 + clockGap(156.7, 156.7, CUE.together, CUE.together + 1.25)} last={0} meet={meet} /></g>
      </Svg>
    </AbsoluteFill>
  );
};

/* W4 171.4–178  18 protection alone is not enough (new, 10-24): the white hydrangea under a glass bell jar, at
   night, in the rain. The rain runs off the glass and never reaches it; under the glass it goes dull and nods, and
   on "enough" a floret comes off and falls. A wide, then close on the flower through the glass (comp/belljar.tsx) */
const W4_CUT = 174.7, W4_S = 1.0;
const W4_FALL = FLORETS.reduce((best, f, i) => (f.y + 0.4 * Math.abs(f.x) > FLORETS[best].y + 0.4 * Math.abs(FLORETS[best].x) ? i : best), 0);
const W4: React.FC = () => {
  const {abs} = useShot();
  const wilt = 0.9 * prog(abs, 171.6, 177.8, eio);
  const hx = JAR.cx, hy = JAR.base - 330 * W4_S;
  const fall = prog(abs, CUE.enough, CUE.enough + 1.05, (x) => x * x);
  const open = fall > 0 ? FLORETS.map((_, i) => (i === W4_FALL ? 0 : 1)) : undefined;
  // where the floret was on the nodding head (Hydrangea: rotate(wilt*16, 0 150) after translate(0, wilt*24))
  const f = FLORETS[W4_FALL], th = (wilt * 16 * Math.PI) / 180, py = f.y + wilt * 24 - 150;
  const fx = f.x * Math.cos(th) - py * Math.sin(th), fy = 150 + f.x * Math.sin(th) + py * Math.cos(th);
  const lx = hx + lerp(fx, fx + 40, fall) * W4_S, ly = hy + lerp(fy, 322, fall) * W4_S;
  const close = abs >= W4_CUT;
  const z = close ? lerp(1.55, 1.63, prog(abs, W4_CUT, 178, (x) => x)) : lerp(1, 1.05, prog(abs, 171.4, W4_CUT, eio));
  const origin = close ? `${hx + 30}px ${hy + 60}px` : '960px 520px';
  return (
    <AbsoluteFill style={{background: `linear-gradient(${C.ink2}, ${C.ink} 70%)`}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: origin}}>
        <Svg>
          <Stand />
          <g transform={`translate(${hx} ${hy}) scale(${W4_S})`}><Hydrangea grow={1} wilt={wilt} open={open} /></g>
          {fall > 0 && <g transform={`translate(${lx} ${ly}) rotate(${f.a + fall * 140}) scale(${W4_S * 0.82})`} filter="url(#papercut)"><LooseFloret r={f.r} color="#c4b89e" /></g>}
          <Jar />
          <Rain t={abs} />
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* W5 178–189.8  19 providing cannot fill an empty cup thirsting for love. User 10-24 (2nd look): close and frontal, as
   in her reference: a glass on the table in front of Araya, two thirds of her face seen through it, magnified under the
   water. 22:01: in one perspective; her head tilted, resting on her left forearm; faceless; one indigo streak in her
   hair (gpt-image, gen/r4; comp/glasscup.tsx). The tap drips every other beat, each drop landing on a beat. 10-25:
   the glass is cracked from the start, a thin layer standing in the bottom below the crack; every drop rings out over
   it (3rd look: without lifting it) and as much runs out through the crack onto the table, and the pool there grows
   while the glass never fills. */
const W5_LAND = Array.from({length: 7}, (_, i) => 178.17 + i * 1.818);
const W5_FALL = 0.62;                                          // comp/glasscup.tsx: a drop's fall
const W5: React.FC = () => {
  const {abs} = useShot();
  // 10-25: higher in the frame, so the table where the water runs out is clear of the subtitles; the tap's spout pinned
  // near the top, the picture's foot (y 1180) on the bottom edge, a slow push in
  const z = lerp(1.19, 1.21, prog(abs, 178, 189.8, (x) => x)), ty = 784 - 882 * z + 4;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: `translate(0px, ${ty}px) scale(${z})`, transformOrigin: '1160px 296px'}}>
        <Svg>
          <GlassClose t={abs} drops={W5_LAND.map((l) => l - W5_FALL)} />
        </Svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* W6 189.8–198.6  20 I questioned myself a lot— (new, 10-24): the same table late at night, from above. Ryoshu is
   only there as her cigarettes. User 10-24 (2nd look): slower. One cigarette burns slowly in the rest the whole
   time and the smoke drifts off like a grey thread, while the ashtray fills by itself, one end after another
   settling in (no drop, no lighting each one); on "a lot" we are wide on the table, the cracked cup empty, the
   moonlight gone across; the long ash falls on the dash (comp/ashtray.tsx) */
const W6_BUTTS = [...Array.from({length: 5}, (_, i) => 180 + i), ...Array.from({length: 12}, (_, i) => 190.0 + i * 0.72)];
const W6_ASHFALL = 197.05;
const W6: React.FC = () => {
  const {abs} = useShot();
  const burn = lerp(0.1, 0.86, prog(abs, 189.0, 199.4, (x) => x));
  const fallBurn = lerp(0.1, 0.86, prog(W6_ASHFALL, 189.0, 199.4, (x) => x));
  const ash = abs >= W6_ASHFALL ? 150 * 0.8 * (burn - fallBurn) : 150 * 0.8 * burn - 6;
  // 10-25 (after the full film): no jump back on "a lot" any more; one slow, even draw-back from the ashtray to the
  // whole table, scale and centre eased together, so it is wide by "a lot"
  const k = prog(abs, 190.2, 196.6, eio);
  const z = lerp(1.56, 1.18, k) + 0.02 * prog(abs, 196.6, 198.6, (x) => x);
  const origin = `${lerp(TRAY.x, 1000, k)}px ${lerp(TRAY.y, 470, k)}px`;
  const fall = prog(abs, W6_ASHFALL, W6_ASHFALL + 0.6, (x) => x * x);
  const tip = emberAt(burn);
  return (
    <AbsoluteFill style={{background: TABLE_NIGHT}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: origin}}>
        <Svg>
          <NightTable slide={prog(abs, 189.8, 198.6, (x) => x)} />
          <Ashtray t={abs} drops={W6_BUTTS} burn={burn} ash={Math.max(0, ash)} litOn={1} settle={0.7} />
          {fall > 0 && fall < 1 && Array.from({length: 7}, (_, i) => <circle key={i} cx={tip[0] - 10 - i * 7 + Math.sin(i * 3) * 6} cy={tip[1] + 6 + fall * (20 + i * 5)} r={3.5 - i * 0.3} fill="#aaa59e" opacity={1 - fall} />)}
          <Smoke t={abs} from={tip} on={1} />
        </Svg>
      </AbsoluteFill>
      <Wash a={197.6} b={199.0} color={C.ink} />
    </AbsoluteFill>
  );
};

/* B1 198.6–223  bridge, the past: she cuts her way out of the House of Spiders. The first draw of the film.
   The names and the faint words are cut and fall away; four things fall and go grey; Rien's thread does not cut,
   the blade only takes a corner off the book, which still hangs (comp/fathers.tsx). */
const B1: React.FC = () => {
  const {abs} = useShot();
  const cut = CUE.firstDraw;
  const tension = prog(abs, 198.6, cut, (x) => x * x);
  const push = lerp(1, 1.06, tension) * lerp(1, 1.5, prog(abs, 207, 223, eio));
  const streak = abs > cut - 0.04 && abs < cut + 0.45;
  // the second design (user 10-26): from the slash on, the silhouettes, as if it were that cut that left him there
  const sil = B1_SIL && abs >= cut + 0.06;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {!sil && (
        <AbsoluteFill style={{transform: `scale(${B1_SIL ? lerp(1, 1.06, tension) : push})`, transformOrigin: '630px 560px'}}>
          <Svg>
            <FatherRow t={abs} appear={196.6} spacing={0.6} cutAt={cut} floor={930} />
            {streak && <path d={`M-100 ${slashY(-100)} L${W + 100} ${slashY(W + 100)}`} stroke={C.white} strokeWidth={lerp(16, 0, prog(abs, cut, cut + 0.45))} />}
          </Svg>
        </AbsoluteFill>
      )}
      {sil && <B1Silhouettes abs={abs} cut={cut} />}
      <Flash at={cut} dur={0.45} color={C.paper} peak={0.4} />
      <Wash a={221.8} b={223.4} color={C.paper} />
    </AbsoluteFill>
  );
};
/** the past (Rien slumped, the young Ryoshu facing him, the blade down) until a blink at BLINK; on the same spot the
 *  Ryoshu of now, her back to him; at the end it all blurs and goes to paper, into the book opening in R1 */
const BLINK = 207.8;   // (03:15) the past holds his first line, read through, before the eyes shut
const B1Silhouettes: React.FC<{abs: number; cut: number}> = ({abs, cut}) => {
  const now = abs >= BLINK;
  const z = now ? lerp(1.02, 1.08, prog(abs, BLINK, 222.6, (x) => x)) : lerp(1.0, 1.05, prog(abs, cut, BLINK, (x) => x));
  const blur = 14 * smooth(220.6, 222.8, abs);
  const shown = smooth(cut + 0.1, cut + 1.3, abs);
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '1000px 640px', filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined, opacity: shown}}>
      <Svg><B1Scene now={now} t={abs} /></Svg>
    </AbsoluteFill>
  );
};
/** the eyes shutting and opening at BLINK (02:44: more slowly), over everything, the banner hanging there included
 *  (03:19: the eyelids are the top layer); set over the whole film in Video.tsx */
export const B1Eyelids: React.FC = () => {
  const abs = useCurrentFrame() / FPS;
  const lid = B1_SIL ? smooth(BLINK - 0.85, BLINK - 0.12, abs) * (1 - smooth(BLINK + 0.18, BLINK + 1.1, abs)) : 0;
  if (lid <= 0.001) return null;
  const lidPath = (top: boolean) => {
    const e = 560 * lid, y = top ? e : H - e, bulge = (top ? 1 : -1) * 90 * lid;
    return top ? `M-20 -20 L${W + 20} -20 L${W + 20} ${y} Q${W / 2} ${y + bulge} -20 ${y} Z` : `M-20 ${H + 20} L${W + 20} ${H + 20} L${W + 20} ${y} Q${W / 2} ${y + bulge} -20 ${y} Z`;
  };
  return <Svg><path d={lidPath(true)} fill={C.ink} /><path d={lidPath(false)} fill={C.ink} /></Svg>;
};



export const PartC: React.FC = () => (
  <>
    <Shot id="W1"><W1 /></Shot>
    <Shot id="W2" still><W2 /></Shot>
    <Shot id="W3" still><W3 /></Shot>
    <Shot id="W4"><W4 /></Shot>
    <Shot id="W5"><W5 /></Shot>
    <Shot id="W6"><W6 /></Shot>
    <Shot id="B1"><B1 /></Shot>
  </>
);

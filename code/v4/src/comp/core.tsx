import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {FPS, H, W, clamp, eio, lerp, rng, s as secToFrame, smooth} from '../util';
import {SHOTS, shotById} from '../timeline';

/* ---------- shot timing ---------- */
type ShotCtx = {start: number; from: number; to: number};
const Ctx = createContext<ShotCtx>({start: 0, from: 0, to: 1});
/** abs = song time in seconds; p = progress through the nominal shot [from, to] */
export const useShot = () => {
  const f = useCurrentFrame();
  const c = useContext(Ctx);
  const abs = c.start + f / FPS;
  return {f, abs, p: clamp((abs - c.from) / (c.to - c.from)), from: c.from, to: c.to};
};

/** Renders a shot from the timeline: starts x/2 early and fades in over x on top of the previous shot,
 *  and stays fully visible until the next shot has faded in over it. */
export const Shot: React.FC<{id: string; children: React.ReactNode; dip?: string; still?: boolean}> = ({id, children, dip, still}) => {
  const d = shotById(id);
  const idx = SHOTS.indexOf(d);
  const next = SHOTS[idx + 1];
  const start = d.from - d.x / 2;
  const end = next ? next.from + next.x / 2 : d.to;
  const sf = secToFrame(start);
  return (
    <Sequence from={sf} durationInFrames={secToFrame(end) - sf} name={id}>
      <Ctx.Provider value={{start: sf / FPS, from: d.from, to: d.to}}>
        <FadeIn x={d.x} start={start} dip={dip} still={still}>{children}</FadeIn>
      </Ctx.Provider>
    </Sequence>
  );
};
const FadeIn: React.FC<{x: number; start: number; dip?: string; still?: boolean; children: React.ReactNode}> = ({x, start, dip, still, children}) => {
  const {abs, from, to} = useShot();
  const o = x > 0 ? smooth(start, start + x, abs) : 1;
  // a barely perceptible drift so that no shot is ever completely still (not where the camera move is baked in)
  const drift = still ? 1 : 1 + 0.022 * clamp((abs - start) / Math.max(1, to - start + 1));
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${drift})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- images ---------- */
export type Fit = 'cover' | 'contain';
/** an image from public/<dir>/ (img4 = v4 cut-outs, img = the sheath strips) */
export const Pic: React.FC<{src: string; dir?: string; x?: number; y?: number; w?: number; h?: number; fit?: Fit; z?: number; tx?: number; ty?: number; rot?: number; flip?: boolean; opacity?: number; style?: React.CSSProperties; imgStyle?: React.CSSProperties; origin?: string}> = ({src, dir = 'img4', x = 0, y = 0, w = W, h = H, fit = 'contain', z = 1, tx = 0, ty = 0, rot = 0, flip = false, opacity = 1, style, imgStyle, origin}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity, transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${z})`, transformOrigin: origin ?? '50% 50%', ...style}}>
    <Img src={staticFile(dir + '/' + src)} style={{width: '100%', height: '100%', objectFit: fit, transform: flip ? 'scaleX(-1)' : undefined, ...imgStyle}} />
  </div>
);

/** jpg sequence (Blender or composited), frame chosen by song time through keypoints [[t, frame], ...] */
export const Seq: React.FC<{name: string; frames: number; keys: [number, number][]; z?: number; origin?: string; style?: React.CSSProperties; ext?: string}> = ({name, frames, keys, z = 1, origin = '50% 50%', style, ext = 'jpg'}) => {
  const {abs} = useShot();
  let n = keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, f0] = keys[i], [t1, f1] = keys[i + 1];
    if (abs >= t0) n = abs >= t1 ? f1 : lerp(f0, f1, (abs - t0) / (t1 - t0));
  }
  n = Math.max(1, Math.min(frames, Math.round(n)));
  return <Img src={staticFile(`seq/${name}/${String(n).padStart(4, '0')}.${ext}`)} style={{position: 'absolute', width: W, height: H, objectFit: 'cover', transform: `scale(${z})`, transformOrigin: origin, ...style}} />;
};

/* ---------- svg helpers ---------- */
export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    <Defs />
    {children}
  </svg>
);
export const Defs: React.FC = () => (
  <defs>
    <filter id="papercut" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d" />
      <feDropShadow in="d" dx="3" dy="6" stdDeviation="5" floodColor="#2a1c10" floodOpacity="0.28" />
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);
/** stroked path with draw-on progress (0..1) */
export const Path: React.FC<{d: string; color?: string; width?: number; draw?: number; opacity?: number; glow?: boolean; cap?: 'round' | 'butt'; filter?: string}> = ({d, color = C.red, width = 2.5, draw = 1, opacity = 1, glow = false, cap = 'round', filter}) => (
  <g filter={filter}>
    {glow && <path d={d} stroke={color} strokeWidth={width * 4} fill="none" opacity={0.16 * opacity} pathLength={1} strokeDasharray={`${draw} 1`} strokeLinecap={cap} />}
    <path d={d} stroke={color} strokeWidth={width} fill="none" opacity={opacity} pathLength={1} strokeDasharray={`${draw} 1.0001`} strokeLinecap={cap} strokeLinejoin="round" />
  </g>
);

/* ---------- drifting silk dust (white motes and short strands) ---------- */
export const Silk: React.FC<{n?: number; seed?: number; color?: string; opacity?: number; speed?: number; len?: number; up?: number}> = ({n = 40, seed = 1, color = C.paper, opacity = 0.4, speed = 1, len = 40, up = 0.25}) => {
  const {abs} = useShot();
  const r = rng(seed);
  const items = Array.from({length: n}, () => ({x: r() * W, y: r() * H, a: r() * Math.PI, v: 8 + r() * 22, l: len * (0.3 + r()), w: 0.5 + r() * 1.0, o: 0.25 + r() * 0.75, ph: r() * 10}));
  const t = abs * speed;
  return (
    <Svg>
      {items.map((it, i) => {
        const x = (((it.x + t * it.v * 0.5 + Math.sin(t * 0.3 + it.ph) * 30) % (W + 200)) + W + 200) % (W + 200) - 100;
        const y = (((it.y - t * it.v * up) % (H + 200)) + H + 200) % (H + 200) - 100;
        const a = it.a + Math.sin(t * 0.4 + it.ph) * 0.5;
        const dx = Math.cos(a) * it.l, dy = Math.sin(a) * it.l;
        return <path key={i} d={`M${x} ${y} Q${x + dx * 0.5 + 6} ${y + dy * 0.5 - 6} ${x + dx} ${y + dy}`} stroke={color} strokeWidth={it.w} fill="none" opacity={opacity * it.o} />;
      })}
    </Svg>
  );
};

/* ---------- flash / dip ---------- */
export const Flash: React.FC<{at: number; dur?: number; color?: string; peak?: number}> = ({at, dur = 0.5, color = C.paper, peak = 1}) => {
  const {abs} = useShot();
  if (abs < at || abs > at + dur) return null;
  const o = peak * (1 - (abs - at) / dur) ** 2;
  return <AbsoluteFill style={{background: color, opacity: o}} />;
};
/** a dark band at the foot of the frame so a subtitle stays readable over busy line art */
export const SubBand: React.FC<{o?: number}> = ({o = 1}) => (
  <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(14,11,16,0) 62%, rgba(14,11,16,0.86) 80%, rgba(14,11,16,0.92) 100%)', opacity: o}} />
);
export const Wash: React.FC<{a: number; b: number; color: string; out?: boolean}> = ({a, b, color, out}) => {
  const {abs} = useShot();
  const k = smooth(a, b, abs);
  const o = out ? 1 - k : k;
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o}} />;
};

export {clamp, lerp, smooth, eio};

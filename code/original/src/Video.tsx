import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Defs, INK, Layer, PAPER, TimeCtx} from './core';
import {S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, Shot} from './scenes1';
import {S12, S13, S14, S15, S16, S17, S18, S19, S20} from './scenes2';
import {S21, S22, S23, S24, S25, S26, S27, S28, S29} from './scenes3';
import lyrics from './data/lyrics.json';
import {FPS, smooth, lerp} from './util';

for (const [family, file, weight, style] of [
  ['MV_sc', 'sc.woff2', '300', 'normal'], ['MV_brush', 'brush.woff2', '400', 'normal'],
  ['MV_en', 'en_i.woff2', '400', 'italic'], ['MV_en', 'en.woff2', '400', 'normal'],
]) loadFont({family, url: staticFile('fonts/' + file), weight, style});

/** shot boundaries (sec): cuts sit in the breaths between sung lines */
const CUTS = [0, 30.0, 34.9, 43.6, 57.9, 71.5, 83.4, 92.0, 100.0, 106.5, 111.0, 124.0, 134.0, 142.7, 149.5, 156.8, 169.5, 177.9, 189.8, 200.6, 222.6, 231.2, 237.8, 249.6, 255.35, 266.8, 274.65, 290.0, 308.0, 324.0];
const SHOTS: Shot[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29];
const XF = 1.8; // dissolve length

/** lines grow fainter through the seasons, recover for the last chorus, fade at the end */
const inkLevel = (g: number) => {
  if (g < 150) return 1;
  if (g < 200) return lerp(1, 0.8, (g - 150) / 50);
  if (g < 248) return lerp(0.8, 0.62, (g - 200) / 48);
  if (g < 256) return lerp(0.62, 1, smooth(248, 256, g));
  if (g < 296) return 1;
  return lerp(1, 0.72, smooth(296, 320, g));
};

const Subtitles: React.FC<{g: number}> = ({g}) => {
  const L = lyrics as {start: number; end: number; en: string; zh: string}[];
  return (
    <>
      {L.map((l, i) => {
        const next = L[i + 1]?.start ?? 999;
        const outEnd = Math.min(l.end + 1.1, next + 0.05);
        const o = smooth(l.start - 0.25, l.start + 0.85, g) * (1 - smooth(outEnd - 1.0, outEnd, g));
        if (o <= 0.003) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, bottom: 52, textAlign: 'center', opacity: o, color: INK}}>
            <div style={{fontFamily: 'MV_sc', fontWeight: 300, fontSize: 29, letterSpacing: 3, opacity: 0.74}}>{l.zh}</div>
            <div style={{fontFamily: 'MV_en', fontStyle: 'italic', fontSize: 23, letterSpacing: 1, opacity: 0.56, marginTop: 4}}>{l.en}</div>
          </div>
        );
      })}
    </>
  );
};

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const g = frame / FPS;
  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <Audio src={staticFile('saikai.wav')} />
      <Img src={staticFile('washi.jpg')} style={{position: 'absolute', width: 2400, height: 1350, left: -240, top: -135, transform: `translate(${Math.sin(g * 0.02) * 60}px, ${Math.cos(g * 0.017) * 40}px)`}} />
      <Defs />
      <TimeCtx.Provider value={{g, ink: inkLevel(g)}}>
        {SHOTS.map((S, i) => {
          const a = CUTS[i], b = CUTS[i + 1];
          const first = i === 0, last = i === SHOTS.length - 1;
          if (g < a - XF / 2 || g > b + XF / 2) return null;
          const o = (first ? 1 : smooth(a - XF / 2, a + XF / 2, g)) * (last ? 1 : 1 - smooth(b - XF / 2, b + XF / 2, g));
          if (o <= 0.002) return null;
          return <Layer key={i} o={o}><S t={g - a} T={b - a} /></Layer>;
        })}
      </TimeCtx.Provider>
      <Subtitles g={g} />
      <AbsoluteFill style={{background: PAPER, opacity: 1 - smooth(0, 1.2, g)}} />
    </AbsoluteFill>
  );
};

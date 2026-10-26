// (Not used since 10-24, 4th look: the screen is modelled in Blender, blender/screen.py; kept for reference.)
// The folding screen of the opening (from v1 S01, which the user liked): six panels showing one picture; as it
// opens they fold back in pairs from the middle and swing out of the frame, and what is behind (children, not
// zoomed with the screen) shows through.
// The picture is comp/hellscreen.ts, drawn whole on each panel and shifted so each shows its own slice.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {H, W, smooth} from '../util';
import {SH, SW, hellScreenSvg} from './hellscreen';

const FRAME = '#b89a5a';
export const FoldingScreen: React.FC<{open: number; t: number; zoom?: number; children?: React.ReactNode}> = ({open, t, zoom = 1, children}) => {
  const n = 6, pw = SW / n, ph = SH;
  const left = (W - SW) / 2, top = (H - ph) / 2 - 20;
  const svg = hellScreenSvg(t);
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill style={{perspective: 1800, transform: `scale(${zoom})`}}>
      {Array.from({length: n}, (_, i) => {
        const side = i < n / 2 ? -1 : 1;
        const j = i < n / 2 ? n / 2 - 1 - i : i - n / 2;   // 0 = innermost
        // user 10-24 (2nd look): slower and even. The panels fold only part way (they no longer go edge-on and vanish)
        // while the two halves slide apart like doors, the whole time, out of the frame
        // `open` is linear in time; each part eases itself. Mirror-symmetric: the inner panels fold back away from us.
        const e = smooth(j * 0.06, 0.8 + j * 0.06, open);
        const rot = (j % 2 === 0 ? -1 : 1) * side * e * 52;
        const slide = smooth(0.15, 1, open);                 // an even, calm glide out of the frame
        const tx = side * (e * j * pw * 0.4 + slide * 1000);
        return (
          <div key={i} style={{position: 'absolute', left: left + i * pw, top, width: pw, height: ph, transformOrigin: side < 0 ? 'left center' : 'right center', transform: `translateX(${tx}px) rotateY(${rot}deg)`, backfaceVisibility: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}>
            <div style={{position: 'absolute', inset: 0, overflow: 'hidden', border: `6px solid ${C.ink}`, outline: `2px solid ${FRAME}`, outlineOffset: -12, background: C.paper}}>
              <svg viewBox={`${i * pw} 0 ${pw} ${ph}`} width={pw} height={ph} style={{position: 'absolute', left: 0, top: 0, width: pw, height: ph}} dangerouslySetInnerHTML={{__html: svg}} />
              <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${i % 2 ? 90 : 270}deg, rgba(0,0,0,${0.06 + 0.3 * e}) 0%, rgba(0,0,0,0) 60%)`}} />
            </div>
          </div>
        );
      })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

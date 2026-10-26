// Decorative text: Araya's monologue hung into the frame like the scroll-curtains of a stage,
// one line at a time, in the instrumental passages only.
import React from 'react';
import {C, F} from '../theme';
import {clamp, eio, eout, smooth} from '../util';
import {useCurrentFrame} from 'remotion';
import {BANNERS, toneAt} from '../timeline';
import {FPS} from '../util';

/** a second strip to the left of the first (vertical text reads right to left), let down with it or after it, rolled up with it */
export type BannerThen = {from: number; zh: string; en: string; cols?: number; rv?: number};
export type BannerDef = {from: number; to: number; zh: string; en: string; x: number; side?: 'left' | 'right'; enAt?: 'below' | 'beside'; tone?: 'dark' | 'light'; color?: string; cols?: number; then?: BannerThen; enW?: number; pace?: number; rv?: number};

/** one column up to 18 characters, past that two (or more) columns of even length */
const strip = (zh: string, colsWanted?: number) => {
  const chars = [...zh];
  const fs = chars.length > 18 ? 34 : chars.length > 16 ? 36 : 40;
  const cols = colsWanted ?? (chars.length <= 18 ? 1 : Math.ceil(chars.length / 16));
  const colLen = Math.ceil(chars.length / cols);
  return {chars, fs, cols, h: colLen * fs * 1.12 + 110, w: cols * fs * 1.5 + 44};
};

/** a paper strip that unrolls downward from the top of the frame, the Chinese line set vertically on it */
/** reveal: [start, seconds] over which its characters come up one by one */
const Strip: React.FC<{abs: number; from: number; to: number; zh: string; x: number; cols?: number; tone: 'dark' | 'light'; color?: string; pace: number; reveal: [number, number]}> = ({abs, from, to, zh, x, cols, tone, color, pace, reveal}) => {
  const {chars, fs, h, w} = strip(zh, cols);
  const k = eout(clamp((abs - from) / (0.9 * pace))) * (1 - eio(clamp((abs - to) / (0.8 * pace))));
  const shown = clamp((abs - reveal[0]) / reveal[1]);
  const paper = tone === 'dark' ? C.paper : C.ink;
  const ink = tone === 'dark' ? C.ink : C.paper;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: 0, width: w, height: h * k, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, background: paper, boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
        <div style={{position: 'absolute', left: 8, right: 8, top: 8, height: 2, background: C.red, opacity: 0.85}} />
        <div style={{position: 'absolute', right: 22, top: 40, height: h - 90, writingMode: 'vertical-rl', fontFamily: F.sc, fontWeight: 500, fontSize: fs, lineHeight: 1.5, letterSpacing: fs * 0.12, color: color ?? ink}}>
          {chars.map((c, i) => <span key={i} style={{opacity: clamp(shown * chars.length * 1.1 - i)}}>{c}</span>)}
        </div>
        <div style={{position: 'absolute', left: '50%', bottom: 14, width: 10, height: 10, marginLeft: -5, borderRadius: 5, background: C.red}} />
      </div>
    </div>
  );
};

/** pace > 1: unrolls, rolls up and brings its English in that much more slowly; rv (and then.rv): seconds over which
 *  its words come up, when they must be slower than the share of the time to the roll-up */
export const Banner: React.FC<BannerDef & {abs: number}> = ({abs, from, to, zh, en, x, side = 'left', enAt = 'below', tone = 'dark', color, cols, then, enW = 520, pace = 1, rv}) => {
  if (abs < from - 0.1 || abs > to + 1.0 * pace) return null;
  const a = strip(zh, cols);
  const k = eout(clamp((abs - from) / (0.9 * pace))) * (1 - eio(clamp((abs - to) / (0.8 * pace))));
  const enO = (r0: number) => smooth(r0 + 0.4 * pace, r0 + 1.1 * pace, abs) * (1 - smooth(to, to + 0.6 * pace, abs));
  const enStyle: React.CSSProperties = {fontFamily: F.en, fontStyle: 'italic', fontSize: 27, lineHeight: 1.3, color: tone === 'dark' ? C.paper2 : C.ink2, textShadow: tone === 'dark' ? '0 0 10px rgba(8,6,10,0.9)' : '0 0 10px rgba(236,228,212,0.9)'};
  // the second strip hangs 18px to the left of the first; its English goes under the first's, in the same block
  const b = then ? strip(then.zh, then.cols) : undefined;
  const xb = b ? x - a.w / 2 - 18 - b.w / 2 : 0;
  const kb = then ? eout(clamp((abs - then.from) / (0.9 * pace))) * (1 - eio(clamp((abs - to) / (0.8 * pace)))) : 0;
  const top = Math.max(a.h * k, b ? b.h * kb : 0) + 18;
  // the words come up as they are read, right to left (user 10-26): the first strip's, then the second's, even when
  // both are let down together; the two share the time to the roll-up by their lengths, the last held a second
  const ra0 = from + 0.5 * pace;
  let ra: [number, number] = [ra0, rv ?? Math.max(0.8, (to - from) * 0.35)], rb: [number, number] = [0, 1];
  if (b && then && rv !== undefined && then.rv !== undefined) {
    rb = [Math.max(then.from + 0.5 * pace, ra0 + rv + 0.2), then.rv];
  } else if (b && then) {
    const span = Math.max(1.6, to - ra0 - 1.2), na = a.chars.length, nb = b.chars.length;
    ra = [ra0, (span * na) / (na + nb)];
    rb = [Math.max(then.from + 0.5 * pace, ra0 + ra[1] + 0.2), (span * nb) / (na + nb)];
  }
  return (
    <>
      <Strip abs={abs} from={from} to={to} zh={zh} x={x} cols={cols} tone={tone} color={color} pace={pace} reveal={ra} />
      {then && <Strip abs={abs} from={then.from} to={to} zh={then.zh} x={xb} cols={then.cols} tone={tone} color={color} pace={pace} reveal={rb} />}
      <div style={{position: 'absolute', ...(enAt === 'beside' ? {top: 64, right: 1920 - (x - a.w / 2) + 28, width: 420} : {top, left: side === 'right' ? x - a.w / 2 : undefined, right: side === 'left' ? 1920 - (x + a.w / 2) : undefined, width: enW}), textAlign: side === 'right' ? 'left' : 'right', ...enStyle}}>
        <div style={{opacity: enO(ra[0])}}>{en}</div>
        {then && <div style={{opacity: enO(rb[0]), marginTop: 14}}>{then.en}</div>}
      </div>
    </>
  );
};

export const BannerLayer: React.FC = () => {
  const abs = useCurrentFrame() / FPS;
  return <>{BANNERS.map((b, i) => <Banner key={i} abs={abs} {...b} tone={toneAt(b.from + 0.5)} />)}</>;
};

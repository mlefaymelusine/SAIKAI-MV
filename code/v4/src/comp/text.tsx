import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import lyrics from '../data/lyrics.json';
import {C, F} from '../theme';
import {FPS, H, W, smooth} from '../util';
import {QUOTES, Speaker, darkAt} from '../timeline';

type Line = {id: number; start: number; end: number; en: string; zh: string};
const L = lyrics as Line[];

const speakerColor = (who: Speaker, dark: boolean) =>
  who === 'ryoshu' ? (dark ? C.ryo : C.ryoInk) : who === 'araya' ? (dark ? C.araya : C.arayaInk) : dark ? C.paper2 : C.ink2;

/** one subtitle block: EN over ZH, centred low in frame */
const Block: React.FC<{en: string; zh: string; o: number; dark: boolean; color?: string; dash?: boolean; rise: number}> = ({en, zh, o, dark, color, dash, rise}) => {
  const main = color ?? (dark ? C.paper : C.ink);
  const sub = color ?? (dark ? C.paper2 : C.ink2);
  const halo = dark ? '0 0 14px rgba(8,6,10,0.9), 0 0 3px rgba(8,6,10,0.9)' : '0 0 14px rgba(236,228,212,0.95), 0 0 3px rgba(236,228,212,0.9)';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 878 + rise, textAlign: 'center', opacity: o}}>
      <div style={{position: 'absolute', left: '50%', top: -26, width: Math.min(1700, 260 + en.length * 19), height: 150, transform: 'translateX(-50%)', background: `radial-gradient(ellipse at center, ${dark ? 'rgba(10,8,12,0.62)' : 'rgba(236,228,212,0.72)'} 0%, ${dark ? 'rgba(10,8,12,0.35)' : 'rgba(236,228,212,0.4)'} 45%, rgba(0,0,0,0) 72%)`}} />
      <div style={{position: 'relative', fontFamily: F.en, fontStyle: 'italic', fontWeight: 400, fontSize: 42, letterSpacing: 0.6, color: main, textShadow: halo, lineHeight: 1.15}}>
        {dash && <span style={{marginRight: 14, opacity: 0.8}}>—</span>}
        {en}
      </div>
      <div style={{position: 'relative', fontFamily: F.sc, fontWeight: 300, fontSize: 25, letterSpacing: 4, color: sub, marginTop: 10, textShadow: halo, opacity: 0.92}}>{zh}</div>
    </div>
  );
};

export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const dk = darkAt(t);
  const dark = dk >= 0.5;
  const items: React.ReactNode[] = [];
  L.forEach((l, i) => {
    const next = L[i + 1]?.start ?? 1e9;
    const a = l.start - 0.35;
    const b = Math.min(l.end + 0.7, next - 0.15);
    if (t < a || t > b) return;
    const o = smooth(a, a + 0.7, t) * (1 - smooth(b - 0.7, b, t));
    const rise = (1 - smooth(a, a + 0.9, t)) * 8;
    if (dk > 0 && dk < 1) {
      items.push(<Block key={'l' + i + 'd'} en={l.en} zh={l.zh} o={o * dk} dark rise={rise} />);
      items.push(<Block key={'l' + i + 'l'} en={l.en} zh={l.zh} o={o * (1 - dk)} dark={false} rise={rise} />);
    } else items.push(<Block key={'l' + i} en={l.en} zh={l.zh} o={o} dark={dark} rise={rise} />);
  });
  QUOTES.forEach((q, i) => {
    if (q.big) return;
    const a = q.from - 0.3, b = q.to + 0.4;
    if (t < a || t > b) return;
    const o = smooth(a, a + 0.6, t) * (1 - smooth(b - 0.6, b, t));
    const rise = (1 - smooth(a, a + 0.8, t)) * 8;
    items.push(<Block key={'q' + i} en={q.en} zh={q.zh} o={o} dark={dark} color={speakerColor(q.who, dark)} dash rise={rise} />);
  });
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{items}</AbsoluteFill>;
};

/** paper fibre + fine grain + soft vignette over everything */
export const PrintOverlay: React.FC = () => {
  const f = useCurrentFrame();
  const g = Math.floor(f / 2) % 6;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: W, height: H, mixBlendMode: 'multiply', opacity: 0.42}} />
      <Img src={staticFile(`tex/grain${g}.png`)} style={{position: 'absolute', width: W, height: H, opacity: 0.55}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 110% at center, rgba(0,0,0,0) 62%, rgba(8,6,10,0.22) 100%)'}} />
    </AbsoluteFill>
  );
};

export {speakerColor};

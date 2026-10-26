// The folding screen's picture, flat, as a texture (user 10-24, 4th look: the screen is modelled and folded in Blender,
// blender/screen.py, so it no longer splits apart). 2 px to the picture's unit; the flames move with the frame.
// The ox is a persistent <image> between the two halves of the picture: inside innerHTML it was reloaded every frame
// and frames 61, 62 and 253 came out without it.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {FPS} from './util';
import {OX, OX_MARK, OX_SRC, SH, SW, hellScreenSvg} from './comp/hellscreen';

export const SCREEN_TEX_SCALE = 2;
export const ScreenTex: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const [handle] = useState(() => delayRender('screen ox'));
  useEffect(() => { const im = new Image(); im.onload = im.onerror = () => continueRender(handle); im.src = OX_SRC; }, [handle]);
  const [under, over] = hellScreenSvg(t).split(OX_MARK);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${SW} ${SH}`} width={SW * SCREEN_TEX_SCALE} height={SH * SCREEN_TEX_SCALE}>
        <g dangerouslySetInnerHTML={{__html: under}} />
        <image href={OX_SRC} {...OX(t)} />
        <g dangerouslySetInnerHTML={{__html: over}} />
      </svg>
    </AbsoluteFill>
  );
};

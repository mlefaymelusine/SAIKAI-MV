// preview only: the W5 close-up glass in perspective with the gpt-image girl (round 4). Each 2 s one state:
// the empty cracked glass, a drop every 2 s; girl tilt (0-8 s), tilt2 (8-16 s)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Svg} from './comp/core';
import {GlassClose} from './comp/glasscup';

export const W5Test: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30, girl = t < 8 ? 'tilt' : 'tilt2';
  return (
    <AbsoluteFill>
      <Svg><GlassClose t={t} drops={Array.from({length: 8}, (_, i) => i * 2 + 0.3)} girl={girl} /></Svg>
    </AbsoluteFill>
  );
};

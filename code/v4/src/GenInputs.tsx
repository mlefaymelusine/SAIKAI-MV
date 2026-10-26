// gpt-image inputs only (not in the film): layouts at 1536x1024 for the C2 pair and the W5 girl behind the glass
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Defs} from './comp/core';
import {Pair} from './comp/rooftop';
import {Behind} from './comp/glasscup';

/** C2: base Pair coords x 620..1500, y 400..987 -> 1536x1024 */
export const C2_MAP = {x0: 620, y0: 400, s: 1536 / 880};
export const C2Pair: React.FC = () => (
  <AbsoluteFill style={{background: '#1d1838'}}>
    <svg viewBox="0 0 1536 1024" width={1536} height={1024} style={{position: 'absolute'}}>
      <Defs />
      <g transform={`scale(${C2_MAP.s}) translate(${-C2_MAP.x0} ${-C2_MAP.y0})`}><Pair lean={0.4} t={100} /></g>
    </svg>
  </AbsoluteFill>
);
/** W5: base coords x 300..1620, y 160..1040 -> 1536x1024 */
export const W5_MAP = {x0: 300, y0: 160, s: 1536 / 1320};
export const W5Girl: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 1536 1024" width={1536} height={1024} style={{position: 'absolute'}}>
      <Defs />
      <g transform={`scale(${W5_MAP.s}) translate(${-W5_MAP.x0} ${-W5_MAP.y0})`}><Behind t={0} eyes look={1} /></g>
    </svg>
  </AbsoluteFill>
);

import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {C} from './theme';
import {PartA} from './shots/A';
import {PartB} from './shots/B';
import {B1Eyelids, PartC} from './shots/C';
import {PartD} from './shots/D';
import {PrintOverlay, Subtitles} from './comp/text';
import {BannerLayer} from './comp/banner';

/** subs false: the same picture without the subtitle layer (SaikaiV4Clean, for the cover) */
export const Video: React.FC<{subs?: boolean}> = ({subs = true}) => (
  <AbsoluteFill style={{background: C.ink}}>
    <Audio src={staticFile('saikai.wav')} />
    <PartA />
    <PartB />
    <PartC />
    <PartD />
    <PrintOverlay />
    <BannerLayer />
    {subs && <Subtitles />}
    <B1Eyelids />
  </AbsoluteFill>
);

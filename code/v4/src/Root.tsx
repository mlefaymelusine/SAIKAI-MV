import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {FPS} from './util';
import {W5Test} from './W5Test';
import {C2Pair, W5Girl} from './GenInputs';
import {ScreenTex} from './ScreenTex';

export const Root: React.FC = () => (
  <>
    <Composition id="SaikaiV4" component={Video} durationInFrames={9718} fps={FPS} width={1920} height={1080} />
    <Composition id="SaikaiV4Clean" component={Video} defaultProps={{subs: false}} durationInFrames={9718} fps={FPS} width={1920} height={1080} />
    <Composition id="W5Test" component={W5Test} durationInFrames={480} fps={FPS} width={1920} height={1080} />
    <Composition id="C2Pair" component={C2Pair} durationInFrames={30} fps={FPS} width={1536} height={1024} />
    <Composition id="W5Girl" component={W5Girl} durationInFrames={30} fps={FPS} width={1536} height={1024} />
    <Composition id="ScreenTex" component={ScreenTex} durationInFrames={360} fps={FPS} width={3000} height={1240} />
  </>
);

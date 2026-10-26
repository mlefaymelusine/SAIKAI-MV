import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DURATION, FPS} from './util';

export const Root: React.FC = () => (
  <Composition id="SaikaiOriginal" component={Video} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);

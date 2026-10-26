import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// v4 palette: colour is a person (brief §二.2). Everything is flat ink on paper.
export const C = {
  ink: '#0e0b10', // black paper, the nest, the fathers
  ink2: '#2a2430',
  paper: '#ece4d4', // cream paper
  paper2: '#cfc5b1',
  paperShade: '#d8cdb8',
  white: '#faf8f2', // the sheath, Ryōshū's shirt and face
  red: '#c0182c', // the red thread and small accents
  redLine: '#d62838',
  redDark: '#7a0d1b',
  navy: '#26345c', // Araya
  navyDeep: '#18213d',
  violet: '#5c53e7', // only when the three phrases on the sheath light up
  grey: '#8d8780', // what has been cut
  greyLight: '#b9b2a6',
  purple: '#8a5cc8', // the bear, the one exception
  purpleLight: '#b392e0',
  gold: '#c9a446', // the Thumb's ticket
  ryo: '#e5484f',
  ryoInk: '#a8121f',
  araya: '#9a93ff',
  arayaInk: '#4a41c9',
};

const faces: [string, string, string, string][] = [
  ['MV_sc', 'sc_300_normal_0.woff2', '300', 'normal'],
  ['MV_sc', 'sc_500_normal_1.woff2', '500', 'normal'],
  ['MV_jp', 'jp_400_normal_0.woff2', '400', 'normal'],
  ['MV_brush', 'brush_400_normal_0.woff2', '400', 'normal'],
  ['MV_en', 'en_i_400_italic_0.woff2', '400', 'italic'],
  ['MV_en', 'en_i_600_italic_1.woff2', '600', 'italic'],
  ['MV_en', 'en_400_normal_0.woff2', '400', 'normal'],
  ['MV_en', 'en_600_normal_1.woff2', '600', 'normal'],
];
for (const [family, file, weight, style] of faces) {
  loadFont({family, url: staticFile('fonts/' + file), weight, style});
}

export const F = {
  sc: 'MV_sc, serif',
  jp: 'MV_jp, MV_sc, serif',
  en: 'MV_en, MV_sc, serif',
  brush: 'MV_brush, MV_jp, serif',
};

// P1 (user 10-24): the v1 folding-screen opening, its picture redrawn. v1 used a generated image of the burning ox-cart
// (Akutagawa's 地獄変); the user found it "too AI". This is the same scene cut flat in paper, ink and red like the
// rest of v4: gold clouds across a cream ground, an ox drawing a carriage whose cabin is on fire, the flames swept
// up to the left into ink smoke. Drawn as an SVG string so the folding screen can show a slice of it on each panel,
// and so the flames can move. All coordinates in the screen's own 1500 x 620 box.

import {staticFile} from 'remotion';

export const SW = 1500, SH = 620;
export const OX_SRC = staticFile('img4/screen_ox.png');
export const OX_MARK = '<!--OX-->';
export const OX = (t: number) => ({x: 843, y: 305.5 + Math.abs(Math.sin(t * 1.6)) * -2, width: 552, height: 290.4});
const PAPER = '#ece4d4', GOLD = '#cbb27c', GOLD_DK = '#a3874f', RED = '#c0182c', RED_DK = '#7a0d1b', EMBER = '#de4a34', INK = '#0e0b10';

const f1 = (v: number) => v.toFixed(1);

/** a band of gold cloud (suyari-gasumi): flat bottom, scalloped top, round ends */
const cloud = (x: number, y: number, w: number, h: number, n = 5) => {
  let d = `M${f1(x)} ${f1(y + h)} `;
  d += `C${f1(x - h * 0.6)} ${f1(y + h)} ${f1(x - h * 0.6)} ${f1(y + h * 0.15)} ${f1(x)} ${f1(y + h * 0.2)} `;
  for (let i = 0; i < n; i++) {
    const a = x + (w * i) / n, b = x + (w * (i + 1)) / n, up = h * (0.35 + 0.3 * ((i * 7) % 3) / 2);
    d += `C${f1(a + (b - a) * 0.1)} ${f1(y - up)} ${f1(b - (b - a) * 0.1)} ${f1(y - up)} ${f1(b)} ${f1(y + h * 0.15)} `;
  }
  d += `C${f1(x + w + h * 0.6)} ${f1(y + h * 0.1)} ${f1(x + w + h * 0.6)} ${f1(y + h)} ${f1(x + w)} ${f1(y + h)} Z`;
  return `<path d="${d}" fill="${GOLD}" stroke="${GOLD_DK}" stroke-width="2.5"/>` +
    `<path d="M${f1(x + w * 0.08)} ${f1(y + h * 0.62)} L${f1(x + w * 0.92)} ${f1(y + h * 0.62)}" stroke="${GOLD_DK}" stroke-width="1.5" opacity="0.6"/>`;
};

/** one tongue of flame from a base at (bx, by): rises h, leans (dx per unit height), ends in a curl */
const tongue = (bx: number, by: number, w: number, h: number, lean: number, wob: number, fill: string, stroke?: string) => {
  const tx = bx + lean * h + wob * 18, ty = by - h;
  const curl = lean < 0 ? -1 : 1;
  const L = [bx - w / 2, by], R = [bx + w / 2, by];
  const m1 = [bx + lean * h * 0.35 - w * 0.55 + wob * 10, by - h * 0.38];
  const m2 = [bx + lean * h * 0.68 + w * 0.15 - wob * 8, by - h * 0.7];
  const d = `M${f1(L[0])} ${f1(L[1])} ` +
    `C${f1(L[0] - w * 0.2)} ${f1(by - h * 0.15)} ${f1(m1[0] - w * 0.1)} ${f1(m1[1] + h * 0.1)} ${f1(m1[0])} ${f1(m1[1])} ` +
    `C${f1(m1[0] + w * 0.1)} ${f1(m1[1] - h * 0.14)} ${f1(m2[0] - w * 0.4)} ${f1(m2[1] + h * 0.06)} ${f1(m2[0] - w * 0.1)} ${f1(m2[1])} ` +
    `C${f1(m2[0] + w * 0.12)} ${f1(m2[1] - h * 0.1)} ${f1(tx - curl * w * 0.5)} ${f1(ty + h * 0.08)} ${f1(tx)} ${f1(ty)} ` +
    // the curl at the tip, then back down the other side
    `C${f1(tx + curl * w * 0.35)} ${f1(ty + h * 0.02)} ${f1(tx + curl * w * 0.3)} ${f1(ty + h * 0.12)} ${f1(tx + curl * w * 0.08)} ${f1(ty + h * 0.1)} ` +
    `C${f1(m2[0] + w * 0.45)} ${f1(m2[1] - h * 0.02)} ${f1(m2[0] + w * 0.25)} ${f1(m2[1] + h * 0.12)} ${f1(m2[0] + w * 0.4)} ${f1(m2[1] + h * 0.2)} ` +
    `C${f1(m1[0] + w * 0.9)} ${f1(m1[1] - h * 0.05)} ${f1(m1[0] + w * 1.05)} ${f1(m1[1] + h * 0.15)} ${f1(R[0] - w * 0.1)} ${f1(by - h * 0.12)} ` +
    `C${f1(R[0])} ${f1(by - h * 0.05)} ${f1(R[0] + w * 0.05)} ${f1(by)} ${f1(R[0])} ${f1(R[1])} Z`;
  return `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"` : ''}/>`;
};

/** an ink smoke curl: a spiral scroll with a pale cut line inside it */
const smoke = (x: number, y: number, r: number, dir: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = dir * (i / 40) * Math.PI * 3.2, rr = r * (1 - (i / 40) * 0.82);
    pts.push(`${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr * 0.75)}`);
  }
  return `<path d="M${pts.join(' L')}" stroke="${INK}" stroke-width="${f1(r * 0.42)}" fill="none" stroke-linecap="round"/>` +
    `<path d="M${pts.slice(4).join(' L')}" stroke="${PAPER}" stroke-width="2" fill="none" opacity="0.55"/>`;
};

const rnd = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// the fire: [base x, base y, width, height, lean], back to front
const FIRE: [number, number, number, number, number][] = [
  [400, 215, 120, 300, -0.75], [520, 205, 140, 360, -0.7], [650, 205, 130, 330, -0.62], [740, 210, 100, 250, -0.55],
  [370, 300, 90, 210, -0.95], [380, 380, 80, 160, -1.0], [470, 208, 90, 220, -0.6], [600, 206, 100, 250, -0.55],
  [700, 210, 80, 180, -0.5],
];

export const hellScreenSvg = (t: number) => {
  const R = rnd(7);
  let s = `<rect x="0" y="0" width="${SW}" height="${SH}" fill="${PAPER}"/>`;
  // far clouds
  s += cloud(930, 74, 520, 40, 6) + cloud(1070, 128, 330, 30, 4) + cloud(-30, 448, 300, 34, 4);
  // smoke over the fire, up to the left
  s += smoke(170, 110, 62, 1) + smoke(300, 52, 44, -1) + smoke(88, 210, 40, -1) + smoke(420, 30, 30, 1);
  // the fire behind the cabin: dark outer tongues, then red, then the hot cores
  FIRE.forEach(([x, y, w, h, l], i) => {
    const wob = Math.sin(t * 2.3 + i * 1.7) * 0.8 + Math.sin(t * 3.7 + i) * 0.4;
    const k = 1 + 0.06 * Math.sin(t * 2.9 + i * 2.1);
    s += tongue(x, y + 6, w * 1.25, h * 1.12 * k, l * 1.05, wob, RED_DK);
  });
  FIRE.forEach(([x, y, w, h, l], i) => {
    const wob = Math.sin(t * 2.5 + i * 1.3 + 1) * 0.8;
    s += tongue(x + 6, y + 4, w, h * (0.92 + 0.07 * Math.sin(t * 3.1 + i)), l, wob, RED, INK);
  });
  FIRE.forEach(([x, y, w, h, l], i) => {
    if (i % 2) return;
    const wob = Math.sin(t * 3.3 + i * 2.2) * 0.8;
    s += tongue(x + 10, y + 2, w * 0.42, h * (0.48 + 0.05 * Math.sin(t * 4.1 + i)), l * 0.9, wob, EMBER);
  });
  // ---- the carriage ----
  // cabin
  s += `<rect x="380" y="214" width="382" height="196" fill="${INK}"/>`;
  s += `<rect x="392" y="226" width="358" height="172" fill="none" stroke="${PAPER}" stroke-width="2.5" opacity="0.8"/>`;
  s += [470, 655].map((x) => `<path d="M${x} 228 L${x} 396" stroke="${PAPER}" stroke-width="2" opacity="0.7"/>`).join('');
  // the side window: lattice, and the fire inside
  const glow = 0.85 + 0.15 * Math.sin(t * 5.3);
  s += `<rect x="488" y="252" width="150" height="82" fill="${RED}" opacity="${f1(glow)}"/>`;
  for (let x = 500; x < 638; x += 14) s += `<path d="M${x} 252 L${x} 334" stroke="${INK}" stroke-width="5"/>`;
  s += `<path d="M488 293 L638 293" stroke="${INK}" stroke-width="5"/><rect x="488" y="252" width="150" height="82" fill="none" stroke="${PAPER}" stroke-width="2"/>`;
  // lower panel: a band of cut diamonds
  for (let x = 404; x < 744; x += 30) s += `<path d="M${x} 372 l12 -12 l12 12 l-12 12 Z" fill="none" stroke="${PAPER}" stroke-width="1.6" opacity="0.65"/>`;
  // roof with its swept eaves
  s += `<path d="M346 226 C352 204 372 194 404 194 L736 194 C770 194 790 204 798 226 C784 216 768 212 750 212 L392 212 C374 212 360 216 346 226 Z" fill="${INK}"/>`;
  s += `<path d="M360 220 C372 206 388 202 404 202 L736 202 C756 202 774 206 786 220" stroke="${PAPER}" stroke-width="2" fill="none" opacity="0.8"/>`;
  // the front: blind, and the long cloth hanging from it
  for (let y = 226; y < 330; y += 9) s += `<path d="M762 ${y} L784 ${y + 2}" stroke="${INK}" stroke-width="5"/>`;
  const sw = Math.sin(t * 1.4) * 6;
  s += `<path d="M764 292 C784 312 790 336 ${f1(806 + sw * 0.5)} 362 C${f1(822 + sw)} 392 ${f1(812 + sw)} 420 ${f1(836 + sw)} 452 C${f1(820 + sw)} 462 ${f1(804 + sw)} 458 ${f1(792 + sw)} 462 C${f1(784 + sw)} 430 776 400 770 372 C764 344 758 320 756 300 Z" fill="${RED_DK}" stroke="${INK}" stroke-width="2.5"/>`;
  s += `<path d="M770 310 C780 340 ${f1(790 + sw * 0.6)} 380 ${f1(806 + sw)} 450" stroke="${PAPER}" stroke-width="1.5" fill="none" opacity="0.5"/>`;
  // the fire in front: over the roof and up the back of the cabin
  [[430, 214, 64, 120, -0.8], [560, 210, 76, 150, -0.7], [690, 212, 60, 110, -0.6], [384, 300, 50, 120, -1.1], [386, 380, 44, 90, -1.2]].forEach(([x, y, w, h, l], i) => {
    const wob = Math.sin(t * 2.8 + i * 1.9) * 0.8;
    s += tongue(x, y, w, h * (0.92 + 0.08 * Math.sin(t * 3.4 + i)), l, wob, RED, INK);
    s += tongue(x + 4, y, w * 0.45, h * 0.5, l * 0.9, wob, EMBER);
  });
  // frame under the cabin
  s += `<rect x="372" y="406" width="402" height="16" fill="${INK}"/>`;
  // ---- the ox ---- (user 10-24, 4th look: redrawn with gpt-image, round 5 #1, public/img4/screen_ox.png; it walks
  // on the spot with a slight bob, its yoke at (1228, 356) where the shafts end)
  // (left as a marker: an <image> inside innerHTML is reloaded every frame and some frames rendered without it, so
  // ScreenTex puts a persistent <image> here, OX below)
  s += OX_MARK;
  // the near shaft, from the carriage across the ox's flank to the yoke on its neck (edged in cream so it reads on the black)
  s += `<path d="M740 404 L1226 354" stroke="${PAPER}" stroke-width="10" stroke-linecap="round" opacity="0.85"/><path d="M740 404 L1226 354" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/>`;
  // ---- the wheel, in front ----
  const rot = t * 18;
  s += `<g transform="translate(560 472) rotate(${f1(rot)})">`;
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; s += `<path d="M${f1(Math.cos(a) * 24)} ${f1(Math.sin(a) * 24)} L${f1(Math.cos(a) * 118)} ${f1(Math.sin(a) * 118)}" stroke="${INK}" stroke-width="5"/>`; }
  s += `<circle r="122" fill="none" stroke="${INK}" stroke-width="16"/><circle r="114" fill="none" stroke="${PAPER}" stroke-width="1.6" opacity="0.7"/>`;
  s += `<circle r="28" fill="${INK}"/><circle r="17" fill="none" stroke="${PAPER}" stroke-width="2"/></g>`;
  // ground
  s += `<path d="M0 588 C200 580 420 596 700 590 C980 584 1240 594 1500 586 L1500 620 L0 620 Z" fill="${INK}"/>`;
  // near clouds over the ground
  s += cloud(1120, 540, 360, 34, 5) + cloud(40, 556, 280, 30, 4);
  // sparks drifting up from the fire
  for (let i = 0; i < 26; i++) {
    const x0 = 360 + R() * 420, sp = 30 + R() * 50, ph = R() * 20;
    const k = ((t * sp + ph * 40) % 420) / 420;
    const x = x0 - k * 260 + Math.sin(t * 2 + i) * 10, y = 200 - k * 220;
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(2 + R() * 2.5)}" fill="${i % 3 ? RED : EMBER}" opacity="${f1(1 - k)}"/>`;
  }
  return s;
};

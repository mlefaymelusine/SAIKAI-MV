// SAIKAI v4: shot table, the one dialogue subtitle kept, and Araya's monologue as banners.
// Times are song seconds (lyric starts from data/lyrics.json). x = crossfade with the previous shot.
// Every time that is not a lyric start lives in cues.ts.

export type Tone = 'dark' | 'light';
export type ShotDef = {id: string; from: number; to: number; tone: Tone; x: number; note: string};

export const SHOTS: ShotDef[] = [
  {id: 'P1', from: 0.0, to: 12.0, tone: 'dark', x: 0, note: 'prologue: the folding screen of the burning ox-cart (地獄変), a pair of three-panel screens modelled in Blender, folds up and is carried off; a red thread let down into the dark, on down to the ball; title'},
  {id: 'P2', from: 12.0, to: 29.6, tone: 'dark', x: 1.6, note: 'the thread winds itself slowly into a ball of yarn (3D), a knot in one thread running on down'},
  {id: 'V0', from: 29.6, to: 35.1, tone: 'dark', x: 1.2, note: '0 young and lost: a cat\'s-cradle web on black paper'},
  {id: 'V1', from: 35.1, to: 44.2, tone: 'dark', x: 0.8, note: '1 doors unlocked: the upright time-safe (brass lever and dial) opens; inside, scratches and a tangle of red thread, in the light'},
  {id: 'V2', from: 44.2, to: 57.6, tone: 'light', x: 1.0, note: '2-3 threads to petals: the thread draws a red kawara-nadeshiko open; we draw back over a riverbank of grey thread-drawn ones'},
  {id: 'V3', from: 57.6, to: 71.6, tone: 'light', x: 1.2, note: '4 caring: the first reel of film, early memories slowly past on a light table (shoes, bento, heights, randoseru, hydrangea)'},
  {id: 'V4', from: 71.6, to: 86.0, tone: 'dark', x: 1.2, note: '5 innocence: a white hydrangea in green bud opens 1, 2, 4, 16, then all; the field opens round it'},
  {id: 'C1', from: 86.0, to: 96.6, tone: 'light', x: 0.8, note: '6-8 pain cannot define the past: burning sword-scars that do not fade'},
  {id: 'C2', from: 96.6, to: 106.5, tone: 'dark', x: 1.0, note: '9-11 with you: out through a dark doorway onto the roof at night (the key image): two moons, the two of them from behind, lunch box, red cup, red randoseru'},
  {id: 'C3', from: 106.5, to: 111.2, tone: 'light', x: 0.5, note: '12 S: SAYONARA cut to S·, grows back into SAIKAI'},
  {id: 'C4', from: 111.2, to: 116.6, tone: 'light', x: 0.5, note: '13 play back: the same film rewinds fast, old-film look'},
  {id: 'I1', from: 116.6, to: 129.8, tone: 'dark', x: 0.6, note: 'interlude: the House of Spiders (3D web tunnel)'},
  {id: 'I2', from: 129.8, to: 143.0, tone: 'dark', x: 1.2, note: 'the five fathers by the names they called her and their things, among faint hanging words'},
  {id: 'W1', from: 143.0, to: 149.4, tone: 'light', x: 1.0, note: '14 step up: small red footprints; big ink ones catch up on "step" and keep her pace beside her'},
  {id: 'W2', from: 149.4, to: 156.7, tone: 'dark', x: 1.0, note: '15 the world and more: the city from the roof, tilting up into the turning sky'},
  {id: 'W3', from: 156.7, to: 171.4, tone: 'dark', x: 1.2, note: '16-17 limited time: a cut-paper clock, the hour hand indigo, the minute hand the red thread; white hydrangea buds at the hours open as the thread passes (up to 12, where they meet; nothing after); they lie together for a moment on "together"'},
  {id: 'W4', from: 171.4, to: 178.0, tone: 'dark', x: 1.0, note: '18 protection is not enough: the white hydrangea under a glass bell jar in the rain goes dull; a floret falls'},
  {id: 'W5', from: 178.0, to: 189.8, tone: 'light', x: 1.0, note: '19 empty cup: Araya in her teens, head on her hand, watches the tap drip into a cracked cup that leaks onto the table'},
  {id: 'W6', from: 189.8, to: 198.6, tone: 'dark', x: 1.2, note: '20 questioned myself: the table late at night from above, the ashtray filling, smoke drifting off like a grey thread'},
  {id: 'B1', from: 198.6, to: 223.0, tone: 'dark', x: 1.0, note: 'bridge: the first draw cuts every thread but Rien\'s; four things fall grey, the book is only nicked'},
  {id: 'R1', from: 223.0, to: 231.4, tone: 'light', x: 1.2, note: '21-22 what do I know about love: Rien\'s book, the spider story'},
  {id: 'R2', from: 231.4, to: 238.0, tone: 'dark', x: 1.0, note: '23 thriving: back to the field of V4, all open, at night; on "thriving" the light comes up over it'},
  {id: 'R3', from: 238.0, to: 249.7, tone: 'dark', x: 1.0, note: '24-25 every drop of blood: red drops here and there over the field; the red spreads through several heads at each'},
  {id: 'G1', from: 249.7, to: 266.8, tone: 'light', x: 1.0, note: '26-29: the big footprints walk away from the small ones (sacrifice is the easy path); from "My absence" close on the two faces of the reunion, drawn back in one move'},
  {id: 'G2', from: 266.8, to: 270.0, tone: 'light', x: 0, note: '30 never cut: Araya comes away as points of light from her hair ends; night falls'},
  {id: 'G3', from: 270.0, to: 274.8, tone: 'dark', x: 0, note: '31 S again: Ryoshu fades as 再见 comes up; only the turning light and the words; 再见 -> 再会'},
  {id: 'G4', from: 274.8, to: 280.4, tone: 'dark', x: 0, note: '32 forgive me: the light comes down and builds the sheath round her blade; the three phrases light up on it'},
  {id: 'O1', from: 280.4, to: 301.0, tone: 'dark', x: 0.8, note: 'outro, on from G4: the sky comes up round the sheath; the red thread rises and ties round it; we draw back into the turning sky'},
  {id: 'O2', from: 301.0, to: 308.7, tone: 'dark', x: 1.4, note: 'the book, open at its blank last page, closes'},
  {id: 'O3', from: 308.7, to: 318.6, tone: 'dark', x: 0.6, note: 'on the last hit: the sky again, the sheath at the pole, its words lit, its thread running down; credits'},
  {id: 'O4', from: 318.6, to: 323.95, tone: 'dark', x: 0, note: 'the very end: the sky has sunk to black (end of O3); a beat; I.L.Y.T. comes up out of the black, still (user 10-24 2nd look; 10-26)'},
];

export const shotById = (id: string) => SHOTS.find((s) => s.id === id)!;

const TONE_OVERRIDES: {from: number; to: number; tone: Tone}[] = [];
// where the picture itself goes from paper to night, the subtitles cross over (0 = light ground, 1 = dark)
const TONE_RAMPS: {from: number; to: number}[] = [{from: 268.0, to: 268.9}];
export const darkAt = (t: number): number => {
  for (const r of TONE_RAMPS) if (t >= r.from && t < r.to) { const x = (t - r.from) / (r.to - r.from); return x * x * (3 - 2 * x); }
  return toneAt(t) === 'dark' ? 1 : 0;
};
export const toneAt = (t: number): Tone => {
  for (const o of TONE_OVERRIDES) if (t >= o.from && t < o.to) return o.tone;
  let tone: Tone = 'dark';
  for (const s of SHOTS) if (t >= s.from) tone = s.tone;
  return tone;
};

export type Speaker = 'ryoshu' | 'araya' | 'other';
export type QuoteDef = {from: number; to: number; who: Speaker; en: string; zh: string; big?: boolean};

// The only subtitled dialogue: Araya's origin, over the web tunnel (verbatim, S948A).
export const QUOTES: QuoteDef[] = [
  {from: 120.8, to: 128.6, who: 'other', en: 'You, too, were born with Yoshihide\'s blood because the higher-ups of the Thumb wished for another candidate with an innate aptitude to wield Arayashiki...', zh: '你也是……因为那些希望得到更多阿赖耶识适配者的拇指上层干部们而诞生的，继承了良秀之血的孩子……'},
];

// Araya's monologue from the end of Canto IX (S949A), official EN / LLC zh-CN, hung as banners in the instrumental passages only.
// Thread of the selection: the ball of yarn -> dragon's beard -> the thread that cannot be cut -> I.L.Y.T.
// Every line has to answer something in the picture or the lyric under it (user 10-24); the two name lines are out.
export type BannerItem = {from: number; to: number; zh: string; en: string; x: number; side?: 'left' | 'right'; enAt?: 'below' | 'beside'; cols?: number; enW?: number; pace?: number; rv?: number; then?: {from: number; zh: string; en: string; cols?: number; rv?: number}};
// the line Araya means to say to her mother (S949A 58), alone in the middle of the frame in O3
export const THANKS = {from: 309.6, to: 314.6, zh: '谢谢你来找我！', en: 'Thanks for coming to find me!'};
/** B1 (user 10-26): the bridge as silhouettes (comp/b1sil.tsx) instead of the falling things and the hanging book */
export const B1_SIL = true;
/** Rien and the two Ryoshus (S950A 19-22, on the roof of the House of Spiders in the story): his lines hang over him on
 *  the right, hers over her on the left. (User 10-26 03:15, a friend's further idea) "I hear the waves" is said in the
 *  past, to the young Ryoshu, who does not answer; it stays up through the blink, and the Ryoshu of now answers it;
 *  then "lonely", after a pause and coming up more slowly (03:02) */
const B1_SIL_BANNERS: BannerItem[] = [
  {from: 203.4, to: 221.2, pace: 1.15, rv: 2.6, zh: '……我听到海浪的声音了。', en: '... I hear the waves.', x: 1760, enW: 290,
    then: {from: 215.0, rv: 3.2, zh: '……寞。很寂寞。', en: '... ly. They sound lonely.'}},
  {from: 209.6, to: 221.2, pace: 1.15, rv: 2.3, zh: '……听起来是什么样的？', en: '... How do they sound?', x: 330, side: 'right', enW: 420},
];
export const BANNERS: BannerItem[] = [
  {from: 13.6, to: 19.6, zh: '你曾经看到过，缠绕成团的线吗？', en: 'Have you ever seen a ball of yarn?', x: 1560},
  {from: 20.6, to: 27.4, zh: '起始与终结紧密相连的那种。', en: 'The one with the two ends of the same thread touching each other.', x: 1560},
  // B1 (10-25): the slash cuts every thread but Rien's, so the voice here is Rien's, reading to her as a child (S950A,
  // the waves and the sand castles). "Slashing away..." moves to the outro with the rest of Araya's lines.
  // B1: the hanging book (first design) or the silhouettes (user 10-26, a friend's idea; S950A, official zh / EN)
  ...(B1_SIL ? B1_SIL_BANNERS : [
    {from: 203.8, to: 209.2, zh: '浪随风起。风一吹，它也随之潮起潮落……破坏掉眼前所见的一切。', en: 'Waves move with the winds. When the wind blows, the high and low tides can\'t help but knock down everything in their path.', x: 1620},      // the threads fall
    {from: 212.4, to: 218.6, zh: '结局……先按下不表吧。', en: 'We can save the ending... for later.', x: 1620},       // Rien's thread, uncut, the book still hanging (it opens in R1, closes on a blank last page in O2)
  ]),
  // the outro (10-25): the passage from the end of S949A (50-55) in order, two lines to a pair of strips side by side,
  // let down together (2nd look: one after the other was too hurried) and slowly, the first line on the right (vertical
  // text reads right to left), from when the sheath has drawn back off the right of the frame: two pairs over the
  // sheath, the last over the book closing. "Thanks for coming to find me!" (58) follows in O3.
  {from: 288.4, to: 294.4, x: 1820, enW: 340, pace: 1.35, zh: '妈妈斩断的那些线……虽然从表面看来已经全部斩开……', en: 'Those threads she\'s cutting off now... may appear severed...',
    then: {from: 288.4, zh: '但在我看来并不是。它们只是在继续增加。', en: 'But that\'s not what it looks like to me. They\'re only getting longer and longer and silkier and silkier, like that candy.'}},
  {from: 296.2, to: 301.0, x: 1820, enW: 340, pace: 1.35, cols: 2, zh: '只是切割，是没办法切断这些线的。', en: 'Slashing away at the threads won\'t sever it.',
    then: {from: 296.2, zh: '我能看到的所有道路中，妈妈和我始终紧密相连。', en: 'Mother and I are tied together on every path. I see it now.'}},
  {from: 302.6, to: 308.2, x: 1820, enW: 340, pace: 1.35, zh: '我能看到紧紧握着、绝不松开的妈妈的手。', en: 'I can also see her whitened knuckles gripping tightly onto the thread, refusing to ever let go.',
    then: {from: 302.6, zh: '那漫长的时间怎么能被区区一句刹那所概括呢。', en: 'How could one bear witness to those layers upon layers of time... and dismiss them as mere "fleeting" moments?'}},
];

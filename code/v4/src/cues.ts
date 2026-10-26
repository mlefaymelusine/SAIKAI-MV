// Every time in v4 that is not a lyric start (lyric starts live in data/lyrics.json).
// m = measured (whisper word onset in work/saikai.wav.whisper.json, or the loudness curve in analysis.json)
// e = estimated by ear / by eye. Change times here only.
export const CUE = {
  // prologue
  threadIn: 1.0, // e  the thread starts to come down
  titleIn: 3.8, // e
  titleOut: 10.0, // e
  windStart: 13.0, // e  the thread starts winding into a ball
  windEnd: 26.6, // e
  endsMeet: 27.4, // e  the free end tucks back in: start and end touching

  // verse 1
  cradle: 30.3, // m  "When I was young and lost"
  showedUp: 37.34, // m  "showed"
  unlocked: 41.3, // m  "unlocked": the door begins to swing
  petals: 46.3, // m  "petals"
  unfold: 47.08, // m  "unfold"
  petals2: 52.8, // m  second "petals"
  nadeshikoLabel: 54.2, // e
  caring: 68.8, // m  "caring"
  bentoIn: 64.2, // e  cut from the walk to the bento
  innocence: 78.48, // m  "innocence"

  // chorus 1
  pain: 88.78, // m
  define: 89.82, // m
  past: 91.42, // m
  overcome: 93.24, // m  the thread starts to sew the cuts
  notSoBad: 97.98, // m  "not"
  withMe: 102.32, // m  "with"
  cherish: 103.34, // m
  sOn: 106.98, // m  "S"
  sayonara1: 108.68, // m  "sayonara": the cut
  saikaiGrow: 109.7, // e  S· grows back into SAIKAI
  playBack: 111.32, // m  "Let memories play back"

  // interlude
  sealIn: 117.6, // e
  fathersIn: 130.0, // e

  // verse 2
  stepUp: 145.88, // m  "step"
  world: 151.5, // e  ("the world and more"; whisper misheard this line)
  rather: 160.82, // m  1 -> 2
  spend: 162.72, // m  2 -> 4
  limited: 164.94, // m  4 -> 16
  together: 167.36, // m  the strands gather into candies
  protection: 171.58, // m
  enough: 176.54, // m  the hand clenches
  fill: 181.56, // m
  emptyCup: 183.46, // m
  questioned: 190.5, // m
  aLot: 194.3, // m

  // bridge
  firstDraw: 202.34, // m  loudness re-enters on the beat after the quiet bar: the first slash

  // father's voice
  whatDoIKnow: 223.7, // m  "do"
  howCan: 226.5, // m
  neverHad: 229.74, // m
  allIKnow: 231.38, // m
  thriving: 236.38, // m  1 -> 2 -> 4 -> 16
  water: 241.68, // m
  every: 243.34, // m
  drop: 243.96, // m
  blood: 245.38, // m
  have: 248.74, // m

  // last chorus
  sacrifice: 252.36, // m
  absence: 256.12, // m
  veryBest: 261.6, // m  the pinkies hook
  believeMe: 265.52, // m  the thread ties round them
  reunion: 266.9, // m  "Our threads in red can never be cut"
  sayonara2: 272.28, // m  见 is cut
  saikai2: 272.9, // e  会 grows in its place
  forgive: 276.44, // m  phrase 1 lights
  me: 277.04, // m  phrase 2
  atLast: 277.88, // m  phrase 3
  sheathed: 279.15, // e  the click

  // outro
  fistOpen: 282.0, // e
  fistOpened: 288.0, // e
  roofBurned: 297.0, // e
  bookClose: 303.4, // e
  ilyt: 308.7, // m  the last hit
  credits: 312.2, // e  (10-24 2nd look: the credits come before I.L.Y.T., which is last; 10-25 after the thanks line)
  fadeOut: 322.3, // e
};

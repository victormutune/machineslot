// Symbols
import sym7 from "./symbols/Yellowcard_transparent.png";
import symA from "./symbols/A.png";
import symBoot from "./symbols/Boot.png";
import symFlag from "./symbols/FLAG.png";
import symFootball from "./symbols/FOOTBALL.png";
import symJ from "./symbols/Armband_transparent.png";
import symK from "./symbols/K.png";
import symQ from "./symbols/Gloves_transparent.png";
import symTrophy from "./symbols/Trophy.png";
import symWhistle from "./symbols/Whistle.png";

// Theme
import background from "./theme/background1.png";
import frame from "./theme/frame_final.png";

export const SYMBOLS = [
  { id: 0, image: sym7, value: 100, name: "Yellowcard" },
  { id: 1, image: symA, value: 50, name: "A" },
  { id: 2, image: symBoot, value: 20, name: "Boot" },
  { id: 3, image: symFlag, value: 15, name: "Flag" },
  { id: 4, image: symFootball, value: 10, name: "Football" },
  { id: 5, image: symJ, value: 5, name: "Armband" },
  { id: 6, image: symK, value: 60, name: "K" },
  { id: 7, image: symQ, value: 40, name: "Glove" },
  { id: 8, image: symTrophy, value: 80, name: "Trophy" },
  { id: 9, image: symWhistle, value: 25, name: "Whistle" },
];

// Per-Reel Strips (5 separate reels)
// Reel 1: Targeted mix (User request: "3 k 2 flag etc") -> More K (6) and Flag (3)
// Scatter (4) is kept rare across all reels.

const REEL_1 = [
  6, 3, 6, 3, 1, 9, 2, 0, 7, 5, // High K(6) and Flag(3)
  6, 2, 1, 9, 7, 0, 8, 5, 2, 9,
  3, 6, 1, 7, 0, 8, 2, 5, 9, 1,
  6, 3, 2, 7, 9, 0, 1, 5, 8, 2,
  3, 6, 9, 1, 7, 2, 0, 5, 8, 1,
  4, 6, 3, 1, 2, 9, 0, 7, 5, 8  // 1 Scatter
];

const REEL_2 = [
  1, 9, 2, 8, 0, 7, 5, 6, 3, 2,
  7, 0, 9, 1, 5, 8, 2, 6, 3, 0,
  9, 2, 1, 7, 5, 0, 8, 6, 3, 9,
  2, 7, 0, 1, 5, 8, 9, 6, 3, 2,
  1, 9, 7, 0, 5, 2, 8, 6, 3, 1,
  4, 0, 2, 7, 9, 1, 5, 8, 6, 3
];

const REEL_3 = [
  8, 0, 6, 2, 9, 1, 7, 3, 5, 0,
  2, 9, 1, 7, 5, 8, 6, 3, 0, 2,
  9, 1, 7, 5, 0, 8, 6, 3, 2, 9,
  0, 2, 7, 1, 5, 9, 8, 6, 3, 0,
  1, 7, 9, 2, 5, 8, 0, 6, 3, 1,
  4, 2, 0, 7, 9, 1, 5, 8, 6, 3
];

const REEL_4 = [
  5, 3, 7, 1, 9, 2, 0, 8, 6, 3,
  7, 1, 9, 2, 0, 8, 6, 5, 3, 7,
  1, 9, 2, 0, 8, 6, 5, 3, 7, 1,
  9, 2, 0, 8, 6, 5, 3, 7, 1, 9,
  2, 0, 8, 6, 5, 3, 7, 1, 9, 2,
  4, 8, 0, 6, 2, 9, 1, 7, 3, 5
];

const REEL_5 = [
  2, 7, 9, 1, 5, 0, 8, 6, 3, 2,
  7, 9, 1, 5, 0, 8, 6, 3, 2, 7,
  9, 1, 5, 0, 8, 6, 3, 2, 7, 9,
  1, 5, 0, 8, 6, 3, 2, 7, 9, 1,
  5, 0, 8, 6, 3, 2, 7, 9, 1, 5,
  4, 6, 8, 0, 2, 7, 9, 1, 5, 3
];

export const REEL_STRIPS = [REEL_1, REEL_2, REEL_3, REEL_4, REEL_5];

// Bonus Strips - Richer winning potential
// Keeping similar structure but maybe more high value symbols (0, 6, 8)
const BONUS_REEL_1 = [...REEL_1].map(s => (s === 1 || s === 9) ? 0 : s); // Replace some low with high
const BONUS_REEL_2 = [...REEL_2].map(s => (s === 3 || s === 5) ? 6 : s);
const BONUS_REEL_3 = [...REEL_3].map(s => (s === 2 || s === 7) ? 8 : s);
const BONUS_REEL_4 = [...REEL_4].map(s => (s === 1 || s === 9) ? 0 : s);
const BONUS_REEL_5 = [...REEL_5].map(s => (s === 3 || s === 5) ? 6 : s);

export const BONUS_REEL_STRIPS = [BONUS_REEL_1, BONUS_REEL_2, BONUS_REEL_3, BONUS_REEL_4, BONUS_REEL_5];


export const ASSETS = {
  background,
  frame,
};

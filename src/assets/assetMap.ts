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
  // High Value Symbols - ADJUSTED ITERATION 5
  { 
    id: 0, 
    image: sym7, 
    name: "Yellowcard",
    payouts: { 3: 15, 4: 90, 5: 450 } 
  },
  { 
    id: 4, 
    image: symFootball, 
    name: "Football",
    payouts: { 3: 0, 4: 0, 5: 0 } 
  },
  { 
    id: 3, 
    image: symFlag, 
    name: "Flag",
    payouts: { 3: 5, 4: 25, 5: 100 } 
  },
  { 
    id: 2, 
    image: symBoot, 
    name: "Boot",
    payouts: { 3: 4, 4: 20, 5: 80 } 
  },
  { 
    id: 8, 
    image: symTrophy, 
    name: "Trophy",
    payouts: { 3: 2.8, 4: 14, 5: 55 } 
  },
  { 
    id: 7, 
    image: symQ, 
    name: "Glove",
    payouts: { 3: 1.8, 4: 9, 5: 35 } 
  },
  
  // Low Value Symbols - FINE TUNED
  { 
    id: 6, 
    image: symK, 
    name: "K",
    payouts: { 3: 0.7, 4: 4.5, 5: 18 } 
  },
  { 
    id: 1, 
    image: symA, 
    name: "A",
    payouts: { 3: 0.7, 4: 4.5, 5: 18 } 
  },
  { 
    id: 5, 
    image: symJ, 
    name: "Armband",
    payouts: { 3: 0.35, 4: 2.2, 5: 9 } 
  },
  { 
    id: 9, 
    image: symWhistle, 
    name: "Whistle",
    payouts: { 3: 0.35, 4: 2.2, 5: 9 } 
  },
];

// Per-Reel Strips (5 separate reels)
// Reel 1: Targeted mix (High Frequency Lows)

const REEL_1 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, // 12 Lows
  2, 6, 3, 1, 7, 5, 0, 9, 8, // Mixed
  4, 5, 9, 6, 1, 1, 2, 2, 
  9, 6, 7, 5, 3, 1, 0, 8, 
  1, 5, 5, 6, 6, 9, 9, 4,
  2, 6, 3, 1, 7, 5, 8, 8, 0  
];

const REEL_2 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, // Matching 12 Lows
  2, 6, 3, 1, 7, 5, 0, 9, 8,
  4, 5, 9, 6, 1, 1, 2, 2,
  9, 6, 7, 5, 3, 1, 0, 8,
  1, 5, 5, 6, 6, 9, 9, 7, 
  2, 6, 3, 1, 7, 5, 8, 8, 0
];

const REEL_3 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, // Matching 12 Lows
  2, 6, 3, 1, 7, 5, 0, 9, 8,
  5, 5, 9, 6, 1, 1, 2, 2, 4,
  9, 6, 7, 5, 3, 1, 0, 8,
  1, 5, 5, 6, 6, 9, 9, 7,
  2, 6, 3, 1, 7, 5, 8, 8, 0
];

const REEL_4 = [
  6, 6, 6, 1, 1, 1, 5, 5, 5, 9, 9, 9, 
  2, 2, 3, 3, 7, 7, 0, 8, 8,
  5, 5, 6, 6, 1, 1, 2, 2, 7,
  9, 9, 7, 7, 3, 3, 0, 8, 8,
  1, 1, 5, 5, 6, 6, 9, 9, 4,
  2, 2, 3, 3, 7, 7, 8, 8, 0
];

const REEL_5 = [
  6, 6, 6, 1, 1, 1, 5, 5, 5, 9, 9, 9, 
  2, 2, 3, 3, 7, 7, 0, 8, 8,
  5, 5, 6, 6, 1, 1, 2, 2, 7,
  9, 9, 7, 7, 3, 3, 0, 8, 8,
  1, 1, 5, 5, 6, 6, 9, 9, 4, // Scatter
  2, 2, 3, 3, 7, 7, 8, 8, 0
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

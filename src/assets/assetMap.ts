// Symbols
import symA from "./symbols/A_1.png";
import symBoot from "./symbols/Boot.png";
import symFlag from "./symbols/flag_1.png";
import symJ from "./symbols/J_1.png";
import symK from "./symbols/K3.png";
import symQ from "./symbols/Q2.png";
import symTrophy from "./symbols/trophy_1.png";
import symWhistle from "./symbols/whistle_1.png";
import symBonus from "./symbols/Bonus.png";
import sym10 from "./symbols/1O.png";
import symFootball from "./symbols/ball1.png";
import symArmband from "./symbols/Armband_transparent.png";
import symGloves from "./symbols/Gloves_transparent.png";

// Theme
import background from "./theme/BACKGROUND.png";
import frame from "./theme/frame_design.png";
import Back from "./theme/Back.png";
import BACKG from "./theme/BACKG.png";
import BAKI from "./theme/BAKI.png";
import stone from "./theme/stone.png";
// Audio
import bgMusic from "./mascot/lab_slots_bgm.mp3";
import spinStartSound from "./mascot/spin_start.mp3";
import spinStopSound from "./mascot/spin_stop.mp3";
import bonusTriggerSound from "./mascot/bonus_sound.mp3";
import afterVideo from "./mascot/after.mp4";

// Mascot
import mos1 from "./mascot/mos1.png";
import mos2 from "./mascot/mos2.png";
import mos3 from "./mascot/mos3.png";
import mos4 from "./mascot/mos4.png";

export const SYMBOLS = [
// ... (omitting symbols array replacement for brevity, maintaining original content)
  // High Value Symbols

  { 
    id: 4, 
    image: symBonus, 
    name: "Bonus",
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
    id: 11,
    image: symFootball,
    name: "Football",
    payouts: { 3: 2, 4: 8, 5: 30, 6: 150 }
  },
  { 
    id: 5, 
    image: symArmband, 
    name: "Armband",
    payouts: { 3: 1, 4: 4, 5: 15, 6: 75 } 
  },
  { 
    id: 9, 
    image: symWhistle, 
    name: "Whistle",
    payouts: { 3: 1.2, 4: 5, 5: 20, 6: 100 } 
  },
  { 
    id: 7, 
    image: symGloves, 
    name: "Gloves",
    payouts: { 3: 1.5, 4: 6, 5: 25, 6: 125 } 
  },
  
  // Low Value Symbols
  {
    id: 10,
    image: sym10,
    name: "10",
    payouts: { 3: 0.10, 4: 0.50, 5: 2.50, 6: 10 }
  },
  { 
    id: 12, 
    image: symJ, 
    name: "J", 
    payouts: { 3: 0.10, 4: 0.50, 5: 2.50, 6: 10 } 
  },
  { 
    id: 13, 
    image: symQ, 
    name: "Q", 
    payouts: { 3: 0.20, 4: 0.80, 5: 4, 6: 12 } 
  },
  { 
    id: 6, 
    image: symK, 
    name: "K",
    payouts: { 3: 0.20, 4: 0.80, 5: 4, 6: 15 } 
  },
  { 
    id: 1, 
    image: symA, 
    name: "A",
    payouts: { 3: 0.30, 4: 1.20, 5: 6, 6: 25 } 
  }

];

// Per-Reel Strips (5 separate reels)
// OPTIMIZED: Reels 4 & 5 now have HEAVY low symbol stacks to allow 4x/5x wins

const REEL_1 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 10, 5, 9, // 12 Lows
  2, 6, 3, 1, 13, 5, 3, 9, 8, 11, // Mixed
  4, 5, 9, 6, 10, 1, 2, 2, 11,
  9, 6, 13, 5, 3, 1, 3, 8, 11,
  1, 5, 5, 6, 6, 9, 9, 4,
  2, 6, 3, 1, 13, 5, 8, 8, 3  
];

const REEL_2 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 1, 5, 9, 
  2, 6, 3, 1, 13, 5, 3, 9, 8, 11,
  4, 5, 9, 6, 1, 10, 2, 2, 11,
  9, 6, 13, 5, 3, 1, 3, 8, 11,
  1, 5, 5, 6, 6, 9, 9, 13, 
  2, 6, 3, 1, 13, 5, 8, 8, 3
];

const REEL_3 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, 
  2, 6, 3, 10, 13, 5, 3, 9, 8, 11,
  5, 5, 9, 6, 10, 1, 2, 2, 4, 11,
  9, 6, 13, 5, 3, 10, 3, 8, 11,
  1, 5, 5, 6, 6, 9, 9, 13,
  2, 6, 3, 10, 13, 5, 8, 8, 3
];

const REEL_4 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 1, 5, 9, // Matching Reels 1-3
  2, 2, 3, 3, 13, 13, 3, 8, 8, 11, 11,
  5, 5, 6, 6, 10, 10, 2, 2, 13, 11, 11,
  9, 9, 13, 13, 3, 3, 3, 8, 8, 11, 11,
  1, 10, 5, 5, 6, 6, 9, 9, 4,
  2, 2, 3, 3, 13, 13, 8, 8, 3
];

const REEL_5 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, // Matching Reels 1-3
  2, 2, 3, 3, 13, 13, 3, 8, 8, 11, 11,
  5, 5, 6, 6, 10, 10, 2, 2, 13, 11, 11,
  9, 9, 13, 13, 3, 3, 3, 8, 8, 11, 11,
  1, 10, 5, 5, 6, 6, 9, 9, 4, // Scatter
  2, 2, 3, 3, 13, 13, 8, 8, 3
];

const REEL_6 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 10, 5, 9,
  2, 2, 3, 3, 13, 13, 3, 8, 8, 11, 11,
  5, 5, 6, 6, 10, 10, 2, 2, 13, 11, 11,
  9, 9, 13, 13, 3, 3, 3, 8, 8, 11, 11,
  10, 10, 5, 5, 6, 6, 9, 9, 4, // Scatter
  2, 2, 3, 3, 13, 13, 8, 8, 3
];

export const REEL_STRIPS = [REEL_1, REEL_2, REEL_3, REEL_4, REEL_5, REEL_6];

// Bonus Strips - Richer winning potential
// Keeping similar structure but maybe more high value symbols (0, 6, 8)
const BONUS_REEL_1 = [...REEL_1].map(s => (s === 1 || s === 9) ? 3 : s); // Replace some low with high
const BONUS_REEL_2 = [...REEL_2].map(s => (s === 3 || s === 5) ? 6 : s);
const BONUS_REEL_3 = [...REEL_3].map(s => (s === 2 || s === 7) ? 8 : s);
const BONUS_REEL_4 = [...REEL_4].map(s => (s === 1 || s === 9) ? 3 : s);
const BONUS_REEL_5 = [...REEL_5].map(s => (s === 3 || s === 5) ? 6 : s);
const BONUS_REEL_6 = [...REEL_6].map(s => (s === 2 || s === 7) ? 8 : s);

export const BONUS_REEL_STRIPS = [BONUS_REEL_1, BONUS_REEL_2, BONUS_REEL_3, BONUS_REEL_4, BONUS_REEL_5, BONUS_REEL_6];


export const ASSETS = {
  background,
  BAKI,
  stone,
  Back,
  BACKG,
  frame,
  mascot: [mos1, mos2, mos3, mos4],
  audio: {
    bgMusic,
    spinStart: spinStartSound,
    spinStop: spinStopSound,
    bonusTrigger: bonusTriggerSound
  },
  video: {
    afterBonus: afterVideo
  }
};

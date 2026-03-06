// Symbols
import sym7 from "./symbols/7 (1).png";
import symA from "./symbols/A (1).png";
import symBoot from "./symbols/boot 2.png";
import symFlag from "./symbols/flag (1).png";
import symFootball from "./symbols/FOOTBALL.png";
import symJ from "./symbols/J (1).png";
import symK from "./symbols/K3.png";
import symQ from "./symbols/Q (1).png";
import symTrophy from "./symbols/trophy (1).png";
import symWhistle from "./symbols/whistle (1).png";
import symBonus from "./symbols/Bonus.png";
import sym10 from "./symbols/1O.png";

// Theme
import background from "./theme/BACKGROUND.png";
import frame from "./theme/Medieval slot machine frame design.png";
import Back from "./theme/Back.png";
import BACKG from "./theme/BACKG.png";
import BAKI from "./theme/BAKI.png";
import stone from "./theme/stone.png";
// Audio
import bgMusic from "./mascot/lab_slots_bgm.mp3";
import spinStartSound from "./mascot/spin_start.mp3";
import spinStopSound from "./mascot/spin_stop.mp3";
import bonusTriggerSound from "./mascot/bonus sound.mp3";

// Mascot
import mos1 from "./mascot/mos1.png";
import mos2 from "./mascot/mos2.png";
import mos3 from "./mascot/mos3.png";
import mos4 from "./mascot/mos4.png";

export const SYMBOLS = [
// ... (omitting symbols array replacement for brevity, maintaining original content)
  // High Value Symbols
  { 
    id: 0, 
    image: sym7, 
    name: "Yellowcard",
    payouts: { 3: 15, 4: 90, 5: 450 } 
  },
  { 
    id: 4, 
    image: symFootball, 
    bonusImage: symBonus,
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
  
  // Low Value Symbols - OPTIMIZED FOR 4x/5x FREQUENCY
  { 
    id: 6, 
    image: symK, 
    name: "K",
    payouts: { 3: 0.6, 4: 4.2, 5: 17 } // 4x Reduced to 4.2 to balance RTP
  },
  { 
    id: 1, 
    image: symA, 
    name: "A",
    payouts: { 3: 0.6, 4: 4.2, 5: 17 } // 4x Reduced to 4.2
  },
  { 
    id: 5, 
    image: symJ, 
    name: "Armband",
    payouts: { 3: 0.35, 4: 2.2, 5: 8.5 } 
  },
  { 
    id: 9, 
    image: symWhistle, 
    name: "Whistle",
    payouts: { 3: 0.35, 4: 2.2, 5: 8.5 } 
  },
  {
    id:10,
    image:sym10,
    name:"10",
    payouts:{3:0.2,4:1.5,5:6}
  }

];

// Per-Reel Strips (5 separate reels)
// OPTIMIZED: Reels 4 & 5 now have HEAVY low symbol stacks to allow 4x/5x wins

const REEL_1 = [
  6, 10, 5, 9, 6, 10, 5, 9, 6, 10, 5, 9, // 12 Lows
  2, 6, 3, 1, 7, 5, 0, 9, 8, // Mixed
  4, 5, 9, 6, 10, 1, 2, 2, 
  9, 6, 7, 5, 3, 1, 0, 8, 
  1, 5, 5, 6, 6, 9, 9, 4,
  2, 6, 3, 1, 7, 5, 8, 8, 0  
];

const REEL_2 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 1, 5, 9, 
  2, 6, 3, 1, 7, 5, 0, 9, 8,
  4, 5, 9, 6, 1, 10, 2, 2,
  9, 6, 7, 5, 3, 1, 0, 8,
  1, 5, 5, 6, 6, 9, 9, 7, 
  2, 6, 3, 1, 7, 5, 8, 8, 0
];

const REEL_3 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, 
  2, 6, 3, 10, 7, 5, 0, 9, 8,
  5, 5, 9, 6, 10, 1, 2, 2, 4,
  9, 6, 7, 5, 3, 10, 0, 8,
  1, 5, 5, 6, 6, 9, 9, 7,
  2, 6, 3, 10, 7, 5, 8, 8, 0
];

const REEL_4 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 1, 5, 9, // Matching Reels 1-3
  2, 2, 3, 3, 7, 7, 0, 8, 8,
  5, 5, 6, 6, 10, 10, 2, 2, 7,
  9, 9, 7, 7, 3, 3, 0, 8, 8,
  1, 10, 5, 5, 6, 6, 9, 9, 4,
  2, 2, 3, 3, 7, 7, 8, 8, 0
];

const REEL_5 = [
  6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9, // Matching Reels 1-3
  2, 2, 3, 3, 7, 7, 0, 8, 8,
  5, 5, 6, 6, 10, 10, 2, 2, 7,
  9, 9, 7, 7, 3, 3, 0, 8, 8,
  1, 10, 5, 5, 6, 6, 9, 9, 4, // Scatter
  2, 2, 3, 3, 7, 7, 8, 8, 0
];

const REEL_6 = [
  6, 1, 5, 9, 6, 10, 5, 9, 6, 10, 5, 9,
  2, 2, 3, 3, 7, 7, 0, 8, 8,
  5, 5, 6, 6, 10, 10, 2, 2, 7,
  9, 9, 7, 7, 3, 3, 0, 8, 8,
  10, 10, 5, 5, 6, 6, 9, 9, 4, // Scatter
  2, 2, 3, 3, 7, 7, 8, 8, 0
];

export const REEL_STRIPS = [REEL_1, REEL_2, REEL_3, REEL_4, REEL_5, REEL_6];

// Bonus Strips - Richer winning potential
// Keeping similar structure but maybe more high value symbols (0, 6, 8)
const BONUS_REEL_1 = [...REEL_1].map(s => (s === 1 || s === 9) ? 0 : s); // Replace some low with high
const BONUS_REEL_2 = [...REEL_2].map(s => (s === 3 || s === 5) ? 6 : s);
const BONUS_REEL_3 = [...REEL_3].map(s => (s === 2 || s === 7) ? 8 : s);
const BONUS_REEL_4 = [...REEL_4].map(s => (s === 1 || s === 9) ? 0 : s);
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
  }
};

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

// Weighted Reel Strip (Total 60 positions)
// Designed to make Footballs (Scatter) rare (~1 in 200 spins for 3+) and Wins balanced.
export const REEL_STRIP = [
  4, 0, 8, 6, 1, 7, 9, 2, 3, 5, // 0-9
  5, 3, 2, 9, 7, 1, 6, 8, 0, 3, // 10-19
  5, 3, 2, 9, 7, 1, 6, 8, 5, 3, // 20-29
  2, 9, 7, 1, 6, 5, 3, 2, 9, 7, // 30-39
  1, 5, 3, 2, 9, 4, 5, 3, 2, 5, // 40-49
  3, 5, 7, 5, 3, 5, 3, 5, 5, 5  // 50-59 (Reduced scatters to 2)
];

// Bonus Reel Strip - Higher chance of High Value symbols (Yellowcard, Trophy, K) and Scatters
export const BONUS_REEL_STRIP = [
  4, 8, 6, 0, 8, 6, 0, 4, 8, 6, // Heavy on high value
  0, 1, 7, 9, 2, 3, 5, 4, 8, 6, // Mix
  4, 0, 8, 6, 1, 7, 9, 4, 8, 6, // More high value
  0, 1, 7, 9, 2, 3, 5, 4, 0, 8, // Mix
  6, 4, 8, 6, 0, 1, 7, 9, 2, 3, // High value end
  5, 4, 8, 6, 0, 1, 7, 9, 4, 8  // High value end
];

export const ASSETS = {
  background,
  frame,
};

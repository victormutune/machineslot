"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSETS = exports.BONUS_REEL_STRIPS = exports.REEL_STRIPS = exports.SYMBOLS = void 0;
// Symbols - MOCKED IMAGES
const sym7 = "sym7";
const symA = "symA";
const symBoot = "symBoot";
const symFlag = "symFlag";
const symFootball = "symFootball";
const symJ = "symJ";
const symK = "symK";
const symQ = "symQ";
const symTrophy = "symTrophy";
const symWhistle = "symWhistle";
// Theme - MOCKED IMAGES
const background = "background";
const frame = "frame";
exports.SYMBOLS = [
    // High Value Symbols
    {
        id: 0,
        image: sym7,
        name: "Yellowcard",
        payouts: { 3: 5, 4: 20, 5: 100 } // Wild/Highest
    },
    {
        id: 4,
        image: symFootball,
        name: "Football",
        payouts: { 3: 1, 4: 3, 5: 5 } // Matches Image Row 1 (3.00, 5.00)
    },
    {
        id: 3,
        image: symFlag,
        name: "Flag",
        payouts: { 3: 0.8, 4: 2, 5: 3 } // Matches Image Row 2 (2.00, 3.00)
    },
    {
        id: 2,
        image: symBoot,
        name: "Boot",
        payouts: { 3: 0.6, 4: 1.5, 5: 2 } // Matches Image Row 3 (1.50, 2.00)
    },
    {
        id: 8,
        image: symTrophy,
        name: "Trophy",
        payouts: { 3: 0.4, 4: 1, 5: 1.4 } // Matches Image Row 4 (1.00, 1.40)
    },
    {
        id: 7,
        image: symQ,
        name: "Glove",
        payouts: { 3: 0.2, 4: 0.6, 5: 0.8 } // Matches Image Row 5 (0.60, 0.80)
    },
    // Low Value Symbols (Paying less than Glove as requested)
    {
        id: 6,
        image: symK,
        name: "K",
        payouts: { 3: 0.15, 4: 0.4, 5: 0.6 } // Less than Glove
    },
    {
        id: 1,
        image: symA,
        name: "A",
        payouts: { 3: 0.15, 4: 0.4, 5: 0.6 } // Less than Glove
    },
    {
        id: 5,
        image: symJ,
        name: "Armband",
        payouts: { 3: 0.1, 4: 0.2, 5: 0.4 } // Lowest
    },
    {
        id: 9,
        image: symWhistle,
        name: "Whistle",
        payouts: { 3: 0.1, 4: 0.2, 5: 0.4 } // Lowest
    },
];
// Per-Reel Strips (5 separate reels)
// Reel 1: Targeted mix (User request: "3 k 2 flag etc") -> More K (6) and Flag (3)
// Scatter (4) is kept rare across all reels.
// Per-Reel Strips (5 separate reels)
// OPTIMIZED for 5-Symbol Wins: Stacks of symbols to allow lines to complete.
const REEL_1 = [
    6, 6, 6, 1, 1, 1, 5, 5, 5, 9, 9, 9, // Low Stacks (K, A, J, Whistle) - Heavy here
    2, 2, 3, 3, 7, 7, 0, 8, 8, // Mid/High Stacks
    4, 5, 5, 6, 6, 1, 1, 2, 2,
    9, 9, 7, 7, 3, 3, 0, 8, 8,
    1, 1, 5, 5, 6, 6, 9, 9, 4, // 1 Scatter here only
    2, 2, 3, 3, 7, 7, 8, 8, 0
];
const REEL_2 = [
    6, 6, 6, 1, 1, 1, 5, 5, 5, 9, 9, 9, // Matching Low Stacks for 5-wins
    2, 2, 3, 3, 7, 7, 0, 8, 8,
    4, 5, 5, 6, 6, 1, 1, 2, 2, // 1 Scatter
    9, 9, 7, 7, 3, 3, 0, 8, 8,
    1, 1, 5, 5, 6, 6, 9, 9, 7,
    2, 2, 3, 3, 7, 7, 8, 8, 0
];
const REEL_3 = [
    6, 6, 6, 1, 1, 1, 5, 5, 5, 9, 9, 9, // Continued matching
    2, 2, 3, 3, 7, 7, 0, 8, 8,
    5, 5, 6, 6, 1, 1, 2, 2, 4, // Scatter moved slightly
    9, 9, 7, 7, 3, 3, 0, 8, 8,
    1, 1, 5, 5, 6, 6, 9, 9, 7,
    2, 2, 3, 3, 7, 7, 8, 8, 0
];
const REEL_4 = [
    6, 6, 6, 1, 1, 1, 5, 5, 5, 9, 9, 9,
    2, 2, 3, 3, 7, 7, 0, 8, 8,
    5, 5, 6, 6, 1, 1, 2, 2, 7,
    9, 9, 7, 7, 3, 3, 0, 8, 8,
    1, 1, 5, 5, 6, 6, 9, 9, 4, // Scatter here
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
exports.REEL_STRIPS = [REEL_1, REEL_2, REEL_3, REEL_4, REEL_5];
// Bonus Strips - Richer winning potential
// Keeping similar structure but maybe more high value symbols (0, 6, 8)
const BONUS_REEL_1 = [...REEL_1].map(s => (s === 1 || s === 9) ? 0 : s); // Replace some low with high
const BONUS_REEL_2 = [...REEL_2].map(s => (s === 3 || s === 5) ? 6 : s);
const BONUS_REEL_3 = [...REEL_3].map(s => (s === 2 || s === 7) ? 8 : s);
const BONUS_REEL_4 = [...REEL_4].map(s => (s === 1 || s === 9) ? 0 : s);
const BONUS_REEL_5 = [...REEL_5].map(s => (s === 3 || s === 5) ? 6 : s);
exports.BONUS_REEL_STRIPS = [BONUS_REEL_1, BONUS_REEL_2, BONUS_REEL_3, BONUS_REEL_4, BONUS_REEL_5];
exports.ASSETS = {
    background,
    frame,
};

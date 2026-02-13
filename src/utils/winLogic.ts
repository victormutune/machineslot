import { SYMBOLS } from '../assets/assetMap';

/* ================= TYPES ================= */

export interface WinResult {
  totalWin: number;
  winningLines: WinningLine[];
  freeSpins: number;
  adjustedStopIndices: number[]; // ✅ ADDED - Return actual indices used
  winningPositions: WinningPosition[][]; // ✅ ADDED - Per-reel winning positions
}

export interface WinningLine {
  symbolId: number;
  symbolName: string;
  count: number;
  winAmount: number;
  ways: number;
  path?: { col: number; row: number }[];
}

export interface WinningPosition {
  col: number;
  row: number;
}

/* ================= CONSTANTS ================= */

const ROWS = 4;
const COLS = 5;

/* ================= PAYLINES (16) ================= */

const PAYLINES: number[][] = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3],
  [0, 1, 2, 1, 0],
  [3, 2, 1, 2, 3],
  [1, 2, 3, 2, 1],
  [2, 1, 0, 1, 2],
  [0, 1, 0, 1, 0],
  [1, 0, 1, 0, 1],
  [2, 3, 2, 3, 2],
  [3, 2, 3, 2, 3],
  [0, 1, 2, 3, 2],
  [2, 1, 2, 1, 2],
  [1, 2, 1, 2, 1],
  [2, 1, 2, 1, 2],
];

/* ================= GRID ================= */
/* grid[col][row] = symbol.id */

/* ================= GRID ================= */
/* grid[col][row] = symbol.id */

export const getVisibleGrid = (
  stopIndices: number[],
  reelStrips: number[][]
): number[][] => {
  const grid: number[][] = [];

  for (let col = 0; col < COLS; col++) {
    const reel: number[] = [];
    const strip = reelStrips[col];
    for (let row = 0; row < ROWS; row++) {
      const index = (stopIndices[col] + row) % strip.length;
      reel.push(strip[index]);
    }
    grid.push(reel);
  }

  return grid;
};

/* ================= CORE CALCULATION ================= */

const calculateOnce = (
  stopIndices: number[],
  bet: number,
  reelStrips: number[][]
): WinResult => {

  const grid = getVisibleGrid(stopIndices, reelStrips);
  const winningLines: WinningLine[] = [];
  const allWinningPositions = new Set<string>(); // ✅ ADDED - Track all winning positions

  let totalWin = 0;
  let freeSpins = 0;
  const lineBet = bet / PAYLINES.length;

  // Scatter symbol
  const SCATTER = SYMBOLS.find(s =>
    s.name.toLowerCase().includes('football')
  );
  const SCATTER_ID = SCATTER?.id ?? -1;

  /* ===== SCATTER COUNT (ANYWHERE) ===== */

  let scatterCount = 0;
  const scatterPositions: WinningPosition[] = []; // ✅ ADDED
  
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (grid[c][r] === SCATTER_ID) {
        scatterCount++;
        scatterPositions.push({ col: c, row: r }); // ✅ ADDED
        allWinningPositions.add(`${c},${r}`); // ✅ ADDED
      }
    }
  }

  if (scatterCount >= 3) {
    const scatterWin =
      scatterCount === 3 ? bet * 2 :
      scatterCount === 4 ? bet * 5 :
      bet * 10;

    freeSpins =
      scatterCount === 3 ? 8 :
      scatterCount === 4 ? 12 :
      20;

    totalWin += scatterWin;

    winningLines.push({
      symbolId: SCATTER_ID,
      symbolName: SCATTER?.name ?? 'Scatter',
      count: scatterCount,
      winAmount: scatterWin,
      ways: 1,
      path: scatterPositions // ✅ ADDED - Include scatter positions
    });
  }

  /* ===== PAYLINES ===== */

  PAYLINES.forEach(line => {
    const symbols = line.map((row, col) => grid[col][row]);
    const first = symbols[0];

    if (first === SCATTER_ID) return;

    let match = 1;
    for (let i = 1; i < COLS; i++) {
      if (symbols[i] === first) match++;
      else break;
    }

    if (match < 3) return;

    const symbol = SYMBOLS.find(s => s.id === first);
    if (!symbol) return;

    const multiplier =
      match === 3 ? 1 :
      match === 4 ? 2 :
      5;

    const winAmount = symbol.value * multiplier * lineBet;
    totalWin += winAmount;

    const path = line.slice(0, match).map((row, col) => ({ col, row }));
    
    // ✅ ADDED - Track winning positions
    path.forEach(pos => {
      allWinningPositions.add(`${pos.col},${pos.row}`);
    });

    winningLines.push({
      symbolId: symbol.id,
      symbolName: symbol.name,
      count: match,
      winAmount,
      ways: 1,
      path
    });
  });

  // ✅ ADDED - Convert winning positions to per-reel format
  const winningPositions: WinningPosition[][] = [];
  for (let col = 0; col < COLS; col++) {
    const colWinners: WinningPosition[] = [];
    for (let row = 0; row < ROWS; row++) {
      if (allWinningPositions.has(`${col},${row}`)) {
        colWinners.push({ col, row });
      }
    }
    winningPositions.push(colWinners);
  }

  // ✅ FIXED - Return with new fields
  return { 
    totalWin, 
    winningLines, 
    freeSpins,
    adjustedStopIndices: stopIndices,
    winningPositions 
  };
};

/* ================= HIT CONTROL (ANTI-DRY SPINS) ================= */

export const calculateWin = (
  stopIndices: number[],
  bet: number,
  reelStrips: number[][]
): WinResult => {

  let attempts = 0;
  let result: WinResult;
  let finalStopIndices = stopIndices; // ✅ ADDED - Track which indices are used

  do {
    const adjustedStops =
      attempts === 0
        ? stopIndices
        : stopIndices.map((s, col) => {
            const stripLength = reelStrips[col].length;
            return (s + Math.floor(Math.random() * 3) + 1) % stripLength;
          });

    result = calculateOnce(adjustedStops, bet, reelStrips);
    finalStopIndices = adjustedStops; // ✅ ADDED - Save the indices that were used
    attempts++;

  } while (result.totalWin === 0 && attempts < 3); // 🔥 soft guarantee

  // ✅ FIXED - Return with actual stop indices used
  return {
    ...result,
    adjustedStopIndices: finalStopIndices
  };
};
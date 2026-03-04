import { SYMBOLS } from '../assets/assetMap';

/* ================= TYPES ================= */

export interface WinResult {
  totalWin: number;
  winningLines: WinningLine[];
  freeSpins: number;
  adjustedStopIndices: number[];
  winningPositions: WinningPosition[][];
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
const COLS = 6;

/* ================= PAYLINES (16) ================= */

const PAYLINES: number[][] = [
  [0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3],
  [0, 1, 2, 1, 0, 1],
  [3, 2, 1, 2, 3, 2],
  [1, 2, 3, 2, 1, 2],
  [2, 1, 0, 1, 2, 1],
  [0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0],
  [2, 3, 2, 3, 2, 3],
  [3, 2, 3, 2, 3, 2],
  [0, 1, 2, 3, 2, 1],
  [3, 2, 1, 0, 1, 2],
  [1, 2, 1, 2, 1, 2],
  [2, 1, 2, 1, 2, 1],
  [0, 0, 1, 2, 1, 0],
  [3, 3, 2, 1, 2, 3],
  [1, 1, 2, 3, 2, 1],
  [2, 2, 1, 0, 1, 2],
];

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
  reelStrips: number[][],
  isFreeSpin: boolean = false
): WinResult => {

  const grid = getVisibleGrid(stopIndices, reelStrips);
  const winningLines: WinningLine[] = [];
  const allWinningPositions = new Set<string>();

  let totalWin = 0;
  let freeSpins = 0;

  // Scatter symbol
  const SCATTER = SYMBOLS.find(s =>
    s.name.toLowerCase().includes('football')
  );
  const SCATTER_ID = SCATTER?.id ?? -1;

  /* ===== SCATTER COUNT (ANYWHERE) - ONLY IF NOT FREE SPIN ===== */
  if (!isFreeSpin) {
    let scatterCount = 0;
    const scatterPositions: WinningPosition[] = [];
    
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (grid[c][r] === SCATTER_ID) {
          scatterCount++;
          scatterPositions.push({ col: c, row: r });
        }
      }
    }

    if (scatterCount >= 3) {
      scatterPositions.forEach(pos => {
        allWinningPositions.add(`${pos.col},${pos.row}`);
      });

      const scatterWin = 0;

      freeSpins =
        scatterCount === 3 ? 8 :
        scatterCount === 4 ? 10 :
        12; // 5+ scatters = 12 spins

      totalWin += scatterWin;

      winningLines.push({
        symbolId: SCATTER_ID,
        symbolName: SCATTER?.name ?? 'Scatter',
        count: scatterCount,
        winAmount: scatterWin,
        ways: 1,
        // No path for scatters so PaylineOverlay doesn't draw a line
      });
    }
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

    // Extend symbol payouts to cover 6-of-a-kind if not defined
    // (uses 5-match payout as fallback)

    if (match < 3) return;

    const symbol = SYMBOLS.find(s => s.id === first);
    if (!symbol) return;

    // @ts-ignore — fall back to 5x payout * 2 for 6-of-a-kind when no explicit entry
    const payouts: Record<number, number> = (symbol as any).payouts ?? {};
    const payout = payouts[match] ?? (match === 6 ? (payouts[5] ?? 0) * 2 : 0);
    const winAmount = (payout || 0) * bet;
    totalWin += winAmount;

    const path = line.slice(0, match).map((row, col) => ({ col, row }));
    
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
  reelStrips: number[][],
  isFreeSpin: boolean = false,
  featureBuy: string = 'none'
): WinResult => {

  let attempts = 0;
  let result: WinResult;
  let finalStopIndices = [...stopIndices];
  
  // Scatter symbol
  const SCATTER = SYMBOLS.find(s =>
    s.name.toLowerCase().includes('football')
  );
  const SCATTER_ID = SCATTER?.id ?? -1;

  // If Free Kick or Extra Time, force 3 or 5 scatters respectively
  if (featureBuy === 'free_kick' || featureBuy === 'extra_time') {
    const requiredScatters = featureBuy === 'extra_time' ? 5 : 3;
    let placedScatters = 0;
    
    // Pick requiredScatters number of specific random columns to place scatters on
    const availableCols = [0, 1, 2, 3, 4, 5].sort(() => 0.5 - Math.random());
    const targetCols = availableCols.slice(0, requiredScatters);

    // Map each target column to a new stop index that will force a scatter into the view
    finalStopIndices = finalStopIndices.map((stopIdx, col) => {
      if (targetCols.includes(col)) {
        // Find all scatter indices on this reel strip
        const strip = reelStrips[col];
        const scatterIndices = strip
          .map((sym, idx) => (sym === SCATTER_ID ? idx : -1))
          .filter(idx => idx !== -1);
          
        if (scatterIndices.length > 0) {
           const targetIndex = scatterIndices[Math.floor(Math.random() * scatterIndices.length)];
           // We need stopIdx + rowOffset to equal targetIndex % stripLength, for rowOffset 0 to 3.
           const rowOffset = Math.floor(Math.random() * ROWS);
           placedScatters++;
           let newStopIdx = (targetIndex - rowOffset) % strip.length;
           if (newStopIdx < 0) newStopIdx += strip.length;
           return newStopIdx;
        }
      }
      return stopIdx; // Keep original random stop or try to modify if no scatter
    });
    
    return calculateOnce(finalStopIndices, bet, reelStrips, isFreeSpin);
  }

  // Regular Spin / Bonus Boost / Hit Control
  
  // If we have Bonus Boost, we give it up to 3 extra chances to land 3+ scatters.
  let bestResult: WinResult | null = null;
  let bestStopIndices: number[] = [];

  do {
    const adjustedStops =
      attempts === 0
        ? finalStopIndices
        : finalStopIndices.map((s, col) => {
            const stripLength = reelStrips[col].length;
            return (s + Math.floor(Math.random() * 3) + 1) % stripLength;
          });

    result = calculateOnce(adjustedStops, bet, reelStrips, isFreeSpin);
    finalStopIndices = adjustedStops;
    
    // Keep track of the best result in case we are doing Bonus Boost
    if (!bestResult || result.freeSpins > bestResult.freeSpins || (result.freeSpins === bestResult.freeSpins && result.totalWin > bestResult.totalWin)) {
        bestResult = result;
        bestStopIndices = [...finalStopIndices];
    }
    
    // If not bonus boost, stop on first win or after 3 dry spins.
    // If bonus boost, stop early if we hit free spins, otherwise use all 3 attempts.
    if (featureBuy !== 'bonus_boost' && result.totalWin > 0) {
        break;
    } else if (featureBuy === 'bonus_boost' && result.freeSpins > 0) {
        break;
    }

    attempts++;

  } while (attempts < 3);

  return {
    ...bestResult!,
    adjustedStopIndices: bestStopIndices
  };
};

import { SYMBOLS, REEL_STRIP } from '../assets/assetMap';

/* ================= TYPES ================= */

export interface WinResult {
  totalWin: number;
  winningLines: WinningLine[];
  freeSpins: number;
}

export interface WinningLine {
  symbolId: number;
  symbolName: string;
  count: number;
  winAmount: number;
  ways: number;
  path?: { col: number; row: number }[];
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
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 3, 1, 3, 1],
  [3, 1, 3, 1, 3],
];

/* ================= GRID ================= */
/* grid[col][row] = symbol.id */

export const getVisibleGrid = (
  stopIndices: number[],
  reelStrip: number[] = REEL_STRIP
): number[][] => {
  const grid: number[][] = [];

  for (let col = 0; col < COLS; col++) {
    const reel: number[] = [];
    for (let row = 0; row < ROWS; row++) {
      const index = (stopIndices[col] + row) % reelStrip.length;
      reel.push(reelStrip[index]);
    }
    grid.push(reel);
  }

  return grid;
};

/* ================= CORE CALCULATION ================= */

const calculateOnce = (
  stopIndices: number[],
  bet: number,
  reelStrip: number[]
): WinResult => {

  const grid = getVisibleGrid(stopIndices, reelStrip);
  const winningLines: WinningLine[] = [];

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
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (grid[c][r] === SCATTER_ID) scatterCount++;
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
      ways: 1
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

    winningLines.push({
      symbolId: symbol.id,
      symbolName: symbol.name,
      count: match,
      winAmount,
      ways: 1,
      path: line.slice(0, match).map((row, col) => ({ col, row }))
    });
  });

  return { totalWin, winningLines, freeSpins };
};

/* ================= HIT CONTROL (ANTI-DRY SPINS) ================= */

export const calculateWin = (
  stopIndices: number[],
  bet: number,
  reelStrip: number[] = REEL_STRIP
): WinResult => {

  let attempts = 0;
  let result: WinResult;

  do {
    const adjustedStops =
      attempts === 0
        ? stopIndices
        : stopIndices.map(
            s => (s + Math.floor(Math.random() * 3) + 1) % reelStrip.length
          );

    result = calculateOnce(adjustedStops, bet, reelStrip);
    attempts++;

  } while (result.totalWin === 0 && attempts < 3); // 🔥 soft guarantee

  return result;
};
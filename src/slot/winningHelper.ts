import type { WinResult } from './winLogic';

/**
 * Converts WinResult to per-reel boolean arrays indicating which rows are winners
 * Used by Reel component to highlight winning symbols
 */
export const getReelWinningRows = (
  winResult: WinResult | null,
  cols: number = 5,
  rows: number = 4
): boolean[][] => {
  if (!winResult || winResult.winningPositions.length === 0) {
    return Array(cols).fill(null).map(() => Array(rows).fill(false));
  }

  const reelWinningRows: boolean[][] = [];

  for (let col = 0; col < cols; col++) {
    const rowFlags = Array(rows).fill(false);
    
    const colWinners = winResult.winningPositions[col] || [];
    colWinners.forEach(pos => {
      if (pos.row >= 0 && pos.row < rows) {
        rowFlags[pos.row] = true;
      }
    });

    reelWinningRows.push(rowFlags);
  }

  return reelWinningRows;
};

/**
 * Check if there are any wins in the result
 */
export const hasAnyWin = (winResult: WinResult | null): boolean => {
  return (winResult?.totalWin ?? 0) > 0 || (winResult?.freeSpins ?? 0) > 0;
};

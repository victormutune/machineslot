"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWin = exports.getVisibleGrid = void 0;
const assetMap_rtp_1 = require("./assetMap.rtp");
/* ================= CONSTANTS ================= */
const ROWS = 4;
const COLS = 5;
/* ================= PAYLINES (16) ================= */
const PAYLINES = [
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
const getVisibleGrid = (stopIndices, reelStrips) => {
    const grid = [];
    for (let col = 0; col < COLS; col++) {
        const reel = [];
        const strip = reelStrips[col];
        for (let row = 0; row < ROWS; row++) {
            const index = (stopIndices[col] + row) % strip.length;
            reel.push(strip[index]);
        }
        grid.push(reel);
    }
    return grid;
};
exports.getVisibleGrid = getVisibleGrid;
/* ================= CORE CALCULATION ================= */
/* ================= CORE CALCULATION ================= */
const calculateOnce = (stopIndices, bet, reelStrips, isFreeSpin = false // ✅ ADDED - Prevent retriggers
) => {
    const grid = (0, exports.getVisibleGrid)(stopIndices, reelStrips);
    const winningLines = [];
    const allWinningPositions = new Set();
    let totalWin = 0;
    let freeSpins = 0;
    // Scatter symbol
    const SCATTER = assetMap_rtp_1.SYMBOLS.find(s => s.name.toLowerCase().includes('football'));
    const SCATTER_ID = SCATTER?.id ?? -1;
    /* ===== SCATTER COUNT (ANYWHERE) - ONLY IF NOT FREE SPIN ===== */
    if (!isFreeSpin) {
        let scatterCount = 0;
        const scatterPositions = [];
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                if (grid[c][r] === SCATTER_ID) {
                    scatterCount++;
                    scatterPositions.push({ col: c, row: r });
                }
            }
        }
        if (scatterCount >= 3) {
            // Highlight winning scatters
            scatterPositions.forEach(pos => {
                allWinningPositions.add(`${pos.col},${pos.row}`);
            });
            // ✅ CHANGED - 0 Payout for Scatters
            const scatterWin = 0;
            // ✅ CHANGED - Updated Free Spin Counts
            freeSpins =
                scatterCount === 3 ? 2 :
                    scatterCount === 4 ? 3 :
                        4; // 5+ scatters = 4 spins
            totalWin += scatterWin;
            winningLines.push({
                symbolId: SCATTER_ID,
                symbolName: SCATTER?.name ?? 'Scatter',
                count: scatterCount,
                winAmount: scatterWin,
                ways: 1,
                path: scatterPositions
            });
        }
    }
    /* ===== PAYLINES ===== */
    PAYLINES.forEach(line => {
        const symbols = line.map((row, col) => grid[col][row]);
        const first = symbols[0];
        if (first === SCATTER_ID)
            return;
        let match = 1;
        for (let i = 1; i < COLS; i++) {
            if (symbols[i] === first)
                match++;
            else
                break;
        }
        if (match < 3)
            return;
        const symbol = assetMap_rtp_1.SYMBOLS.find(s => s.id === first);
        if (!symbol)
            return;
        // @ts-ignore
        const payout = symbol.payouts ? symbol.payouts?.[match] : 0;
        // Payouts are Total Bet Multipliers
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
    const winningPositions = [];
    for (let col = 0; col < COLS; col++) {
        const colWinners = [];
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
const calculateWin = (stopIndices, bet, reelStrips, isFreeSpin = false // ✅ ADDED
) => {
    let attempts = 0;
    let result;
    let finalStopIndices = stopIndices;
    do {
        const adjustedStops = attempts === 0
            ? stopIndices
            : stopIndices.map((s, col) => {
                const stripLength = reelStrips[col].length;
                return (s + Math.floor(Math.random() * 3) + 1) % stripLength;
            });
        result = calculateOnce(adjustedStops, bet, reelStrips, isFreeSpin); // Pass flag
        finalStopIndices = adjustedStops;
        attempts++;
    } while (result.totalWin === 0 && attempts < 3);
    return {
        ...result,
        adjustedStopIndices: finalStopIndices
    };
};
exports.calculateWin = calculateWin;

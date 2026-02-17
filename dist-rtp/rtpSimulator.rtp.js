"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateRTP = void 0;
const winLogic_rtp_1 = require("./winLogic.rtp");
const assetMap_rtp_1 = require("./assetMap.rtp");
const simulateRTP = (numSpins = 100000) => {
    let totalBet = 0;
    let totalWon = 0;
    let winCount = 0;
    let freeSpinCount = 0;
    let biggestWin = 0;
    // Track wins per symbol to see distribution
    const symbolWins = {};
    assetMap_rtp_1.SYMBOLS.forEach(s => symbolWins[s.name] = 0);
    console.log(`Starting RTP simulation for ${numSpins} spins...`);
    const startTime = performance.now();
    const baseBet = 10; // Arbitrary bet unit
    for (let i = 0; i < numSpins; i++) {
        // 1. Regular Spin
        totalBet += baseBet;
        // Random stop indices
        const stopIndices = assetMap_rtp_1.REEL_STRIPS.map(strip => Math.floor(Math.random() * strip.length));
        // Calculate Win
        const result = (0, winLogic_rtp_1.calculateWin)(stopIndices, baseBet, assetMap_rtp_1.REEL_STRIPS, false);
        totalWon += result.totalWin;
        if (result.totalWin > 0)
            winCount++;
        if (result.totalWin > biggestWin)
            biggestWin = result.totalWin;
        // Track symbol wins
        result.winningLines.forEach(line => {
            if (symbolWins[line.symbolName] !== undefined) {
                symbolWins[line.symbolName]++;
            }
        });
        // 2. Handle Free Spins (Recursive)
        if (result.freeSpins > 0) {
            freeSpinCount += result.freeSpins;
            let spinsRemaining = result.freeSpins;
            while (spinsRemaining > 0) {
                // Free spins don't cost bet
                spinsRemaining--;
                // Use Bonus Strips
                const fsStopIndices = assetMap_rtp_1.BONUS_REEL_STRIPS.map(strip => Math.floor(Math.random() * strip.length));
                const fsResult = (0, winLogic_rtp_1.calculateWin)(fsStopIndices, baseBet, assetMap_rtp_1.BONUS_REEL_STRIPS, true); // isFreeSpin = true
                totalWon += fsResult.totalWin;
                if (fsResult.totalWin > biggestWin)
                    biggestWin = fsResult.totalWin;
            }
        }
    }
    const endTime = performance.now();
    const rtp = (totalWon / totalBet) * 100;
    const stats = {
        spins: numSpins,
        rtp: rtp.toFixed(2) + '%',
        totalBet,
        totalWon,
        hitFrequency: ((winCount / numSpins) * 100).toFixed(2) + '%',
        freeSpinsTriggered: freeSpinCount,
        biggestWinMultiplier: (biggestWin / baseBet).toFixed(0) + 'x',
        timeTaken: ((endTime - startTime) / 1000).toFixed(2) + 's',
        symbolWins
    };
    return stats;
};
exports.simulateRTP = simulateRTP;

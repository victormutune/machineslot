
import { calculateWin } from './winLogic';
import { REEL_STRIPS, BONUS_REEL_STRIPS, SYMBOLS } from '../assets/assetMap';

export const simulateRTP = (numSpins: number = 100000) => {
  let totalBet = 0;
  let totalWon = 0;
  let winCount = 0;
  let freeSpinCount = 0;
  let biggestWin = 0;

  // Track wins per symbol to see distribution
  const symbolWins: Record<string, number> = {};
  SYMBOLS.forEach(s => symbolWins[s.name] = 0);

  console.log(`Starting RTP simulation for ${numSpins} spins...`);
  const startTime = performance.now();

  const baseBet = 10; // Arbitrary bet unit

  for (let i = 0; i < numSpins; i++) {
    // 1. Regular Spin
    totalBet += baseBet;
    
    // Random stop indices
    const stopIndices = REEL_STRIPS.map(strip => Math.floor(Math.random() * strip.length));
    
    // Calculate Win
    const result = calculateWin(stopIndices, baseBet, REEL_STRIPS, false);
    
    totalWon += result.totalWin;
    if (result.totalWin > 0) winCount++;
    if (result.totalWin > biggestWin) biggestWin = result.totalWin;

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
        const fsStopIndices = BONUS_REEL_STRIPS.map(strip => Math.floor(Math.random() * strip.length));
        const fsResult = calculateWin(fsStopIndices, baseBet, BONUS_REEL_STRIPS, true); // isFreeSpin = true
        
        totalWon += fsResult.totalWin;
        if (fsResult.totalWin > biggestWin) biggestWin = fsResult.totalWin;
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

  console.table(stats);
  return stats;
};

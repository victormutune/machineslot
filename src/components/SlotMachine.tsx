import { useMemo, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import Reel, { type ReelHandle } from './Reel'; 
import { SYMBOLS, REEL_STRIP } from '../assets/assetMap';
import { type WinResult } from '../utils/winLogic';

// Props
interface SlotMachineProps {
  onSpinComplete: () => void;
  reelOrders?: number[][]; // [reelIndex][symbolIndex] -> symbolId
  boostActive?: boolean;
  winResult: WinResult | null;
  reelStrip?: number[];
}

// Handle Interface
export interface SlotMachineHandle {
  spin: (results: number[], spinCount: number, reelOrders?: number[][]) => void;
}

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>(({ onSpinComplete, boostActive = false, winResult, reelStrip = REEL_STRIP }, ref) => {
  const [spinning, setSpinning] = useState(false);
  const [activeOrders, setActiveOrders] = useState<number[][]>(() => {
    // Use the weighted REEL_STRIP (or provided strip) for all 5 reels
    return Array.from({ length: 5 }, () => reelStrip);
  });
  
  // Update active orders when reelStrip changes (e.g. entering/leaving bonus)
  useMemo(() => {
     setActiveOrders(Array.from({ length: 5 }, () => reelStrip));
  }, [reelStrip]);
  
  // Refs for the 5 reels
  const reelsRef = useRef<(ReelHandle | null)[]>([]);
  const baseIds = useMemo(() => SYMBOLS.map((s) => s.id), []);

  // Calculate winning positions from winResult
  const winningPositions = useMemo(() => {
    // 5 reels x 4 rows
    const grid = Array(5).fill(null).map(() => Array(4).fill(false));

    if (winResult) {
      winResult.winningLines.forEach(line => {
        if (line.path) {
          line.path.forEach(pos => {
            if (grid[pos.col] && grid[pos.col][pos.row] !== undefined) {
              grid[pos.col][pos.row] = true;
            }
          });
        }
      });
    }
    return grid;
  }, [winResult]);

  useImperativeHandle(ref, () => ({
    spin: (results: number[], spinCount: number, reelOrders?: number[][]) => {
      if (spinning) return;
      setSpinning(true);
      if (reelOrders?.length === 5) setActiveOrders(reelOrders);

      // Apply boost multiplier to speed up spin: 0.5x speed = 2x duration reduction
      const boostMultiplier = boostActive ? 0.5 : 1;
      
      reelsRef.current.forEach((reel, i) => {
        if (reel) {
          // Sequential delay logic
          // Reel 1: 0s, Reel 2: 0.4s, etc.
          const stopDelay = i * 0.10 * boostMultiplier; 
          
          // We pass:
          // 1. Base spin count (plus i*2 to make the later ones spin 'more' visually before stopping)
          // 2. The result index
          // 3. The explicit stop delay (reduced by boost multiplier)
          reel.spin(spinCount + i * 2, results[i], stopDelay, boostMultiplier);
        }
      });

      // Calculate the exact duration of the last reel (index 4)
      const lastReelIndex = 4;
      const lastReelStopDelay = lastReelIndex * 0.10 * boostMultiplier;
      
      // Part 1: Spin Loop Duration
      // (spinCount + i * 2) * (0.15 * boostMultiplier)
      // Note: gsap repeat counts the *repeats*, so actual plays is repeat + 1 usually, 
      // but here repeat: spins means it plays 'spins' + 1 times?
      // Let's verify standard GSAP behavior. repeat: 1 plays twice.
      // In Reel.tsx: repeat: spins. So total iterations = spins + 1.
      // Wait, let's look at Reel.tsx loop duration again.
      // it says duration: 0.15 * boostMultiplier.
      // if repeat is N, total time is duration * (N + 1).
      // Let's assume the previous manual calcs were slightly off if they ignored the +1.
      // Reel.tsx: spinCount passed is (spinCount + i * 2).
      // So loop duration = (0.15 * boostMultiplier) * (spinCount + lastReelIndex * 2 + 1).
      
      // Part 2: Landing Duration
      // (1.5 + stopDelay) * boostMultiplier
      const landingDuration = (1.5 + lastReelStopDelay) * boostMultiplier;
      
      const loopDuration = (0.15 * boostMultiplier) * (spinCount + lastReelIndex * 2 + 1);
      
      const totalDurationSec = loopDuration + landingDuration;
      const timeoutDuration = (totalDurationSec * 1000) + 100; // +100ms buffer
      
      setTimeout(() => {
        setSpinning(false);
        onSpinComplete();
      }, timeoutDuration);
    }
  }));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative"> 
      {/* Reels Container */}
      <div className="flex justify-center items-center w-full h-full overflow-hidden">
        {/* Render 5 reels */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Reel 
            key={i}
            ref={(el) => (reelsRef.current[i] = el)} 
            rows={4} 
            order={activeOrders[i] ?? baseIds}
            winningRows={winningPositions[i]}
            isSpinning={spinning}
          />
        ))}
      </div>
      
      {/* Spin Button REMOVED - Moved to ControlPanel */}
    </div>
  );
});

export default SlotMachine;

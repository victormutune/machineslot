import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import Reel, { type ReelHandle } from './Reel';
import WinEffects from './WinEffects';
import { type WinResult } from '../utils/winLogic';
import { getReelWinningRows, hasAnyWin } from '../utils/winningHelper';
import { REEL_STRIPS } from '../assets/assetMap';
import PaylineOverlay from './ui/PaylineOverlay';

export interface SlotMachineHandle {
  spin: (stopIndices: number[], spins?: number, reelOrders?: number[][]) => void;
}

interface SlotMachineProps {
  onSpinComplete?: () => void;
  boostActive?: boolean;
  winResult: WinResult | null;
  reelStrips?: number[][]; // Changed to array of arrays
}

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>(({
  onSpinComplete,
  boostActive = false,
  winResult,
  reelStrips = REEL_STRIPS,
}, ref) => {
  
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [currentStopIndices, setCurrentStopIndices] = React.useState<number[]>([0, 0, 0, 0, 0]);

  const reelRefs = [
    useRef<ReelHandle>(null),
    useRef<ReelHandle>(null),
    useRef<ReelHandle>(null),
    useRef<ReelHandle>(null),
    useRef<ReelHandle>(null),
  ];

  useImperativeHandle(ref, () => ({
    spin: (stopIndices: number[], spinCount: number = 5) => {
      if (isSpinning) return;
      setIsSpinning(true);
      setCurrentStopIndices(stopIndices);

      // Trigger spins on all reels
      reelRefs.forEach((reelRef, index) => {
        if (reelRef.current) {
           const delay = index * 0.1; // Staggered start
           
           reelRef.current.spin(
             spinCount + (index * 0.5), // Add some randomness/stagger to spin count
             stopIndices[index],
             delay,
             boostActive ? 2 : 1 // Faster if boost is active
           );
        }
      });

      // Calculate total duration roughly
      // (base spins * duration) + (landing delay)
      const baseDuration = (spinCount + 4) * 0.15; // approximate
      const landingDelay = 1.0; 
      const totalTime = (baseDuration + landingDelay) * 1000 + 500; // + buffer

      setTimeout(() => {
        setIsSpinning(false);
        if (onSpinComplete) onSpinComplete();
      }, totalTime);
    }
  }));

  // Track payline animation phase to sync win amount display
  const [paylinePhase, setPaylinePhase] = React.useState<'flowing' | 'complete'>('flowing');

  // Winning rows for highlighting
  const reelWinningRows = getReelWinningRows(winResult);
  const hasWin = hasAnyWin(winResult);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="reels-grid grid grid-cols-5 gap-1 w-full h-full relative"> 
        {reelRefs.map((reelRef, index) => (
          <Reel
            key={index}
            ref={reelRef}
            rows={4}
            colIndex={index} // ✅ Pass column index
            order={reelStrips[index]} // Use the individual strip for this reel
            winningRows={reelWinningRows[index]}
            isSpinning={isSpinning}
            hasAnyWin={hasWin}
          />
        ))}
        {/* Overlay for Paylines */}
        {!isSpinning && winResult && (
           <div className="absolute inset-0 pointer-events-none z-20">
               <PaylineOverlay
                 winningLines={winResult.winningLines}
                 onPhaseChange={setPaylinePhase}
               />
           </div>
        )}
      </div>

      <WinEffects
        winResult={winResult}
        stopIndices={currentStopIndices}
        freeSpinsWon={winResult?.freeSpins ?? 0}
        showAmount={paylinePhase === 'complete'}
      />
    </div>
  );
});

export default SlotMachine;

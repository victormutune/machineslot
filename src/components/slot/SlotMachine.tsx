import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import Reel, { type ReelHandle } from './Reel';
import WinEffects from './WinEffects';
import { type WinResult } from '../../slot/winLogic';
import { getReelWinningRows, hasAnyWin } from '../../slot/winningHelper';
import { REEL_STRIPS } from '../../assets/assetMap';
import PaylineOverlay from '../ui/PaylineOverlay';

export interface SlotMachineHandle {
  spin: (stopIndices: number[], spins?: number, reelOrders?: number[][]) => void;
}

interface SlotMachineProps {
  onSpinComplete?: () => void;
  boostActive?: boolean;
  winResult: WinResult | null;
  reelStrips?: number[][];
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

      reelRefs.forEach((reelRef, index) => {
        if (reelRef.current) {
           const delay = index * 0.1;
           reelRef.current.spin(
             spinCount + (index * 0.5),
             stopIndices[index],
             delay,
             boostActive ? 2 : 1
           );
        }
      });

      const baseDuration = (spinCount + 4) * 0.15;
      const landingDelay = 1.0; 
      const totalTime = (baseDuration + landingDelay) * 1000 + 500;

      setTimeout(() => {
        setIsSpinning(false);
        if (onSpinComplete) onSpinComplete();
      }, totalTime);
    }
  }));

  const [paylinePhase, setPaylinePhase] = React.useState<'flowing' | 'complete'>('flowing');

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
            colIndex={index}
            order={reelStrips[index]}
            winningRows={reelWinningRows[index]}
            isSpinning={isSpinning}
            hasAnyWin={hasWin}
          />
        ))}
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

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
  instantSpin?: boolean;
  turboSpin?: boolean;
  winResult: WinResult | null;
  reelStrips?: number[][];
}

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>(({
  onSpinComplete,
  instantSpin = false,
  turboSpin = false,
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
    spin: (stopIndices: number[], spinCount: number = 2) => {
      if (isSpinning) return;
      setIsSpinning(true);
      setCurrentStopIndices(stopIndices);

      // Speed profile: instant > turbo > normal
      //                  STOP_GAP  LOOP_DUR  LANDING_DUR  spinCycles
      // normal:           0.20s     0.15s      0.85s        spinCount
      // turbo:            0.12s     0.10s      0.50s        1
      // instant:          0.06s     0.015s     0.12s        spinCount
      const STOP_GAP    = instantSpin ? 0.06  : turboSpin ? 0.12  : 0.20;
      const LOOP_DUR    = instantSpin ? 0.015 : turboSpin ? 0.10  : 0.15;
      const LANDING_DUR = instantSpin ? 0.12  : turboSpin ? 0.50  : 0.85;
      const animMult    = instantSpin ? 0.1   : 1;
      const cycles      = turboSpin  ? 1 : spinCount;  // turbo does fewer loops

      reelRefs.forEach((reelRef, index) => {
        if (reelRef.current) {
          const stopDelay = index * STOP_GAP;
          reelRef.current.spin(
            cycles,
            stopIndices[index],
            stopDelay,
            animMult
          );
        }
      });

      const lastStopDelay  = (reelRefs.length - 1) * STOP_GAP;
      const extraLoopsLast = lastStopDelay > 0 ? Math.ceil(lastStopDelay / LOOP_DUR) : 0;
      const lastLoopEnd    = (cycles + extraLoopsLast) * LOOP_DUR;
      const totalTime      = instantSpin
        ? 400
        : (lastLoopEnd + LANDING_DUR) * 1000 + 500;

      setTimeout(() => {
        setIsSpinning(false);
        if (onSpinComplete) onSpinComplete();
      }, totalTime);
    }
  }));

  const [paylinePhase, setPaylinePhase] = React.useState<'flowing' | 'complete'>('flowing');

  const reelWinningRows = getReelWinningRows(winResult);
  const hasWin = hasAnyWin(winResult);
  const bonusTriggered = !!winResult && winResult.freeSpins > 0;

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
            bonusTriggered={bonusTriggered}
          />
        ))}
      </div>

      {/* PaylineOverlay MUST be outside the reels-grid (overflow:hidden) so the SVG
          getBoundingClientRect() covers the full container correctly */}
      {!isSpinning && winResult && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
          <PaylineOverlay
            winningLines={winResult.winningLines}
            onPhaseChange={setPaylinePhase}
          />
        </div>
      )}

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

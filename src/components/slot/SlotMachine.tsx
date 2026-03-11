import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
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

// How long (ms) a symbol stays "popped" — matches TRAVEL_MS in PaylineOverlay
const POP_HOLD_MS = 1100;

const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>((
{
  onSpinComplete,
  instantSpin = false,
  turboSpin = false,
  winResult,
  reelStrips = REEL_STRIPS,
}, ref) => {

  const [isSpinning, setIsSpinning] = React.useState(false);
  const [currentStopIndices, setCurrentStopIndices] = React.useState<number[]>([0, 0, 0, 0, 0, 0]);

  // Tracks which columns are currently "popped" by the sweep line
  const [poppedCols, setPoppedCols] = React.useState<Set<number>>(new Set());

  // Increments each time a new win result arrives — tells PaylineOverlay to restart
  const [winKey, setWinKey] = React.useState(0);

  // When winResult goes null (new spin) → clear pops
  // When winResult arrives (spin complete) → bump winKey so overlay restarts
  const prevWinResultRef = useRef<WinResult | null>(null);
  React.useEffect(() => {
    if (winResult === null) {
      setPoppedCols(new Set());
    } else if (winResult !== prevWinResultRef.current) {
      // Genuine new win result
      setWinKey(k => k + 1);
    }
    prevWinResultRef.current = winResult;
  }, [winResult]);

  const reelRefs = [
    useRef<ReelHandle>(null),
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
      setPoppedCols(new Set());

      const STOP_GAP    = instantSpin ? 0.06  : turboSpin ? 0.12  : 0.18;
      const LOOP_DUR    = instantSpin ? 0.015 : turboSpin ? 0.10  : 0.15;
      const LANDING_DUR = instantSpin ? 0.12  : turboSpin ? 0.50  : 0.85;
      const animMult    = instantSpin ? 0.1   : 1;
      const cycles      = turboSpin   ? 1     : spinCount;

      reelRefs.forEach((reelRef, index) => {
        if (reelRef.current) {
          reelRef.current.spin(cycles, stopIndices[index], index * STOP_GAP, animMult);
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

  const [paylinePhase, setPaylinePhase] = React.useState<'flowing' | 'complete' | 'idle'>('idle');

  // sweepActive = true ONLY while the line is actively drawing across
  const sweepActive = paylinePhase === 'flowing';

  // Called by PaylineOverlay as the sweep passes each column
  const handleSweepColumn = useCallback((col: number) => {
    setPoppedCols(prev => { const s = new Set(prev); s.add(col); return s; });
    setTimeout(() => {
      setPoppedCols(prev => { const s = new Set(prev); s.delete(col); return s; });
    }, POP_HOLD_MS);
  }, []);

  const reelWinningRows = getReelWinningRows(winResult);
  const hasWin          = hasAnyWin(winResult);
  const bonusTriggered  = !!winResult && winResult.freeSpins > 0;

  // Only feed lines to the overlay when not spinning and a win result exists
  const overlayLines = (!isSpinning && winResult) ? winResult.winningLines : [];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="reels-grid grid grid-cols-6 gap-1 w-full h-full relative">
        {reelRefs.map((reelRef, index) => (
          <Reel
            key={index}
            ref={reelRef}
            rows={4}
            colIndex={index}
            order={reelStrips[index]}
            winningRows={reelWinningRows[index]}
            isSpinning={isSpinning}
            hasAnyWin={hasWin && sweepActive}
            bonusTriggered={bonusTriggered}
            isPopped={poppedCols.has(index)}
            sweepActive={sweepActive}
          />
        ))}
      </div>

      {/* Always mounted — svgRef stays valid for DOM measurement.
          winKey bumps on each new win so the overlay knows to restart. */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
        <PaylineOverlay
          winningLines={overlayLines}
          winKey={!isSpinning && winResult ? winKey : 0}
          onPhaseChange={setPaylinePhase}
          onSweepColumn={handleSweepColumn}
        />
      </div>

      <WinEffects
        winResult={winResult}
        stopIndices={currentStopIndices}
        freeSpinsWon={winResult?.freeSpins ?? 0}
        showAmount={paylinePhase === 'flowing'}
      />
    </div>
  );
});

export default SlotMachine;

import { useMemo, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import gsap from 'gsap';
import { SYMBOLS } from '../assets/assetMap';

interface ReelProps {
  rows?: number;
  order?: number[]; // array of symbol ids (length = SYMBOLS.length)
  winningRows?: boolean[]; // [row0, row1, row2, row3]
  isSpinning?: boolean;
}

export interface ReelHandle {
  spin: (spins: number, stopIndex: number, stopDelay: number, boostMultiplier?: number) => void;
}

const Reel = forwardRef<ReelHandle, ReelProps>(({ rows = 4, order, winningRows, isSpinning }, ref) => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [finalStopIndex, setFinalStopIndex] = useState<number | null>(null);
  
  // 3 Sets to handle buffer:
  // Set 0 (0-9): Buffer Top
  // Set 1 (10-19): Landing Zone
  // Set 2 (20-29): Start Zone
  const idToSymbol = useMemo(() => new Map(SYMBOLS.map((s) => [s.id, s])), []);
  const baseStrip = useMemo(
    () =>
      (order?.length ? order : SYMBOLS.map((s) => s.id))
        .map((id) => idToSymbol.get(id))
        .filter(Boolean) as typeof SYMBOLS,
    [order, idToSymbol],
  );
  const REEL_SYMBOLS = [...baseStrip, ...baseStrip, ...baseStrip];
  const TOTAL_SYMBOLS = REEL_SYMBOLS.length; // 60
  
  // Calculated height of the strip relative to the viewport container
  // Formula: (Total Symbols / Visible Rows) * 100%
  // This ensures that 'rows' symbols fit exactly in the container height.
  const STRIP_HEIGHT_PERCENT = (TOTAL_SYMBOLS / rows) * 100;

  useImperativeHandle(ref, () => ({
    spin: (spins: number, stopIndex: number, stopDelay: number = 0, boostMultiplier: number = 1) => {
      const reel = reelRef.current;
      if (!reel) return;

      // Reset final stop index during spin
      setFinalStopIndex(null);

      const tl = gsap.timeline();
      
      // Measure dynamic height
      const stripH = reel.scrollHeight;
      const symbolH = stripH / TOTAL_SYMBOLS;
      const uniqueCount = baseStrip.length; // 60

      // Start Position: Top of Set 2 (Index 120 if strip is 60? REEL_SYMBOLS is 3x baseStrip)
      // baseStrip is now length 60 (REEL_STRIP).
      // So REEL_SYMBOLS is 180.
      // Index 2 is uniqueCount * 2.
      const loopStart = -(uniqueCount * 2 * symbolH); 
      const loopEnd = -(uniqueCount * symbolH); 

      // Reset to Loop Start
      gsap.set(reel, { y: loopStart });

      // Spin Loop - Apply boost multiplier to speed (shorter duration = faster)
      // We ensure the spin loop lasts long enough to cover the delay
      tl.fromTo(reel, 
        { y: loopStart },
        {
          y: loopEnd, 
          duration: 0.15 * boostMultiplier, 
          ease: "none",
          repeat: spins, 
        }
      );

      // 2. Landing Phase
      const targetIndex = uniqueCount + stopIndex; 
      const finalY = -(targetIndex * symbolH);
      
      // Strict Sequential Duration - Apply boost multiplier to landing duration
      // Base duration (1.5s) + The calculated delay, both reduced by boostMultiplier
      const landingDuration = (1.5 + stopDelay) * boostMultiplier;

      tl.fromTo(reel,
        { y: loopStart }, // Seamless reset
        {
          y: finalY,
          duration: landingDuration, 
          ease: "power2.out", // User requested power2.out
          onComplete: () => {
             gsap.set(reel, { y: finalY });
             setFinalStopIndex(stopIndex);
          }
        }
      );
    }
  }));

  const uniqueCount = baseStrip.length;

  return (
    <div className="relative overflow-hidden h-full flex-1 border-r border-black/10 bg-[#1a0b00]"> 
      {/* Shine overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/40 via-white/5 to-black/40"></div>

      <div 
        ref={reelRef} 
        className="flex flex-col w-full" 
        style={{ 
            height: `${STRIP_HEIGHT_PERCENT}%`, 
            willChange: 'transform',
            // Initial render position: Start of Set 1 (Index 60)
            transform: `translateY(${-100/3}%)` 
        }}
      >
        {REEL_SYMBOLS.map((symbol, i) => {
          // Check if this symbol is currently a winner
          let isWinner = false;
          let isDim = false;

          // Only calculate if not spinning and we have a result
          if (!isSpinning && finalStopIndex !== null && winningRows) {
            // The visible symbols start at `uniqueCount + finalStopIndex`
            const startVisibleIndex = uniqueCount + finalStopIndex;
            
            // Allow for a small range? No, exact match.
            // i must be between startVisibleIndex and startVisibleIndex + rows - 1
            if (i >= startVisibleIndex && i < startVisibleIndex + rows) {
               const rowIndex = i - startVisibleIndex;
               if (winningRows[rowIndex]) {
                 isWinner = true;
               } else {
                 // Check if there are ANY winners on this reel. 
                 // If so, and this isn't one, dim it.
                 // Actually requirement is: "others should turn a little bit to give the winning symbols to look more visible"
                 // This implies if there is a win *anywhere* on screen (or just this reel?), we dim losers.
                 // Usually it's if there is a win *anywhere* in the game.
                 // passing `hasAnyWin` prop would be better, but we can infer: 
                 // If `winningRows` has any true, then dim non-winners.
                 if (winningRows.some(w => w)) {
                    isDim = true;
                 }
               }
            }
          }

          return (
            <div key={`${symbol.id}-${i}`} className="w-full flex items-center justify-center p-1" style={{
               height: `${100 / TOTAL_SYMBOLS}%` 
            }}>
              <img 
                src={symbol.image} 
                alt={symbol.name}
                className={`
                  w-[80%] h-[80%] object-contain filter drop-shadow-md transition-all duration-500
                  ${isWinner ? 'animate-bounce-zoom z-20 scale-110 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]' : ''}
                  ${isDim ? 'opacity-40 grayscale-[0.5] scale-90 blur-[1px]' : ''}
                `}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Reel;

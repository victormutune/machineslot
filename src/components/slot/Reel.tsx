import { useMemo, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import gsap from 'gsap';
import { SYMBOLS } from '../../assets/assetMap';

interface ReelProps {
  rows?: number;
  colIndex: number;
  order?: number[];
  winningRows?: boolean[];
  isSpinning?: boolean;
  hasAnyWin?: boolean; 
}

export interface ReelHandle {
  spin: (spins: number, stopIndex: number, stopDelay: number, boostMultiplier?: number) => void;
}

const Reel = forwardRef<ReelHandle, ReelProps>(({ 
  rows = 4, 
  colIndex,
  order, 
  winningRows, 
  isSpinning,
  hasAnyWin = false 
}, ref) => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [finalStopIndex, setFinalStopIndex] = useState<number | null>(null);
  
  const idToSymbol = useMemo(() => new Map(SYMBOLS.map((s) => [s.id, s])), []);
  const baseStrip = useMemo(
    () =>
      (order?.length ? order : SYMBOLS.map((s) => s.id))
        .map((id) => idToSymbol.get(id))
        .filter(Boolean) as typeof SYMBOLS,
    [order, idToSymbol],
  );
  const REEL_SYMBOLS = [...baseStrip, ...baseStrip, ...baseStrip];
  const TOTAL_SYMBOLS = REEL_SYMBOLS.length;
  
  const STRIP_HEIGHT_PERCENT = (TOTAL_SYMBOLS / rows) * 100;

  useImperativeHandle(ref, () => ({
    spin: (spins: number, stopIndex: number, stopDelay: number = 0, boostMultiplier: number = 1) => {
      const reel = reelRef.current;
      if (!reel) return;

      setFinalStopIndex(null);

      const tl = gsap.timeline();
      
      const stripH = reel.scrollHeight;
      const symbolH = stripH / TOTAL_SYMBOLS;
      const uniqueCount = baseStrip.length;

      const loopStart = -(uniqueCount * 2 * symbolH); 
      const loopEnd = -(uniqueCount * symbolH); 

      gsap.set(reel, { y: loopStart });

      tl.fromTo(reel, 
        { y: loopStart },
        {
          y: loopEnd, 
          duration: 0.15 * boostMultiplier, 
          ease: "none",
          repeat: spins, 
        }
      );

      const targetIndex = uniqueCount + stopIndex; 
      const finalY = -(targetIndex * symbolH);
      const landingDuration = (1.5 + stopDelay) * boostMultiplier;

      tl.fromTo(reel,
        { y: loopStart },
        {
          y: finalY,
          duration: landingDuration, 
          ease: "power2.out",
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
    <div className="relative overflow-hidden h-full flex-1 border-r border-black/10 bg-gray-900"> 
      <div className="absolute inset-0 z-10 pointer-events-none"></div>

      <div 
        ref={reelRef} 
        className="flex flex-col w-full" 
        style={{ 
            height: `${STRIP_HEIGHT_PERCENT}%`, 
            willChange: 'transform',
            transform: `translateY(${-100/3}%)` 
        }}
      >
        {REEL_SYMBOLS.map((symbol, i) => {
          let isWinner = false;
          let shouldDim = false;
          let rowIndex = -1;

          if (!isSpinning && finalStopIndex !== null) {
            const startVisibleIndex = uniqueCount + finalStopIndex;
            
            if (i >= startVisibleIndex && i < startVisibleIndex + rows) {
              rowIndex = i - startVisibleIndex;
              
              if (winningRows && winningRows[rowIndex]) {
                isWinner = true;
              } 
              else if (hasAnyWin) {
                shouldDim = true;
              }
            }
          }

          return (
            <div 
              key={`${symbol.id}-${i}`} 
              data-grid-coord={rowIndex >= 0 ? `${colIndex},${rowIndex}` : undefined}
              className="w-full flex items-center justify-center p-1" 
              style={{
                height: `${100 / TOTAL_SYMBOLS}%` 
              }}
            >
              <img 
                src={symbol.image} 
                alt={symbol.name}
                className={`
                  w-[70%] h-[70%] object-contain filter drop-shadow-md transition-all duration-500
                  ${isWinner ? 'animate-bounce-zoom z-20 scale-110 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]' : ''}
                  ${shouldDim ? 'opacity-40 grayscale-[0.5] scale-90 blur-[1px]' : ''}
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

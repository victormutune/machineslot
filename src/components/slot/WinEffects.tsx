import React, { useEffect, useRef, useState } from 'react';
import { type WinResult } from '../../slot/winLogic';

interface WinEffectsProps {
  winResult: WinResult | null;
  stopIndices: number[];
  freeSpinsWon?: number;
  showAmount?: boolean;
}

const WinEffects: React.FC<WinEffectsProps> = ({
  winResult,
  stopIndices,
  freeSpinsWon = 0,
  showAmount = false,
}) => {
  const [showEffects, setShowEffects] = useState(false);
  const [displayedWin, setDisplayedWin] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; left: string; top: string; color: string; dx: string; dy: string }[]
  >([]);

  // Track animation state: 'in' = zooming in, 'visible' = holding, 'out' = zooming out, 'hidden' = gone
  const [amountAnim, setAmountAnim] = useState<'in' | 'visible' | 'out' | 'hidden'>('hidden');
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when win result changes
  useEffect(() => {
    if (!winResult) {
      setShowEffects(false);
      setDisplayedWin(0);
      setParticles([]);
      setAmountAnim('hidden');
      return;
    }

    setShowEffects(true);
    setDisplayedWin(0);
    setAmountAnim('hidden');

    /* ── Count up win amount ── */
    const target = winResult.totalWin;
    const duration = 700;
    const steps = 30;
    const stepValue = target / steps;
    const intervalTime = duration / steps;
    let current = 0;
    const interval = window.setInterval(() => {
      current += stepValue;
      if (current >= target) {
        setDisplayedWin(target);
        window.clearInterval(interval);
      } else {
        setDisplayedWin(Math.floor(current));
      }
    }, intervalTime);

    /* ── Particles ── */
    const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF1493'];
    const newParticles = Array.from({ length: 60 }).map((_, i) => {
      const angle  = (Math.PI * 2 * i) / 60;
      const radius = 120 + Math.random() * 40;
      return {
        id:    i,
        left:  '50%',
        top:   '50%',
        color: colors[i % colors.length],
        dx:    `${Math.cos(angle) * radius}px`,
        dy:    `${Math.sin(angle) * radius}px`,
      };
    });
    setParticles(newParticles);

    return () => window.clearInterval(interval);
  }, [winResult]);

  // React to showAmount toggling
  useEffect(() => {
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }

    if (showAmount) {
      // Zoom in
      setAmountAnim('in');
      // After zoom-in animation (400ms), settle to 'visible'
      exitTimer.current = setTimeout(() => setAmountAnim('visible'), 200);
    } else {
      // Only animate out if it was actually showing
      if (amountAnim === 'in' || amountAnim === 'visible') {
        // Zoom OUT smoothly in sync with symbol zoom-out
        setAmountAnim('out');
        exitTimer.current = setTimeout(() => setAmountAnim('hidden'), 350);
      }
    }

    return () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAmount]);

  if (!winResult || !showEffects || stopIndices.length === 0) return null;

  const hasAmount = winResult.totalWin > 0 || freeSpinsWon > 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* ── Win amount + free spins badge ── */}
      {hasAmount && amountAnim !== 'hidden' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {winResult.totalWin > 0 && (
            <h2
              className="text-5xl font-extrabold text-yellow-300 win-text-glow"
              style={{
                animation:
                  amountAnim === 'in'
                    ? 'winAmountIn 0.1s cubic-bezier(0.34,1.56,0.64,1) forwards'
                    : amountAnim === 'out'
                    ? 'winAmountOut 0.3s ease-out forwards'
                    : undefined,
                // hold: keep the final scale from zoom-in
                transform: amountAnim === 'visible' ? 'scale(1)' : undefined,
                opacity:   amountAnim === 'visible' ? 1 : undefined,
              }}
            >
              ${displayedWin.toLocaleString('en-US')}
            </h2>
          )}

          {freeSpinsWon > 0 && (
            <div
              className="mt-3 px-4 py-1.5 rounded-full bg-[#141922]/90 border border-[#4ade80] text-[#d1fae5]"
              style={{
                animation:
                  amountAnim === 'in'
                    ? 'winAmountIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
                    : amountAnim === 'out'
                    ? 'winAmountOut 0.3s ease-out forwards'
                    : undefined,
              }}
            >
              +{freeSpinsWon} Free Spins!
            </div>
          )}
        </div>
      )}

      {/* ── Particles ── */}
      <div className="absolute inset-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="win-particle"
            style={{
              left: p.left,
              top:  p.top,
              backgroundColor: p.color,
              // @ts-ignore
              '--dx': p.dx,
              '--dy': p.dy,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WinEffects;

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!winResult) {
      setShowEffects(false);
      setDisplayedWin(0);
      setParticles([]);
      return;
    }

    setShowEffects(true);
    setDisplayedWin(0);

    /* ================= COUNT UP WIN ================= */
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

    /* ================= PARTICLES ================= */
    const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF1493'];
    const newParticles = Array.from({ length: 60 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 60;
      const radius = 120 + Math.random() * 40;
      return {
        id: i,
        left: '50%',
        top: '50%',
        color: colors[i % colors.length],
        dx: `${Math.cos(angle) * radius}px`,
        dy: `${Math.sin(angle) * radius}px`,
      };
    });

    setParticles(newParticles);

    return () => window.clearInterval(interval);
  }, [winResult]);

  if (!winResult || !showEffects || stopIndices.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* ================= WIN AMOUNT ================= */}
      {winResult.totalWin > 0 && showAmount && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <h2 className="text-5xl font-extrabold text-yellow-300 animate-bounce win-text-glow">
            ${displayedWin.toLocaleString('en-US')}
          </h2>

          {freeSpinsWon > 0 && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-[#141922]/90 border border-[#4ade80] text-[#d1fae5]">
              +{freeSpinsWon} Free Spins!
            </div>
          )}
        </div>
      )}

      {/* ================= PARTICLES ================= */}
      <div className="absolute inset-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="win-particle"
            style={{
              left: p.left,
              top: p.top,
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

import React, { useEffect, useMemo, useState } from 'react';
import { type WinResult } from '../utils/winLogic';
import footballImage from '../assets/symbols/FOOTBALL.png';

interface WinEffectsProps {
  winResult: WinResult | null;
  stopIndices: number[];
  freeSpinsWon?: number;
}

const WinEffects: React.FC<WinEffectsProps> = ({
  winResult,
  stopIndices,
  freeSpinsWon = 0,
}) => {
  const [showEffects, setShowEffects] = useState(false);
  const [displayedWin, setDisplayedWin] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; left: string; top: string; color: string; dx: string; dy: string }[]
  >([]);

  /* ================= FOOTBALL SCATTER DETECT ================= */
  const hasFootballWin = useMemo(() => {
    return winResult?.winningLines.some(line =>
      line.symbolName.toLowerCase().includes('football')
    );
  }, [winResult]);

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

      {/* ================= FOOTBALL SCATTER EFFECT ================= */}
      {hasFootballWin && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="football-glow-ring" />
          <div className="absolute w-[320px] h-[320px] rounded-full bg-yellow-400/20 blur-3xl animate-pulse" />

          <div className="football-3d-container">
            <img
              src={footballImage}
              alt="Football Scatter"
              className="football-3d animate-football-dance"
            />
          </div>
        </div>
      )}

      {/* ================= PAYLINES (DISABLED) ================= */}
      {/* 
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {winResult.winningLines.map((line, index) => {
          if (!line.path || line.path.length < 2) return null;
          const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF1493'];
          
          // Helper to get center coordinates
          const getCenter = (col: number, row: number) => ({
            x: ((col + 0.5) / 5) * 100,
            y: ((row + 0.5) / 4) * 100
          });

          const pathPoints = line.path.map(p => getCenter(p.col, p.row));

          // Calculate extended start
          const p0 = pathPoints[0];
          const p1 = pathPoints[1];
          // Slope from p0 to p1
          const dx0 = p1.x - p0.x;
          const dy0 = p1.y - p0.y;
          // We want to extend backwards (left)
          // Cell half-width is 10. We extend by 10 to touch the edge.
          const slope0 = dx0 !== 0 ? dy0 / dx0 : 0;
          const offset = 10;
          const startX = p0.x - offset;
          const startY = p0.y - (slope0 * offset);

          // Calculate extended end
          const pn = pathPoints[pathPoints.length - 1];
          const pn_1 = pathPoints[pathPoints.length - 2];
          const dxN = pn.x - pn_1.x;
          const dyN = pn.y - pn_1.y;
          const slopeN = dxN !== 0 ? dyN / dxN : 0;
          // Extend forward (right)
          const endX = pn.x + offset;
          const endY = pn.y + (slopeN * offset);
          
          const finalPoints = [
            { x: startX, y: startY },
            ...pathPoints,
            { x: endX, y: endY }
          ];

          const pointsStr = finalPoints
            .map(p => `${p.x},${p.y}`)
            .join(' ');

          return (
            <polyline
              key={index}
              points={pointsStr}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      */}

      {/* ================= WIN TEXT ================= */}
      {winResult.totalWin > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-black text-yellow-300 animate-bounce win-text-glow">
            WIN!
          </h1>
          <h2 className="mt-2 text-4xl font-extrabold text-white">
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

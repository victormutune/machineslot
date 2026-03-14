import React, { useEffect, useState, useRef } from 'react';
import { ASSETS } from '../../assets/assetMap';

interface BonusTriggerOverlayProps {
  freeSpinsWon: number;
  onAnimationComplete: () => void;
}

const BonusTriggerOverlay: React.FC<BonusTriggerOverlayProps> = ({ freeSpinsWon, onAnimationComplete }) => {
  const [phase, setPhase] = useState<'hidden' | 'video' | 'enter' | 'show'>('hidden');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ASSETS.audio.bonusTrigger);
      audioRef.current.volume = 0.8;
    }

    if (freeSpinsWon > 0) {
      hasCompleted.current = false;
      
      // Start by playing the transition video
      setPhase('video');

      // (Sound will play after video completes, or you can play it simultaneously)
    }
  }, [freeSpinsWon]);

 

  const handleContinue = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    setPhase('hidden');
    onAnimationComplete();
  };

  if (phase === 'hidden' || freeSpinsWon === 0) return null;



  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundImage: `url(${ASSETS.stone})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Slight dark overlay for depth */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Particle rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="w-[200vw] h-[200vw] opacity-20"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.6) 10deg, transparent 20deg, transparent 40deg, rgba(255,215,0,0.4) 50deg, transparent 60deg, transparent 80deg, rgba(255,215,0,0.5) 90deg, transparent 100deg, transparent 120deg, rgba(255,215,0,0.5) 130deg, transparent 140deg, transparent 160deg, rgba(255,215,0,0.3) 170deg, transparent 180deg, transparent 200deg, rgba(255,215,0,0.5) 210deg, transparent 220deg, transparent 240deg, rgba(255,215,0,0.4) 250deg, transparent 260deg, transparent 280deg, rgba(255,215,0,0.6) 290deg, transparent 300deg, transparent 320deg, rgba(255,215,0,0.4) 330deg, transparent 340deg, transparent 360deg)',
            animation: 'spin 12s linear infinite',
          }}
        />
      </div>

      {/* ── Main Frame Container ─────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 'min(80vw, 520px)',
          height: 'min(80vw, 520px)',
          transform: phase === 'enter' ? 'scale(0.5) translateY(60px)' : 'scale(1) translateY(0)',
          opacity: phase === 'enter' ? 0 : 1,
          transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease',
        }}
      >
        {/* ── Frame Image (same as GoldenFrame) ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${ASSETS.frame})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            zIndex: 30,
          }}
        />

        {/* ── Dark panel behind content (inside the frame) ── */}
        <div
          className="absolute"
          style={{
            width: '90%',
            height: '71%',
            background: '#000000',
            borderRadius: '6px',
            zIndex: 40,
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
          }}
        />

        {/* ── Content inside the frame ── */}
        <div
          className="relative flex flex-col items-center justify-center text-center gap-2 px-4"
          style={{ zIndex: 50, width: '85%', height: '73%' }}
        >
          {/* CONGRATULATIONS */}
          <h1
            className="font-black uppercase tracking-wider leading-none"
            style={{
              fontSize: 'clamp(14px, 4.5vw, 22px)',
              color: '#ff6600',
              textShadow: '0 0 20px rgba(255,100,0,0.8), 0 2px 4px rgba(0,0,0,0.9)',
              letterSpacing: '0.08em',
              fontFamily: 'Impact, "Arial Black", sans-serif',
            }}
          >
            CONGRATULATIONS
          </h1>

          {/* YOU WON X FREE SPINS */}
          <div className="flex flex-col items-center leading-tight">
            <span
              className="font-black uppercase"
              style={{
                fontSize: 'clamp(18px, 5vw, 28px)',
                color: '#FFE000',
                textShadow: '0 0 30px rgba(255,220,0,0.9), 0 3px 6px rgba(0,0,0,0.9)',
                fontFamily: 'Impact, "Arial Black", sans-serif',
                lineHeight: 1.1,
              }}
            >
              YOU WON {freeSpinsWon}
            </span>
            <span
              className="font-black uppercase"
              style={{
                fontSize: 'clamp(18px, 5vw, 28px)',
                color: '#FFE000',
                textShadow: '0 0 30px rgba(255,220,0,0.9), 0 3px 6px rgba(0,0,0,0.9)',
                fontFamily: 'Impact, "Arial Black", sans-serif',
                lineHeight: 1.1,
              }}
            >
              FREE SPINS!
            </span>
          </div>

          {/* Divider */}
          <div
            className="w-4/5 my-1"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,200,0,0.6), transparent)',
            }}
          />

          {/* Description text */}
          <p
            className="text-center font-bold uppercase"
            style={{
              fontSize: 'clamp(8px, 2vw, 11px)',
              color: '#e0e8ff',
              lineHeight: 1.5,
              letterSpacing: '0.04em',
              maxWidth: '85%',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            }}
          >
            YOU START WITH {freeSpinsWon} FREE SPINS ON
            ENHANCED REELS WITH MORE HIGH-VALUE
            SYMBOLS. COLLECT BONUS SCATTERS TO WIN
            ADDITIONAL FREE SPINS!
          </p>
        </div>
      </div>

      {/* ── CLICK TO CONTINUE button (below the frame) ── */}
      <button
        onClick={handleContinue}
        className="absolute font-black uppercase tracking-widest cursor-pointer"
        style={{
          bottom: 'clamp(30px, 8vh, 80px)',
          fontSize: 'clamp(16px, 3vw, 24px)',
          color: '#FFE000',
          background: 'none',
          border: 'none',
          textShadow: '0 0 20px rgba(255,220,0,0.8), 0 2px 6px rgba(0,0,0,0.9)',
          fontFamily: 'Impact, "Arial Black", sans-serif',
          letterSpacing: '0.12em',
          animation: 'pulse-glow 1.5s ease-in-out infinite',
          zIndex: 100,
        }}
      >
        CLICK TO CONTINUE
      </button>

      {/* Pulse glow animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(255,220,0,0.8), 0 2px 6px rgba(0,0,0,0.9); }
          50% { opacity: 0.6; text-shadow: 0 0 40px rgba(255,220,0,1), 0 2px 6px rgba(0,0,0,0.9); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BonusTriggerOverlay;

import React, { useEffect, useState, useRef } from 'react';
import { ASSETS } from '../../assets/assetMap';

interface BonusTriggerOverlayProps {
  freeSpinsWon: number;
  onAnimationComplete: () => void;
}

const BonusTriggerOverlay: React.FC<BonusTriggerOverlayProps> = ({ freeSpinsWon, onAnimationComplete }) => {
  const [phase, setPhase] = useState<'hidden' | 'explode' | 'show' | 'fade-out'>('hidden');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio instance once
    if (!audioRef.current) {
        audioRef.current = new Audio(ASSETS.audio.bonusTrigger);
        audioRef.current.volume = 0.8;
    }
    
    if (freeSpinsWon > 0) {
      // Play Sound
      if (audioRef.current) {
         audioRef.current.currentTime = 0;
         audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }

      // 1. Instantly start exploding/sliding in
      setPhase('explode');

      // 2. Settle into showing the text
      const showTimer = setTimeout(() => {
        setPhase('show');
      }, 800);

      // 3. Start fading out
      const fadeTimer = setTimeout(() => {
        setPhase('fade-out');
      }, 3500);

      // 4. Complete animation, tell parent to resume
      const completeTimer = setTimeout(() => {
        setPhase('hidden');
        onAnimationComplete();
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [freeSpinsWon, onAnimationComplete]);

  if (phase === 'hidden' || freeSpinsWon === 0) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-500 overflow-hidden ${phase === 'fade-out' ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Dark Backdrop */}
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${phase === 'fade-out' ? 'opacity-0' : 'opacity-100'}`} />

      {/* Explosive Light Rays Background */}
      <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-1000 ${phase === 'explode' ? 'scale-[0.1] opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="w-[150vw] h-[150vw] max-w-[2000px] max-h-[2000px] bg-[radial-gradient(circle,rgba(255,215,0,0.5)_0%,rgba(0,0,0,0)_60%)] animate-spin-slow opacity-60" style={{ animationDuration: '10s' }} />
      </div>

      {/* Main Content Container */}
      <div className={`relative flex flex-col items-center justify-center text-center transform transition-all duration-[800ms] cubic-bezier(0.175, 0.885, 0.32, 1.275) ${phase === 'explode' ? 'scale-0 translate-y-20 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}>
        
        {/* Decorative Top Elements */}
        <div className="mb-4 flex gap-4 animate-bounce">
          <span className="text-4xl">🎉</span>
          <span className="text-5xl text-yellow-400">⚡</span>
          <span className="text-4xl">🎉</span>
        </div>

        {/* Huge Text */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_10px_10px_rgba(255,165,0,0.5)] mb-2 uppercase" style={{ WebkitTextStroke: '2px #b45309' }}>
          BONUS
        </h1>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-widest text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] mb-8 uppercase">
          Triggered!
        </h2>

        {/* Free Spins Amount */}
        <div className="relative mt-8 px-12 py-6 bg-gradient-to-b from-black/60 to-black/90 border-2 border-yellow-500/50 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.4)] overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-yellow-400/10 blur-xl"></div>
            
            <div className="relative flex flex-col items-center justify-center">
                <span className="text-2xl md:text-3xl font-bold text-gray-300 uppercase tracking-widest mb-2">You Have Won</span>
                <div className="flex items-center gap-4">
                     <span className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">{freeSpinsWon}</span>
                     <div className="flex flex-col text-left leading-none">
                         <span className="text-3xl md:text-5xl font-extrabold text-yellow-400 uppercase">Free</span>
                         <span className="text-3xl md:text-5xl font-extrabold text-yellow-400 uppercase">Spins</span>
                     </div>
                </div>
            </div>
        </div>
        
        {/* Decorative Bottom */}
        <div className="mt-12 text-yellow-400/80 font-bold uppercase tracking-[0.5em] text-sm animate-pulse">
            Get Ready
        </div>

      </div>
    </div>
  );
};

export default BonusTriggerOverlay;

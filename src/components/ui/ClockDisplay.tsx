import { useState, useEffect } from 'react';

export default function ClockDisplay() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours   = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  return (
    <div className="fixed top-3 left-4 z-[100] flex items-center gap-2 select-none pointer-events-none">

      {/* Clock card */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 shrink-0">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="font-mono text-sm font-bold text-white tracking-widest leading-none">
          {hours}<span className="text-yellow-400 animate-pulse">:</span>{minutes}<span className="text-yellow-400 animate-pulse">:</span>{seconds}
        </span>
      </div>

      {/* Game name card */}
      <div className="flex items-center bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5">
        <span className="text-sm font-black tracking-widest uppercase leading-none">
          <span className="text-yellow-400">Le</span>
          <span className="text-white"> Furma</span>
        </span>
      </div>

    </div>
  );
}

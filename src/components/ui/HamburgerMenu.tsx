import { useState, useRef, useEffect } from 'react';

interface HamburgerMenuProps {
  onOpenPaytable: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  boostActive: boolean;
  onToggleBoost: () => void;
}

export default function HamburgerMenu({
  onOpenPaytable,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  boostActive,
  onToggleBoost,
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gray-300 transition flex items-center justify-center p-2 rounded-md hover:bg-white/10"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-4 w-64 bg-[#1a1b1e] rounded-lg shadow-2xl border border-white/20 p-4 flex flex-col gap-6 z-50">
          
          {/* Paytable (Info) */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenPaytable();
            }}
            className="flex items-center gap-3 text-white hover:text-yellow-400 transition"
          >
            <div className="w-8 h-8 rounded-full border border-white/20 bg-black/40 flex items-center justify-center italic font-serif">
              i
            </div>
            <span className="font-bold tracking-wider">Paytable</span>
          </button>

          {/* Turbo Boost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span className="font-bold tracking-wider">Turbo Boost</span>
            </div>
            <button
              onClick={onToggleBoost}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${boostActive ? 'bg-yellow-400' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${boostActive ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Sound Control */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-white">
              <button onClick={onToggleMute} className="hover:text-yellow-400 transition focus:outline-none">
                {isMuted || volume === 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                )}
              </button>
              <span className="font-bold tracking-wider justify-self-start">Sound</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                if (isMuted) onToggleMute();
                onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-full accent-yellow-400"
            />
          </div>
          
        </div>
      )}
    </div>
  );
}

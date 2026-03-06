import { formatBalance, formatBet } from '../stake/stakeEngineHelpers';
import HamburgerMenu from './ui/HamburgerMenu';

interface ControlPanelProps {
  balance: number;
  currentBet: number;
  currency?: string;
  betLevels: number[];
  currentBetIndex: number;
  spinning: boolean;
  autoSpinEnabled: boolean;
  freeSpinsRemaining: number;
  freeSpinsTotalWin?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  boostActive: boolean;
  onToggleBoost: () => void;
  instantSpin: boolean;
  onToggleInstantSpin: () => void;
  turboSpin: boolean;
  onToggleTurboSpin: () => void;
  onSpin: () => void;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onBuyBonus: () => void;
  onToggleAutoSpin: () => void;
  onOpenPaytable: () => void;
}

export default function SlotControlPanel({
  balance,
  currentBet,
  currency,
  betLevels,
  currentBetIndex,
  spinning,
  autoSpinEnabled,
  freeSpinsRemaining,
  freeSpinsTotalWin = 0,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  boostActive,
  onToggleBoost,
  instantSpin,
  onToggleInstantSpin,
  turboSpin,
  onToggleTurboSpin,
  onSpin,
  onIncreaseBet,
  onDecreaseBet,
  onBuyBonus,
  onToggleAutoSpin,
  onOpenPaytable,
}: ControlPanelProps) {
  const atMin = currentBetIndex === 0;
  const atMax = currentBetIndex === betLevels.length - 1;
  // When boost is active, the actual cost per spin is 2× the base bet
  const displayBet = boostActive ? currentBet * 2 : currentBet;
  const cur = currency ?? 'USD';

  return (
    <>

      {/* ================= CONTROL BAR (all screen sizes) ================= */}
      <div className="flex w-full justify-center px-2 py-2 sm:p-4 z-50">
        <div className="relative flex items-center justify-center w-full max-w-3xl">


          {/* Buy Bonus / Deactivate Boost Button */}
          <div className="absolute left-0 z-20 flex flex-col items-center justify-center h-10 w-10 sm:h-16 sm:w-16 -ml-1 sm:-ml-2">
            {boostActive ? (
              <button
                onClick={onToggleBoost}
                disabled={spinning}
              className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-red-600 border-2 border-red-400 shadow-lg shadow-red-900/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 animate-pulse"
              >
                <span style={{ fontSize: '9px', letterSpacing: '0.04em', transform: 'scaleX(0.78)', display: 'inline-block', fontWeight: 900, color: 'white', whiteSpace: 'nowrap' }}>DEACTIVATE</span>
              </button>
            ) : (
              <button
                onClick={onBuyBonus}
                disabled={spinning}
                className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#fbbf24] border-2 border-[#f59e0b] shadow-lg flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
              >
                <span className="text-black font-extrabold text-[10px] leading-tight text-center">
                  BUY<br />BONUS
                </span>
              </button>
            )}
          </div>

          {/* Main Control Bar */}
          <div className="relative bg-[#1a1b1e]/95 backdrop-blur-sm w-full max-w-2xl flex flex-col rounded-sm shadow-2xl border-t border-white/10 ml-6 sm:ml-8">

            {/* Controls Row */}
            <div className="h-12 sm:h-16 flex items-center px-2 sm:px-4">

              {/* Left: Menu & Balance */}
              <div className="flex items-center gap-2 sm:gap-6 pl-4 sm:pl-8">
                <HamburgerMenu
                  onOpenPaytable={onOpenPaytable}
                  isMuted={isMuted}
                  onToggleMute={onToggleMute}
                  volume={volume}
                  onVolumeChange={onVolumeChange}
                  instantSpin={instantSpin}
                  onToggleInstantSpin={onToggleInstantSpin}
                  turboSpin={turboSpin}
                  onToggleTurboSpin={onToggleTurboSpin}
                />

                <div className="flex flex-col">
                  <span className="hidden sm:block text-[10px] text-gray-400 font-bold tracking-wider uppercase">Balance</span>
                  <span className="text-sm sm:text-xl font-bold text-white tracking-wide">{formatBalance(balance, cur)}</span>
                </div>
              </div>

              <div className="flex-1 flex justify-center items-center">
                {freeSpinsRemaining > 0 && freeSpinsTotalWin > 0 && (
                  <div className="flex flex-col items-center justify-center px-6 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                    <span className="text-[10px] text-yellow-500 font-extrabold tracking-widest uppercase mb-0.5">Free Spins Win</span>
                    <span className="text-xl font-black text-yellow-300 drop-shadow-md leading-none">{formatBalance(freeSpinsTotalWin, cur)}</span>
                  </div>
                )}
              </div>

              {/* Right: Bet display + arrows + spin + autospin */}
              <div className="flex items-center gap-4 pr-18">

                {/* Bet Display + Up/Down */}
                <div className="flex items-center bg-[#0f1012] rounded-md h-9 sm:h-12 border border-white/5 relative mr-10 sm:mr-12 overflow-hidden">
                  <div className="flex flex-col justify-center px-2 sm:px-4 min-w-[70px] sm:min-w-[110px]">
                    <span className="hidden sm:block text-[9px] text-gray-400 font-bold tracking-wider uppercase">Current Bet</span>
                    <span className={`text-sm sm:text-lg font-bold flex items-center gap-2 ${boostActive ? 'text-red-400' : 'text-yellow-400'}`}>
                      {formatBet(displayBet)}
                    </span>
                  </div>
                  <div className="flex flex-col h-full border-l border-white/10">
                    <button
                      onClick={onIncreaseBet}
                      disabled={spinning || atMax}
                      className="flex-1 px-2 hover:bg-white/10 active:bg-white/20 transition flex items-center justify-center disabled:opacity-40"
                    >
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 0L9.33013 5.25H0.669873L5 0Z" fill="white" /></svg>
                    </button>
                    <button
                      onClick={onDecreaseBet}
                      disabled={spinning || atMin}
                      className="flex-1 px-2 hover:bg-white/10 active:bg-white/20 transition flex items-center justify-center border-t border-white/10 disabled:opacity-40"
                    >
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M5 6L0.669873 0.75L9.33013 0.75L5 6Z" fill="white" /></svg>
                    </button>
                  </div>
                  {/* Progress bar shows bet position */}
                  <div
                    className="absolute bottom-0 left-0 h-[2px] bg-yellow-400 transition-all"
                    style={{ width: `${((currentBetIndex) / (betLevels.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Spin + AutoSpin */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 flex items-center gap-2 pr-2">
                  <button
                    onClick={onSpin}
                    disabled={spinning}
                    className={`w-12 h-12 sm:w-18 sm:h-18 rounded-full border-4 border-[#2b2d31] bg-[#1a1b1e] flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all ${spinning ? 'opacity-80' : ''}`}
                  >
                    {freeSpinsRemaining > 0 ? (
                      <>
                        <span className="text-[8px] font-black text-yellow-400 mt-1">FREE SPINS</span>
                        <span className="text-[24px] font-black text-white leading-tight">{freeSpinsRemaining}</span>
                      </>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`sm:w-10 sm:h-10 text-white ${spinning ? 'animate-spin' : ''}`}>
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={onToggleAutoSpin}
                    className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition active:scale-95 ${autoSpinEnabled ? 'bg-green-600' : 'bg-[#1a1b1e]'}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-white ml-0.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

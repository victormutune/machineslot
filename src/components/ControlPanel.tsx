import { formatBalance, formatBet } from '../stake/stakeEngineHelpers';

interface ControlPanelProps {
  balance: number;
  currentBet: number;
  betLevels: number[];
  currentBetIndex: number;
  spinning: boolean;
  autoSpinEnabled: boolean;
  freeSpinsRemaining: number;
  freeSpinsTotalWin?: number;
  isMuted: boolean;
  onToggleMute: () => void;
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
  betLevels,
  currentBetIndex,
  spinning,
  autoSpinEnabled,
  freeSpinsRemaining,
  freeSpinsTotalWin = 0,
  isMuted,
  onToggleMute,
  onSpin,
  onIncreaseBet,
  onDecreaseBet,
  onBuyBonus,
  onToggleAutoSpin,
  onOpenPaytable,
}: ControlPanelProps) {
  const atMin = currentBetIndex === 0;
  const atMax = currentBetIndex === betLevels.length - 1;
  const displayBet = currentBet;

  return (
    <>
      {/* ================= MOBILE LAYOUT ================= */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end pb-2 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center pointer-events-auto">
          {/* Status */}
          <div className="mb-3">
            <h2 className="text-white font-black text-xl tracking-wider drop-shadow-md uppercase text-center animate-pulse">
              {spinning ? 'GOOD LUCK!' : 'PLACE YOUR BETS!'}
            </h2>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-center gap-6 mb-3 w-full px-4">
            {/* Decrease Bet */}
            <button
              onClick={onDecreaseBet}
              disabled={spinning || atMin}
              className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition disabled:opacity-40"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Spin Button */}
            <button
              onClick={onSpin}
              disabled={spinning}
              className={`w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 transition ${spinning ? 'opacity-80' : ''}`}
            >
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-white ${spinning ? 'animate-spin' : ''}`}>
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>

            {/* Increase Bet */}
            <button
              onClick={onIncreaseBet}
              disabled={spinning || atMax}
              className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition disabled:opacity-40"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between w-full px-6 mb-2">
            {/* Info / Paytable */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPaytable}
                className="w-14 h-8 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white italic font-serif hover:bg-white/10"
              >
                i
              </button>
            </div>

            {/* Free Spins / Buy Bonus & Mute */}
            <div className="flex items-end gap-2">
              <button
                onClick={onToggleMute}
                className="w-10 h-10 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition"
              >
                {isMuted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                )}
              </button>

              <button
                onClick={freeSpinsRemaining > 0 ? undefined : onBuyBonus}
                disabled={spinning || freeSpinsRemaining > 0}
                className={`h-10 rounded-full border border-white/20 bg-black/40 flex flex-col items-center justify-center hover:bg-white/10 active:scale-95 transition ${freeSpinsRemaining > 0 ? 'w-32 border-yellow-400/50' : 'w-16'}`}
              >
                {freeSpinsRemaining > 0 ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-yellow-400 font-bold leading-none">FREE SPINS</span>
                    <span className="text-lg text-white font-black leading-none">{freeSpinsRemaining}</span>
                  </div>
                ) : (
                  <div className="flex -space-x-1">
                    <div className="w-3 h-3 rounded-full border border-white bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full border border-white bg-yellow-400" />
                  </div>
                )}
              </button>
            </div>

            {/* Auto Spin */}
            <button
              onClick={onToggleAutoSpin}
              className={`w-14 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 ${autoSpinEnabled ? 'bg-green-600/50' : 'bg-black/40'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {/* Footer: Credit / Bet */}
          <div className="flex gap-4 text-xs font-bold text-[#f2d27a] tracking-wider mb-2">
            <span>CREDIT {formatBalance(balance)}</span>
            <span className="flex items-center gap-1">
              BET {formatBet(displayBet)}
            </span>
          </div>
        </div>
      </div>


      {/* ================= DESKTOP LAYOUT (LG+) ================= */}
      <div className="hidden lg:flex w-full justify-center p-4 fixed bottom-0 left-0 z-50">
        <div className="relative flex items-center justify-center w-full max-w-3xl">


          {/* Sound Control + Buy Bonus Button Stack */}
          <div className="absolute left-0 z-20 transform -translate-x-4 flex flex-col items-center gap-2 -translate-y-6">
            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-full border border-white/20 bg-black/60 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all shadow-lg backdrop-blur-sm"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              )}
            </button>

            <button
              onClick={onBuyBonus}
              disabled={spinning}
              className="w-18 h-18 rounded-full bg-[#fbbf24] border-2 border-[#f59e0b] shadow-lg flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
            >
              <span className="text-black font-extrabold text-[10px] leading-tight text-center">
                BUY<br />BONUS
              </span>
            </button>
          </div>

          {/* Main Control Bar */}
          <div className="relative bg-[#1a1b1e]/95 backdrop-blur-sm w-full max-w-2xl flex flex-col rounded-sm shadow-2xl border-t border-white/10 ml-8 overflow-hidden">

            {/* Controls Row */}
            <div className="h-16 flex items-center px-4">

              {/* Left: Menu & Balance */}
              <div className="flex items-center gap-6 pl-8">
                <button onClick={onOpenPaytable} className="text-white hover:text-gray-300 transition">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>

                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Balance</span>
                  <span className="text-xl font-bold text-white tracking-wide">{formatBalance(balance)}</span>
                </div>
              </div>

              <div className="flex-1 flex justify-center items-center">
                {freeSpinsRemaining > 0 && freeSpinsTotalWin > 0 && (
                  <div className="flex flex-col items-center justify-center px-6 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                    <span className="text-[10px] text-yellow-500 font-extrabold tracking-widest uppercase mb-0.5">Free Spins Win</span>
                    <span className="text-xl font-black text-yellow-300 drop-shadow-md leading-none">{formatBalance(freeSpinsTotalWin)}</span>
                  </div>
                )}
              </div>

              {/* Right: Bet display + arrows + spin + autospin */}
              <div className="flex items-center gap-4 pr-18">

                {/* Bet Display + Up/Down */}
                <div className="flex items-center bg-[#0f1012] rounded-md h-12 border border-white/5 relative mr-12 overflow-hidden">
                  <div className="flex flex-col justify-center px-4 min-w-[110px]">
                    <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Current Bet</span>
                    <span className="text-lg font-bold text-yellow-400 flex items-center gap-2">
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
                    className={`w-18 h-18 rounded-full border-4 border-[#2b2d31] bg-[#1a1b1e] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all ${spinning ? 'opacity-80' : ''}`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-white ${spinning ? 'animate-spin' : ''}`}>
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
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

import { formatBalance, formatBet } from '../stake/stakeEngineHelpers';
import HamburgerMenu from './ui/HamburgerMenu';
import { t } from '../locale/locale';

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
  isMusicMuted: boolean;
  onToggleMusic: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
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
  onOpenBetSelection: () => void;
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
  isMusicMuted,
  onToggleMusic,
  isSoundMuted,
  onToggleSound,
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
  onOpenBetSelection,
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
                  {t('BUY')}<br />{t('BONUS')}
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
                  isMusicMuted={isMusicMuted}
                  onToggleMusic={onToggleMusic}
                  isSoundMuted={isSoundMuted}
                  onToggleSound={onToggleSound}
                  instantSpin={instantSpin}
                  onToggleInstantSpin={onToggleInstantSpin}
                  turboSpin={turboSpin}
                  onToggleTurboSpin={onToggleTurboSpin}
                />

                <div className="flex flex-col">
                  <span className="hidden sm:block text-[10px] text-gray-400 font-bold tracking-wider uppercase">{t('Balance')}</span>
                  <div className="flex items-center gap-1.5">
                    {cur === 'XGC' && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 leading-none">GC</span>
                    )}
                    {cur === 'XSC' && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 leading-none">SC</span>
                    )}
                    <span className={`text-sm sm:text-xl font-bold tracking-wide ${cur === 'XGC' ? 'text-yellow-300' : cur === 'XSC' ? 'text-slate-300' : 'text-white'}`}>
                      {formatBalance(balance, cur)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex justify-center items-center">
                {freeSpinsRemaining > 0 && freeSpinsTotalWin > 0 && (
                  <div className="flex flex-col items-center justify-center px-6 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                    <span className="text-[10px] text-yellow-500 font-extrabold tracking-widest uppercase mb-0.5">{t('Free Spins Win')}</span>
                    <span className="text-xl font-black text-yellow-300 drop-shadow-md leading-none">{formatBalance(freeSpinsTotalWin, cur)}</span>
                  </div>
                )}
              </div>

              {/* Right: Bet display + arrows + spin + autospin */}
              <div className="flex items-center gap-4 pr-18">

                {/* Bet Display + Up/Down */}
                <div className="flex items-center gap-2 sm:gap-3 mr-10 sm:mr-12">
                  <div 
                    className="flex flex-col items-end justify-center cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                    onClick={onOpenBetSelection}
                    role="button"
                    title="Select Bet Level"
                  >
                    <div className='relative bg-[#1a1b1e]/10 flex flex-col p-2 overflow-hidden'>
                      <span className="text-[8px] sm:text-[12px] text-yellow-500 font-extrabold tracking-widest leading-none mb-1">{t('BET')}</span>
                      <span className={`text-xl sm:text-xl font-black ${boostActive ? 'text-red-400' : 'text-white'} leading-none`}>
                          {formatBet(displayBet, cur)}
                      </span>
                      
                      {/* Dynamic Indicator Line */}
                      <div className="absolute bottom-0 left-0 h-[3px] bg-yellow-500 transition-all duration-300 ease-out" style={{ width: `${((currentBetIndex + 1) / betLevels.length) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <button
                      onClick={onIncreaseBet}
                      disabled={spinning || atMax}
                      className="w-6 h-6 sm:w-6 sm:h-6 rounded-full border-2 border-white hover:bg-white/20 active:bg-white/30 transition flex items-center justify-center disabled:opacity-40"
                    >
                      <span className="text-white font-black text-sm sm:text-lg leading-none mt-[1px]">+</span>
                    </button>
                    <button
                      onClick={onDecreaseBet}
                      disabled={spinning || atMin}
                      className="w-6 h-6 sm:w-6   sm:h-6 rounded-full border-2 border-white hover:bg-white/20 active:bg-white/30 transition flex items-center justify-center disabled:opacity-40"
                    >
                      <span className="text-white font-black text-sm sm:text-lg leading-none mb-[1px]">-</span>
                    </button>
                  </div>
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

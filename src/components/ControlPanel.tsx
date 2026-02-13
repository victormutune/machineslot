

interface ControlPanelProps {
  balance: number;
  currentBet: number;
  spinning: boolean;
  autoSpinEnabled: boolean;
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
  spinning,
  autoSpinEnabled,
  onSpin,
  onIncreaseBet,
  onDecreaseBet,
  onBuyBonus,
  onToggleAutoSpin,
  onOpenPaytable
}: ControlPanelProps) {

  return (
    <>
      {/* ================= MOBILE LAYOUT (Now includes MD/Tablet) ================= */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end pb-2 pointer-events-none">
         {/* Gradient Overlay for visibility */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>

         <div className="relative z-10 w-full flex flex-col items-center pointer-events-auto">
            {/* Status Message */}
            <div className="mb-4">
                <h2 className="text-white font-black text-xl tracking-wider drop-shadow-md uppercase text-center animate-pulse">
                    {spinning ? 'GOOD LUCK!' : 'PLACE YOUR BETS!'}
                </h2>
            </div>
            
            {/* Main Controls Row: (-) [SPIN] (+) */}
            <div className="flex items-center justify-center gap-6 mb-4 w-full px-4">
                {/* Decrease Bet */}
                <button 
                    onClick={onDecreaseBet}
                    disabled={spinning}
                    className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition disabled:opacity-50"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>

                {/* Spin Button */}
                <button 
                    onClick={onSpin}
                    disabled={spinning}
                    className={`w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 transition ${spinning ? 'opacity-80' : ''}`}
                >
                     <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-white ${spinning ? 'animate-spin' : ''}`}>
                             <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                             <path d="M21 3v5h-5"></path>
                        </svg>
                </button>

                {/* Increase Bet */}
                <button 
                    onClick={onIncreaseBet}
                    disabled={spinning}
                    className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition disabled:opacity-50"
                >
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            {/* Bottom Row: Info - Coins - Menu */}
            <div className="flex items-center justify-between w-full px-6 mb-2">
                {/* Info (Left) - Using PayTable logic if available or placeholder */}
                <button 
                    onClick={onOpenPaytable} 
                    className="w-14 h-8 rounded-full border border-white/20 bg-black/40 flex items-center justify-center text-white italic font-serif hover:bg-white/10"
                >
                    i
                </button>

                {/* Coins / Buy Bonus (Center) */}
                <button 
                    onClick={onBuyBonus}
                    disabled={spinning}
                    className="w-16 h-10 rounded-full border border-white/20 bg-black/40 flex flex-col items-center justify-center hover:bg-white/10 active:scale-95 transition"
                >
                    <div className="flex -space-x-1">
                        <div className="w-3 h-3 rounded-full border border-white bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full border border-white bg-yellow-400"></div>
                    </div>
                </button>

                 {/* Menu / AutoSpin (Right) */}
                <button 
                    onClick={onToggleAutoSpin}
                    className={`w-14 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 ${autoSpinEnabled ? 'bg-green-600/50' : 'bg-black/40'}`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Footer Text */}
            <div className="flex gap-4 text-xs font-bold text-[#f2d27a] tracking-wider mb-2">
                <span>CREDIT ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span>BET ${currentBet.toFixed(2)}</span>
            </div>

         </div>
      </div>


      {/* ================= DESKTOP LAYOUT (LG+) ================= */}
      <div className="hidden lg:flex w-full justify-center p-4 fixed bottom-0 left-0 z-50">
        <div className="relative flex items-center justify-center w-full max-w-4xl">
            
            {/* Buy Bonus Button */}
            <div className="absolute left-0 z-20 transform -translate-x-4">
                <button
                onClick={onBuyBonus}
                disabled={spinning}
                className="w-20 h-20 rounded-full bg-[#fbbf24] border-2 border-[#f59e0b] shadow-lg flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <span className="text-black font-extrabold text-[10px] leading-tight text-center">
                    BUY<br />BONUS
                </span>
                </button>
            </div>

            {/* Main Control Bar */}
            <div className="relative bg-[#1a1b1e]/95 backdrop-blur-sm h-16 w-full max-w-3xl flex items-center px-4 rounded-sm shadow-2xl border-t border-white/10 ml-8">
                
                {/* Left Section: Menu & Balance */}
                <div className="flex items-center gap-6 pl-8">
                    {/* Menu Icon */}
                    <button 
                        onClick={onOpenPaytable}
                        className="text-white hover:text-gray-300 transition"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="12" x2="20" y2="12"></line>
                            <line x1="4" y1="6" x2="20" y2="6"></line>
                            <line x1="4" y1="18" x2="20" y2="18"></line>
                        </svg>
                    </button>

                    {/* Balance */}
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Demo Balance</span>
                        <span className="text-xl font-bold text-white tracking-wide">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1">
                    
                </div>

                {/* Right Section: Bet & Spin Controls */}
                <div className="flex items-center gap-4 pr-18">
                    
                    {/* Bet Control */}
                    <div className="flex items-center bg-[#0f1012] rounded-md h-12 border border-white/5 relative mr-8 overflow-hidden">
                        <div className="flex flex-col justify-center px-4 min-w-[100px]">
                            <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Demo Bet</span>
                            <span className="text-lg font-bold text-white">${currentBet.toFixed(2)}</span>
                        </div>
                        {/* Up/Down Arrows */}
                        <div className="flex flex-col h-full border-l border-white/10">
                            <button 
                                onClick={onIncreaseBet}
                                disabled={spinning}
                                className="flex-1 px-2 hover:bg-white/10 active:bg-white/20 transition flex items-center justify-center disabled:opacity-50"
                            >
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 0L9.33013 5.25H0.669873L5 0Z" fill="white"/>
                                </svg>
                            </button>
                            <button 
                                onClick={onDecreaseBet}
                                disabled={spinning}
                                className="flex-1 px-2 hover:bg-white/10 active:bg-white/20 transition flex items-center justify-center border-t border-white/10 disabled:opacity-50"
                            >
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 6L0.669873 0.75L9.33013 0.75L5 6Z" fill="white"/>
                                </svg>
                            </button>
                        </div>
                        {/* Progress Bar (Visual only as per image) */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-white w-1/3"></div>
                    </div>

                    {/* Spin Button Container (Overlapping) */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 z-20 flex items-center gap-2">
                        {/* Spin Button */}
                        <button 
                            onClick={onSpin}
                            disabled={spinning}
                            className={`w-20 h-20 rounded-full border-4 border-[#2b2d31] bg-[#1a1b1e] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group ${spinning ? 'opacity-80' : ''}`}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-white ${spinning ? 'animate-spin' : ''}`}>
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                                <path d="M21 3v5h-5"></path>
                            </svg>
                        </button>

                        {/* Auto Spin Button (Small) */}
                        <button 
                            onClick={onToggleAutoSpin}
                            className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition active:scale-95 relative ${autoSpinEnabled ? 'bg-green-600' : 'bg-[#1a1b1e]'}`}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-white ml-0.5">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span className="absolute top-0 right-0 -mt-1 -mr-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white transform -scale-x-100">
                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                                    <path d="M21 3v5h-5"></path>
                                </svg>
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </>
  );
}

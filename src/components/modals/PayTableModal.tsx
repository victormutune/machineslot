import { SYMBOLS } from '../../assets/assetMap';

interface PayTableModalProps {
  open: boolean;
  onClose: () => void;
}

const PayTableModal = ({ open, onClose }: PayTableModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      
      {/* Circle Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[210] text-zinc-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <div className="w-10 h-10 rounded-full border-2 border-zinc-400 flex items-center justify-center hover:border-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>

      <div className="relative w-full max-w-4xl h-full flex flex-col items-center overflow-hidden">
        
        {/* Header */}
        <div className="w-full text-center py-8 shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase italic transform skew-x-[-12deg]">
            GAME INFO - LE BALLER™
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full px-6 md:px-12 paytable-scroll pb-20">
          <div className="max-w-3xl mx-auto space-y-10 text-zinc-100 font-medium leading-relaxed">

            {/* ABOUT THE GAME */}
            <section>
              <h3 className="text-lg md:text-xl font-black text-yellow-500 mb-6 tracking-wide uppercase">
                ABOUT THE GAME
              </h3>
              <div className="space-y-4 text-sm md:text-base text-zinc-200">
                <p>
                  Step onto the pitch and experience the roar of the crowd in Le Baller™! The stadium is packed, the lights are bright, and the championship trophy is within your reach. 
                </p>
                <p>
                  Join the elite ranks of football legends as you spin through a high-stakes 6-reel, 4-row arena. Whether you're chasing the golden boot or the ultimate cup, every spin is a chance to strike for glory and secure a massive win of up to 15,000 times your bet!
                </p>
              </div>
            </section>

            {/* FEATURES */}
            <section>
              <h3 className="text-lg md:text-xl font-black text-yellow-500 mb-6 tracking-wide uppercase">
                FEATURES
              </h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase">W WILDS</h4>
                  <p className="text-sm md:text-base text-zinc-200">
                    The W symbol acts as a <span className="text-yellow-500 font-bold italic">WILD</span> and substitutes for all regular paying symbols. When a W is part of a winning payline, it randomly applies a powerful multiplier of <span className="text-yellow-500 font-bold">2x, 3x, or 5x</span> to your win!
                  </p>
                </div>

                <div>
                  <h4 className="text-base md:text-lg font-black text-white mb-3 uppercase">BONUS FREE SPINS</h4>
                  <p className="text-sm md:text-base text-zinc-200 mb-6">
                    Landing 4 or more Bonus scatter symbols anywhere on the reels triggers the Free Spins feature, giving you more chances to score big without placing a bet.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <div className="flex justify-center gap-12 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-black text-yellow-500">8</div>
                        <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Spins</div>
                        <div className="text-[8px] text-zinc-500">4 Scatters</div>
                      </div>
                      <div className="text-center border-l border-white/10 pl-12">
                        <div className="text-2xl font-black text-yellow-500">12</div>
                        <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Spins</div>
                        <div className="text-[8px] text-zinc-500">5+ Scatters</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SYMBOL PAYOUTS */}
            <section>
              <h3 className="text-lg md:text-xl font-black text-yellow-500 mb-6 tracking-wide uppercase">
                SYMBOL PAYOUTS
              </h3>
              {/* High Paying Symbols */}
              <div className="mb-12">
                <h4 className="text-sm font-black text-zinc-500 mb-6 tracking-[0.2em] uppercase text-center border-b border-white/5 pb-2">High Paying Symbols</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SYMBOLS
                    .filter(s => ![1, 6, 10, 12, 13, 4].includes(s.id))
                    .sort((a, b) => {
                      const a6 = (a.payouts as any)[6] || (a.payouts as any)[5] || 0;
                      const b6 = (b.payouts as any)[6] || (b.payouts as any)[5] || 0;
                      return b6 - a6;
                    })
                    .map((symbol) => (
                      <div key={symbol.id} className="bg-white/5 rounded-2xl p-5 border border-white/10 flex gap-5 items-center hover:bg-white/10 transition-colors group">
                        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 relative">
                          <img src={symbol.image} alt={symbol.name} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-2 italic">
                            {symbol.id === 8 ? 'WILD (W)' : symbol.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(symbol.payouts).map(([count, pay]) => (
                              <div key={count} className="flex justify-between items-center bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                <span className="text-[10px] text-zinc-500 font-bold">{count}x</span>
                                <span className="text-[11px] text-yellow-500 font-black italic">{pay}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Low Paying Symbols */}
              <div>
                <h4 className="text-sm font-black text-zinc-500 mb-6 tracking-[0.2em] uppercase text-center border-b border-white/5 pb-2">Low Paying Symbols</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {SYMBOLS
                    .filter(s => [1, 6, 10, 12, 13].includes(s.id))
                    .sort((a, b) => {
                      const a6 = (a.payouts as any)[6] || 0;
                      const b6 = (b.payouts as any)[6] || 0;
                      return b6 - a6;
                    })
                    .map((symbol) => (
                      <div key={symbol.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 mb-3">
                          <img src={symbol.image} alt={symbol.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-tighter mb-2 italic">{symbol.name}</h4>
                        <div className="w-full space-y-0.5">
                          {Object.entries(symbol.payouts).map(([count, pay]) => (
                            <div key={count} className="flex justify-between items-center bg-black/40 px-2 py-0.5 rounded-sm">
                              <span className="text-[8px] text-zinc-500 font-bold">{count}x</span>
                              <span className="text-[9px] text-yellow-500 font-black">{pay}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </section>

            {/* WAYS TO WIN */}
            <section>
              <h3 className="text-lg md:text-xl font-black text-yellow-500 mb-6 tracking-wide uppercase">
                WAYS TO WIN
              </h3>
              <p className="text-sm text-zinc-300 mb-8 max-w-2xl">
                Wins are attained by matching at least 3 symbols on one of the 20 predefined lines on adjacent reels starting from the leftmost reel.
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
                {[
                  [0,0,0,0,0,0],[1,1,1,1,1,1],[2,2,2,2,2,2],[3,3,3,3,3,3],
                  [0,1,2,1,0,1],[3,2,1,2,3,2],[1,2,3,2,1,2],[2,1,0,1,2,1],
                  [0,1,0,1,0,1],[1,0,1,0,1,0],[2,3,2,3,2,3],[3,2,3,2,3,2],
                  [0,1,2,3,2,1],[3,2,1,0,1,2],[1,2,1,2,1,2],[2,1,2,1,2,1],
                  [0,0,1,2,1,0],[3,3,2,1,2,3],[1,1,2,3,2,1],[2,2,1,0,1,2],
                ].map((line, idx) => (
                  <div key={idx} className="bg-black/40 p-1.5 rounded border border-white/5">
                    <div className="text-[10px] text-yellow-500 font-black mb-1 text-center">{idx + 1}</div>
                    <div className="grid grid-cols-6 gap-0.5">
                      {[0,1,2,3,4,5].map(col => (
                        <div key={col} className="flex flex-col gap-0.5">
                          {[0,1,2,3].map(row => (
                            <div
                              key={row}
                              className={`w-full h-1.5 rounded-px ${line[col] === row ? 'bg-yellow-500' : 'bg-white/10'}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW TO PLAY */}
            <section>
              <h3 className="text-lg md:text-xl font-black text-yellow-500 mb-6 tracking-wide uppercase">
                HOW TO PLAY
              </h3>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black shrink-0">1</div>
                    <p className="text-sm md:text-base">Set your bet using the <span className="text-yellow-500 font-bold">−</span> and <span className="text-yellow-500 font-bold">+</span> buttons in the control panel.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black shrink-0">2</div>
                    <p className="text-sm md:text-base">Press the central <span className="text-zinc-100 font-black uppercase tracking-tighter italic">SPIN</span> button to start your journey with Le Baller™.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black shrink-0">3</div>
                    <p className="text-sm md:text-base">For continuous automated play, click the <span className="text-yellow-500 font-bold">Auto Spin</span> button and select the number of rounds.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black shrink-0">4</div>
                    <p className="text-sm md:text-base">Match symbols along any of the <span className="text-yellow-500 font-bold italic">20 paylines</span> to secure a bounty!</p>
                  </li>
                </ul>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PayTableModal;


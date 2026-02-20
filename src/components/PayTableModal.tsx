import React from 'react';
import { SYMBOLS } from '../assets/assetMap';

interface PayTableModalProps {
  open: boolean;
  onClose: () => void;
}

const PayTableModal = ({ open, onClose }: PayTableModalProps) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const totalPages = 4;
  const PAGE_TITLES = ['Symbol Payouts', 'Free Spins & Specials', 'Ways to Win', 'How to Play'];

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#3e2723] border-4 border-[#5d4037] rounded-xl shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl md:text-4xl font-display text-yellow-400 text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] shrink-0 transition-all duration-300">
          {PAGE_TITLES[currentPage]}
        </h2>

        {/* Content Area - Scrollable if needed, but pages should fit mostly */}
        <div className="flex-1 overflow-y-auto min-h-0 text-zinc-200 px-2 relative">
            
            {/* PAGE 1: SYMBOL PAYOUTS */}
            {currentPage === 0 && (
                <div className="animate-in slide-in-from-right duration-300">
                    <div className="grid grid-cols-5 font-bold text-yellow-300 border-b border-white/20 pb-1 mb-2 sticky top-0 bg-[#3e2723]">
                        <div className="col-span-2">Symbol</div>
                        <div className="text-center">3x</div>
                        <div className="text-center">4x</div>
                        <div className="text-center">5x</div>
                    </div>
                    {/* Sort symbols: Low value (Cards) -> High value (Characters). Football (ID 4) is excluded/moved. */ }
                    {SYMBOLS.filter(s => s.id !== 4).sort((a, b) => { // Exclude Football (ID 4)
                         const maxPayoutA = Math.max(...Object.values(a.payouts || {}));
                         const maxPayoutB = Math.max(...Object.values(b.payouts || {}));
                         return maxPayoutA - maxPayoutB;
                    }).map((symbol) => (
                        <div key={symbol.id} className="grid grid-cols-5 items-center bg-black/20 p-2 rounded hover:bg-black/30 transition-colors mb-1">
                             <div className="col-span-2 flex items-center gap-2">
                                <img src={symbol.image} alt={symbol.name} className="w-8 h-8 object-contain" />
                                <span className="font-semibold text-zinc-100">{symbol.name}</span>
                             </div>
                             {symbol.id === -1 ? (
                                <div className="col-span-3 text-center font-bold text-yellow-300 tracking-wider text-xs md:text-sm">
                                    SCATTER / FREE SPINS
                                </div>
                             ) : (
                                <>
                                    {/* @ts-ignore */}
                                    <div className="text-center font-mono text-yellow-400">{(symbol.payouts?.[3] || 0).toFixed(2)}</div>
                                    {/* @ts-ignore */}
                                    <div className="text-center font-mono text-yellow-400">{(symbol.payouts?.[4] || 0).toFixed(2)}</div>
                                    {/* @ts-ignore */}
                                    <div className="text-center font-mono text-yellow-400">{(symbol.payouts?.[5] || 0).toFixed(2)}</div>
                                </>
                             )}
                        </div>
                    ))}
                </div>
            )}

            {/* PAGE 2: FEATURES & RULES */}
            {currentPage === 1 && (
                <div className="animate-in slide-in-from-right duration-300 space-y-8">
                     {/* Free Spins Section */}
                    <div>
                        <div className="bg-black/20 p-4 rounded-lg text-center">
                             <p className="text-zinc-300 mb-4">
                                Land 3 or more SCATTER symbols to win FREE SPINS. <br/>
                                During Free Spins, winnings are multiplied!
                             </p>
                             
                             {/* Football Symbol (Scatter/Special) shown here */}
                             {(() => {
                                // ID 4 is Football/Scatter
                                const football = SYMBOLS.find(s => s.id === 4);
                                if (!football) return null;
                                    return (
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center gap-3 max-w-xs mx-auto">
                                             <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                                <img src={football.image} alt={football.name} className="max-w-full max-h-full object-contain" />
                                             </div>
                                             <div className="text-left">
                                                 <div className="font-bold text-yellow-400">{football.name}</div>
                                                 <div className="text-xs text-zinc-400">SCATTER - Triggers Free Spins</div>
                                                 {(football.payouts?.[3] || 0) > 0 && (
                                                     <div className="flex gap-3 mt-1 text-xs font-mono text-zinc-300">
                                                         {/* @ts-ignore */}
                                                        <div>3x: {football.payouts?.[3] ?? 0}</div>
                                                         {/* @ts-ignore */}
                                                        <div>4x: {football.payouts?.[4] ?? 0}</div>
                                                         {/* @ts-ignore */}
                                                        <div>5x: {football.payouts?.[5] ?? 0}</div>
                                                     </div>
                                                 )}
                                             </div>
                                        </div>
                                    );
                             })()}
                        </div>
                    </div>

                    {/* Game Rules */}
                     <div>
                        <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-white/10 pb-2 text-center">Game Rules</h3>
                        <ul className="list-disc list-inside space-y-3 text-zinc-300 text-base max-w-2xl mx-auto bg-black/20 p-6 rounded-lg">
                            <li>All wins pay left to right on adjacent reels, starting from the leftmost reel.</li>
                            <li>Only the highest win equals paid per winning combination.</li>
                            <li>WILD symbol substitutes for all symbols except BONUS scatter.</li>
                            <li>3 or more BONUS symbols trigger the Free Spins feature.</li>
                            <li>Malfunction voids all pays and plays.</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* PAGE 3: WAYS TO WIN */}
            {currentPage === 2 && (
                <div className="animate-in slide-in-from-right duration-300">
                    <p className="text-sm text-zinc-300 mb-6 text-center max-w-2xl mx-auto">
                        Wins are attained by matching at least 3 symbols on one of the 16 predefined lines on adjacent reels starting from the leftmost reel.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Payline Visuals */}
                         {[
                            [0, 0, 0, 0, 0], // 1
                            [1, 1, 1, 1, 1], // 2
                            [2, 2, 2, 2, 2], // 3
                            [3, 3, 3, 3, 3], // 4
                            [0, 1, 2, 1, 0], // 5
                            [3, 2, 1, 2, 3], // 6
                            [1, 2, 3, 2, 1], // 7
                            [2, 1, 0, 1, 2], // 8
                            [0, 1, 0, 1, 0], // 9
                            [1, 0, 1, 0, 1], // 10
                            [2, 3, 2, 3, 2], // 11
                            [3, 2, 3, 2, 3], // 12
                            [0, 1, 2, 3, 2], // 13
                            [2, 1, 2, 1, 2], // 14
                            [1, 2, 1, 2, 1], // 15
                            [2, 1, 2, 1, 2], // 16
                          ].map((line, idx) => (
                            <div key={idx} className="bg-black/40 p-2 rounded-lg border border-white/10 hover:border-yellow-500/50 transition-colors">
                                <div className="text-xs text-yellow-500 mb-1 font-bold text-center">Line {idx + 1}</div>
                                <div className="grid grid-cols-5 gap-1">
                                    {[0, 1, 2, 3, 4].map(col => (
                                        <div key={col} className="flex flex-col gap-1">
                                            {[0, 1, 2, 3].map(row => (
                                                <div 
                                                    key={row} 
                                                    className={`w-full h-2 rounded-sm ${line[col] === row ? 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.6)]' : 'bg-white/10'}`}
                                                ></div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                          ))}
                    </div>
                </div>
            )}

            {/* PAGE 4: HOW TO PLAY */}
            {currentPage === 3 && (
                <div className="animate-in slide-in-from-right duration-300 h-full flex flex-col py-4">
                     <div className="flex-1 flex items-center justify-center">
                         <div className="bg-black/30 p-8 rounded-xl border border-white/10 max-w-2xl w-full">
                             <ul className="space-y-6 text-zinc-200 text-lg">
                                <li className="flex items-start gap-4">
                                    <span className="bg-yellow-600/20 text-yellow-400 font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">1</span>
                                    <span>Set your bet amount using the <strong>(-)</strong> and <strong>(+)</strong> buttons on the control panel.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="bg-yellow-600/20 text-yellow-400 font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">2</span>
                                    <span>Press the big <strong>SPIN</strong> button to start the game.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="bg-yellow-600/20 text-yellow-400 font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">3</span>
                                    <span>For automatic play, click the small <strong>Auto Spin</strong> button next to Spin and select number of spins.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="bg-yellow-600/20 text-yellow-400 font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">4</span>
                                    <span>Match symbols on any of the <strong>16 paylines</strong> to win.</span>
                                </li>
                            </ul>
                         </div>
                     </div>
                </div>
            )}

        </div>

        {/* Footer / Pagination Controls */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 shrink-0">
             
             {/* Previous Button */}
             <button 
                onClick={prevPage}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded font-bold transition-all ${
                    currentPage === 0 
                    ? 'text-zinc-600 cursor-not-allowed' 
                    : 'text-yellow-400 hover:bg-yellow-400/10 hover:translate-x-[-4px]'
                }`}
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                PREV
             </button>

             {/* Dots Indicator */}
             <div className="flex gap-2">
                {[0, 1, 2, 3].map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-3 h-3 rounded-full transition-all ${
                            currentPage === page ? 'bg-yellow-400 scale-125' : 'bg-zinc-600 hover:bg-zinc-500'
                        }`}
                        aria-label={`Go to page ${page + 1}`}
                    />
                ))}
             </div>

             {/* Next / Close Button */}
             {currentPage < totalPages - 1 ? (
                 <button 
                    onClick={nextPage}
                    className="flex items-center gap-2 px-4 py-2 rounded font-bold text-yellow-400 hover:bg-yellow-400/10 hover:translate-x-[4px] transition-all"
                 >
                    NEXT
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                 </button>
             ) : (
                 <button 
                    onClick={onClose}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded shadow-lg transition-transform hover:scale-105"
                 >
                    CLOSE
                 </button>
             )}
        </div>

      </div>
    </div>
  );
};

export default PayTableModal;

import { SYMBOLS } from '../assets/assetMap';

interface PayTableModalProps {
  open: boolean;
  onClose: () => void;
}

const PayTableModal = ({ open, onClose }: PayTableModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#3e2723] border-4 border-[#5d4037] rounded-xl shadow-2xl overflow-hidden p-6 md:p-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl md:text-5xl font-display text-yellow-400 text-center mb-8 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
          PAY TABLE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-200 overflow-y-auto max-h-[70vh] p-2">
            
            {/* Symbol Payouts */}
            <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-white/10 pb-2">Symbol Payouts</h3>
                <div className="grid grid-cols-1 gap-2 text-sm overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-5 font-bold text-yellow-300 border-b border-white/20 pb-1 mb-2 sticky top-0 bg-[#3e2723]">
                        <div className="col-span-2">Symbol</div>
                        <div className="text-center">3x</div>
                        <div className="text-center">4x</div>
                        <div className="text-center">5x</div>
                    </div>
                    {SYMBOLS.map((symbol) => (
                        <div key={symbol.id} className="grid grid-cols-5 items-center bg-black/20 p-2 rounded hover:bg-black/30 transition-colors mb-1">
                             <div className="col-span-2 flex items-center gap-2">
                                <img src={symbol.image} alt={symbol.name} className="w-8 h-8 object-contain" />
                                <span className="font-semibold text-zinc-100">{symbol.name}</span>
                             </div>
                             {symbol.id === 4 ? (
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
            </div>

            {/* Game Rules */}
             <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-white/10 pb-2">Game Rules</h3>
                <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm">
                    <li>All wins pay left to right on adjacent reels, starting from the leftmost reel.</li>
                    <li>Only the highest win equals paid per winning combination.</li>
                    <li>WILD symbol substitutes for all symbols except BONUS scatter.</li>
                    <li>3 or more BONUS symbols trigger the Free Spins feature.</li>
                    <li>Malfunction voids all pays and plays.</li>
                </ul>

                <h3 className="text-xl font-bold text-yellow-500 mt-8 mb-4 border-b border-white/10 pb-2">Free Spins</h3>
                 <p className="text-sm text-zinc-300">
                    Land 3 or more SCATTER symbols to win FREE SPINS. <br/>
                    During Free Spins, winnings are multiplied!
                 </p>
            </div>

        </div>

        <div className="mt-8 text-center flex gap-4 justify-center">
            <button 
                onClick={onClose}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-8 rounded shadow-lg transition-transform hover:scale-105"
            >
                CLOSE
            </button>
            <button 
                onClick={() => {
                  // Dynamic import to avoid bundling if not needed, or just standard import
                  import('../utils/rtpSimulator').then(module => {
                    alert('Running Simulation... Check Console for details.');
                    setTimeout(() => {
                        const result = module.simulateRTP(100000);
                        alert(`Simulation Complete!\nRTP: ${result.rtp}\nHit Freq: ${result.hitFrequency}`);
                    }, 100);
                  });
                }}
                className=" hidden bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 py-2 px-4 rounded border border-gray-600"
            >
                Run RTP Sim (Dev)
            </button>
        </div>

      </div>
    </div>
  );
};

export default PayTableModal;

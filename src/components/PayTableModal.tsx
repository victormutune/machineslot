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
                <div className="space-y-4">
                     {/* High Value Symbols */}
                     <div className="flex items-center gap-4 bg-black/20 p-2 rounded">
                        <img src={SYMBOLS[0].image} alt="Wild" className="w-12 h-12 object-contain" />
                        <div>
                            <p className="font-bold text-yellow-300">WILD (Yellowcard)</p>
                            <p className="text-sm">Substitutes for all symbols except Scatter</p>
                        </div>
                     </div>
                      <div className="flex items-center gap-4 bg-black/20 p-2 rounded">
                        <img src={SYMBOLS[4].image} alt="Scatter" className="w-12 h-12 object-contain" />
                        <div>
                            <p className="font-bold text-blue-300">SCATTER (Football)</p>
                            <p className="text-sm">3+ Scatters logic triggers Free Spins</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-black/20 p-2 rounded">
                             <img src={SYMBOLS[8].image} alt="Trophy" className="w-8 h-8 mx-auto mb-1" />
                             <div className="text-center">5x: 80.00</div>
                         </div>
                        <div className="bg-black/20 p-2 rounded">
                             <img src={SYMBOLS[6].image} alt="K" className="w-8 h-8 mx-auto mb-1" />
                             <div className="text-center">5x: 60.00</div>
                        </div>
                         <div className="bg-black/20 p-2 rounded">
                             <img src={SYMBOLS[1].image} alt="A" className="w-8 h-8 mx-auto mb-1" />
                             <div className="text-center">5x: 50.00</div>
                        </div>
                         <div className="bg-black/20 p-2 rounded">
                             <img src={SYMBOLS[7].image} alt="Glove" className="w-8 h-8 mx-auto mb-1" />
                             <div className="text-center">5x: 40.00</div>
                        </div>
                          <div className="bg-black/20 p-2 rounded">
                             <img src={SYMBOLS[9].image} alt="Whistle" className="w-8 h-8 mx-auto mb-1" />
                             <div className="text-center">5x: 25.00</div>
                        </div>
                     </div>

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

        <div className="mt-8 text-center">
            <button 
                onClick={onClose}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-8 rounded shadow-lg transition-transform hover:scale-105"
            >
                CLOSE
            </button>
        </div>

      </div>
    </div>
  );
};

export default PayTableModal;

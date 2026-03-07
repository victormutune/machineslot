import { SYMBOLS } from '../../assets/assetMap';
import { t } from '../../locale/locale';

interface PayTableModalProps {
  open: boolean;
  onClose: () => void;
}

const PayTableModal = ({ open, onClose }: PayTableModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-center bg-black/60 backdrop-blur-sm animate-in slide-in-from-bottom duration-300 pointer-events-auto">

      {/* Global Floating Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-black/60 hover:bg-black/90 border border-white/20 text-zinc-300 hover:text-white p-2 sm:p-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full max-w-2xl h-full flex flex-col items-center bg-black/60 shadow-2xl border-l border-r border-white/5">
        
        {/* Sticky Header */}
        <div className="z-20 w-full flex items-center justify-center px-6 py-4 sm:py-6 bg-transparent border-b border-white/10 shrink-0">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
            {t('Pay Table')}
          </h2>
        </div>

        {/* Scrollable content restricted to this middle column */}
        <div className="flex-1 overflow-y-auto w-full paytable-scroll">
          <div className="w-full px-5 py-8 space-y-12 text-zinc-200">

            {/* ── SYMBOL PAYOUTS ── */}
          <section>
            <h3 className="text-base md:text-lg font-bold tracking-widest text-center text-[#7da2ce] mb-6">{t('HIGH SYMBOLS')}</h3>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              {SYMBOLS.filter(s => s.id !== 4 && (s.payouts?.[5] || 0) >= 20)
                .sort((a, b) => (b.payouts?.[5] || 0) - (a.payouts?.[5] || 0))
                .map((symbol) => (
                  <div
                    key={symbol.id}
                    className="bg-gradient-to-b from-[#2a2a30] to-[#1a1a1c] border border-white/5 rounded-2xl py-5 px-4 flex flex-col shadow-2xl shrink-0 w-[140px] md:w-[150px]"
                  >
                    <div className="flex-1 flex items-center justify-center mb-6 min-h-[70px]">
                      <img src={symbol.image} alt={symbol.name} className="w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.8)]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {[3, 4, 5].map((multiplier) => (
                        <div key={multiplier} className="flex justify-between items-center bg-black/40 border border-white/5 rounded px-3 py-1.5 text-xs md:text-sm">
                          <span className="text-zinc-500 font-bold">{multiplier}x</span>
                          <span className={`font-bold ${multiplier === 5 ? 'text-yellow-500' : 'text-zinc-100'}`}>
                            {symbol.payouts?.[multiplier as keyof typeof symbol.payouts] || 0}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <h3 className="text-base md:text-lg font-bold tracking-widest text-center text-[#7da2ce] mb-6">{t('LOW SYMBOLS')}</h3>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {SYMBOLS.filter(s => s.id !== 4 && (s.payouts?.[5] || 0) < 20)
                .sort((a, b) => (b.payouts?.[5] || 0) - (a.payouts?.[5] || 0))
                .map((symbol) => (
                  <div
                    key={symbol.id}
                    className="bg-gradient-to-b from-[#2a2a30] to-[#1a1a1c] border border-white/5 rounded-2xl py-5 px-4 flex flex-col shadow-2xl shrink-0 w-[140px] md:w-[150px]"
                  >
                    <div className="flex-1 flex items-center justify-center mb-6 min-h-[70px]">
                      <img src={symbol.image} alt={symbol.name} className="w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.8)]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {[3, 4, 5].map((multiplier) => (
                        <div key={multiplier} className="flex justify-between items-center bg-black/40 border border-white/5 rounded px-3 py-1.5 text-xs md:text-sm">
                          <span className="text-zinc-500 font-bold">{multiplier}x</span>
                          <span className={`font-bold ${multiplier === 5 ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-zinc-100'}`}>
                            {symbol.payouts?.[multiplier as keyof typeof symbol.payouts] || 0}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* ── FREE SPINS & SPECIALS ── */}
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-white/10 pb-2">{t('Free Spins & Specials')}</h3>
            <div className="bg-black/20 p-4 rounded-lg text-center mb-4">
              <p className="text-zinc-300">
                {t('Land 3 or more SCATTER symbols to')} {t('win')} {t('FREE SPINS')}.<br />
                {t('During Free Spins, winnings are multiplied!')}
              </p>
            </div>
            {(() => {
              const football = SYMBOLS.find(s => s.id === 4);
              if (!football) return null;
              return (
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center gap-3 max-w-xs mx-auto">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <img src={football.image} alt={football.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-yellow-400">{football.name}</div>
                    <div className="text-xs text-zinc-400">{t('SCATTER - Triggers Free Spins')}</div>
                  </div>
                </div>
              );
            })()}

            <h3 className="text-xl font-bold text-yellow-500 mt-6 mb-3">{t('Game Rules')}</h3>
            <ul className="list-disc list-inside space-y-3 text-zinc-300 bg-black/20 p-5 rounded-lg">
              <li>{t('All wins pay left to right on adjacent reels, starting from the leftmost reel.')}</li>
              <li>{t('Only the highest win is paid per winning combination.')}</li>
              <li>{t('WILD symbol substitutes for all symbols except BONUS scatter.')}</li>
              <li>{t('3 or more BONUS symbols trigger the')} {t('Free Spins feature')}.</li>
              <li>{t('Malfunction voids all pays and plays.')}</li>
            </ul>
          </section>

          {/* ── WAYS TO WIN ── */}
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-white/10 pb-2">{t('Ways to Win')}</h3>
            <p className="text-sm text-zinc-300 mb-5 text-center max-w-2xl mx-auto">
              {t('Wins are attained by matching at least 3 symbols on one of the 16 predefined lines on adjacent reels starting from the leftmost reel.')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[3,3,3,3,3],
                [0,1,2,1,0],[3,2,1,2,3],[1,2,3,2,1],[2,1,0,1,2],
                [0,1,0,1,0],[1,0,1,0,1],[2,3,2,3,2],[3,2,3,2,3],
                [0,1,2,3,2],[2,1,2,1,2],[1,2,1,2,1],[2,1,2,1,2],
              ].map((line, idx) => (
                <div key={idx} className="bg-black/40 p-2 rounded-lg border border-white/10 hover:border-yellow-500/50 transition-colors">
                  <div className="text-xs text-yellow-500 mb-1 font-bold text-center">{t('Line')} {idx + 1}</div>
                  <div className="grid grid-cols-5 gap-1">
                    {[0,1,2,3,4].map(col => (
                      <div key={col} className="flex flex-col gap-1">
                        {[0,1,2,3].map(row => (
                          <div
                            key={row}
                            className={`w-full h-2 rounded-sm ${line[col] === row ? 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.6)]' : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HOW TO PLAY ── */}
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-white/10 pb-2">{t('How to Play')}</h3>
            <div className="bg-black/30 p-6 rounded-xl border border-white/10">
              <ul className="space-y-5 text-zinc-200">
                {[
                  ['1', <>{t('Set your bet using the')} <strong>(−)</strong> {t('and')} <strong>(+)</strong> {t('buttons')}.</>],
                  ['2', <>{t('Press the big')} <strong>{t('SPIN')}</strong> {t('button to start the game')}.</>],
                  ['3', <>{t('For')} {t('automatic play')}, {t('click')} <strong>{t('Auto Spin')}</strong> {t('next to Spin and select number of spins.')}</>],
                  ['4', <>{t('Match symbols on any of the')} <strong>{t('16 paylines')}</strong> {t('to win')}.</>],
                ].map(([num, text]) => (
                  <li key={String(num)} className="flex items-start gap-4">
                    <span className="bg-yellow-600/20 text-yellow-400 font-bold w-8 h-8 rounded flex items-center justify-center shrink-0">{num}</span>
                    <span className="text-base">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Bottom spacer for comfortable scrolling */}
          <div className="h-12"></div>

        </div>
      </div>
    </div>
    </div>
  );
};

export default PayTableModal;


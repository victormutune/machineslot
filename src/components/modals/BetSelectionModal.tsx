import { t } from '../../locale/locale';
import { formatBet } from '../../stake/stakeEngineHelpers';

interface BetSelectionModalProps {
  open: boolean;
  onClose: () => void;
  betLevels: number[];
  currentBetIndex: number;
  currency?: string;
  onSelectBet: (index: number) => void;
}

export default function BetSelectionModal({
  open,
  onClose,
  betLevels,
  currentBetIndex,
  currency,
  onSelectBet
}: BetSelectionModalProps) {
  if (!open) return null;

  const cur = currency ?? 'USD';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-[24px] bg-gradient-to-b from-[#1a1b1e] to-[#0f1013] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-black text-yellow-500 tracking-wider">
            {t('BET LEVEL')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content (Scrollable Grid) */}
        <div className="p-4 overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {betLevels.map((amount, index) => {
              const isSelected = index === currentBetIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onSelectBet(index);
                    onClose();
                  }}
                  className={`
                    flex items-center justify-center py-4 rounded-xl font-bold text-lg transition-all duration-200
                    ${isSelected 
                      ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105 border-2 border-yellow-300' 
                      : 'bg-black/40 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:text-white'
                    }
                  `}
                >
                  {formatBet(amount, cur)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

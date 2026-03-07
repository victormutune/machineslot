import React, { useState, useEffect } from 'react';
import { t } from '../../locale/locale';

export interface AutoSpinModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (count: number | null) => void;
}

const OPTIONS = [10, 20, 50, 100, 200, 500];

const AutoSpinModal: React.FC<AutoSpinModalProps> = ({ open, onClose, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setSelectedOption(undefined);
    }
  }, [open]);

  if (!open) return null;

  const handleStart = () => {
    if (selectedOption !== undefined) {
      onSelect(selectedOption);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Auto Play"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-[420px] rounded-[18px] bg-gradient-to-b from-[#111827] to-[#0e0e10] shadow-[0_30px_80px_rgba(0,0,0,0.85)] ring-1 ring-[#facc15]/40 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-[18px] bg-[#facc15]/90">
          <div className="text-[#1f2937] font-extrabold text-lg tracking-[0.18em] uppercase">
            {t('Auto Play')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] w-[34px] rounded-full bg-[#111827]/80 text-white/90 ring-1 ring-white/10 hover:bg-[#020617] active:scale-[0.98] transition flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="px-5 py-6">
          <div className="text-center text-xs uppercase tracking-[0.18em] text-[#9ca3af] mb-4 font-bold">
            {t('Select number of auto spins')}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedOption(v)}
                className={`py-3 rounded-[12px] border text-sm font-bold shadow-md transition-all active:scale-95 flex flex-col items-center justify-center ${
                  selectedOption === v
                    ? 'bg-[#facc15] border-[#facc15] text-[#020617] ring-2 ring-[#facc15]/50 scale-105 z-10'
                    : 'bg-[#1f2937]/50 hover:bg-[#374151] border-white/10 text-gray-200 hover:border-white/20'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSelectedOption(null)}
            className={`w-full py-3 mb-6 rounded-[12px] border text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
              selectedOption === null
                ? 'bg-[#facc15] border-[#facc15] text-[#020617] ring-2 ring-[#facc15]/50 scale-[1.02]'
                : 'bg-[#1f2937]/50 hover:bg-[#374151] border-white/10 text-gray-200 hover:border-white/20'
            }`}
          >
           Infinite <span className="text-xl leading-none">∞</span>
          </button>

          <button
            type="button"
            onClick={handleStart}
            disabled={selectedOption === undefined}
            className={`w-full px-6 py-4 rounded-[14px] font-black text-base tracking-[0.1em] uppercase shadow-lg transition-all ${
              selectedOption !== undefined
                ? 'bg-[#16a34a] hover:bg-[#15803d] text-white hover:shadow-[#16a34a]/40 hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-[#374151] text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {t('Start Auto Spin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoSpinModal;

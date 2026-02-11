import React from 'react';

export interface AutoSpinModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (count: number | null) => void;
}

const OPTIONS = [10, 25, 50, 100];

const AutoSpinModal: React.FC<AutoSpinModalProps> = ({ open, onClose, onSelect }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Auto Play"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-[420px] rounded-[18px] bg-gradient-to-b from-[#111827] to-[#020617] shadow-[0_30px_80px_rgba(0,0,0,0.85)] ring-1 ring-[#facc15]/40">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-[18px] bg-[#facc15]/90">
          <div className="text-[#1f2937] font-extrabold text-lg tracking-[0.18em] uppercase">
            Auto Play
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] w-[34px] rounded-full bg-[#111827]/80 text-white/90 ring-1 ring-white/10 hover:bg-[#020617] active:scale-[0.98] transition"
            aria-label="Close auto play modal"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="text-center text-xs uppercase tracking-[0.18em] text-[#e5e7eb] mb-3">
            Select number of auto spins
          </div>

          <div className="grid grid-cols-4 gap-3">
            {OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onSelect(v)}
                className="px-2 py-2 rounded-[12px] bg-[#020617] hover:bg-[#111827] border border-[#4b5563] text-sm font-semibold text-[#e5e7eb] shadow-[0_8px_20px_rgba(0,0,0,0.7)]"
              >
                {v}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelect(null)}
            className="mt-4 w-full px-3 py-2 rounded-[999px] bg-[#16a34a] hover:bg-[#22c55e] text-sm font-bold text-white tracking-[0.16em] uppercase shadow-[0_10px_30px_rgba(22,163,74,0.6)]"
          >
            Infinite
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoSpinModal;


import React, { useMemo } from 'react';

type BonusId = 'goal_rush' | 'counter_attack';

export type BuyBonusChoice = {
  id: BonusId;
  title: string;
  subtitle: string;
  freeSpins: number;
  costMultiplier: number;
  startBetMultiplier: number;
  accent: 'green' | 'purple';
};

const money = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export interface BuyBonusModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  currentBet: number;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onBuy: (choice: BuyBonusChoice) => void;
}

export default function BuyBonusModal({
  open,
  onClose,
  balance,
  currentBet,
  onIncreaseBet,
  onDecreaseBet,
  onBuy,
}: BuyBonusModalProps) {
  const choices: BuyBonusChoice[] = useMemo(
    () => [
      {
        id: 'goal_rush',
        title: 'Goal Rush',
        subtitle: '8 Free Spins',
        freeSpins: 8,
        costMultiplier: 100,
        startBetMultiplier: 1,
        accent: 'green',
      },
      {
        id: 'counter_attack',
        title: 'Counter Attack',
        subtitle: '12 Free Spins + 2x Start',
        freeSpins: 12,
        costMultiplier: 250,
        startBetMultiplier: 2,
        accent: 'purple',
      },
    ],
    [],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Buy Bonus"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-[520px] rounded-[18px] bg-gradient-to-b from-[#131316] to-[#0e0e10] shadow-[0_30px_80px_rgba(0,0,0,0.75)] ring-1 ring-[#daa520]/35">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-[18px] bg-[#c6a31f]/85">
          <div className="text-[#3a2b05] font-extrabold text-lg">Buy Bonus</div>
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] w-[34px] rounded-full bg-[#2a2a2e]/60 text-white/90 ring-1 ring-white/10 hover:bg-[#323237] active:scale-[0.98] transition"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Select Bet Amount row */}
          <div className="rounded-[14px] bg-[#151518]/70 ring-1 ring-white/10 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-[#c9b06a] font-bold">Select Bet Amount</div>
                <div className="h-[34px] w-[38px] rounded-[10px] bg-[#232327] ring-1 ring-white/10 flex items-center justify-center text-[#d7d7db]">
                  ▼
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-[12px] bg-[#101013] ring-2 ring-[#caa23d]/70 px-5 py-2 text-[#efece1] font-extrabold tabular-nums">
                  {money(currentBet)}
                </div>
                <div className="flex flex-col overflow-hidden rounded-[10px] ring-1 ring-[#caa23d]/40">
                  <button
                    type="button"
                    onClick={onIncreaseBet}
                    className="h-[18px] w-[30px] bg-[#232327] text-[#efece1] text-[12px] leading-none hover:bg-[#2c2c32] active:scale-[0.98] transition"
                    aria-label="Increase bet"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={onDecreaseBet}
                    className="h-[18px] w-[30px] bg-[#1a1a1e] text-[#efece1] text-[12px] leading-none hover:bg-[#24242a] active:scale-[0.98] transition"
                    aria-label="Decrease bet"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bonus cards */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            {choices.map((c) => {
              const accent =
                c.accent === 'green'
                  ? {
                      ring: 'ring-1 ring-[#2cff77]/35',
                      glow: 'shadow-[0_0_0_1px_rgba(44,255,119,0.25),0_18px_45px_rgba(0,0,0,0.5)]',
                      pill: 'bg-[#1c6c2f]/40',
                      title: 'text-[#d9ffe7]',
                    }
                  : {
                      ring: 'ring-1 ring-[#b86bff]/35',
                      glow: 'shadow-[0_0_0_1px_rgba(184,107,255,0.22),0_18px_45px_rgba(0,0,0,0.5)]',
                      pill: 'bg-[#5a2aa0]/35',
                      title: 'text-[#efe3ff]',
                    };

              const cost = currentBet * c.costMultiplier;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onBuy(c)}
                  className={[
                    'rounded-[16px] bg-[#121214]/70 px-4 py-4 text-left',
                    'hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.99] transition',
                    accent.ring,
                    accent.glow,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    <div className={['font-extrabold', accent.title].join(' ')}>{c.title}</div>
                  </div>
                  <div className="mt-2 text-sm text-white/70">{c.subtitle}</div>

                  <div className={['mt-3 rounded-[12px] px-3 py-2', accent.pill].join(' ')}>
                    <div className="text-[#f2d27a] font-extrabold tabular-nums">{money(cost)}</div>
                  </div>
                  <div className="mt-2 text-xs text-white/50">
                    {c.costMultiplier}x Bet
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center text-sm text-[#c9b06a]">
            Your Balance: <span className="text-[#efece1] font-bold tabular-nums">{money(balance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


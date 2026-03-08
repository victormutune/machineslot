import { useMemo, useState, useEffect } from 'react';
import { formatBalance } from '../../stake/stakeEngineHelpers';
import { t } from '../../locale/locale';

type BonusId = 'goal_rush' | 'power_rush' | 'bonus_boost';

export type BuyBonusChoice = {
  id: BonusId;
  title: string;
  subtitle: string;
  freeSpins: number;
  costMultiplier: number;
  startBetMultiplier: number;
  accent: 'green' | 'purple' | 'blue';
};



export interface BuyBonusModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  currentBet: number;
  currency?: string;
  boostActive?: boolean;
  onDeactivateBoost?: () => void;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onBuy: (choice: BuyBonusChoice) => void;
}

export default function BuyBonusModal({
  open,
  onClose,
  balance,
  currentBet,
  currency,
  boostActive = false,
  onDeactivateBoost,
  onIncreaseBet,
  onDecreaseBet,
  onBuy,
}: BuyBonusModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<BuyBonusChoice | null>(null);
  const cur = currency ?? 'USD';
  const money = (value: number) => formatBalance(value, cur);

  // Reset selected choice when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedChoice(null);
    }
  }, [open]);

  const handleClose = () => {
    setSelectedChoice(null);
    onClose();
  };

  const choices: BuyBonusChoice[] = useMemo(
    () => [
      {
        id: 'bonus_boost' as any,
        title: 'Bonus Boost',
        subtitle: 'Activate to increase 3x the chance of triggering the Bonus Round',
        freeSpins: 0,
        costMultiplier: 2,
        startBetMultiplier: 1,
        accent: 'blue',
      },
      {
        id: 'power_rush' as any,
        title: 'Power Rush',
        subtitle: 'Bonus Buy with 8 Free Spins',
        freeSpins: 8,
        costMultiplier: 100,
        startBetMultiplier: 1,
        accent: 'green',
      },
      {
        id: 'goal_rush' as any,
        title: 'Goal Rush',
        subtitle: 'Bonus Buy with 12 Free Spins',
        freeSpins: 12,
        costMultiplier: 300,
        startBetMultiplier: 1,
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
        onClick={handleClose}
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-[720px] rounded-[18px] bg-gradient-to-b from-[#131316] to-[#0e0e10] shadow-[0_30px_80px_rgba(0,0,0,0.75)] ring-1 ring-[#daa520]/35">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-[18px] bg-[#c6a31f]/85">
          <div className="text-[#3a2b05] font-extrabold text-lg">{t('Buy Bonus')}</div>
          <button
            type="button"
            onClick={handleClose}
            className="h-[34px] w-[34px] rounded-full bg-[#2a2a2e]/60 text-white/90 ring-1 ring-white/10 hover:bg-[#323237] active:scale-[0.98] transition"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5">
          {selectedChoice ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-2xl font-extrabold text-[#efece1] mb-2">{t(selectedChoice.title)}</div>
              <div className="text-[#c9b06a] text-center mb-6 max-w-[400px]">
                {t('Are you sure you want to')} {t('purchase')} <strong className="text-white">{t(selectedChoice.title)}</strong> {t('for')}{' '}
                <span className="text-[#f2d27a] font-bold tabular-nums">
                  {money(currentBet * selectedChoice.costMultiplier)}
                </span>
                ?
              </div>
              <div className="flex gap-4 w-full max-w-[300px]">
                <button
                  type="button"
                  onClick={() => setSelectedChoice(null)}
                  className="flex-1 rounded-[12px] bg-[#2a2a2e]/60 py-3 text-[#efece1] font-bold ring-1 ring-white/10 hover:bg-[#323237] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBuy(selectedChoice);
                    setSelectedChoice(null);
                  }}
                  className="flex-1 rounded-[12px] bg-[#c6a31f] py-3 text-[#1a1505] font-extrabold shadow-[0_0_20px_rgba(198,163,31,0.4)] hover:brightness-110 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── Bonus Boost Active Banner ── */}
              {boostActive && (
                <div className="mb-4 rounded-[14px] bg-[#1f4a9e]/60 ring-1 ring-[#1f8fff]/60 px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="text-[#cce8ff] font-extrabold text-sm">Bonus Boost Active</div>
                      <div className="text-[#7ab4ff] text-xs mt-0.5">Each spin costs 2× your bet</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onDeactivateBoost}
                    className="shrink-0 rounded-[10px] bg-[#c6291f] px-4 py-2 text-white font-extrabold text-sm hover:brightness-110 active:scale-[0.97] transition shadow-[0_0_15px_rgba(198,41,31,0.4)]"
                  >
                    Deactivate
                  </button>
                </div>
              )}

              {/* Select Bet Amount row */}
              <div className="rounded-[14px] bg-[#151518]/70 ring-1 ring-white/10 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-[#c9b06a] font-bold">{t('Select Bet Amount')}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDecreaseBet}
                  className="w-10 h-10 rounded-[10px] bg-[#232327] text-[#efece1] font-bold text-lg hover:bg-[#2c2c32] active:scale-[0.95] transition ring-1 ring-white/10 flex items-center justify-center"
                  aria-label="Decrease bet"
                >
                  −
                </button>
                <div className="min-w-[100px] text-center rounded-[12px] bg-[#101013] ring-2 ring-[#caa23d]/70 px-4 py-2 text-[#efece1] font-extrabold tabular-nums">
                  {money(currentBet)}
                </div>
                <button
                  type="button"
                  onClick={onIncreaseBet}
                  className="w-10 h-10 rounded-[10px] bg-[#232327] text-[#efece1] font-bold text-lg hover:bg-[#2c2c32] active:scale-[0.95] transition ring-1 ring-white/10 flex items-center justify-center"
                  aria-label="Increase bet"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Bonus cards */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {choices.map((c) => {
              const isBoostCard = (c.id as string) === 'bonus_boost';
              const isActive = isBoostCard && boostActive;

              const accent =
                c.accent === 'green'
                  ? {
                      ring: 'ring-1 ring-[#2cff77]/35',
                      glow: 'shadow-[0_0_0_1px_rgba(44,255,119,0.25),0_18px_45px_rgba(0,0,0,0.5)]',
                      pill: 'bg-[#1c6c2f]/40',
                      title: 'text-[#d9ffe7]',
                    }
                  : c.accent === 'blue'
                  ? {
                      ring: 'ring-1 ring-[#1f8fff]/35',
                      glow: 'shadow-[0_0_0_1px_rgba(31,143,255,0.25),0_18px_45px_rgba(0,0,0,0.5)]',
                      pill: 'bg-[#0f46a6]/40',
                      title: 'text-[#cce8ff]',
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
                  onClick={() => {
                    if (isActive) return; // already on — use deactivate banner instead
                    setSelectedChoice(c);
                  }}
                  disabled={isActive}
                  className={[
                    'rounded-[16px] bg-[#121214]/70 px-4 py-4 text-left',
                    isActive
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:translate-y-[-1px] active:translate-y-0 active:scale-[0.99] transition',
                    accent.ring,
                    accent.glow,
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    <div className={['font-extrabold', accent.title].join(' ')}>{c.title}</div>
                    {isActive && <span className="text-[10px] bg-[#1f8fff]/30 text-[#cce8ff] px-2 py-0.5 rounded-full font-bold">ON</span>}
                  </div>
                  <div className="mt-2 text-sm text-white/70">{c.subtitle}</div>

                  <div className={['mt-3 rounded-[12px] px-3 py-2', accent.pill].join(' ')}>
                    <div className="text-[#f2d27a] font-extrabold tabular-nums">
                      {isBoostCard ? `${money(currentBet * 2)}/spin` : money(cost)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/50">
                    {isBoostCard ? `2× ${t('Bet')} per spin` : `${c.costMultiplier}x ${t('Bet')}`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center text-sm text-[#c9b06a]">
            {t('Your Balance')}: <span className="text-[#efece1] font-bold tabular-nums">{money(balance)}</span>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


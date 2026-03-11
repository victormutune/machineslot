/**
 * stakeEngineHelpers.ts
 * Shared helpers for balance/bet formatting and stake-engine window events.
 * Uses internal stakeEngineClient utilities — no stake-engine npm package needed.
 */

import {
  formatBalance as _formatBalance,
  fromRGSAmount,
  toRGSAmount,
} from './stakeEngineClient';

import type { Balance } from './stakeEngineClient';

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a display-dollar balance with its currency symbol.
 * e.g. formatBalance(10000, 'USD') → "$10,000.00"
 */
export const formatBalance = (dollars: number, currency: string = 'USD'): string =>
  _formatBalance({ amount: toRGSAmount(dollars), currency: currency as Balance['currency'] });

/**
 * Format a bet amount, trimming unnecessary decimals for whole numbers.
 * e.g. formatBet(100, 'USD') → "$100"  |  formatBet(10.5, 'USD') → "$10.50"
 */
export const formatBet = (dollars: number, currency: string = 'USD'): string => {
  const formatted = _formatBalance({ amount: toRGSAmount(dollars), currency: currency as Balance['currency'] });
  // Trim ".00" suffix for whole-number bets (e.g. "$100.00" → "$100")
  return formatted.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

/**
 * Convert a plain-dollar amount to RGS micro-units.
 * e.g. toMicroUnits(10.5) → 10_500_000
 */
export const toMicroUnits = (dollars: number): number => toRGSAmount(dollars);

/**
 * Convert RGS micro-units back to a plain-dollar amount.
 * e.g. fromMicroUnits(10_500_000) → 10.5
 */
export const fromMicroUnits = (amount: number): number => fromRGSAmount(amount);

// ─────────────────────────────────────────────────────────────────────────────
// Window event helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Emit a stake-engine roundActive window event. */
export const emitRoundActive = (active: boolean): void => {
  window.dispatchEvent(
    new CustomEvent<{ active: boolean }>('roundActive', { detail: { active } })
  );
};

/** Emit a stake-engine balanceUpdate window event (micro-unit amount). */
export const emitBalanceUpdate = (dollars: number, currency: string = 'USD'): void => {
  window.dispatchEvent(
    new CustomEvent<{ amount: number; currency: string }>('balanceUpdate', {
      detail: { amount: toRGSAmount(dollars), currency },
    })
  );
};

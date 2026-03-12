/**
 * stakeEngineHelpers.ts
 * Shared helpers for balance/bet formatting and stake-engine window events.
 * Uses the official stake-engine npm package.
 */

import {
  DisplayAmount,
  ParseAmount,
} from 'stake-engine';

const API_MULTIPLIER = 1000000;

// ─────────────────────────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a display-dollar balance with its currency symbol.
 * e.g. formatBalance(10000, 'USD') → "$10,000.00"
 */
export const formatBalance = (dollars: number, currency: string = 'USD'): string =>
  DisplayAmount({ amount: toMicroUnits(dollars), currency: currency as any });

/**
 * Format a bet amount, trimming unnecessary decimals for whole numbers.
 * e.g. formatBet(100, 'USD') → "$100"  |  formatBet(10.5, 'USD') → "$10.50"
 */
export const formatBet = (dollars: number, currency: string = 'USD'): string => {
  return DisplayAmount(
    { amount: toMicroUnits(dollars), currency: currency as any },
    { trimDecimalForIntegers: true }
  );
};

/**
 * Convert a plain-dollar amount to RGS micro-units.
 * e.g. toMicroUnits(10.5) → 10_500_000
 */
export const toMicroUnits = (dollars: number): number => Math.round(dollars * API_MULTIPLIER);

/**
 * Convert RGS micro-units back to a plain-dollar amount.
 * e.g. fromMicroUnits(10_500_000) → 10.5
 */
export const fromMicroUnits = (amount: number): number => ParseAmount(amount);

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
      detail: { amount: toMicroUnits(dollars), currency },
    })
  );
};

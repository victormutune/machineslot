/**
 * stakeEngineHelpers.ts
 * Shared helpers that wrap stake-engine's DisplayAmount / ParseAmount
 * for use across components (avoids circular App ↔ ControlPanel imports).
 */
import { DisplayAmount, ParseAmount, parseBalance } from 'stake-engine';
import type { Balance } from 'stake-engine';

/**
 * stake-engine uses micro-units: 1 USD = 1_000_000 units.
 */
const API_MULTIPLIER = 1_000_000;

/** Convert a plain-dollar amount to a stake-engine Balance micro-unit object. */
export const toBalance = (dollars: number, currency: string = 'USD'): Balance =>
  parseBalance({ amount: Math.round(dollars * API_MULTIPLIER), currency });

/**
 * Format a dollar balance with currency symbol.
 * e.g. 10000 → "$10,000.00"
 */
export const formatBalance = (dollars: number, currency: string = 'USD'): string =>
  DisplayAmount(toBalance(dollars, currency), { decimals: 2 });

/**
 * Format a bet amount, trimming unnecessary decimals for whole numbers.
 * e.g. 100 → "$100"  |  10.5 → "$10.50"
 */
export const formatBet = (dollars: number, currency: string = 'USD'): string =>
  DisplayAmount(toBalance(dollars, currency), {
    decimals: 2,
    trimDecimalForIntegers: true,
  });

/** Emit a stake-engine balanceUpdate window event (micro-unit amount). */
export const emitBalanceUpdate = (dollars: number, currency: string = 'USD'): void => {
  window.dispatchEvent(
    new CustomEvent<Balance>('balanceUpdate', { detail: toBalance(dollars, currency) })
  );
};

/** Emit a stake-engine roundActive window event. */
export const emitRoundActive = (active: boolean): void => {
  window.dispatchEvent(
    new CustomEvent<{ active: boolean }>('roundActive', { detail: { active } })
  );
};

/** Convert a stake-engine micro-unit amount back to plain dollars. */
export const fromMicroUnits = (amount: number): number => ParseAmount(amount);

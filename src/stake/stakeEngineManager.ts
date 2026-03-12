/**
 * stakeEngineManager.ts
 * Manages the game integration with official Stake Engine RGS npm package.
 * Handles RGS mode, Social/Demo mode.
 */

import { RGSClient, DisplayAmount } from 'stake-engine';
import type {
  Balance,
  AuthenticateConfig,
  Round,
  Currency,
} from 'stake-engine';

import { getLocaleManager } from '../locale/locale';
import { fromMicroUnits, toMicroUnits } from './stakeEngineHelpers';

// ============================================================================
// Types
// ============================================================================

export type GameMode = 'rgs' | 'social' | 'demo';

export interface StakeEngineManagerConfig {
  defaultBalance?: number;
  defaultBetLevels?: number[];
  defaultBetIndex?: number;
  onBalanceUpdate?: (balance: number, formatted: string) => void;
  onConfigLoaded?: (config: AuthenticateConfig) => void;
  onError?: (error: Error) => void;
  onModeChange?: (mode: GameMode) => void;
}

export interface SpinResult {
  success: boolean;
  balance: number;
  round?: Round;
  error?: Error;
}

// ============================================================================
// Simple EventEmitter
// ============================================================================

type Listener = (...args: any[]) => void;

class EventEmitter {
  private _listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): this {
    const list = this._listeners.get(event) ?? [];
    list.push(listener);
    this._listeners.set(event, list);
    return this;
  }

  off(event: string, listener: Listener): this {
    const list = this._listeners.get(event) ?? [];
    this._listeners.set(event, list.filter(l => l !== listener));
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    (this._listeners.get(event) ?? []).forEach(l => l(...args));
  }

  removeAllListeners(event?: string): void {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }
}

// ============================================================================
// StakeEngineManager
// ============================================================================

export class StakeEngineManager extends EventEmitter {

  private client: ReturnType<typeof RGSClient> | null = null;

  private _mode: GameMode = 'demo';
  private _balance = 1000;
  private _currency: Currency = 'USD';
  private _config: AuthenticateConfig | null = null;

  private _betLevels: number[] = [
    1_000_000,   //  $1
    2_000_000,   //  $2
    5_000_000,   //  $5  ← default
    10_000_000,  // $10
    20_000_000,  // $20
    50_000_000,  // $50
    75_000_000,  // $75
    100_000_000, // $100
    200_000_000, // $200
    500_000_000, // $500
    750_000_000,
    1_000_000_000,
    2_000_000_000,
    5_000_000_000,
    10_000_000_000,
  ];

  private _currentBetIndex = 2;
  private _currentRound: Round | null = null;
  private _initialized = false;

  private onBalanceUpdate?: (balance: number, formatted: string) => void;
  private onConfigLoaded?: (config: AuthenticateConfig) => void;
  private onError?: (error: Error) => void;
  private onModeChange?: (mode: GameMode) => void;

  constructor(config?: StakeEngineManagerConfig) {
    super();

    if (config) {
      if (config.defaultBalance !== undefined) this._balance = config.defaultBalance;
      if (config.defaultBetLevels)            this._betLevels = config.defaultBetLevels;
      if (config.defaultBetIndex !== undefined) this._currentBetIndex = config.defaultBetIndex;

      this.onBalanceUpdate = config.onBalanceUpdate;
      this.onConfigLoaded  = config.onConfigLoaded;
      this.onError         = config.onError;
      this.onModeChange    = config.onModeChange;
    }
  }

  // ─────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────

  get mode(): GameMode              { return this._mode; }
  get balance(): number             { return this._balance; }
  get currency(): Currency          { return this._currency; }
  get config(): AuthenticateConfig | null   { return this._config; }
  get betLevels(): number[]         { return this._betLevels; }
  get currentBetIndex(): number     { return this._currentBetIndex; }
  get currentBet(): number          { return this._betLevels[this._currentBetIndex] ?? 1_000_000; }
  get currentBetDisplay(): number   { return fromMicroUnits(this.currentBet); }
  get currentRound(): Round | null { return this._currentRound; }
  get isInitialized(): boolean      { return this._initialized; }
  get isRGSMode(): boolean          { return this._mode === 'rgs'; }
  get isSocialMode(): boolean       { return this._mode === 'social'; }
  get isDemoMode(): boolean         { return this._mode === 'demo'; }
  get isSocialCasino(): boolean     { return this._mode === 'social'; }

  get formattedBalance(): string {
    return DisplayAmount({ amount: toMicroUnits(this._balance), currency: this._currency });
  }

  get formattedBet(): string {
    return DisplayAmount({ amount: this.currentBet, currency: this._currency }, { trimDecimalForIntegers: true });
  }

  // ─────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────

  private _updateBalanceFromRGS(balanceData: Balance): void {
    const newCurrency = balanceData.currency;
    const newAmount   = fromMicroUnits(balanceData.amount);

    let currencyChanged = false;
    if (newCurrency !== this._currency) {
      this._currency = newCurrency;
      currencyChanged = true;
    }

    this._balance = newAmount;

    if (currencyChanged) {
      const isSocialFromURL  = new URLSearchParams(window.location.search).get('social') === 'true';
      const isConfigSocial   = this._mode === 'social'; // We'll refine this in initialize

      let newMode: GameMode = this._mode;

      if (isSocialFromURL || isConfigSocial || newCurrency === 'XGC' || newCurrency === 'XSC') {
        newMode = 'social';
      } else {
        newMode = 'rgs';
      }

      if (this._mode !== newMode) {
        this._mode = newMode;
        getLocaleManager().setSocialMode(newMode === 'social');
        this.onModeChange?.(this._mode);
        this.emit('modeChanged', this._mode);
        console.info(`[StakeEngine] Mode dynamically changed to: ${this._mode}`);
      }

      this.emit('currencyChanged', this._currency);
      console.info(`[StakeEngine] Currency dynamically changed to: ${this._currency}`);
    }

    this._emitBalanceUpdate();
  }

  async initialize(): Promise<boolean> {
    if (this._initialized) return true;

    const urlParams        = new URLSearchParams(window.location.search);
    const sessionID        = urlParams.get('sessionID');
    const rgs_url          = urlParams.get('rgs_url');
    const isSocialFromURL  = urlParams.get('social') === 'true';
    const currencyFromURL  = urlParams.get('currency') as Currency | null;
    const balanceFromURL   = urlParams.get('balance');

    if (sessionID && rgs_url) {
      try {
        this.client = RGSClient({
          url: window.location.href,
        });

        const auth = await this.client.Authenticate();

        this._config       = auth.config;
        this._betLevels    = auth.config.betLevels;
        this._balance      = fromMicroUnits(auth.balance.amount);
        this._currency     = auth.balance.currency;
        this._currentRound = auth.round;

        if (
          isSocialFromURL ||
          auth.jurisdictionFlags.socialCasino ||
          auth.balance.currency === 'XGC' ||
          auth.balance.currency === 'XSC'
        ) {
          this._mode = 'social';
          getLocaleManager().setSocialMode(true);
        } else {
          this._mode = 'rgs';
          getLocaleManager().setSocialMode(false);
        }

        this._applyDefaultBet(auth.config.defaultBetLevel);

        this.onConfigLoaded?.(auth.config);
        this.emit('configLoaded', auth.config);
        this._updateBalanceFromRGS(auth.balance);
        this.onModeChange?.(this._mode);
        this.emit('authenticated', auth);
        this._initialized = true;

        console.info(`[StakeEngine] Initialized in ${this._mode} mode`);

        if (this._currentRound?.active) {
          console.info('[StakeEngine] Active round found — emitting resumeRound');
          this.emit('resumeRound', this._currentRound);
        }

        return true;

      } catch (error) {
        console.warn('[StakeEngine] RGS auth failed, falling back to demo', error);
      }
    }

    // ─────────────────────────────────────────────
    // DEMO / SOCIAL FALLBACK
    // ─────────────────────────────────────────────

    if (currencyFromURL) {
      this._currency = currencyFromURL;
    }

    if (balanceFromURL) {
      const parsed = Number(balanceFromURL);
      if (!isNaN(parsed)) this._balance = parsed;
    }

    if (isSocialFromURL || this._currency === 'XGC' || this._currency === 'XSC') {
      this._mode = 'social';
      getLocaleManager().setSocialMode(true);
    } else {
      this._mode = 'demo';
    }

    this._initialized = true;
    this.onModeChange?.(this._mode);
    this.emit('demoMode');

    console.info(`[StakeEngine] Running in ${this._mode} mode`);

    return true;
  }

  // ─────────────────────────────────────────────
  // Bet controls
  // ─────────────────────────────────────────────

  increaseBet(): boolean {
    if (this._currentBetIndex < this._betLevels.length - 1) {
      this._currentBetIndex++;
      this.emit('betChanged', this.currentBet, this.currentBetDisplay);
      return true;
    }
    return false;
  }

  decreaseBet(): boolean {
    if (this._currentBetIndex > 0) {
      this._currentBetIndex--;
      this.emit('betChanged', this.currentBet, this.currentBetDisplay);
      return true;
    }
    return false;
  }

  setBetLevel(index: number): boolean {
    if (index >= 0 && index < this._betLevels.length) {
      this._currentBetIndex = index;
      this.emit('betChanged', this.currentBet, this.currentBetDisplay);
      return true;
    }
    return false;
  }

  setBetAmount(amount: number): boolean {
    const microAmount = toMicroUnits(amount);
    const index = this._betLevels.findIndex(level => level >= microAmount);
    if (index !== -1) return this.setBetLevel(index);
    return false;
  }

  // ─────────────────────────────────────────────
  // Play
  // ─────────────────────────────────────────────

  async play(mode = 'BASE'): Promise<SpinResult> {
    const bet = this.currentBetDisplay;

    if (this._balance < bet) {
      const error = new Error('Insufficient balance');
      this._handleError(error);
      return { success: false, balance: this._balance, error };
    }

    if (this.isRGSMode || this.isSocialMode) {
      try {
        const res = await this.client!.Play({
          amount: this.currentBet,
          mode,
        });
        this._currentRound = res.round;
        this._updateBalanceFromRGS(res.balance);
        this.emit('playStarted', res.round);
        return { success: true, balance: this._balance, round: res.round };
      } catch (error: any) {
        console.warn('[StakeEngine] play failed, falling back to demo', error);
        this._mode = 'demo';
        this.onModeChange?.(this._mode);
        this.emit('modeChanged', this._mode);
      }
    }

    // Demo spin
    this._balance -= bet;
    this._emitBalanceUpdate();
    this.emit('playStarted', null);
    return { success: true, balance: this._balance };
  }

  // ─────────────────────────────────────────────
  // End Round
  // ─────────────────────────────────────────────

  async endRound(): Promise<SpinResult> {
    if (this.isRGSMode || this.isSocialMode) {
      try {
        const res = await this.client!.EndRound();
        this._currentRound = null;
        this._updateBalanceFromRGS(res.balance);
        this.emit('roundEnded');
        return { success: true, balance: this._balance };
      } catch (error: any) {
        console.warn('[StakeEngine] endRound failed, falling back to demo', error);
        this._mode = 'demo';
        this.onModeChange?.(this._mode);
        this.emit('modeChanged', this._mode);
      }
    }

    // Demo
    this._currentRound = null;
    this.emit('roundEnded');
    return { success: true, balance: this._balance };
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  /** Add winnings locally (demo/social mode only). */
  addWinnings(amount: number): void {
    if (!this.isRGSMode) {
      this._balance += amount;
      this._emitBalanceUpdate();
    }
  }

  /** Save event for round resumption / crash recovery. */
  async saveEvent(event: string): Promise<boolean> {
    if (this.isRGSMode || this.isSocialMode) {
      try {
        await this.client!.Event(event);
        return true;
      } catch (error) {
        console.warn('[StakeEngine] saveEvent failed', error);
        return false;
      }
    }
    return true;
  }

  isFullscreenAllowed(): boolean { return !(this.client?.jurisdictionFlags.disabledFullscreen ?? false); }
  isTurboAllowed(): boolean      { return !(this.client?.jurisdictionFlags.disabledTurbo      ?? false); }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  private _applyDefaultBet(defaultBetLevel: number): void {
    const idx = this._betLevels.indexOf(defaultBetLevel);
    if (idx !== -1) this._currentBetIndex = idx;
  }

  private _emitBalanceUpdate(): void {
    const formatted = this.formattedBalance;
    this.onBalanceUpdate?.(this._balance, formatted);
    this.emit('balanceUpdate', this._balance, formatted);
  }

  private _handleError(error: Error): void {
    this.onError?.(error);
    this.emit('error', error);
  }
}

// ============================================================================
// Singleton
// ============================================================================

let _instance: StakeEngineManager | null = null;

/** Get (or create) the singleton StakeEngineManager. */
export function getStakeEngineManager(
  config?: StakeEngineManagerConfig
): StakeEngineManager {
  if (!_instance) _instance = new StakeEngineManager(config);
  return _instance;
}

/** Reset the singleton (useful for testing). */
export function resetStakeEngineManager(): void {
  _instance = null;
}

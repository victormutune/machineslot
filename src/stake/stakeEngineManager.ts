/**
 * stakeEngineManager.ts
 * Manages the game integration with Stake Engine RGS.
 * Handles RGS mode, Social/Demo mode.
 */

import {
  StakeEngineClient,
  StakeEngineError,
  fromRGSAmount,
  toRGSAmount,
  formatBalance,
  parseURLParams,
  isSocialCasinoCurrency,
} from './stakeEngineClient';

import type {
  GameConfig,
  RoundData,
  Currency,
  Balance,
} from './stakeEngineClient';

import { getLocaleManager } from '../locale/locale';

// ============================================================================
// Types
// ============================================================================

export type GameMode = 'rgs' | 'social' | 'demo';

export interface StakeEngineManagerConfig {
  defaultBalance?: number;
  defaultBetLevels?: number[];
  defaultBetIndex?: number;
  onBalanceUpdate?: (balance: number, formatted: string) => void;
  onConfigLoaded?: (config: GameConfig) => void;
  onError?: (error: StakeEngineError) => void;
  onModeChange?: (mode: GameMode) => void;
}

export interface SpinResult {
  success: boolean;
  balance: number;
  round?: RoundData;
  error?: StakeEngineError;
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

  private client: StakeEngineClient | null = null;

  private _mode: GameMode = 'demo';
  private _balance = 1000;
  private _currency: Currency = 'USD';
  private _config: GameConfig | null = null;

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
  ];

  private _currentBetIndex = 2;
  private _currentRound: RoundData | null = null;
  private _initialized = false;

  private onBalanceUpdate?: (balance: number, formatted: string) => void;
  private onConfigLoaded?: (config: GameConfig) => void;
  private onError?: (error: StakeEngineError) => void;
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
  get config(): GameConfig | null   { return this._config; }
  get betLevels(): number[]         { return this._betLevels; }
  get currentBetIndex(): number     { return this._currentBetIndex; }
  get currentBet(): number          { return this._betLevels[this._currentBetIndex] ?? 1_000_000; }
  get currentBetDisplay(): number   { return fromRGSAmount(this.currentBet); }
  get currentRound(): RoundData | null { return this._currentRound; }
  get isInitialized(): boolean      { return this._initialized; }
  get isRGSMode(): boolean          { return this._mode === 'rgs'; }
  get isSocialMode(): boolean       { return this._mode === 'social'; }
  get isDemoMode(): boolean         { return this._mode === 'demo'; }
  get isSocialCasino(): boolean     { return this._config?.jurisdiction.socialCasino ?? false; }

  get formattedBalance(): string {
    return formatBalance({ amount: toRGSAmount(this._balance), currency: this._currency });
  }

  get formattedBet(): string {
    return formatBalance({ amount: this.currentBet, currency: this._currency });
  }

  // ─────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────

  private _updateBalanceFromRGS(balanceData: Balance): void {
    const newCurrency = balanceData.currency;
    const newAmount   = fromRGSAmount(balanceData.amount);

    let currencyChanged = false;
    if (newCurrency !== this._currency) {
      this._currency = newCurrency;
      currencyChanged = true;
    }

    this._balance = newAmount;

    if (currencyChanged) {
      const isSocialFromURL  = new URLSearchParams(window.location.search).get('social') === 'true';
      const isConfigSocial   = this._config?.jurisdiction.socialCasino ?? false;

      let newMode: GameMode = this._mode;

      if (isSocialFromURL || isConfigSocial || isSocialCasinoCurrency(newCurrency)) {
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
    // Guard: React StrictMode mounts effects twice — skip if already done
    if (this._initialized) return true;
    const params           = parseURLParams();
    const urlParams        = new URLSearchParams(window.location.search);
    const isSocialFromURL  = urlParams.get('social') === 'true';
    const currencyFromURL  = urlParams.get('currency') as Currency | null;
    const balanceFromURL   = urlParams.get('balance');

    if (params) {
      this.client = new StakeEngineClient(params.sessionID, params.rgs_url);

      try {
        const auth = await this.client.authenticate();

        this._config       = auth.config;
        this._betLevels    = auth.config.betLevels;
        this._balance      = fromRGSAmount(auth.balance.amount);
        this._currency     = auth.balance.currency;
        this._currentRound = auth.round ?? null;

        if (
          isSocialFromURL ||
          auth.config.jurisdiction.socialCasino ||
          isSocialCasinoCurrency(auth.balance.currency)
        ) {
          this._mode = 'social';
          getLocaleManager().setSocialMode(true);
        } else {
          this._mode = 'rgs';
          getLocaleManager().setSocialMode(false);
        }

        // Restore bet index from saved round event if available
        if (this._currentRound?.event) {
          try {
            const saved = JSON.parse(this._currentRound.event) as { betIndex?: number };
            if (saved.betIndex !== undefined) this._currentBetIndex = saved.betIndex;
          } catch {
            this._applyDefaultBet(auth.config.defaultBetLevel);
          }
        } else {
          this._applyDefaultBet(auth.config.defaultBetLevel);
        }

        this.onConfigLoaded?.(auth.config);
        this._updateBalanceFromRGS(auth.balance);
        this.onModeChange?.(this._mode);
        this.emit('authenticated', auth);
        this._initialized = true;

        console.info(`[StakeEngine] Initialized in ${this._mode} mode`);
        console.info(`[StakeEngine] Bet levels: ${this._betLevels.map(fromRGSAmount).join(', ')}`);
        console.info(`[StakeEngine] Bet index: ${this._currentBetIndex}, amount: ${fromRGSAmount(this.currentBet)}`);

        // Resume any active/stuck round
        if (this._currentRound?.state === 'active') {
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

    if (isSocialFromURL || isSocialCasinoCurrency(this._currency)) {
      this._mode = 'social';
      getLocaleManager().setSocialMode(true);
    } else {
      this._mode = 'demo';
    }

    this._initialized = true;
    this.onModeChange?.(this._mode);
    this.emit('demoMode');

    console.info(`[StakeEngine] Running in ${this._mode} mode`);
    console.info(`[StakeEngine] Currency: ${this._currency}`);
    console.info(`[StakeEngine] Balance: ${this._balance}`);

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
    const rgsAmount = toRGSAmount(amount);
    const index = this._betLevels.findIndex(level => level >= rgsAmount);
    if (index !== -1) return this.setBetLevel(index);
    return false;
  }

  // ─────────────────────────────────────────────
  // Play
  // ─────────────────────────────────────────────

  async play(mode = 'BASE'): Promise<SpinResult> {
    const bet = this.currentBetDisplay;

    if (this._balance < bet) {
      const error = new StakeEngineError('ERR_IPB', 'Insufficient balance');
      this._handleError(error);
      return { success: false, balance: this._balance, error };
    }

    if (this.isRGSMode || this.isSocialMode) {
      try {
        const res = await this.client!.play(this.currentBet, mode);
        this._currentRound = res.round;
        this._updateBalanceFromRGS(res.balance);
        this.emit('playStarted', res.round);
        return { success: true, balance: this._balance, round: res.round };
      } catch (error) {
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
        const res = await this.client!.endRound();
        this._currentRound = null;
        this._updateBalanceFromRGS(res.balance);
        this.emit('roundEnded');
        return { success: true, balance: this._balance };
      } catch (error) {
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
        let data: Record<string, unknown> = {};
        try { data = JSON.parse(event) as Record<string, unknown>; }
        catch { data = { data: event }; }
        data.betIndex  = this._currentBetIndex;
        data.betAmount = this.currentBet;
        await this.client!.saveEvent(JSON.stringify(data));
        console.info('[StakeEngine] Saved event with bet index:', this._currentBetIndex);
        return true;
      } catch (error) {
        console.warn('[StakeEngine] saveEvent failed, falling back to demo', error);
        this._mode = 'demo';
        this.onModeChange?.(this._mode);
        this.emit('modeChanged', this._mode);
        return false;
      }
    }
    return true;
  }

  /** Refresh balance from RGS. */
  async refreshBalance(): Promise<number> {
    if (this.isRGSMode || this.isSocialMode) {
      try {
        const res = await this.client!.getBalance();
        this._updateBalanceFromRGS(res.balance);
      } catch (error) {
        console.warn('[StakeEngine] refreshBalance failed, falling back to demo', error);
        this._mode = 'demo';
        this.onModeChange?.(this._mode);
        this.emit('modeChanged', this._mode);
      }
    }
    return this._balance;
  }

  isFullscreenAllowed(): boolean { return !(this._config?.jurisdiction.disabledFullscreen ?? false); }
  isTurboAllowed(): boolean      { return !(this._config?.jurisdiction.disabledTurbo      ?? false); }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  private _applyDefaultBet(defaultBetLevel: number): void {
    const idx = this._betLevels.indexOf(defaultBetLevel);
    if (idx !== -1) this._currentBetIndex = idx;
  }

  private _emitBalanceUpdate(): void {
    this.onBalanceUpdate?.(this._balance, this.formattedBalance);
    this.emit('balanceUpdate', this._balance, this.formattedBalance);
  }

  private _handleError(error: StakeEngineError): void {
    this.onError?.(error);
    this.emit('error', error);
    if (error.isInvalidSession())          this.emit('sessionExpired');
    else if (error.isMaintenanceMode())    this.emit('maintenance');
    else if (error.isLocationRestricted()) this.emit('locationRestricted');
    else if (error.isGamblingLimitExceeded()) this.emit('gamblingLimitExceeded');
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

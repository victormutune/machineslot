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
    1_000_000,
    2_000_000,
    5_000_000,
    10_000_000,
    20_000_000,
    50_000_000,
    100_000_000,
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
      if (config.defaultBetLevels) this._betLevels = config.defaultBetLevels;
      if (config.defaultBetIndex !== undefined) this._currentBetIndex = config.defaultBetIndex;

      this.onBalanceUpdate = config.onBalanceUpdate;
      this.onConfigLoaded = config.onConfigLoaded;
      this.onError = config.onError;
      this.onModeChange = config.onModeChange;
    }
  }

  // ─────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────

  get mode(): GameMode { return this._mode; }
  get balance(): number { return this._balance; }
  get currency(): Currency { return this._currency; }
  get config(): GameConfig | null { return this._config; }

  get betLevels(): number[] { return this._betLevels }
  get currentBetIndex(): number { return this._currentBetIndex }

  get currentBet(): number {
    return this._betLevels[this._currentBetIndex] ?? 1_000_000
  }

  get currentBetDisplay(): number {
    return fromRGSAmount(this.currentBet)
  }

  get currentRound(): RoundData | null {
    return this._currentRound
  }

  get isRGSMode(): boolean { return this._mode === 'rgs' }
  get isSocialMode(): boolean { return this._mode === 'social' }
  get isDemoMode(): boolean { return this._mode === 'demo' }

  get formattedBalance(): string {
    return formatBalance({
      amount: toRGSAmount(this._balance),
      currency: this._currency
    })
  }

  // ─────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────

  async initialize(): Promise<boolean> {

    const params = parseURLParams()
    const urlParams = new URLSearchParams(window.location.search)

    const socialFromURL = urlParams.get('social') === 'true'
    const currencyFromURL = urlParams.get('currency') as Currency | null
    const balanceFromURL = urlParams.get('balance')

    if (params) {

      this.client = new StakeEngineClient(params.sessionID, params.rgs_url)

      try {

        const auth = await this.client.authenticate()

        this._config = auth.config
        this._betLevels = auth.config.betLevels
        this._balance = fromRGSAmount(auth.balance.amount)
        this._currency = auth.balance.currency
        this._currentRound = auth.round ?? null

        if (
          socialFromURL ||
          auth.config.jurisdiction.socialCasino ||
          isSocialCasinoCurrency(auth.balance.currency)
        ) {

          this._mode = 'social'
          getLocaleManager().setSocialMode(true)

        } else {

          this._mode = 'rgs'
          getLocaleManager().setSocialMode(false)

        }

        this.onConfigLoaded?.(auth.config)
        this._initialized = true

        this.emit('authenticated', auth)

        console.info(`[StakeEngine] Initialized in ${this._mode} mode`)

        return true

      } catch (error) {

        console.warn('[StakeEngine] RGS auth failed, falling back to demo', error)

      }

    }

    // ─────────────────────────────────────────────
    // DEMO FALLBACK
    // ─────────────────────────────────────────────

    if (currencyFromURL) {
      this._currency = currencyFromURL
    }

    if (balanceFromURL) {
      const parsed = Number(balanceFromURL)
      if (!isNaN(parsed)) {
        this._balance = parsed
      }
    }

    if (socialFromURL || isSocialCasinoCurrency(this._currency)) {

      this._mode = 'social'
      getLocaleManager().setSocialMode(true)

    } else {

      this._mode = 'demo'

    }

    this._initialized = true

    this.onModeChange?.(this._mode)
    this.emit('demoMode')

    console.info(`[StakeEngine] Running in ${this._mode} mode`)
    console.info(`[StakeEngine] Currency: ${this._currency}`)
    console.info(`[StakeEngine] Balance: ${this._balance}`)

    return true
  }

  // ─────────────────────────────────────────────
  // Bet controls
  // ─────────────────────────────────────────────

  increaseBet(): boolean {
    if (this._currentBetIndex < this._betLevels.length - 1) {
      this._currentBetIndex++
      this.emit('betChanged', this.currentBet)
      return true
    }
    return false
  }

  decreaseBet(): boolean {
    if (this._currentBetIndex > 0) {
      this._currentBetIndex--
      this.emit('betChanged', this.currentBet)
      return true
    }
    return false
  }

  // ─────────────────────────────────────────────
  // Play
  // ─────────────────────────────────────────────

  async play(): Promise<SpinResult> {

    const bet = this.currentBetDisplay

    if (this._balance < bet) {

      const error = new StakeEngineError('ERR_IPB', 'Insufficient balance')

      return {
        success: false,
        balance: this._balance,
        error
      }

    }

    if (this.isRGSMode || this.isSocialMode) {

      try {

        const res = await this.client!.play(this.currentBet)

        this._currentRound = res.round
        this._balance = fromRGSAmount(res.balance.amount)

        this.emit('playStarted', res.round)

        return {
          success: true,
          balance: this._balance,
          round: res.round
        }

      } catch (error) {

        console.warn('[StakeEngine] play failed -> switching demo')

        this._mode = 'demo'
      }

    }

    // Demo spin

    this._balance -= bet

    this.emit('balanceUpdate', this._balance)

    return {
      success: true,
      balance: this._balance
    }

  }

}

// ============================================================================
// Singleton
// ============================================================================

let _instance: StakeEngineManager | null = null

export function getStakeEngineManager(
  config?: StakeEngineManagerConfig
): StakeEngineManager {

  if (!_instance) {
    _instance = new StakeEngineManager(config)
  }

  return _instance
}

export function resetStakeEngineManager(): void {
  _instance = null
}


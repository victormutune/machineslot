/**
 * Stake Engine RGS Client
 * Handles communication with the Stake Engine Remote Gaming Server
 * Based on: https://github.com/StakeEngine/ts-client/
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Available currency codes for Stake Engine
 */
export type Currency =
  | 'USD' | 'CAD' | 'JPY' | 'EUR' | 'RUB' | 'CNY' | 'PHP' | 'INR'
  | 'IDR' | 'KRW' | 'BRL' | 'MXN' | 'DKK' | 'PLN' | 'VND' | 'TRY'
  | 'CLP' | 'ARS' | 'PEN' | 'NGN' | 'SAR' | 'ILS' | 'AED' | 'TWD'
  | 'NOK' | 'KWD' | 'JOD' | 'CRC' | 'TND' | 'SGD' | 'MYR' | 'OMR'
  | 'QAR' | 'BHD' | 'XGC' | 'XSC';

/**
 * Currency metadata for display formatting
 */
interface CurrencyMeta {
  symbol: string;
  decimals: number;
  symbolAfter?: boolean;
}

/**
 * Balance object from RGS
 */
export interface Balance {
  amount: number;
  currency: Currency;
}

/**
 * Jurisdiction configuration
 */
export interface JurisdictionConfig {
  socialCasino: boolean;
  disabledFullscreen: boolean;
  disabledTurbo: boolean;
}

/**
 * Game configuration from RGS
 */
export interface GameConfig {
  minBet: number;
  maxBet: number;
  stepBet: number;
  defaultBetLevel: number;
  betLevels: number[];
  jurisdiction: JurisdictionConfig;
}

/**
 * Round data from RGS
 */
export interface RoundData {
  id: string;
  state: 'active' | 'completed';
  event?: string;
  result?: unknown;
}

/**
 * Authentication response
 */
export interface AuthenticateResponse {
  balance: Balance;
  config: GameConfig;
  round?: RoundData;
}

/**
 * Play response
 */
export interface PlayResponse {
  balance: Balance;
  round: RoundData;
}

/**
 * Balance response
 */
export interface BalanceResponse {
  balance: Balance;
}

/**
 * End round response
 */
export interface EndRoundResponse {
  balance: Balance;
}

/**
 * Event response
 */
export interface EventResponse {
  event: string;
}

/**
 * Error response from RGS
 */
export interface RGSError {
  code: string;
  message?: string;
}

/**
 * URL parameters from game URL
 */
export interface URLParams {
  sessionID: string;
  lang: string;
  device: 'mobile' | 'desktop';
  rgs_url: string;
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Currency metadata for display formatting
 */
const CurrencyMetaMap: Record<Currency, CurrencyMeta> = {
  USD: { symbol: '$', decimals: 2 },
  CAD: { symbol: 'CA$', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  EUR: { symbol: '€', decimals: 2 },
  RUB: { symbol: '₽', decimals: 2 },
  CNY: { symbol: 'CN¥', decimals: 2 },
  PHP: { symbol: '₱', decimals: 2 },
  INR: { symbol: '₹', decimals: 2 },
  IDR: { symbol: 'Rp', decimals: 0 },
  KRW: { symbol: '₩', decimals: 0 },
  BRL: { symbol: 'R$', decimals: 2 },
  MXN: { symbol: 'MX$', decimals: 2 },
  DKK: { symbol: 'KR', decimals: 2, symbolAfter: true },
  PLN: { symbol: 'zł', decimals: 2, symbolAfter: true },
  VND: { symbol: '₫', decimals: 0, symbolAfter: true },
  TRY: { symbol: '₺', decimals: 2 },
  CLP: { symbol: 'CLP', decimals: 0, symbolAfter: true },
  ARS: { symbol: 'ARS', decimals: 2, symbolAfter: true },
  PEN: { symbol: 'S/', decimals: 2, symbolAfter: true },
  NGN: { symbol: '₦', decimals: 2 },
  SAR: { symbol: 'SAR', decimals: 2, symbolAfter: true },
  ILS: { symbol: 'ILS', decimals: 2, symbolAfter: true },
  AED: { symbol: 'AED', decimals: 2, symbolAfter: true },
  TWD: { symbol: 'NT$', decimals: 2 },
  NOK: { symbol: 'kr', decimals: 2 },
  KWD: { symbol: 'KD', decimals: 2 },
  JOD: { symbol: 'JD', decimals: 2 },
  CRC: { symbol: '₡', decimals: 2 },
  TND: { symbol: 'TND', decimals: 2, symbolAfter: true },
  SGD: { symbol: 'SG$', decimals: 2 },
  MYR: { symbol: 'RM', decimals: 2 },
  OMR: { symbol: 'OMR', decimals: 2, symbolAfter: true },
  QAR: { symbol: 'QAR', decimals: 2, symbolAfter: true },
  BHD: { symbol: 'BD', decimals: 2 },
  XGC: { symbol: '★GC ', decimals: 0 },  // Gold Coins  – social casino
  XSC: { symbol: '◆SC ', decimals: 0 },  // Silver Coins – social casino
};

/**
 * Convert RGS integer amount to display amount (6 decimal places = micro-units)
 */
export function fromRGSAmount(amount: number): number {
  return amount / 1_000_000;
}

/**
 * Convert display amount to RGS integer amount (6 decimal places = micro-units)
 */
export function toRGSAmount(amount: number): number {
  return Math.round(amount * 1_000_000);
}

/**
 * Format balance for display
 */
export function formatBalance(balance: Balance): string {
  const meta = CurrencyMetaMap[balance.currency] ?? {
    symbol: balance.currency,
    decimals: 2,
    symbolAfter: true,
  };

  const displayAmount = fromRGSAmount(balance.amount);
  const formattedAmount = displayAmount.toFixed(meta.decimals);

  return meta.symbolAfter
    ? `${formattedAmount} ${meta.symbol}`
    : `${meta.symbol}${formattedAmount}`;
}

/**
 * Check if currency is social casino currency
 */
export function isSocialCasinoCurrency(currency: Currency): boolean {
  return currency === 'XGC' || currency === 'XSC';
}

// ============================================================================
// URL Parameter Parsing
// ============================================================================

/**
 * Parse URL parameters for Stake Engine integration.
 * Returns null when running outside a real casino operator (e.g. local dev).
 */
export function parseURLParams(): URLParams | null {
  const urlParams = new URLSearchParams(window.location.search);

  const sessionID = urlParams.get('sessionID');
  const lang = urlParams.get('lang') || 'en';
  const device = (urlParams.get('device') as 'mobile' | 'desktop') || 'desktop';
  const rgs_url = urlParams.get('rgs_url');

  if (!sessionID || !rgs_url) return null;

  return { sessionID, lang, device, rgs_url };
}

// ============================================================================
// Stake Engine Client
// ============================================================================

/**
 * Stake Engine RGS Client
 */
export class StakeEngineClient {
  private sessionID: string;
  private rgsUrl: string;

  // Cached data
  private _balance: Balance | null = null;
  private _config: GameConfig | null = null;
  private _currentRound: RoundData | null = null;
  private _authenticated = false;

  constructor(
    sessionID: string,
    rgsUrl: string,
  ) {
    this.sessionID = sessionID;
    let url = rgsUrl.replace(/\/$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    this.rgsUrl = url;
  }

  /**
   * Create client from URL parameters.
   * Returns null when URL params are absent (local dev mode).
   */
  static fromURL(): StakeEngineClient | null {
    const params = parseURLParams();
    if (!params) return null;
    return new StakeEngineClient(params.sessionID, params.rgs_url);
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  get balance(): Balance | null { return this._balance; }
  get config(): GameConfig | null { return this._config; }
  get currentRound(): RoundData | null { return this._currentRound; }
  get isAuthenticated(): boolean { return this._authenticated; }
  get isSocialCasino(): boolean { return this._config?.jurisdiction.socialCasino ?? false; }

  // ── Internal request helper ───────────────────────────────────────────────
  private async request<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.rgsUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionID: this.sessionID, ...body }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as RGSError;
        throw new StakeEngineError(
          errorData.code || `HTTP_${response.status}`,
          errorData.message || `HTTP Error: ${response.status}`,
        );
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof StakeEngineError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new StakeEngineError('ERR_TIMEOUT', 'Request timed out');
      }
      const msg = error instanceof Error ? error.message : 'Network error occurred';
      throw new StakeEngineError('ERR_NETWORK', `Failed to connect to ${this.rgsUrl}: ${msg}`);
    }
  }

  // ── API methods ───────────────────────────────────────────────────────────

  /** Authenticate session — call first before anything else. */
  async authenticate(): Promise<AuthenticateResponse> {
    const response = await this.request<AuthenticateResponse>('/wallet/authenticate', {});
    this._balance = response.balance;
    this._config = response.config;
    this._currentRound = response.round ?? null;
    this._authenticated = true;
    return response;
  }

  /** Get current balance. */
  async getBalance(): Promise<BalanceResponse> {
    this._requireAuth();
    const response = await this.request<BalanceResponse>('/wallet/balance', {});
    this._balance = response.balance;
    return response;
  }

  /**
   * Place a bet and start a round.
   * @param amount - Bet in RGS micro-units (integer, 6 decimal places)
   * @param mode   - Bet mode, default 'BASE'
   */
  async play(amount: number, mode = 'BASE'): Promise<PlayResponse> {
    this._requireAuth();
    if (this._config) {
      if (amount < this._config.minBet)  throw new StakeEngineError('ERR_VAL', 'Bet below minimum');
      if (amount > this._config.maxBet)  throw new StakeEngineError('ERR_VAL', 'Bet above maximum');
      if (amount % this._config.stepBet !== 0) throw new StakeEngineError('ERR_VAL', 'Bet not divisible by step');
    }
    const payload: Record<string, unknown> = { amount };
    if (mode !== 'BASE' && mode !== 'base') {
       payload.mode = mode;
    }
    const response = await this.request<PlayResponse>('/wallet/play', payload);
    this._balance = response.balance;
    this._currentRound = response.round;
    return response;
  }

  /** End the current round. */
  async endRound(): Promise<EndRoundResponse> {
    this._requireAuth();
    const response = await this.request<EndRoundResponse>('/wallet/end-round', {});
    this._balance = response.balance;
    this._currentRound = null;
    return response;
  }

  /** Save an event string for round resumption. */
  async saveEvent(event: string): Promise<EventResponse> {
    this._requireAuth();
    return this.request<EventResponse>('/bet/event', { event });
  }

  // ── Config helpers ────────────────────────────────────────────────────────
  getBetLevels(): number[] { return this._config?.betLevels ?? []; }
  getDefaultBetLevel(): number { return this._config?.defaultBetLevel ?? 1_000_000; }
  isFullscreenDisabled(): boolean { return this._config?.jurisdiction.disabledFullscreen ?? false; }
  isTurboDisabled(): boolean { return this._config?.jurisdiction.disabledTurbo ?? false; }

  private _requireAuth(): void {
    if (!this._authenticated) {
      throw new StakeEngineError('ERR_IS', 'Session not authenticated. Call authenticate() first.');
    }
  }
}

// ============================================================================
// Error class
// ============================================================================

export class StakeEngineError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'StakeEngineError';
  }

  isInsufficientBalance(): boolean   { return this.code === 'ERR_IPB'; }
  isInvalidSession(): boolean        { return this.code === 'ERR_IS' || this.code === 'ERR_ATE'; }
  isGamblingLimitExceeded(): boolean { return this.code === 'ERR_GLE'; }
  isLocationRestricted(): boolean    { return this.code === 'ERR_LOC'; }
  isMaintenanceMode(): boolean       { return this.code === 'ERR_MAINTENANCE'; }
}

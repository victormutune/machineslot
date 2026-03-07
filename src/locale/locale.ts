/**
 * locale.ts
 * Minimal locale manager stub for Gradiator.
 * Extend this if you need real i18n support.
 */

class LocaleManager {
  private _socialMode = false;

  // Stake US Sweeps translations for prohibited gambling terms
  private _sweepsMap: Record<string, string> = {
    'win feature': 'play feature',
    'pay out': 'win',
    'paid out': 'won',
    'stake': 'play amount',
    'pays out': 'win',
    'betting': 'playing',
    'total bet': 'total play',
    'bet': 'play',
    'bets': 'plays',
    'cash': 'coins',
    'payer': 'winner',
    'pay': 'win',
    'pays': 'wins',
    'paid': 'won',
    'money': 'coins',
    'buy': 'play',
    'bought': 'instantly triggered',
    'purchase': 'play',
    'at the cost of': 'for',
    'rebet': 'respin',
    'cost of': 'can be played for',
    'credit': 'balance',
    'buy bonus': 'get bonus',
    'gamble': 'play',
    'wager': 'play',
    'deposit': 'get coins',
    'withdraw': 'redeem',
    'bonus buy': 'feature',
    'be awarded to player’s accounts': 'appear in player’s accounts',
    'place your bets': 'come and play',
    'bet/s': 'play/s',
    'currency': 'token',
    'fund': 'balance',
    // variations with casing adjustments
    'Bet': 'Play',
    'Bonus Buy': 'Get Bonus',
    'Buy Bonus': 'Get Bonus',
    'Auto Spin': 'Auto Play', // Safe
    'Auto Spin Enabled': 'Auto Play Enabled',
    'Balance': 'Coins',
    'Total Bet': 'Total Play',
    'Win': 'Win'
  };

  setSocialMode(social: boolean): void {
    this._socialMode = social;
  }

  isSocialMode(): boolean {
    return this._socialMode;
  }

  /**
   * Translates text replacing prohibited gambling terms in Sweeps Social Mode.
   */
  t(text: string): string {
    if (!this._socialMode || !text) return text;
    // Fast path: Exact match
    if (this._sweepsMap[text]) return this._sweepsMap[text];
    
    // Fallback: Case-insensitive simple word replacement string
    let result = text;
    for (const [key, val] of Object.entries(this._sweepsMap)) {
      // Very naive dynamic replace on boundaries here. Exact map matching is usually safer.
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      result = result.replace(regex, (match) => {
          // preserve casing of first letter roughly
          if (match[0].toUpperCase() === match[0]) {
             return val.charAt(0).toUpperCase() + val.slice(1);
          }
          return val;
      });
    }
    return result;
  }
}

let _instance: LocaleManager | null = null;

export function getLocaleManager(): LocaleManager {
  if (!_instance) _instance = new LocaleManager();
  return _instance;
}

// Shortcut function for UI
export function t(text: string): string {
  return getLocaleManager().t(text);
}

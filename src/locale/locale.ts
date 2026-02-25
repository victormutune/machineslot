/**
 * locale.ts
 * Minimal locale manager stub for Gradiator.
 * Extend this if you need real i18n support.
 */

class LocaleManager {
  private _socialMode = false;

  setSocialMode(social: boolean): void {
    this._socialMode = social;
  }

  isSocialMode(): boolean {
    return this._socialMode;
  }
}

let _instance: LocaleManager | null = null;

export function getLocaleManager(): LocaleManager {
  if (!_instance) _instance = new LocaleManager();
  return _instance;
}

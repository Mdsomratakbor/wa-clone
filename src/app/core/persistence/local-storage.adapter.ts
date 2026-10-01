import { Injectable } from '@angular/core';
import { PersistencePort } from './persistence.port';

/**
 * F-047 FR-002. The only `window.localStorage` reference in `src/app/core`.
 *
 * The try/catch bodies are moved verbatim from the three stores that each held a
 * private copy, so behaviour is preserved by construction rather than by
 * reimplementation. Every guard is load-bearing:
 *
 * - `getItem` throws `SecurityError` in a blocked third-party context and when
 *   cookies are disabled;
 * - `setItem` throws `QuotaExceededError` when the origin's quota is full;
 * - `removeItem` throws when storage is unavailable;
 * - all three can throw merely for *touching* `window.localStorage` at all, which
 *   is why nothing here runs at injection time — see plan.md risk 4.
 *
 * `providedIn: 'root'` is what satisfies the port for all three stores without a
 * provider list in `app.config.ts` and without touching a single component (F-047
 * FR-009, FR-008).
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageAdapter extends PersistencePort {
  override read(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  override write(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable/blocked or quota exceeded: persist is best-effort.
    }
  }

  override remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore: storage unavailable.
    }
  }
}
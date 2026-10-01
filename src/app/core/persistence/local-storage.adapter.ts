import { Injectable } from '@angular/core';
import type { PersistencePort } from './persistence.port';

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
 * `providedIn: 'root'` here is what lets a test ask for the concrete adapter by name. The *port*
 * binding — what lets a store ask for the seam — lives on `PersistencePort` itself; see the note in
 * `persistence.port.ts` for why it cannot live here, and why an `extends` clause would deadlock module
 * evaluation.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageAdapter implements PersistencePort {
  read(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  write(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable/blocked or quota exceeded: persist is best-effort.
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore: storage unavailable.
    }
  }
}
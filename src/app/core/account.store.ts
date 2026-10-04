import { Injectable, signal } from '@angular/core';
import { PersistencePort } from './persistence/persistence.port';

export const ACCOUNT_KEY = 'wa.account.v1';

export interface TwoStepState {
  pin: string;
  email: string;
}

export interface AccountState {
  deviceNumber: string;
  twoStep: TwoStepState | null;
}

export const DEFAULT_ACCOUNT: AccountState = {
  deviceNumber: '',
  twoStep: null,
};

interface AccountSnapshot {
  version: 1;
  deviceNumber?: string;
  twoStep?: TwoStepState | null;
}

const STORE_VERSION = 1;

/**
 * F-057 FR-006/FR-007 (model). Additive-model guard, same defect class as
 * F-042 hydrateDefaults / F-045 normalizeCalls: a malformed persisted block must
 * never render `undefined`. A twoStep block survives only when both pin and email
 * are strings; anything else normalizes to disabled. The PIN is treated as an
 * opaque string - normalizing only its type, never its content.
 */
function normalizeAccount(raw: Partial<AccountSnapshot> | null): AccountState {
  const state: AccountState = { ...DEFAULT_ACCOUNT };
  if (raw === null || typeof raw !== 'object') {
    return state;
  }
  if (typeof raw.deviceNumber === 'string') {
    state.deviceNumber = raw.deviceNumber;
  }
  const two = raw.twoStep;
  if (
    typeof two === 'object' &&
    two !== null &&
    typeof two.pin === 'string' &&
    typeof two.email === 'string'
  ) {
    state.twoStep = { pin: two.pin, email: two.email };
  }
  return state;
}

@Injectable({ providedIn: 'root' })
export class AccountStore {
  readonly account = signal<AccountState>({ ...DEFAULT_ACCOUNT });

  constructor(private readonly storage: PersistencePort) {
    this.hydrate();
  }

  setDeviceNumber(number: string): void {
    const trimmed = number.trim();
    if (trimmed.length === 0) {
      return;
    }
    this.account.update((state) => ({ ...state, deviceNumber: trimmed }));
    this.persist();
  }

  /**
   * FR-006: refuses silently when the inputs are not a 6-digit PIN and a
   * recovery email containing `@` - the page gates the button too, but the store
   * must not persist an invalid rule if a caller guesses.
   */
  setTwoStep(pin: string, email: string): void {
    const trimmedPin = pin.trim();
    const trimmedEmail = email.trim();
    if (!/^\d{6}$/.test(trimmedPin) || !trimmedEmail.includes('@')) {
      return;
    }
    this.account.update((state) => ({
      ...state,
      twoStep: { pin: trimmedPin, email: trimmedEmail },
    }));
    this.persist();
  }

  /**
   * FR-006: removal requires re-entering the PIN. Returns whether the state was
   * cleared; a mismatch changes nothing and the caller announces the refusal.
   */
  removeTwoStep(pin: string): boolean {
    const current = this.account().twoStep;
    if (current === null || current.pin !== pin) {
      return false;
    }
    this.account.update((state) => ({ ...state, twoStep: null }));
    this.persist();
    return true;
  }

  /**
   * F-013 reset convention: remove the key and restore defaults (contrast
   * CallStore.clearCalls(), which writes an empty snapshot).
   *
   * The PIN is stored plainly: this app has no approved hashing dependency and
   * the threat model is a single-user demo clone. This is a local flag the UI
   * reflects honestly, not security, and it is wiped with the store.
   */
  reset(): void {
    this.storage.remove(ACCOUNT_KEY);
    this.account.set({ ...DEFAULT_ACCOUNT });
  }

  private persist(): void {
    const snapshot: AccountSnapshot = {
      version: STORE_VERSION,
      deviceNumber: this.account().deviceNumber,
      twoStep: this.account().twoStep,
    };
    this.storage.write(ACCOUNT_KEY, JSON.stringify(snapshot));
  }

  private hydrate(): void {
    const raw = this.storage.read(ACCOUNT_KEY);
    if (raw === null) {
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const snapshot = parsed as Partial<AccountSnapshot> | null;
    if (snapshot === null || typeof snapshot !== 'object' || snapshot.version !== STORE_VERSION) {
      return;
    }
    this.account.set(normalizeAccount(snapshot));
  }
}
import { PersistencePort } from './persistence.port';

/**
 * F-047 FR-010. An in-memory `PersistencePort` for tests.
 *
 * This is a real implementation of the contract, not a spy. `research.md` §7 records why that
 * matters: a spy asserts that `write` was *called*, which says nothing about whether the bytes it
 * received can be read back. A store that persisted under one key and hydrated from another, or
 * serialized into something `JSON.parse` chokes on, passes every spy-based assertion and still
 * loses a user's data on reload. With a working double, "the store wrote it" and "a fresh store
 * instance read it back" become one fact that has to hold.
 *
 * It honours the port's no-throw contract rather than simulating failure — the stores already prove
 * the unavailable-storage path against `LocalStorageAdapter`, and a double that randomly threw would
 * make those results unreproducible.
 *
 * It lives in `src/app/core/persistence/` and not in a test folder because Angular's build does not
 * exclude test helpers by path: a fake that must be kept out of the production bundle by convention
 * is a fake that eventually ships. It is not `providedIn: 'root'` and no store depends on it, so
 * it is inert at runtime — tests construct it explicitly with `new`.
 */
export class InMemoryPersistencePort extends PersistencePort {
  private readonly data: Map<string, string>;

  /** `initial` seeds payloads as if a previous session had already written them. */
  constructor(initial: Readonly<Record<string, string>> = {}) {
    super();
    this.data = new Map(Object.entries(initial));
  }

  override read(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  override write(key: string, value: string): void {
    this.data.set(key, value);
  }

  override remove(key: string): void {
    this.data.delete(key);
  }
}
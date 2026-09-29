import { Injectable } from '@angular/core';

/**
 * F-045: the single source of "now" and of periodic ticks for the calling flow.
 *
 * `AGENTS.md` forbids wall-clock reads in render paths, and tests must not depend
 * on the real clock. Components and stores therefore never call `Date.now()`
 * directly: the caller passes the time it got from here, so the store stays pure
 * with respect to time and `fakeAsync` can drive it deterministically.
 */
@Injectable({ providedIn: 'root' })
export class Clock {
  now(): number {
    return Date.now();
  }

  /**
   * Run `onTick` every `intervalMs` until the returned cleanup is called.
   * Returning the cleanup rather than an id keeps the interval in one place and
   * makes "the tick is cleared on hangup and on destroy" (FR-010) a single call.
   */
  every(intervalMs: number, onTick: () => void): () => void {
    const handle = setInterval(onTick, intervalMs);
    return () => clearInterval(handle);
  }
}

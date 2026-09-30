export type CallDirection = 'incoming' | 'outgoing' | 'missed';

/** F-045: what the user asked for. Orthogonal to `direction`. */
export type CallOutcome = 'completed' | 'missed';

export type CallKind = 'voice' | 'video';

export type CallState = 'dialing' | 'ringing' | 'connected' | 'ended';

export interface CallEntry {
  id: string;
  contactName: string;
  direction: CallDirection;
  date: string;
  avatarRef: string | null;
  /** F-045: optional so pre-F-045 v1 snapshots load unchanged. */
  outcome?: CallOutcome;
}

/**
 * F-045: who a call is placed to. `contactId` is null when the calls log holds a
 * name with no matching conversation - the same no-match path the Calls row tap
 * already takes (calls-page.ts:140-146).
 */
export interface CallTarget {
  contactId: string | null;
  contactName: string;
  avatarRef: string | null;
}

/**
 * F-045: the live call. Held in CallStore, never persisted (FR-009): reloading
 * must not restore a call that is not there.
 */
export interface CallSession {
  target: CallTarget;
  kind: CallKind;
  state: CallState;
  startedAtMs: number;
  connectedAtMs: number | null;
  elapsedMs: number;
  muted: boolean;
  speakerOn: boolean;
  videoOn: boolean;
}

// Not-yet-connected phases. Both mean "no duration is counting yet"; `dialing`
// is the brief placing phase, `ringing` the wait for an answer. There is no
// second party to answer, so ringing auto-answers to keep the flow functional
// (spec FR-004). Both are hypotheses pending capture, named so tests drive them
// through the clock rather than waiting.
export const DIALING_MS = 1000;
export const RINGING_MS = 3000;
export const CONNECT_AFTER_MS = DIALING_MS + RINGING_MS;

export const CALL_DIRECTION_LABELS: Record<CallDirection, string> = {
  incoming: 'incoming',
  outgoing: 'outgoing',
  missed: 'missed',
};

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  completed: 'completed call',
  missed: 'cancelled call',
};

/**
 * F-046 FR-008: a call is missed if it was never completed.
 *
 * This used to read `direction === 'missed'`, which F-045 quietly invalidated:
 * `endCall` records every call this app places as `direction: 'outgoing'` and
 * puts the real result in `outcome` (call.store.ts:130-137). So a call that
 * rang out unanswered - the one call the user most wants to find - reported
 * `false` here. Wiring the Missed filter to that helper would have produced a
 * filter that was enabled, styled as working, and showed nothing.
 *
 * `outcome` is consulted when present because `hydrate()` normalizes it from
 * `direction` for pre-F-045 snapshots (call.store.ts:53). The fallback keeps
 * the helper correct for an un-normalized entry, where `direction: 'missed'` is
 * the only signal available.
 */
export const isMissedCall = (call: CallEntry): boolean =>
  call.outcome !== undefined ? call.outcome === 'missed' : call.direction === 'missed';

/** A call is "active" until it has ended; `ended` is a terminal state. */
export const isActiveCall = (session: CallSession | null): session is CallSession =>
  session !== null && session.state !== 'ended';

/**
 * Pure transition: given the session and the current clock time, return the
 * session as it should be now. Keeping this out of the store makes the machine
 * testable without a component or a TestBed.
 *
 * `ended` is terminal; `connected` only advances the clock; the not-yet-connected
 * states promote on their boundaries, and `connectedAtMs` is pinned to the
 * boundary instant so the duration starts at zero rather than jumping.
 */
export function reduceSession(session: CallSession, nowMs: number): CallSession {
  if (session.state === 'ended') {
    return session;
  }

  if (session.state === 'connected') {
    const elapsedMs = Math.max(0, nowMs - (session.connectedAtMs ?? nowMs));
    return elapsedMs === session.elapsedMs ? session : { ...session, elapsedMs };
  }

  const sinceStartMs = nowMs - session.startedAtMs;

  if (sinceStartMs >= CONNECT_AFTER_MS) {
    const connectedAtMs = session.startedAtMs + CONNECT_AFTER_MS;
    return {
      ...session,
      state: 'connected',
      connectedAtMs,
      elapsedMs: Math.max(0, nowMs - connectedAtMs),
    };
  }

  if (sinceStartMs >= DIALING_MS) {
    return session.state === 'ringing' ? session : { ...session, state: 'ringing' };
  }

  return session;
}

/** `mm:ss` for the in-call duration. Hours are not modelled; calls do not last. */
export function formatDuration(elapsedMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * A log entry's `date` is a display string. Derived from the injected clock so
 * the store never reads the wall clock itself (FR-010).
 */
export function formatCallDate(nowMs: number): string {
  const d = new Date(nowMs);
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}

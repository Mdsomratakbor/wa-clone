import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallStore } from '../../core/call.store';
import { Clock } from '../../core/clock';
import { formatDuration } from './calls.model';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';

const TICK_MS = 1000;

// F-045 (specs/045-calling-flow). PROVISIONAL chrome: no Figma node exists for an
// in-call screen, and the quota reset cannot verify one because none is in the
// file. The entry points that ARE design-verified are row 4 (0:10395) and row 2.
@Component({
  selector: 'app-in-call-page',
  imports: [UserAvatar],
  templateUrl: './in-call-page.html',
  styleUrl: './in-call-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InCallPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(CallStore);
  private readonly clock = inject(Clock);

  private readonly stopTick: () => void;

  // FR-005: the screen renders the live session from the store, it does not own
  // the call. A call the store cannot see is a call the UI invented.
  protected readonly session = computed(() => this.store.session());
  protected readonly name = computed(() => this.session()?.target.contactName ?? '');
  protected readonly avatarRef = computed(() => this.session()?.target.avatarRef ?? null);
  protected readonly duration = computed(() => formatDuration(this.session()?.elapsedMs ?? 0));

  protected readonly connected = computed(() => this.session()?.state === 'connected');

  /**
   * FR-014: `/calls/active` is reachable by deep link with no session behind it.
   * Rendering an empty avatar and a "Connecting…" that will never resolve is a
   * lie about state, so the no-session case gets its own branch.
   */
  protected readonly statusLabel = computed(() => {
    const session = this.session();
    if (!session) {
      return 'No active call';
    }
    return session.state === 'connected' ? this.duration() : 'Connecting…';
  });

  /**
   * FR-005/FR-008: the call returns to the screen it came from. The origin arrives
   * as a query param and is validated against an allow-list - an unvalidated param
   * is an open redirect into whatever the router resolves.
   */
  private readonly returnTo: readonly string[] = this.resolveReturnTo();

  constructor() {
    // FR-010: time advances on ticks, never from a wall-clock read in the render
    // path. Cleared on hangup AND on destroy, so neither a finished nor a
    // navigated-away screen leaves an interval running.
    this.stopTick = this.clock.every(TICK_MS, () => this.store.advance(this.clock.now()));
  }

  ngOnDestroy(): void {
    this.stopTick();
  }

  protected onMute(): void {
    this.store.toggleMute();
  }

  protected onSpeaker(): void {
    this.store.toggleSpeaker();
  }

  protected onVideo(): void {
    this.store.toggleVideo();
  }

  protected onHangUp(): void {
    this.store.endCall(this.clock.now());
    this.stopTick();
    this.store.clearSession();
    void this.router.navigate(this.returnTo);
  }

  // FR-014: an unreachable in-call screen must not be a dead end.
  protected onBackToCalls(): void {
    this.stopTick();
    void this.router.navigate(['/calls']);
  }

  private resolveReturnTo(): readonly string[] {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from !== null && isAllowedOrigin(from)) {
      return [from];
    }
    return ['/calls'];
  }
}

/**
 * FR-005/FR-008. Matched exactly, not by prefix: a `startsWith('/calls')` test also
 * accepts `/callsevil`, and `startsWith('/chat/')` accepts `/chat//evil` and
 * `/chat/../settings`. A return target is a navigation, so it gets the same
 * treatment as a redirect.
 */
const CHAT_ORIGIN = /^\/chat\/[A-Za-z0-9_-]+$/;

function isAllowedOrigin(from: string): boolean {
  return from === '/calls' || CHAT_ORIGIN.test(from);
}

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { InCallPage } from './in-call-page';
import { CallStore } from '../../core/call.store';
import { CallTarget, CONNECT_AFTER_MS, DIALING_MS } from './calls.model';

describe('InCallPage (feature 045)', () => {
  const MARTHA: CallTarget = {
    contactId: 'chat-006',
    contactName: 'Martha Craig',
    avatarRef: null,
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InCallPage],
      providers: [
        provideRouter([
          { path: 'calls/active', component: InCallPage },
          { path: 'calls', component: InCallPage },
          { path: 'chat/:id', component: InCallPage },
        ]),
      ],
    }).compileComponents();
  });

  interface Harness {
    el: HTMLElement;
    router: Router;
    store: CallStore;
    fixture: ComponentFixture<unknown>;
  }

  async function render(from?: string): Promise<Harness> {
    const harness = await RouterTestingHarness.create();
    const url =
      from === undefined ? '/calls/active' : `/calls/active?from=${encodeURIComponent(from)}`;
    await harness.navigateByUrl(url, InCallPage);
    return {
      el: harness.fixture.nativeElement as HTMLElement,
      router: TestBed.inject(Router),
      store: TestBed.inject(CallStore),
      fixture: harness.fixture,
    };
  }

  /**
   * The screen renders the store, not its own copy, so a call started after the
   * route resolved only appears after a change-detection pass. Starting a call
   * without this is the shape of bug where a store-driven screen silently shows
   * nothing, so it is a helper rather than a repeated call.
   */
  function start(h: Harness, kind: 'voice' | 'video' = 'voice', nowMs = 0): void {
    h.store.startCall(MARTHA, kind, nowMs);
    h.fixture.detectChanges();
  }

  function control(el: HTMLElement, testid: string): HTMLButtonElement {
    return el.querySelector<HTMLButtonElement>(`[data-testid="${testid}"]`) as HTMLButtonElement;
  }

  it('renders the contact name and the call kind (FR-005)', async () => {
    const h = await render();
    start(h);

    expect(control(h.el, 'in-call-name').textContent?.trim()).toBe('Martha Craig');
    expect(control(h.el, 'in-call-kind').textContent?.trim()).toBe('Voice call');
  });

  it('shows a video call kind for a video session (FR-005)', async () => {
    const h = await render();
    start(h, 'video');

    expect(control(h.el, 'in-call-kind').textContent?.trim()).toBe('Video call');
  });

  it('shows Connecting until the session connects (FR-005)', async () => {
    const h = await render();
    start(h);

    const duration = control(h.el, 'in-call-duration');
    expect(duration.textContent?.trim()).toContain('Connecting');
    expect(duration.textContent?.trim()).not.toContain('00:00');
  });

  it('the duration is a timer region, not a live region (FR-013)', async () => {
    const h = await render();
    start(h);

    const duration = control(h.el, 'in-call-duration');
    expect(duration.getAttribute('role')).toBe('timer');
    // role="status" implies aria-live, which would announce a new value every
    // second. Asserted explicitly because it is the worst outcome available here.
    expect(duration.getAttribute('aria-live')).toBeNull();
  });

  it('advances the duration only once connected (FR-010)', fakeAsync(() => {
    render().then((h) => {
      const base = 1_000_000;
      start(h, 'voice', base);

      h.store.advance(base + DIALING_MS + 1);
      h.fixture.detectChanges();
      expect(control(h.el, 'in-call-duration').textContent?.trim()).toContain('Connecting');

      h.store.advance(base + CONNECT_AFTER_MS);
      h.fixture.detectChanges();
      expect(control(h.el, 'in-call-duration').textContent?.trim()).toBe('00:00');

      h.store.advance(base + CONNECT_AFTER_MS + 65_000);
      h.fixture.detectChanges();
      expect(control(h.el, 'in-call-duration').textContent?.trim()).toBe('01:05');

      // The page's own interval drives advance() once a second (FR-010).
      tick(1000);
      tick(0);
    });
  }));

  it('Mute toggles real session state and aria-pressed (FR-006)', async () => {
    const h = await render();
    start(h);

    const mute = control(h.el, 'in-call-mute');
    expect(mute.getAttribute('aria-pressed')).toBe('false');
    mute.click();
    h.fixture.detectChanges();

    expect(mute.getAttribute('aria-pressed')).toBe('true');
    // Read through the store, not the label: the project directive's G4 gate is
    // about real state, and an aria-pressed flip alone would satisfy a weaker one.
    expect(h.store.session()?.muted).toBe(true);
    expect(mute.classList.contains('in-call__control--on')).toBe(true);
  });

  it('Speaker toggles real session state (FR-006)', async () => {
    const h = await render();
    start(h);
    control(h.el, 'in-call-speaker').click();
    h.fixture.detectChanges();

    expect(h.store.session()?.speakerOn).toBe(true);
    expect(control(h.el, 'in-call-speaker').getAttribute('aria-pressed')).toBe('true');
  });

  it('Video toggles real session state (FR-006)', async () => {
    const h = await render();
    start(h);
    control(h.el, 'in-call-video').click();
    h.fixture.detectChanges();

    expect(h.store.session()?.videoOn).toBe(true);
  });

  it('the video affordance is labelled unavailable (FR-013)', async () => {
    const h = await render();
    start(h);

    expect(control(h.el, 'in-call-video').getAttribute('aria-label')).toContain('unavailable');
  });

  it('every control is a labelled button, keyboard reachable (FR-013)', async () => {
    const h = await render();
    start(h);

    for (const testid of [
      'in-call-mute',
      'in-call-speaker',
      'in-call-video',
      'in-call-hangup',
    ]) {
      const button = control(h.el, testid);
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('aria-label')).toBeTruthy();
      expect(button.disabled).toBe(false);
    }
  });

  it('Hang up ends the call, records it, and returns to the origin (FR-005, FR-007)', fakeAsync(() => {
    render('/chat/chat-006').then((h) => {
      const before = h.store.calls().length;
      start(h);
      h.store.advance(CONNECT_AFTER_MS);

      control(h.el, 'in-call-hangup').click();
      tick();

      expect(h.store.calls().length).toBe(before + 1);
      expect(h.store.calls()[0]?.outcome).toBe('completed');
      expect(h.router.url).toBe('/chat/chat-006');
    });
  }));

  it('Hang up during ringing records a missed call, not a completed one (FR-007)', fakeAsync(() => {
    render().then((h) => {
      start(h);
      h.store.advance(DIALING_MS + 1);

      control(h.el, 'in-call-hangup').click();
      tick();

      expect(h.store.calls()[0]?.outcome).toBe('missed');
    });
  }));

  it('Hang up returns to the Calls list when no origin is given (FR-005)', fakeAsync(() => {
    render().then((h) => {
      start(h);
      control(h.el, 'in-call-hangup').click();
      tick();

      expect(h.router.url).toBe('/calls');
    });
  }));

  it('a second call while one is active is refused and the session is untouched (FR-011)', async () => {
    const h = await render();
    start(h);
    const first = h.store.session();

    expect(h.store.startCall({ ...MARTHA, contactName: 'Other' }, 'video', 10)).toBe(false);
    expect(h.store.session()).toBe(first);
    expect(h.store.session()?.target.contactName).toBe('Martha Craig');
  });

  it('the tick stops after hangup (FR-010)', fakeAsync(() => {
    render().then((h) => {
      start(h);
      h.store.advance(CONNECT_AFTER_MS);
      h.fixture.detectChanges();

      control(h.el, 'in-call-hangup').click();
      tick();
      expect(h.store.session()).toBeNull();

      // If the interval leaked, ticking would keep mutating a session that is gone.
      tick(5000);
      expect(h.store.session()).toBeNull();
    });
  }));

  it('renders without a session and does not throw (FR-014)', async () => {
    const h = await render();

    expect(h.el.querySelector('[data-testid="in-call-page"]')).not.toBeNull();
    expect(control(h.el, 'in-call-duration').textContent?.trim()).toBe('No active call');
  });

  it('hides the call controls when there is no session, rather than rendering them dead (FR-014)', async () => {
    const h = await render();

    expect(h.el.querySelector('[data-testid="in-call-empty"]')).not.toBeNull();
    expect(h.el.querySelector('[data-testid="in-call-hangup"]')).toBeNull();
    expect(h.el.querySelector('[data-testid="in-call-mute"]')).toBeNull();
  });

  it('a no-session in-call screen is not a dead end (FR-014)', fakeAsync(() => {
    render().then((h) => {
      control(h.el, 'in-call-back-to-calls').click();
      tick();

      expect(h.router.url).toBe('/calls');
    });
  }));

  // One test per hostile value rather than a loop: RouterTestingHarness.create()
  // can only run once per TestBed, and five in one test leaks five tick intervals.
  // A prefix match would accept all of these; the allow-list is exact.
  for (const hostile of [
    'https://evil.example/steal',
    '/callsevil',
    '/chat/../settings',
    '/chat//evil',
    '//evil.example/steal',
  ]) {
    it(`a from= that only looks like the allow-list is rejected: ${hostile} (FR-005, FR-008)`, fakeAsync(() => {
      render(hostile).then((h) => {
        start(h);
        control(h.el, 'in-call-hangup').click();
        tick();

        expect(h.router.url).toBe('/calls');
      });
    }));
  }

  it('a valid chat origin is still honoured after hardening (FR-005)', fakeAsync(() => {
    render('/chat/chat-006').then((h) => {
      start(h);
      control(h.el, 'in-call-hangup').click();
      tick();

      expect(h.router.url).toBe('/chat/chat-006');
    });
  }));
});

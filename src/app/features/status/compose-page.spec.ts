import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { ComposePage } from './compose-page';
import { StatusStore } from '../../core/status.store';
import { Clock } from '../../core/clock';

describe('ComposePage', () => {
  let fixture: ComponentFixture<ComposePage>;
  let routeKind: string | null = null;

  beforeEach(async () => {
    localStorage.clear();
    routeKind = null;
    await TestBed.configureTestingModule({
      imports: [ComposePage],
      providers: [
        provideRouter([]),
        // F-050: the page reads `?kind=photo` off the route snapshot, following the
        // `in-call-page.ts` precedent. A getter keeps the stub mutable so one TestBed
        // can render both modes, instead of reconfiguring mid-test.
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap(): URLSearchParams {
                return new URLSearchParams(routeKind === null ? '' : `kind=${routeKind}`);
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  function render(): HTMLElement {
    return renderIn(null);
  }

  function renderIn(kind: string | null): HTMLElement {
    routeKind = kind;
    fixture = TestBed.createComponent(ComposePage);
    fixture.autoDetectChanges();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function type(el: HTMLElement, value: string): void {
    const input = el.querySelector<HTMLInputElement>('[data-testid="compose-input"]');
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
  }

  it('renders the full-bleed compose surface with the three top glyphs', () => {
    const el = render();
    const surface = el.querySelector<HTMLElement>('[data-testid="compose-page"]');
    expect(surface).not.toBeNull();
    expect(getComputedStyle(surface!).backgroundColor).toBe('rgb(255, 138, 140)');
    expect(el.querySelector('[data-testid="compose-top"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-close"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-send-text"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-send"]')).not.toBeNull();
  });

  // F-049: the decorative <p> and its fake caret are replaced by a real input,
  // so the placeholder is now an attribute and the caret is the input's own.
  // F-051: the keyboard band is a component now, not the inert PNG graphic.
  // F-053: the field is a growing single-row textarea, not a fixed-height input.
  it('renders a real expanding textarea, not a decorative placeholder, plus the on-screen keyboard (FR-001)', () => {
    const el = render();
    const input = el.querySelector<HTMLTextAreaElement>('[data-testid="compose-input"]');

    expect(input?.tagName).toBe('TEXTAREA');
    expect(input?.getAttribute('rows')).toBe('1');
    expect(input?.getAttribute('placeholder')).toBe('Type a status');
    expect(input?.getAttribute('aria-label')).toBe('Type a status');
    expect(el.querySelector('.compose__placeholder')).toBeNull();
    expect(el.querySelector('.compose__caret')).toBeNull();
    expect(el.querySelector('[data-testid="compose-type"]')?.getAttribute('aria-hidden')).toBeNull();

    expect(el.querySelector('app-status-keyboard')).not.toBeNull();
    expect(el.querySelector('img[src="/status-compose-keyboard.png"]')).toBeNull();
  });

  it('renders no tab bar, navigation bar, FAB or title', () => {
    const el = render();
    expect(el.querySelector('app-navigation-bar')).toBeNull();
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector('.fab')).toBeNull();
    expect(el.querySelector('.navigation-bar__title')).toBeNull();
  });

  it('navigates to /status when Close is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="compose-close"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  // F-049: Send is disabled by a click listener-free attribute, so clicking it
  // does nothing at all - the browser suppresses the event.
  it('Send is genuinely disabled while the text is blank (FR-002)', () => {
    const el = render();
    const send = el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]');

    expect(send?.disabled).toBe(true);

    type(el, '   ');
    fixture.detectChanges();
    expect(send?.disabled).toBe(true);
  });

  it('Send becomes enabled once text is typed (FR-002)', () => {
    const el = render();
    type(el, 'on the move');
    fixture.detectChanges();

    expect(el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]')?.disabled).toBe(false);
  });

  it('Send publishes the trimmed text and navigates to the feed (FR-003)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    type(el, '  at the beach  ');
    fixture.detectChanges();
    (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()?.text).toBe('at the beach');
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('Send publishes nothing and navigates nowhere when the text is blank (FR-004)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    type(el, '  ');
    fixture.detectChanges();
    (el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]') as HTMLButtonElement)
      .click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('Send uses the injected Clock, not the wall clock (FR-012)', () => {
    const el = render();
    spyOn(TestBed.inject(Clock), 'now').and.returnValue(1_700_000_000_000);

    type(el, 'timed');
    fixture.detectChanges();
    (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()?.createdAtMs).toBe(1_700_000_000_000);
  });

  it('Send-alt is disabled with an accessible reason, and inert by mouse and keyboard (FR-008)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const sendText = el.querySelector<HTMLButtonElement>('[data-testid="compose-send-text"]');

    expect(sendText?.disabled).toBe(true);

    const reasonId = sendText?.getAttribute('aria-describedby');
    expect(reasonId).toBe('compose-send-text-reason');
    expect(el.querySelector(`#${reasonId}`)?.textContent).toContain('not available');

    type(el, 'on the move');
    fixture.detectChanges();
    expect(sendText?.disabled).toBe(true);

    sendText?.click();
    sendText?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    sendText?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
  });

  // ---------------------------------------------------------------- F-051 ------

  function press(el: HTMLElement, testid: string): void {
    (el.querySelector(`[data-testid="${testid}"]`) as HTMLButtonElement).click();
  }

  // F-051 FR-007: one value for both entry points — the real input and the on-screen
  // keys edit the same signal, so entry through either is seen by the other.
  it('the on-screen keys and the field share one value (FR-007)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const input = el.querySelector<HTMLInputElement>('[data-testid="compose-input"]')!;

    press(el, 'compose-key-h');
    expect(input.value).toBe('h');

    // the helper writes the whole field value, so appending 'i' means typing 'hi'.
    type(el, 'hi');
    expect(input.value).toBe('hi');

    press(el, 'compose-key-e');
    expect(input.value).toBe('hie');

    press(el, 'compose-key-send');
    fixture.detectChanges();
    expect(TestBed.inject(StatusStore).myStatus()?.text).toBe('hie');
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('the on-screen backspace removes the last typed character (FR-004)', () => {
    const el = render();
    const input = el.querySelector<HTMLInputElement>('[data-testid="compose-input"]')!;

    press(el, 'compose-key-a');
    press(el, 'compose-key-b');
    press(el, 'compose-key-backspace');
    fixture.detectChanges();

    expect(input.value).toBe('a');
    expect(el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]')?.disabled).toBe(
      false,
    );
  });

  it('a blank value leaves the on-screen Send disabled and nothing is published (FR-006)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    expect(el.querySelector<HTMLButtonElement>('[data-testid="compose-key-send"]')?.disabled).toBe(
      true,
    );
    press(el, 'compose-key-space');
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('[data-testid="compose-key-send"]')?.disabled).toBe(
      true,
    );
    press(el, 'compose-key-send');
    fixture.detectChanges();
    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------- F-053 ------

  // F-053 FR-003: the field is sized to `min(contentHeight, 136.8px)`. Chrome
  // rounds scrollHeight up (46px vs the 45.6px token), so heights are compared
  // against the measured one-line value, never exact fractional strings.
  it('starts at one line and grows with the typed content (FR-001, FR-003)', () => {
    const el = render();
    const field = el.querySelector<HTMLTextAreaElement>('[data-testid="compose-input"]')!;

    fixture.detectChanges();
    const oneLine = parseFloat(field.style.height);
    expect(oneLine).toBeGreaterThan(0);
    expect(field.style.overflowY).toBe('hidden');

    type(el, 'one\ntwo');
    fixture.detectChanges();
    expect(parseFloat(field.style.height)).toBeGreaterThan(oneLine);
  });

  it('caps the field at three lines, then scrolls inside it (FR-001)', () => {
    const el = render();
    const field = el.querySelector<HTMLTextAreaElement>('[data-testid="compose-input"]')!;

    type(el, ['one', 'two', 'three'].join('\n'));
    fixture.detectChanges();
    expect(field.style.height).toBe('136.8px');
    expect(field.style.overflowY).toBe('hidden');

    type(el, ['one', 'two', 'three', 'four'].join('\n'));
    fixture.detectChanges();
    expect(field.style.height).toBe('136.8px');
    expect(field.style.overflowY).toBe('auto');

    type(el, ['one', 'two', 'three', 'four', 'five', 'six'].join('\n'));
    fixture.detectChanges();
    expect(field.scrollHeight).toBeGreaterThan(field.clientHeight);
  });

  it('clearing the field returns it to one line (FR-001)', () => {
    const el = render();
    const field = el.querySelector<HTMLTextAreaElement>('[data-testid="compose-input"]')!;

    fixture.detectChanges();
    const oneLine = parseFloat(field.style.height);

    type(el, 'a\nb\nc');
    fixture.detectChanges();
    expect(parseFloat(field.style.height)).toBeGreaterThan(oneLine);

    type(el, '');
    fixture.detectChanges();
    expect(parseFloat(field.style.height)).toBe(oneLine);
  });

  it('the on-screen keys grow the field too, since they share the value (FR-003)', () => {
    const el = render();
    const field = el.querySelector<HTMLTextAreaElement>('[data-testid="compose-input"]')!;

    for (let i = 0; i < 30; i++) {
      press(el, 'compose-key-a');
    }
    fixture.detectChanges();

    expect(parseFloat(field.style.height)).toBeGreaterThan(45.6);
  });

  it('newlines typed in the field are preserved through publish (FR-002, FR-004)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    type(el, 'first line\nsecond line');
    fixture.detectChanges();
    press(el, 'compose-key-send');
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()?.text).toBe('first line\nsecond line');
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('the on-screen backspace removes a trailing line break (FR-003)', () => {
    const el = render();
    const field = el.querySelector<HTMLTextAreaElement>('[data-testid="compose-input"]')!;

    type(el, 'ab\n');
    fixture.detectChanges();
    press(el, 'compose-key-backspace');
    fixture.detectChanges();

    expect(field.value).toBe('ab');
  });

  // ---------------------------------------------------------------- F-050 ------

  describe('photo mode', () => {
    /** F-050: a real PNG from a canvas, so the downscale path is genuinely exercised. */
    function imageFile(width = 40, height = 30, name = 'photo.png'): File {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#ff8a8c';
      context.fillRect(0, 0, width, height);
      const binary = atob(canvas.toDataURL('image/png').split(',')[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new File([bytes], name, { type: 'image/png' });
    }

    function chooseFile(el: HTMLElement, file: File): void {
      const input = el.querySelector<HTMLInputElement>('[data-testid="compose-file"]')!;
      input.files = (() => {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        return transfer.files;
      })();
      input.dispatchEvent(new Event('change'));
    }

    function decodeDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('preview data URL did not decode'));
        image.src = dataUrl;
      });
    }

    /**
     * F-050: an `Image` load is not a task zone.js tracks, so `whenStable()` returns
     * before the decode lands, and clock-based polling is slow and flaky. Instead the
     * fixture runs with `autoDetectChanges`, so the DOM mutates on the zone turn the
     * decode finishes in, and this waits on DOM mutations alone — settling the moment
     * the `decoding` indicator is rendered away. The timeout guard exists only to
     * fail loudly if the pipeline ever breaks.
     */
    async function chooseAndSettle(el: HTMLElement, file: File): Promise<void> {
      chooseFile(el, file);
      await waitForDecodingToClear(el);
    }

    function waitForDecodingToClear(el: HTMLElement, timeoutMs = 5000): Promise<void> {
      return new Promise((resolve, reject) => {
        const container = el.querySelector('[data-testid="compose-photo"]') ?? el;
        const timer = window.setTimeout(() => {
          observer.disconnect();
          reject(new Error('the photo never finished decoding'));
        }, timeoutMs);
        const settled = (): boolean =>
          el.querySelector('[data-testid="compose-photo-decoding"]') === null;
        if (settled()) {
          window.clearTimeout(timer);
          resolve();
          return;
        }
        const observer = new MutationObserver(() => {
          if (settled()) {
            observer.disconnect();
            window.clearTimeout(timer);
            resolve();
          }
        });
        observer.observe(container, { childList: true, subtree: true, attributes: true });
      });
    }

    it('opens in photo mode from ?kind=photo (FR-001)', () => {
      const el = renderIn('photo');

      expect(el.querySelector('[data-testid="compose-file"]')).not.toBeNull();
      expect(el.querySelector('[data-testid="compose-input"]')).toBeNull();
    });

    it('treats any other kind as text mode, so an unknown param is not an empty screen (FR-001)', () => {
      expect(renderIn('nonsense').querySelector('[data-testid="compose-input"]')).not.toBeNull();
      expect(renderIn(null).querySelector('[data-testid="compose-input"]')).not.toBeNull();
    });

    it('renders a labelled file input accepting images (FR-002)', () => {
      const el = renderIn('photo');
      const input = el.querySelector<HTMLInputElement>('[data-testid="compose-file"]')!;

      expect(input.getAttribute('type')).toBe('file');
      expect(input.getAttribute('accept')).toBe('image/*');
      const label = el.querySelector<HTMLLabelElement>('label[for="compose-file"]');
      expect(label?.textContent?.trim().length).toBeGreaterThan(0);
      expect(input.getAttribute('aria-label') ?? label?.textContent?.trim()).toBeTruthy();
    });

    it('omits the keyboard graphic in photo mode, and keeps it in text mode (FR-003)', () => {
      expect(renderIn('photo').querySelector('[data-testid="compose-keyboard"]')).toBeNull();
      expect(renderIn(null).querySelector('[data-testid="compose-keyboard"]')).not.toBeNull();
    });

    it('Send is disabled until an image is chosen, and enabled once decoded (FR-002)', async () => {
      const el = renderIn('photo');
      const send = () => el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]')!;

      expect(send().disabled).toBe(true);

      await chooseAndSettle(el, imageFile());

      expect(send().disabled).toBe(false);
    });

    it('shows a preview of the chosen photo and publishes it (FR-002, FR-004, FR-005)', async () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const el = renderIn('photo');

      await chooseAndSettle(el, imageFile());

      const preview = el.querySelector<HTMLImageElement>('[data-testid="compose-photo-preview"]')!;
      expect(preview.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/);

      (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      const status = TestBed.inject(StatusStore).myStatus();
      expect(status?.photo?.dataUrl).toMatch(/^data:image\/jpeg;base64,/);
      expect(status?.text).toBe('');
      expect(router.navigate).toHaveBeenCalledWith(['/status']);
    });

    it('a file that is not an image leaves Send disabled and publishes nothing (FR-004)', async () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const el = renderIn('photo');

      await chooseAndSettle(el, new File([new Uint8Array([1, 2, 3])], 'notes.txt', { type: 'text/plain' }));

      expect(el.querySelector('[data-testid="compose-photo-preview"]')).toBeNull();
      expect(el.querySelector<HTMLButtonElement>('[data-testid="compose-send"]')?.disabled).toBe(true);
      expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('picks a second file in place of the first rather than stacking (FR-005)', async () => {
      const el = renderIn('photo');

      await chooseAndSettle(el, imageFile(40, 30, 'first.png'));
      const first = el
        .querySelector<HTMLImageElement>('[data-testid="compose-photo-preview"]')!
        .getAttribute('src');

      await chooseAndSettle(el, imageFile(64, 48, 'second.png'));
      const second = el
        .querySelector<HTMLImageElement>('[data-testid="compose-photo-preview"]')!
        .getAttribute('src');

      // FR-005 is replacement, so the second photo must read as a different image: the
      // decoded source of `second` is the 64x48 PNG, and only one preview exists.
      const secondDimensions = await decodeDimensions(second!);
      expect(secondDimensions).toEqual({ width: 64, height: 48 });
      expect(second).not.toBe(first);
      expect(el.querySelectorAll('[data-testid="compose-photo-preview"]').length).toBe(1);
    });

    it('uses the injected Clock for the photo (FR-010)', async () => {
      const el = renderIn('photo');
      spyOn(TestBed.inject(Clock), 'now').and.returnValue(1_700_000_000_000);

      await chooseAndSettle(el, imageFile());
      (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(TestBed.inject(StatusStore).myStatus()?.createdAtMs).toBe(1_700_000_000_000);
    });

    it('Close returns to /status without publishing (FR-011)', async () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);
      const el = renderIn('photo');

      await chooseAndSettle(el, imageFile());
      (el.querySelector('[data-testid="compose-close"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/status']);
      expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
    });

    it('keeps the same surface and Close/Send glyphs as text mode (FR-001, FR-011)', () => {
      const photo = renderIn('photo');
      const surface = photo.querySelector<HTMLElement>('[data-testid="compose-page"]')!;
      expect(getComputedStyle(surface).backgroundColor).toBe('rgb(255, 138, 140)');
      expect(photo.querySelector('[data-testid="compose-close"]')).not.toBeNull();
      expect(photo.querySelector('[data-testid="compose-send"]')).not.toBeNull();
    });
  });
});
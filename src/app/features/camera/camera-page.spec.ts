import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CameraPage } from './camera-page';
import { StatusStore } from '../../core/status.store';
import { Clock } from '../../core/clock';

describe('CameraPage', () => {
  let fixture: ComponentFixture<CameraPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CameraPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(CameraPage);
    fixture.autoDetectChanges();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  // ------------------------------------------------------- F-012 (unchanged) -----

  it('renders the dark viewport with the Camera tab active', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-page"]')).not.toBeNull();
    const active = el.querySelector('[role="tab"][aria-selected="true"]');
    expect(active?.textContent?.trim()).toBe('Camera');
  });

  it('renders labelled Close, Shutter and Flip controls', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-close"]')?.getAttribute('aria-label')).toBe(
      'Close camera',
    );
    expect(el.querySelector('[data-testid="camera-shutter"]')?.getAttribute('aria-label')).toBe(
      'Take photo',
    );
    expect(el.querySelector('[data-testid="camera-flip"]')?.getAttribute('aria-label')).toBe(
      'Switch camera',
    );
  });

  it('navigates to /chats from Close', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="camera-close"]') as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
  });

  it('routes Chats, Calls and Status tabs away', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const tab = (name: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
        (b) => b.textContent?.trim()?.startsWith(name),
      );
    tab('Chats')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
    tab('Calls')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/calls']);
    tab('Status')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('navigates to /settings when the Settings tab is activated (feature 013)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const settingsTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Settings'),
    );
    settingsTab?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  // --------------------------------------------------------------- F-056 ---------

  /** F-056: a real PNG from a canvas so the downscale path is genuinely exercised. */
  function imageFile(width = 40, height = 30, name = 'photo.png'): File {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#2c2c2e';
    context.fillRect(0, 0, width, height);
    const binary = atob(canvas.toDataURL('image/png').split(',')[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], name, { type: 'image/png' });
  }

  function chooseFile(el: HTMLElement, file: File): void {
    const input = el.querySelector<HTMLInputElement>('[data-testid="camera-file"]')!;
    input.files = (() => {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      return transfer.files;
    })();
    input.dispatchEvent(new Event('change'));
  }

  function waitForTest(el: HTMLElement, condition: (el: HTMLElement) => boolean, what: string) {
    return new Promise<void>((resolve, reject) => {
      let observer: MutationObserver | undefined;
      const timer = window.setTimeout(() => {
        observer?.disconnect();
        reject(new Error(`timed out waiting for ${what}`));
      }, 5000);
      const finish = (): void => {
        window.clearTimeout(timer);
        observer?.disconnect();
        resolve();
      };
      if (condition(el)) {
        finish();
        return;
      }
      observer = new MutationObserver(() => {
        if (condition(el)) {
          finish();
        }
      });
      observer.observe(el, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    });
  }

  const status = (el: HTMLElement): string =>
    el.querySelector('[data-testid="camera-status"]')?.textContent?.trim() ?? '';

  async function chooseAndSettleCapture(el: HTMLElement, file: File): Promise<void> {
    chooseFile(el, file);
    await waitForTest(el, (root) => root.querySelector('[data-testid="camera-preview"]') !== null, 'capture preview');
  }

  async function chooseAndSettleStatus(el: HTMLElement, file: File, text: string): Promise<void> {
    chooseFile(el, file);
    await waitForTest(el, (root) => status(root) === text, `status "${text}"`);
  }

  it('renders the informative chrome: Flash, Close, gallery, shutter and flip (FR-001)', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-flash"]')?.getAttribute('aria-label')).toBe(
      'Flash',
    );
    expect(el.querySelector('[data-testid="camera-close"]')?.getAttribute('aria-label')).toBe(
      'Close camera',
    );
    expect(el.querySelector('[data-testid="camera-gallery"]')?.getAttribute('aria-label')).toBe(
      'Choose from gallery',
    );
    expect(el.querySelector('[data-testid="camera-shutter"]')?.getAttribute('aria-label')).toBe(
      'Take photo',
    );
    expect(el.querySelector('[data-testid="camera-flip"]')?.getAttribute('aria-label')).toBe(
      'Switch camera',
    );
  });

  it('shows the HD chip in viewfinder state only (FR-001)', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-quality"]')?.textContent?.trim()).toBe('HD');
  });

  it('renders the provisional viewfinder fill, grid and honest hint in idle state (FR-002)', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-filler"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="camera-grid"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="camera-hint"]')?.textContent).toContain(
      'choose a photo',
    );
    expect(el.querySelector('[data-testid="camera-preview"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-send"]')).toBeNull();
    expect(status(el)).toBe('');
  });

  it('opens the file picker from shutter, the viewfinder and the gallery (FR-003)', () => {
    const el = render();
    const input = el.querySelector<HTMLInputElement>('[data-testid="camera-file"]')!;

    expect(input.getAttribute('type')).toBe('file');
    expect(input.getAttribute('accept')).toBe('image/*');

    spyOn(input, 'click').and.callThrough();
    (el.querySelector('[data-testid="camera-shutter"]') as HTMLButtonElement).click();
    expect(input.click).toHaveBeenCalledTimes(1);

    (el.querySelector('[data-testid="camera-viewfinder"]') as HTMLButtonElement).click();
    expect(input.click).toHaveBeenCalledTimes(2);

    (el.querySelector('[data-testid="camera-gallery"]') as HTMLButtonElement).click();
    expect(input.click).toHaveBeenCalledTimes(3);
  });

  it('keeps the shutter labelled Take photo until a photo is captured (FR-003)', () => {
    const el = render();
    expect(
      el.querySelector('[data-testid="camera-shutter"]')?.getAttribute('aria-label'),
    ).toBe('Take photo');
  });

  it('announces Preparing photo, then Photo ready on a successful decode (FR-003, FR-004)', async () => {
    const el = render();
    const seen = new Set<string>();
    const region = el.querySelector('[data-testid="camera-status"]')!;
    const observer = new MutationObserver(() => seen.add(status(el)));
    observer.observe(region, { childList: true, subtree: true, characterData: true });

    await chooseAndSettleCapture(el, imageFile());
    observer.disconnect();

    expect(seen.has('Preparing photo…')).toBe(true);
    expect(status(el)).toBe('Photo ready');
  });

  it('enters capture state: preview image with honest alt, shutter becomes Retake, Send appears (FR-004)', async () => {
    const el = render();

    await chooseAndSettleCapture(el, imageFile());

    const preview = el.querySelector<HTMLImageElement>('[data-testid="camera-preview"]')!;
    expect(preview.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/);
    expect(preview.getAttribute('alt')).toBe('Captured photo — to be sent to your status');
    expect(el.querySelector('[data-testid="camera-shutter"]')?.getAttribute('aria-label')).toBe(
      'Retake',
    );
    expect(el.querySelector('[data-testid="camera-send"]')?.getAttribute('aria-label')).toBe(
      'Send to status',
    );
    expect(el.querySelector<HTMLButtonElement>('[data-testid="camera-send"]')?.disabled).toBe(false);
    expect(el.querySelector('[data-testid="camera-flip"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-filler"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-grid"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-hint"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-quality"]')).toBeNull();
  });

  it('a non-image stays in viewfinder, announces the failure and publishes nothing (FR-004)', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    const el = render();
    await chooseAndSettleStatus(
      el,
      new File([new Uint8Array([1, 2, 3])], 'notes.txt', { type: 'text/plain' }),
      'Could not read that image',
    );

    expect(el.querySelector('[data-testid="camera-preview"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-send"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-hint"]')).not.toBeNull();
    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('Send publishes the photo as the status and navigates to /status (FR-005)', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    await chooseAndSettleCapture(el, imageFile());
    (el.querySelector('[data-testid="camera-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const posted = TestBed.inject(StatusStore).myStatus();
    expect(posted?.photo?.dataUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect(posted?.text).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('uses the injected Clock, not the wall clock, for the publish (FR-005, FR-010)', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    spyOn(TestBed.inject(Clock), 'now').and.returnValue(1_700_000_000_000);

    await chooseAndSettleCapture(el, imageFile());
    (el.querySelector('[data-testid="camera-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(TestBed.inject(StatusStore).myStatus()?.createdAtMs).toBe(1_700_000_000_000);
  });

  it('announces and keeps the photo when the store refuses to save it (FR-005)', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    await chooseAndSettleCapture(el, imageFile());
    const store = TestBed.inject(StatusStore);
    spyOn(store, 'publishPhoto').and.returnValue(null);

    (el.querySelector('[data-testid="camera-send"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(status(el)).toBe('This photo is too large to save');
    expect(el.querySelector('[data-testid="camera-preview"]')).not.toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(store.myStatus()).toBeNull();
  });

  it('Retake discards the capture and the old photo becomes the gallery thumbnail (FR-006)', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    await chooseAndSettleCapture(el, imageFile(40, 30, 'one.png'));
    const capturedSrc = el
      .querySelector<HTMLImageElement>('[data-testid="camera-preview"]')!
      .getAttribute('src');

    (el.querySelector('[data-testid="camera-shutter"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="camera-preview"]')).toBeNull();
    expect(el.querySelector('[data-testid="camera-hint"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="camera-send"]')).toBeNull();
    expect(el.querySelector<HTMLImageElement>('[data-testid="camera-gallery"] img')?.getAttribute('src')).toBe(capturedSrc);
    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('Flash and Flip are aria-pressed toggles, and Flip is absent in capture state (FR-007)', async () => {
    const el = render();
    const flash = () => el.querySelector<HTMLButtonElement>('[data-testid="camera-flash"]')!;
    const flip = () => el.querySelector<HTMLButtonElement>('[data-testid="camera-flip"]')!;

    expect(flash().getAttribute('aria-pressed')).toBe('false');
    expect(flip().getAttribute('aria-pressed')).toBe('false');
    flash().click();
    flip().click();
    fixture.detectChanges();
    expect(flash().getAttribute('aria-pressed')).toBe('true');
    expect(flip().getAttribute('aria-pressed')).toBe('true');

    await chooseAndSettleCapture(el, imageFile());
    expect(el.querySelector('[data-testid="camera-flip"]')).toBeNull();
  });

  it('Close returns to /chats from capture state without publishing (FR-008)', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();

    await chooseAndSettleCapture(el, imageFile());
    (el.querySelector('[data-testid="camera-close"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
    expect(TestBed.inject(StatusStore).myStatus()).toBeNull();
  });

  it('picking a second file replaces the first capture rather than stacking (FR-004)', async () => {
    const el = render();

    await chooseAndSettleCapture(el, imageFile(40, 30, 'first.png'));
    await chooseAndSettleCapture(el, imageFile(64, 48, 'second.png'));

    expect(el.querySelectorAll('[data-testid="camera-preview"]').length).toBe(1);
    const preview = el.querySelector<HTMLImageElement>('[data-testid="camera-preview"]')!;
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('preview data URL did not decode'));
      image.src = preview.getAttribute('src') ?? '';
    });
    expect(dims).toEqual({ width: 64, height: 48 });
  });
});
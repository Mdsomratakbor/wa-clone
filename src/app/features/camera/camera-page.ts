import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { TabItem, TabKey } from '../chat-list/chat.model';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { StatusStore } from '../../core/status.store';
import { Clock } from '../../core/clock';
import { downscaleToJpegDataUrl } from '../../core/status-photo';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

/**
 * F-056 FR-004. Provisional copy announced by the live region; recorded verbatim in
 * spec 056 §PROVISIONAL inventory for the post-re-auth reconcile.
 */
const STATUS_PREPARING = 'Preparing photo…';
const STATUS_READY = 'Photo ready';
const STATUS_NOT_IMAGE = 'Could not read that image';
const STATUS_REFUSED = 'This photo is too large to save';

/**
 * F-056 FR-002. The viewfinder hint is deliberately literal: this capture is a device
 * picker, not a live feed, and the copy must never imply a preview that does not exist.
 */
const HINT_VIEWFINDER = 'Tap viewfinder to choose a photo';

/**
 * F-056 FR-004. The alt text is deliberately a statement about the document, not an
 * invented description of image content (F-050 alt precedent).
 */
const ALT_CAPTURED = 'Captured photo — to be sent to your status';

@Component({
  selector: 'app-camera-page',
  imports: [TabBar],
  templateUrl: './camera-page.html',
  styleUrl: './camera-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraPage {
  private readonly router = inject(Router);
  private readonly store = inject(StatusStore);
  private readonly clock = inject(Clock);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('cameraFile');

  protected readonly activeTab = signal<TabKey>('camera');

  /** F-056 FR-004: the downscaled JPEG the user is about to send, or null in viewfinder. */
  protected readonly photo = signal<string | null>(null);

  /** F-056 FR-003: decode is a real async step (read → decode → draw → encode). */
  protected readonly decoding = signal(false);

  /**
   * F-056 FR-004/FR-005: transient failure/refusal copy shown in the hint slot. It is
   * cleared on the next pick, so the viewfinder never sits in a stale error state.
   */
  protected readonly message = signal<string | null>(null);

  /** F-056 FR-007 (PROVISIONAL): state toggles; live effects are a Non-Goal. */
  protected readonly flash = signal(false);
  protected readonly flipped = signal(false);

  /**
   * F-056 FR-006: the photo discarded by Retake becomes the gallery thumbnail for the
   * session. Never persisted - a "gallery" implies a feed we do not have.
   */
  protected readonly lastPhoto = signal<string | null>(null);

  /** The screen is in capture state once a photographed image is ready to send. */
  protected readonly captured = computed(() => this.photo() !== null && !this.decoding());

  protected readonly previewAlt = ALT_CAPTURED;

  /** F-056 FR-003: exposed for the template's disqualifying hint on the viewport. */
  protected readonly hint = HINT_VIEWFINDER;

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  /**
   * F-056 FR-003: one text slot for the live region so the DOM never renders stale
   * copy. `null` renders an empty region, which still creates a live region for the
   * "skip to end" pattern without announcing anything in the viewfinder idle state.
   */
  protected readonly statusText = computed<string | null>(() => {
    if (this.decoding()) {
      return STATUS_PREPARING;
    }
    if (this.message()) {
      return this.message();
    }
    if (this.captured()) {
      return STATUS_READY;
    }
    return null;
  });

  protected onTabSelect(key: TabKey): void {
    if (key === 'chats') {
      void this.router.navigate(['/chats']);
      return;
    }
    if (key === 'calls') {
      void this.router.navigate(['/calls']);
      return;
    }
    if (key === 'status') {
      void this.router.navigate(['/status']);
      return;
    }
    if (key === 'settings') {
      void this.router.navigate(['/settings']);
      return;
    }
    // F-012/F-056: camera tab is the active screen.
  }

  protected onClose(): void {
    void this.router.navigate(['/chats']);
  }

  /**
   * F-056 FR-003/FR-006. Viewfinder: open the device picker. Capture state: retake —
   * the current photo is discarded and becomes the gallery thumbnail for the session.
   */
  protected onShutter(): void {
    if (this.captured()) {
      this.retake();
      return;
    }
    this.openPicker();
  }

  /** F-056 FR-003: the viewport is itself the primary capture surface. */
  protected onViewfinder(): void {
    this.openPicker();
  }

  /** F-056 FR-003/FR-006: the gallery entry opens the same picker. */
  protected onGallery(): void {
    this.openPicker();
  }

  protected onFlash(): void {
    this.flash.update((value) => !value);
  }

  /** F-056 FR-007: rendered in viewfinder state only; live lens switching is a Non-Goal. */
  protected onFlip(): void {
    this.flipped.update((value) => !value);
  }

  private openPicker(): void {
    if (this.decoding()) {
      return;
    }
    this.fileInput()?.nativeElement.click();
  }

  /**
   * F-056 FR-004. A file that will not decode stays in viewfinder, announces the
   * refusal and is never published (F-050 FR-004 contract, same failure path).
   */
  protected onFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file === null || file === undefined) {
      return;
    }
    // Re-choosing the exact same file must re-trigger `change`, so the input value is
    // cleared once the file has been read.
    input.value = '';
    this.message.set(null);
    this.decoding.set(true);
    void downscaleToJpegDataUrl(file).then((dataUrl) => {
      this.decoding.set(false);
      if (dataUrl === null) {
        this.message.set(STATUS_NOT_IMAGE);
      } else {
        this.photo.set(dataUrl);
      }
    });
  }

  /**
   * F-056 FR-005. The store refuses what it cannot persist and returns null (F-050
   * FR-007); the camera keeps the photo and announces the refusal rather than
   * swallowing it or navigating away.
   */
  protected onSend(): void {
    const photo = this.photo();
    if (photo === null) {
      return;
    }
    const entry = this.store.publishPhoto(photo, this.clock.now());
    if (entry === null) {
      this.message.set(STATUS_REFUSED);
      return;
    }
    void this.router.navigate(['/status']);
  }

  private retake(): void {
    const current = this.photo();
    if (current !== null) {
      this.lastPhoto.set(current);
    }
    this.photo.set(null);
    this.message.set(null);
  }
}
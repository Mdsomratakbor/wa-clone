import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  output,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { PrefsStore } from '../../../core/prefs.store';
import { FileInfo } from '../../../features/chat-window/chat-window.model';
import { downscaleToJpegDataUrl } from '../../../core/status-photo';
import { formatFileSize, splitFileName } from '../../../core/chat.store';
import { Action } from '../action-sheet/action-sheet.model';
import { ActionSheet } from '../action-sheet/action-sheet';

export interface AttachmentDraft {
  text: string;
  file: FileInfo;
}

@Component({
  selector: 'app-composer',
  imports: [ActionSheet],
  templateUrl: './composer.html',
  styleUrl: './composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Composer {
  readonly send = output<string>();
  readonly sendAttachment = output<AttachmentDraft>();

  private readonly prefs = inject(PrefsStore);
  private readonly router = inject(Router);

  protected readonly draft = signal('');
  protected readonly attachOpen = signal(false);
  protected readonly pendingFile = signal<FileInfo | null>(null);
  protected readonly decoding = signal(false);

  /**
   * F-058 FR-002. The decoder is a field, not a direct module call, for the same
   * reason the stores inject a Clock: an `Image` load is a macrotask zone.js does
   * not track, so a module-binding spy does not survive the build, and the seek is
   * the deterministic seam the unit tests replace with a resolved or null-resolving
   * fake. The real decode path is exercised end-to-end in `status-photo.spec.ts`.
   */
  decodePhoto: (file: File, maxEdge?: number, quality?: number) => Promise<string | null> =
    downscaleToJpegDataUrl;

  /**
   * F-058 FR-001. The sheet offers exactly the two kinds this feature can actually
   * send. `Camera` is deliberately absent: the F-056 screen cannot return a capture
   * to this composer, so a Camera row would be a dead end with no way back to the
   * pending state (the same F-046 honesty rule that disabled the button originally).
   */
  protected readonly attachActions: readonly Action[] = [
    { id: 'attach-photo', label: 'Photos & Videos' },
    { id: 'attach-document', label: 'Document' },
  ];

  private readonly photoInput = viewChild<ElementRef<HTMLInputElement>>('photoInput');
  private readonly docInput = viewChild<ElementRef<HTMLInputElement>>('docInput');

  protected readonly canSend = computed(
    () => this.draft().trim().length > 0 || this.pendingFile() !== null,
  );

  protected readonly pendingName = computed(() => {
    const file = this.pendingFile();
    if (file === null) {
      return '';
    }
    return file.ext ? `${file.filename}.${file.ext}` : file.filename;
  });

  protected onInput(value: string): void {
    this.draft.set(value);
  }

  protected onEnter(): void {
    // F-027: "Enter key sends" toggle gates the Enter handler.
    if (!this.prefs.prefs().enterKeySends) {
      return;
    }
    this.onSend();
  }

  protected onAddAttachment(): void {
    this.attachOpen.set(true);
  }

  protected onDismissSheet(): void {
    this.attachOpen.set(false);
  }

  protected onSheetAction(id: string): void {
    this.attachOpen.set(false);
    if (id === 'attach-photo') {
      this.photoInput()?.nativeElement.click();
      return;
    }
    if (id === 'attach-document') {
      this.docInput()?.nativeElement.click();
    }
  }

  /**
   * F-058 FR-002. Decoding is a real async step and the value is reset after read so
   * selecting the same file again re-fires the change event. A file that will not
   * decode resolves `null` here (the helper never rejects), leaving the pending
   * state empty - a broken pick cannot leave a broken preview behind.
   */
  protected onPhotoChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    input.value = '';
    if (file === null || file === undefined) {
      return;
    }
    this.decoding.set(true);
    void this.decodePhoto(file).then((dataUrl) => {
      this.decoding.set(false);
      if (dataUrl === null) {
        return;
      }
      const { filename } = splitFileName(file.name);
      this.pendingFile.set({
        filename,
        ext: 'jpg',
        size: formatFileSize(file.size),
        dataUrl,
      });
    });
  }

  /**
   * F-058 FR-003. Metadata only: the card is a reference, never a byte copy, so an
   * arbitrary document can never blow past the localStorage budget.
   */
  protected onDocumentChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    input.value = '';
    if (file === null || file === undefined) {
      return;
    }
    const { filename, ext } = splitFileName(file.name);
    this.pendingFile.set({ filename, ext, size: formatFileSize(file.size) });
  }

  protected onRemovePending(): void {
    // F-058 FR-004: removing the attachment must leave the draft untouched.
    this.pendingFile.set(null);
    this.decoding.set(false);
  }

  protected onSend(): void {
    const pending = this.pendingFile();
    if (pending !== null) {
      // F-058 FR-004/FR-005: the draft rides along as the caption and both clear on
      // Send. A file-only message (empty caption) is valid.
      this.sendAttachment.emit({ text: this.draft().trim(), file: pending });
      this.pendingFile.set(null);
      this.draft.set('');
      return;
    }
    const body = this.draft().trim();
    if (!body) {
      return;
    }
    this.send.emit(body);
    this.draft.set('');
  }

  // F-046 FR-004: the camera screen already exists and is reachable from the tab
  // bar, so this is real navigation rather than a stub. Capturing a photo and
  // sending it back to the composer is the attachment pipeline's work, which
  // this feature does not build.
  protected onCamera(): void {
    void this.router.navigate(['/camera']);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.attachOpen()) {
      this.onDismissSheet();
    }
  }
}
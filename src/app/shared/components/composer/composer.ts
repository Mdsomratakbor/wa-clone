import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PrefsStore } from '../../../core/prefs.store';

@Component({
  selector: 'app-composer',
  templateUrl: './composer.html',
  styleUrl: './composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Composer {
  readonly send = output<string>();

  private readonly prefs = inject(PrefsStore);
  private readonly router = inject(Router);

  protected readonly draft = signal('');

  protected readonly canSend = computed(() => this.draft().trim().length > 0);

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

  protected onSend(): void {
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
}
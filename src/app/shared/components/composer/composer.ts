import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
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
}
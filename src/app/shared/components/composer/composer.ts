import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

@Component({
  selector: 'app-composer',
  templateUrl: './composer.html',
  styleUrl: './composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Composer {
  readonly send = output<string>();

  protected readonly draft = signal('');

  protected readonly canSend = computed(() => this.draft().trim().length > 0);

  protected onInput(value: string): void {
    this.draft.set(value);
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
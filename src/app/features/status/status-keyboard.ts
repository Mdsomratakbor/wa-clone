import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/**
 * F-051: the compose screen's on-screen keyboard, replacing the static band graphic
 * (F-051 FR-001). The page owns the `value`; this component only emits characters and
 * intentions, so the real input and the on-screen keys stay a single source (FR-007)
 * and the keyboard never touches persistent state, the store or the clock (FR-009).
 * No `123` / globe / emoji keys exist: they would be inert controls (FR-001).
 */
@Component({
  selector: 'app-status-keyboard',
  templateUrl: './status-keyboard.html',
  styleUrl: './status-keyboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusKeyboard {
  readonly value = input('');

  readonly type = output<string>();
  readonly backspace = output<void>();
  readonly send = output<void>();

  protected readonly shiftOn = signal(false);

  protected readonly rowOne = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  protected readonly rowTwo = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  protected readonly rowThree = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  protected readonly canDelete = computed(() => this.value().length > 0);
  protected readonly canSend = computed(() => this.value().trim().length > 0);

  protected label(letter: string): string {
    return this.shiftOn() ? letter.toUpperCase() : letter;
  }

  /**
   * F-051 FR-002: one-shot shift. The letter is emitted in the current case and shift
   * resets, so the next letter is lowercase again — like an OS keyboard.
   */
  protected tap(letter: string): void {
    this.type.emit(labelOf(letter, this.shiftOn()));
    if (this.shiftOn()) {
      this.shiftOn.set(false);
    }
  }

  protected toggleShift(): void {
    this.shiftOn.update((on) => !on);
  }

  protected delete(): void {
    if (!this.canDelete()) {
      return;
    }
    this.backspace.emit();
  }

  protected space(): void {
    this.type.emit(' ');
  }

  protected sendKey(): void {
    this.send.emit();
  }
}

function labelOf(letter: string, shift: boolean): string {
  return shift ? letter.toUpperCase() : letter;
}
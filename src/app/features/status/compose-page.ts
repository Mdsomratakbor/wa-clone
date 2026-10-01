import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StatusStore } from '../../core/status.store';
import { Clock } from '../../core/clock';

@Component({
  selector: 'app-compose-page',
  imports: [],
  templateUrl: './compose-page.html',
  styleUrl: './compose-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposePage {
  private readonly router = inject(Router);
  private readonly store = inject(StatusStore);
  private readonly clock = inject(Clock);

  protected readonly value = signal('');

  protected readonly canSend = computed(() => this.value().trim().length > 0);

  protected onValue(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onClose(): void {
    void this.router.navigate(['/status']);
  }

  protected onSend(): void {
    // F-049: publish refuses blank text and returns null, so the guard is the
    // store's contract rather than a second copy of the same check.
    const entry = this.store.publish(this.value(), this.clock.now());
    if (entry === null) {
      return;
    }
    void this.router.navigate(['/status']);
  }
}

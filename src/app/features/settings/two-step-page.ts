import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { AccountStore } from '../../core/account.store';

const PIN_PATTERN = /^\d{6}$/;

@Component({
  selector: 'app-two-step-page',
  imports: [NavigationBar],
  templateUrl: './two-step-page.html',
  styleUrl: './two-step-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoStepPage {
  private readonly router = inject(Router);
  private readonly store = inject(AccountStore);

  protected readonly account = this.store.account;

  protected readonly pin = signal('');
  protected readonly pinConfirm = signal('');
  protected readonly email = signal('');
  protected readonly removePin = signal('');
  protected readonly editing = signal(false);
  protected readonly removing = signal(false);
  protected readonly announcement = signal('');

  protected readonly enabled = computed(() => this.account().twoStep !== null);

  protected readonly setDisabled = computed(() => {
    const value = this.pin();
    return (
      !PIN_PATTERN.test(value) ||
      this.pinConfirm() !== value ||
      !this.email().includes('@')
    );
  });

  protected readonly emailDisplay = computed(() => this.account().twoStep?.email ?? '');

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings/account']);
    }
  }

  protected onSet(): void {
    if (this.setDisabled()) {
      return;
    }
    this.store.setTwoStep(this.pin(), this.email());
    this.pin.set('');
    this.pinConfirm.set('');
    this.email.set('');
    this.editing.set(false);
    this.removing.set(false);
    this.announcement.set('Two-step verification is enabled');
  }

  protected onBeginChange(): void {
    this.editing.set(true);
    this.removing.set(false);
  }

  protected onCancelChange(): void {
    this.editing.set(false);
  }

  protected onBeginRemove(): void {
    this.removing.set(true);
    this.editing.set(false);
  }

  protected onRemove(): void {
    const removed = this.store.removeTwoStep(this.removePin());
    this.removePin.set('');
    this.removing.set(false);
    this.announcement.set(
      removed
        ? 'Two-step verification is disabled'
        : 'Incorrect PIN. Two-step verification was not removed.',
    );
  }
}
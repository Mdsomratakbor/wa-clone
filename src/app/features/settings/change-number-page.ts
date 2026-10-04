import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { AccountStore } from '../../core/account.store';

// PROVISIONAL local-shape guard, recorded in spec 057 research §4; every change
// goes through this and the store decides truth.
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,}$/;

@Component({
  selector: 'app-change-number-page',
  imports: [NavigationBar],
  templateUrl: './change-number-page.html',
  styleUrl: './change-number-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeNumberPage {
  private readonly router = inject(Router);
  private readonly store = inject(AccountStore);

  protected readonly current = signal(this.store.account().deviceNumber);
  protected readonly next = signal('');
  protected readonly announcement = signal('');

  protected readonly valid = computed(() => {
    const current = this.current().trim();
    const next = this.next().trim();
    return (
      PHONE_PATTERN.test(current) &&
      PHONE_PATTERN.test(next) &&
      next !== current
    );
  });

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings/account']);
    }
  }

  protected onSave(): void {
    if (!this.valid()) {
      return;
    }
    const next = this.next().trim();
    this.store.setDeviceNumber(next);
    this.current.set(next);
    this.next.set('');
    this.announcement.set('Your number has been changed');
  }
}
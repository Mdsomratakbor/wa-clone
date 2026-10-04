import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { Toggle } from '../../shared/components/toggle/toggle';
import { AccountStore } from '../../core/account.store';

@Component({
  selector: 'app-security-page',
  imports: [NavigationBar, Toggle],
  templateUrl: './security-page.html',
  styleUrl: './security-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityPage {
  private readonly router = inject(Router);
  private readonly store = inject(AccountStore);

  protected readonly account = this.store.account;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings/account']);
    }
  }

  protected onTwoStep(): void {
    void this.router.navigate(['/settings/account/two-step']);
  }
}
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { ACCOUNT_ROWS, SettingsRowSeed } from './settings.seed';

@Component({
  selector: 'app-account-page',
  imports: [NavigationBar],
  templateUrl: './account-page.html',
  styleUrl: './account-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly router = inject(Router);

  protected readonly rows: readonly SettingsRowSeed[] = ACCOUNT_ROWS;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(_row: SettingsRowSeed): void {
    // F-014: Account-internal targets are not in the design map (later features).
  }
}
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

  protected onRowActivate(row: SettingsRowSeed): void {
    // F-057 FR-001..FR-004: every seeded Account row now reaches a real screen.
    // The map is total over ACCOUNT_ROWS; a new seed row without a route would be
    // the F-046 silent no-op this feature exists to remove, so it gets one here.
    const route = this.rowRoutes[row.id];
    if (route !== undefined) {
      void this.router.navigate([route]);
    }
  }

  private readonly rowRoutes: Readonly<Record<string, string>> = {
    security: '/settings/account/security',
    'two-step-verification': '/settings/account/two-step',
    'change-number': '/settings/account/change-number',
    'delete-account': '/settings/account/delete',
  };
}
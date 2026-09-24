import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

@Component({
  selector: 'app-settings-stub-page',
  imports: [NavigationBar],
  templateUrl: './settings-stub-page.html',
  styleUrl: './settings-stub-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsStubPage {
  private readonly router = inject(Router);

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/starred-messages']);
    }
  }
}
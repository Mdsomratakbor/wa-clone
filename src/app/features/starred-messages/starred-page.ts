import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

@Component({
  selector: 'app-starred-page',
  imports: [NavigationBar],
  templateUrl: './starred-page.html',
  styleUrl: './starred-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarredPage {
  private readonly router = inject(Router);

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Settings', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }
}
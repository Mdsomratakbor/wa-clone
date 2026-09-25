import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { CHATS_SETTINGS_ROWS, SettingsRowSeed } from './settings.seed';

@Component({
  selector: 'app-chats-settings-page',
  imports: [NavigationBar],
  templateUrl: './chats-settings-page.html',
  styleUrl: './chats-settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsSettingsPage {
  private readonly router = inject(Router);

  protected readonly rows: readonly SettingsRowSeed[] = CHATS_SETTINGS_ROWS;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(_row: SettingsRowSeed): void {
    // F-016: wallpaper/font/keyboard targets are later features.
  }
}
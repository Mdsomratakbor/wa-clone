import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { Toggle } from '../../shared/components/toggle/toggle';
import { PrefsKey, PrefsStore } from '../../core/prefs.store';
import { CHATS_SETTINGS_ROWS, SettingsRowSeed } from './settings.seed';

const TOGGLE_PREFS: Readonly<Record<string, PrefsKey>> = {
  'chats-enter-sends': 'enterKeySends',
  'chats-media-visibility': 'mediaVisibility',
};

@Component({
  selector: 'app-chats-settings-page',
  imports: [NavigationBar, Toggle],
  templateUrl: './chats-settings-page.html',
  styleUrl: './chats-settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsSettingsPage {
  private readonly router = inject(Router);
  private readonly store = inject(PrefsStore);

  protected readonly rows: readonly SettingsRowSeed[] = CHATS_SETTINGS_ROWS;

  protected readonly prefs = this.store.prefs;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected toggleKey(rowId: string): PrefsKey | undefined {
    return TOGGLE_PREFS[rowId];
  }

  protected onToggle(key: PrefsKey, value: boolean): void {
    // F-027: persisted toggle; behaviors beyond Enter key sends are later targets.
    this.store.set(key, value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(_row: SettingsRowSeed): void {
    // F-016: wallpaper/font/keyboard targets are later features.
  }
}
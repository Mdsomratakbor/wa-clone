import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { Toggle } from '../../shared/components/toggle/toggle';
import { PrefsKey, PrefsStore } from '../../core/prefs.store';
import { CHATS_SETTINGS_ROWS, SettingsRowSeed } from './settings.seed';

const TOGGLE_PREFS: Readonly<Record<string, PrefsKey>> = {
  'chats-enter-sends': 'enterKeySends',
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
    // F-027: persisted toggle, and F-046 FR-006 makes this the only pref on this
    // screen with a real consumer (composer.ts reads enterKeySends).
    this.store.set(key, value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(row: SettingsRowSeed): void {
    // F-041: Font size owns its own screen; F-016's other targets stay inert.
    if (row.id === 'chats-font-size') {
      void this.router.navigate(['/settings/chats/font-size']);
    }
  }
}
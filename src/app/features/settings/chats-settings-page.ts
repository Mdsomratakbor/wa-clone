import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { Toggle } from '../../shared/components/toggle/toggle';
import { PrefsKey, PrefsStore } from '../../core/prefs.store';
import { CHATS_SETTINGS_ROWS, SettingsRowSeed } from './settings.seed';

const TOGGLE_PREFS: Readonly<Record<string, PrefsKey>> = {
  // F-059 FR-009: mediaVisibility is live here BECAUSE its consumer (MessageBubble)
  // lands in the same series - the F-046 key-return-with-consumer contract.
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
    // F-027: persisted toggle. F-059 FR-009: mediaVisibility is the one switch on
    // this screen whose consumer (message-bubble masking) exists in the same series.
    this.store.set(key, value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(row: SettingsRowSeed): void {
    // F-041 owns the font-size screen; F-059 FR-002/FR-004 add the wallpaper and
    // keyboard screens. F-016's other targets stay inert.
    if (row.id === 'chats-font-size') {
      void this.router.navigate(['/settings/chats/font-size']);
    } else if (row.id === 'chats-wallpaper') {
      void this.router.navigate(['/settings/chats/wallpaper']);
    } else if (row.id === 'chats-keyboard') {
      void this.router.navigate(['/settings/chats/keyboard']);
    }
  }
}
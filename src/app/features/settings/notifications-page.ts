import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { Toggle } from '../../shared/components/toggle/toggle';
import { PrefsKey, PrefsStore } from '../../core/prefs.store';
import { NOTIFICATIONS_ROWS, SettingsRowSeed } from './settings.seed';

const TOGGLE_PREFS: Readonly<Record<string, PrefsKey>> = {
  'notifications-sound': 'sound',
  'notifications-vibrate': 'vibrate',
  'notifications-popup': 'popup',
  'notifications-light': 'light',
  'notifications-previews': 'showPreviews',
};

@Component({
  selector: 'app-notifications-page',
  imports: [NavigationBar, Toggle],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage {
  private readonly router = inject(Router);
  private readonly store = inject(PrefsStore);

  protected readonly rows: readonly SettingsRowSeed[] = NOTIFICATIONS_ROWS;

  protected readonly prefs = this.store.prefs;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected toggleKey(rowId: string): PrefsKey | undefined {
    return TOGGLE_PREFS[rowId];
  }

  protected onToggle(key: PrefsKey, value: boolean): void {
    // F-027: persisted toggles; notification consumer effects are later targets.
    this.store.set(key, value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(_row: SettingsRowSeed): void {
    // F-017: sound/vibrate/popup sub-targets are later features.
  }
}
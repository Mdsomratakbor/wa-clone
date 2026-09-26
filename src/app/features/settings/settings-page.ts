import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavAction, TabItem, TabKey } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { SettingsModal } from './settings-modal';
import { SETTINGS_PROFILE, SETTINGS_ROWS, SettingsRowSeed } from './settings.seed';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

@Component({
  selector: 'app-settings-page',
  imports: [NavigationBar, TabBar, SettingsModal],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly router = inject(Router);
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('settingsOptionsTrigger');

  protected readonly profile = SETTINGS_PROFILE;
  protected readonly rows: readonly SettingsRowSeed[] = SETTINGS_ROWS;

  protected readonly activeTab = signal<TabKey>('settings');
  protected readonly settingsModalOpen = signal(false);

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/starred-messages']);
    }
  }

  protected onTabSelect(key: TabKey): void {
    if (key === 'chats') {
      void this.router.navigate(['/chats']);
      return;
    }
    if (key === 'camera') {
      void this.router.navigate(['/camera']);
      return;
    }
    if (key === 'calls') {
      void this.router.navigate(['/calls']);
      return;
    }
    if (key === 'status') {
      void this.router.navigate(['/status']);
      return;
    }
    // F-013: Settings tab is the active screen.
  }

  protected onRowActivate(row: SettingsRowSeed): void {
    if (row.id === 'account') {
      // F-014: Account screen (design-map row 14).
      void this.router.navigate(['/settings/account']);
      return;
    }
    if (row.id === 'chats-settings') {
      // F-016: Chats Settings screen (design-map row 16).
      void this.router.navigate(['/settings/chats']);
      return;
    }
    if (row.id === 'notifications') {
      // F-017: Notifications screen (design-map row 17).
      void this.router.navigate(['/settings/notifications']);
      return;
    }
    if (row.id === 'data-storage') {
      // F-018: Data & Storage screen (design-map row 18).
      void this.router.navigate(['/settings/data-storage']);
      return;
    }
    // F-013: remaining row target (Contacts, row 21-adjacent) is a later feature.
  }

  protected onSettingsOptions(): void {
    this.settingsModalOpen.set(true);
  }

  protected onProfileTap(): void {
    // F-020: Edit Profile screen (design-map row 20).
    void this.router.navigate(['/settings/profile']);
  }

  protected onSettingsAction(_id: string): void {
    // F-011: row targets (notifications / storage / more) are later features.
  }

  protected onDismissSettings(): void {
    this.settingsModalOpen.set(false);
    this.trigger().nativeElement.focus();
  }
}
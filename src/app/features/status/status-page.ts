import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction, TabItem, TabKey } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

@Component({
  selector: 'app-status-page',
  imports: [NavigationBar, TabBar, UserAvatar],
  templateUrl: './status-page.html',
  styleUrl: './status-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPage {
  private readonly router = inject(Router);

  protected readonly activeTab = signal<TabKey>('status');

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected readonly leadingActions: readonly NavAction[] = [{ id: 'privacy', label: 'Privacy' }];

  protected onTabSelect(key: TabKey): void {
    if (key === 'chats') {
      void this.router.navigate(['/chats']);
      return;
    }
    if (key === 'calls') {
      void this.router.navigate(['/calls']);
      return;
    }
    this.activeTab.set(key);
  }

  protected onNavAction(_id: string): void {
    // F-006: Privacy (settings) is a later feature (design-map row 13).
  }

  protected onRowActivate(): void {
    // F-006: Status compose is a later feature (design-map row 7).
  }

  protected onCamera(): void {
    // F-006: Status compose (photo/camera) is a later feature (design-map row 7).
  }

  protected onNote(): void {
    // F-006: Status compose (text note) is a later feature (design-map row 7).
  }
}
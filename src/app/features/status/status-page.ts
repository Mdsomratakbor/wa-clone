import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction, TabItem, TabKey } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { UserAvatar } from '../../shared/components/avatar/user-avatar';
import { StatusStore } from '../../core/status.store';

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
  private readonly status = inject(StatusStore);

  protected readonly activeTab = signal<TabKey>('status');

  // F-049: the design only shows the empty variant of this row, so the published
  // subtitle is provisional. Not truncated: a truncation rule is unsourced, and a
  // truncated status is one the user cannot read in full.
  protected readonly myStatus = this.status.myStatus;

  // F-050 FR-009: a photo status has `text: ''`, which must not render as an empty
  // subtitle; the proprietial photo label hides nothing and invites no second publish.
  protected readonly subtitle = computed(() => {
    const entry = this.myStatus();
    if (entry === null) {
      return 'Add to my status';
    }
    if (entry.photo !== undefined) {
      return 'A photo';
    }
    return entry.text;
  });

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
    if (key === 'camera') {
      void this.router.navigate(['/camera']);
      return;
    }
    if (key === 'settings') {
      void this.router.navigate(['/settings']);
      return;
    }
    this.activeTab.set(key);
  }

  protected onNavAction(id: string): void {
    if (id === 'privacy') {
      // F-035: the design has no Privacy screen; Settings is the privacy entry.
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(): void {
    void this.router.navigate(['/status/compose']);
  }

  protected onCamera(): void {
    // F-050 FR-001: the camera circle is labelled "Add a photo to my status", so it
    // no longer opens the text composer the way the note circle and row body do.
    void this.router.navigate(['/status/compose'], { queryParams: { kind: 'photo' } });
  }

  protected onNote(): void {
    // F-007: note entry opens the text-status composer (design-map row 7).
    void this.router.navigate(['/status/compose']);
  }
}
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction, TabItem, TabKey } from '../chat-list/chat.model';
import { CallListItem } from '../../shared/components/call-list-item/call-list-item';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { CallEntry } from './calls.model';
import { CALL_SEED } from './calls.seed';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

@Component({
  selector: 'app-calls-page',
  imports: [NavigationBar, CallListItem, TabBar],
  templateUrl: './calls-page.html',
  styleUrl: './calls-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallsPage {
  private readonly router = inject(Router);

  readonly calls = input<CallEntry[]>(CALL_SEED as CallEntry[]);

  protected readonly activeTab = signal<TabKey>('calls');

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected readonly leadingActions: readonly NavAction[] = [{ id: 'edit', label: 'Edit' }];
  protected readonly trailingActions: readonly NavAction[] = [
    { id: 'new-call', label: 'New call', icon: 'new-call' },
  ];

  protected onTabSelect(key: TabKey): void {
    if (key === 'chats') {
      void this.router.navigate(['/chats']);
      return;
    }
    if (key === 'calls') {
      return;
    }
    this.activeTab.set(key);
  }

  protected onNavAction(_id: string): void {
    // F-004: edit (feature 005) and new-call (calling flow) are later features.
  }
}
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
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
  protected readonly editing = signal(false);
  protected readonly items = signal<CallEntry[]>([]);

  constructor() {
    effect(() => {
      this.items.set([...this.calls()]);
    });
  }

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected readonly leadingActions = computed<readonly NavAction[]>(() =>
    this.editing() ? [{ id: 'done', label: 'Done' }] : [{ id: 'edit', label: 'Edit' }],
  );

  protected readonly trailingActions = computed<readonly NavAction[]>(() =>
    this.editing()
      ? [{ id: 'clear', label: 'Clear', disabled: this.items().length === 0 }]
      : [{ id: 'new-call', label: 'New call', icon: 'new-call' }],
  );

  protected onTabSelect(key: TabKey): void {
    if (this.editing()) {
      return;
    }
    if (key === 'chats') {
      void this.router.navigate(['/chats']);
      return;
    }
    if (key === 'status') {
      void this.router.navigate(['/status']);
      return;
    }
    if (key === 'calls') {
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
    if (id === 'edit') {
      this.editing.set(true);
      return;
    }
    if (id === 'done') {
      this.editing.set(false);
      return;
    }
    if (id === 'clear') {
      this.items.set([]);
      return;
    }
    // F-004: new-call (calling flow) is a later feature.
  }

  protected onCallSelected(call: CallEntry): void {
    if (this.editing()) {
      return;
    }
    // F-004: row activation / info flows are later features.
  }

  protected onCallInfo(call: CallEntry): void {
    // F-004: info flows are later features.
  }

  protected onCallRemove(call: CallEntry): void {
    if (this.editing()) {
      this.items.update((list) => list.filter((item) => item.id !== call.id));
    }
  }
}
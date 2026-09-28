import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavAction, TabItem, TabKey } from '../chat-list/chat.model';
import { CallListItem } from '../../shared/components/call-list-item/call-list-item';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { CallStore } from '../../core/call.store';
import { ChatStore } from '../../core/chat.store';
import { CallEntry } from './calls.model';
import { CallInfoModal } from './call-info-modal';

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
  imports: [NavigationBar, CallListItem, TabBar, CallInfoModal],
  templateUrl: './calls-page.html',
  styleUrl: './calls-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallsPage {
  private readonly router = inject(Router);
  private readonly callStore = inject(CallStore);
  private readonly chatStore = inject(ChatStore);

  protected readonly activeTab = signal<TabKey>('calls');
  protected readonly editing = signal(false);
  protected readonly items = computed(() => this.callStore.calls());
  protected readonly infoCall = signal<CallEntry | null>(null);

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
      this.callStore.clearCalls();
      return;
    }
    // F-043: new-call stays inert. Its destination is a contact picker plus an in-call screen
    // (timer, mute, hangup); F-043 shipped the call-info sheet only, so the calling flow is
    // still a separate feature (audit B6).
  }

  protected onCallSelected(call: CallEntry): void {
    if (this.editing()) {
      return;
    }
    this.openChatFor(call);
  }

  protected onCallInfo(call: CallEntry): void {
    if (this.editing()) {
      return;
    }
    this.infoCall.set(call);
  }

  protected onSheetAction(id: string): void {
    const call = this.infoCall();
    if (call === null) {
      return;
    }
    this.infoCall.set(null);
    if (id === 'message') {
      this.openChatFor(call);
      return;
    }
    if (id === 'delete') {
      this.callStore.removeCall(call.id);
      return;
    }
    // voice-call / video-call: their destination is the in-call screen, which is out of scope
    // here. The row is deliberately rendered and focusable (see specs/043-call-info/spec.md).
  }

  protected onSheetDismiss(): void {
    this.infoCall.set(null);
  }

  private openChatFor(call: CallEntry): void {
    const chatId = this.chatStore.chatIdForContactName(call.contactName);
    if (chatId === null) {
      return;
    }
    void this.router.navigate(['/chat', chatId]);
  }

  protected onCallRemove(call: CallEntry): void {
    if (this.editing() && this.infoCall() === null) {
      this.callStore.removeCall(call.id);
    }
  }
}
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
import { Clock } from '../../core/clock';
import { CallEntry, CallKind } from './calls.model';
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
  private readonly clock = inject(Clock);

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
    // F-045 (supersedes the F-043 note): the calling flow now exists, so this goes
    // to the contact picker rather than doing nothing.
    if (id === 'new-call') {
      void this.router.navigate(['/calls/new']);
    }
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
    // Close on every action, including the ones with no effect. Doing this per
    // branch is how Delete ended up leaving the sheet open (F-043 FR-005).
    this.infoCall.set(null);
    if (id === 'message') {
      this.openChatFor(call);
      return;
    }
    if (id === 'delete') {
      this.callStore.removeCall(call.id);
      return;
    }
    // F-045 (supersedes the F-043 note): voice/video from the call-info sheet now
    // start a real call against the contact behind the log row.
    if (id === 'voice-call' || id === 'video-call') {
      this.startCall(call, id === 'voice-call' ? 'voice' : 'video');
    }
  }

  /**
   * FR-012: the log row already carries the contact name and avatar, so a call starts
   * even when that contact has no chat. Looking up a chat first (as openChatFor does)
   * and bailing would make Voice/Video dead again for exactly the rows F-043 left
   * inert - the failure G4 exists to prevent.
   */
  private startCall(call: CallEntry, kind: CallKind): void {
    const started = this.callStore.startCall(
      {
        contactId: this.chatStore.chatIdForContactName(call.contactName) ?? '',
        contactName: call.contactName,
        avatarRef: call.avatarRef,
      },
      kind,
      this.clock.now(),
    );
    if (!started) {
      return;
    }
    void this.router.navigate(['/calls/active'], { queryParams: { from: '/calls' } });
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
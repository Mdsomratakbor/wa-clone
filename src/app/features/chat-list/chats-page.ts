import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AddModal } from '../new-chat-modal/add-modal';
import { Action } from '../../shared/components/action-sheet/action-sheet.model';
import { ChatActionsBar } from '../../shared/components/chat-actions-bar/chat-actions-bar';
import { ChatListItem } from '../../shared/components/chat-list-item/chat-list-item';
import { Fab } from '../../shared/components/fab/fab';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';
import { CHAT_SEED } from './chat-list.seed';
import { ChatPreview, NavAction, TabItem, TabKey } from './chat.model';
import { NEW_CHAT_ACTIONS } from '../new-chat-modal/new-chat-modal.seed';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

@Component({
  selector: 'app-chats-page',
  imports: [NavigationBar, ChatListItem, Fab, TabBar, ChatActionsBar, AddModal],
  templateUrl: './chats-page.html',
  styleUrl: './chats-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPage {
  private readonly router = inject(Router);
  private readonly fabRef = viewChild(Fab);

  readonly conversations = input<ChatPreview[]>(CHAT_SEED as ChatPreview[]);

  protected readonly activeTab = signal<TabKey>('chats');
  protected readonly editing = signal(false);
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly items = signal<ChatPreview[]>([]);
  protected readonly modalOpen = signal(false);
  protected readonly newChatActions: readonly Action[] = NEW_CHAT_ACTIONS;

  constructor() {
    effect(() => {
      this.items.set([...this.conversations()]);
    });
  }

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'broadcast-lists', label: 'Broadcast Lists' },
    { id: 'new-group', label: 'New Group' },
  ];

  protected readonly trailingActions = computed<readonly NavAction[]>(() =>
    this.editing() ? [{ id: 'done', label: 'Done' }] : [{ id: 'edit', label: 'Edit' }],
  );

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected readonly selectedCount = computed(() => this.selectedIds().size);

  protected onTabSelect(key: TabKey): void {
    if (this.editing()) {
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

  protected onChatSelected(chat: ChatPreview): void {
    if (this.editing()) {
      this.toggleSelection(chat.id);
      return;
    }
    void this.router.navigate(['/chat', chat.id]);
  }

  protected onNavAction(id: string): void {
    if (id === 'edit') {
      this.editing.set(true);
      this.selectedIds.set(new Set());
      return;
    }
    if (id === 'done') {
      this.editing.set(false);
      this.selectedIds.set(new Set());
      return;
    }
    // F-001/003: broadcast-lists / new-group flows are later features.
  }

  protected onFabPressed(): void {
    this.modalOpen.set(true);
  }

  protected onAddModalAction(_id: string): void {
    // Row targets (new group / contact / community) are later features (spec Non-Goals).
  }

  protected onDismissModal(): void {
    this.modalOpen.set(false);
    this.fabRef()?.focus();
  }

  protected isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  protected onArchive(): void {
    this.removeSelected();
  }

  protected onDelete(): void {
    this.removeSelected();
  }

  protected onReadAll(): void {
    // F-003: control-only no-op (no read/unread state exists in feature 001).
  }

  private toggleSelection(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
  }

  private removeSelected(): void {
    const selected = this.selectedIds();
    if (selected.size === 0) {
      return;
    }
    this.items.set(this.items().filter((chat) => !selected.has(chat.id)));
    this.selectedIds.set(new Set());
  }
}
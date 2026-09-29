import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallStore } from '../../core/call.store';
import { ChatStore } from '../../core/chat.store';
import { Clock } from '../../core/clock';
import { PrefsStore } from '../../core/prefs.store';
import { CallKind } from '../calls/calls.model';
import { ChatHeader } from '../../shared/components/chat-header/chat-header';
import { ActionSheet } from '../../shared/components/action-sheet/action-sheet';
import { Composer } from '../../shared/components/composer/composer';
import { MessageBubble } from '../../shared/components/message-bubble/message-bubble';
import { ChatActionsModal } from './chat-actions-modal';
import { CHAT_MORE_ACTIONS } from './chat-actions.seed';
import { CHAT_CONTACT, DATE_CHIP_LABEL } from './chat-window.seed';
import { ContactHeader } from './chat-window.model';

@Component({
  selector: 'app-chat-window-page',
  imports: [ChatHeader, MessageBubble, Composer, ChatActionsModal, ActionSheet],
  templateUrl: './chat-window-page.html',
  styleUrl: './chat-window-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);
  private readonly callStore = inject(CallStore);
  private readonly clock = inject(Clock);
  private readonly prefs = inject(PrefsStore);
  private readonly header = viewChild(ChatHeader);
  private readonly thread = viewChild<ElementRef<HTMLDivElement>>('thread');

  protected readonly fontScale = this.prefs.fontScale;

  protected readonly contact = computed<ContactHeader>(() =>
    this.store.contact(this.chatId()) ?? CHAT_CONTACT,
  );
  protected readonly dateChip = DATE_CHIP_LABEL;
  protected readonly chatActionsOpen = signal(false);
  protected readonly chatMoreOpen = signal(false);
  protected readonly moreActions = CHAT_MORE_ACTIONS;

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly messages = computed(() =>
    this.store.conversationMessages(this.chatId()),
  );

  protected readonly listEmpty = computed(() => this.messages().length === 0);

  protected readonly muted = computed(() => this.store.isMuted(this.chatId()));

  constructor() {
    effect(() => {
      this.store.openConversation(this.chatId());
    });
    effect(() => {
      this.messages();
      const el = this.thread()?.nativeElement;
      if (el) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      }
    });
  }

  protected onSend(text: string): void {
    this.store.sendMessage(this.chatId(), text);
  }

  protected isStarred(messageId: string): boolean {
    return this.store.isStarred(this.chatId(), messageId);
  }

  protected onStarMessage(messageId: string): void {
    this.store.toggleStarred(this.chatId(), messageId);
  }

  protected onBack(): void {
    void this.router.navigate(['/chats']);
  }

  protected onIdentity(): void {
    // F-015: header tap opens Contact Info (design-map row 15).
    void this.router.navigate(['/contact', this.chatId()]);
  }

  protected onChatActions(): void {
    this.chatActionsOpen.set(true);
  }

  /**
   * F-045: the header Call/Video buttons now start a real call. FR-011 - if a call is
   * already live, startCall refuses and the user stays in the chat rather than losing
   * it, so this is a no-op on screen by design, not a broken button.
   *
   * Reads `contact()`, not `store.contact()`, so the call always matches the name the
   * header is displaying. The computed already falls back to CHAT_CONTACT for an
   * unknown id, so these buttons are never dead.
   */
  protected onCall(kind: CallKind): void {
    const contact = this.contact();
    const started = this.callStore.startCall(
      {
        contactId: this.chatId(),
        contactName: contact.name,
        avatarRef: contact.avatarRef,
      },
      kind,
      this.clock.now(),
    );
    if (!started) {
      return;
    }
    void this.router.navigate(['/calls/active'], {
      queryParams: { from: `/chat/${this.chatId()}` },
    });
  }

  protected onChatAction(id: string): void {
    if (id === 'chat-mute') {
      this.store.toggleMuted(this.chatId());
      return;
    }
    if (id === 'chat-more') {
      this.chatActionsOpen.set(false);
      this.chatMoreOpen.set(true);
    }
  }

  protected onMoreAction(id: string): void {
    if (id === 'chat-clear') {
      this.store.clearMessages(this.chatId());
      this.chatMoreOpen.set(false);
      this.header()?.focus();
      return;
    }
    if (id === 'chat-delete') {
      this.store.deleteConversation(this.chatId());
      this.chatMoreOpen.set(false);
      void this.router.navigate(['/chats']);
    }
  }

  protected onDismissMore(): void {
    this.chatMoreOpen.set(false);
    this.header()?.focus();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.chatMoreOpen()) {
      this.onDismissMore();
    }
  }

  protected onDismissChatActions(): void {
    this.chatActionsOpen.set(false);
    this.header()?.focus();
  }
}
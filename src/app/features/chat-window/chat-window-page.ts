import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { ChatHeader } from '../../shared/components/chat-header/chat-header';
import { Composer } from '../../shared/components/composer/composer';
import { MessageBubble } from '../../shared/components/message-bubble/message-bubble';
import { ChatActionsModal } from './chat-actions-modal';
import { CHAT_CONTACT, DATE_CHIP_LABEL } from './chat-window.seed';

@Component({
  selector: 'app-chat-window-page',
  imports: [ChatHeader, MessageBubble, Composer, ChatActionsModal],
  templateUrl: './chat-window-page.html',
  styleUrl: './chat-window-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);
  private readonly header = viewChild(ChatHeader);
  private readonly thread = viewChild<ElementRef<HTMLDivElement>>('thread');

  protected readonly contact = CHAT_CONTACT;
  protected readonly dateChip = DATE_CHIP_LABEL;
  protected readonly chatActionsOpen = signal(false);

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly messages = computed(() =>
    this.store.conversationMessages(this.chatId()),
  );

  protected readonly listEmpty = computed(() => this.messages().length === 0);

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

  protected onChatAction(_id: string): void {
    // Row targets (mute / wallpaper / more) are later features (spec Non-Goals).
  }

  protected onDismissChatActions(): void {
    this.chatActionsOpen.set(false);
    this.header()?.focus();
  }
}
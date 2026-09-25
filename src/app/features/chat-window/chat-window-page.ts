import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatHeader } from '../../shared/components/chat-header/chat-header';
import { Composer } from '../../shared/components/composer/composer';
import { MessageBubble } from '../../shared/components/message-bubble/message-bubble';
import { ChatActionsModal } from './chat-actions-modal';
import { CHAT_CONTACT, CHAT_SEED, DATE_CHIP_LABEL } from './chat-window.seed';

const THREADED_CONTACT_ID = 'chat-006';

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
  private readonly header = viewChild(ChatHeader);

  protected readonly contact = CHAT_CONTACT;
  protected readonly dateChip = DATE_CHIP_LABEL;
  protected readonly chatActionsOpen = signal(false);

  protected readonly messages = computed(() =>
    this.route.snapshot.paramMap.get('id') === THREADED_CONTACT_ID ? CHAT_SEED : [],
  );

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly listEmpty = computed(() => this.messages().length === 0);

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
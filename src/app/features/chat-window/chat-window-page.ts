import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatHeader } from '../../shared/components/chat-header/chat-header';
import { Composer } from '../../shared/components/composer/composer';
import { MessageBubble } from '../../shared/components/message-bubble/message-bubble';
import { CHAT_CONTACT, CHAT_SEED, DATE_CHIP_LABEL } from './chat-window.seed';

const THREADED_CONTACT_ID = 'chat-006';

@Component({
  selector: 'app-chat-window-page',
  imports: [ChatHeader, MessageBubble, Composer],
  templateUrl: './chat-window-page.html',
  styleUrl: './chat-window-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly contact = CHAT_CONTACT;
  protected readonly dateChip = DATE_CHIP_LABEL;

  protected readonly messages = computed(() =>
    this.route.snapshot.paramMap.get('id') === THREADED_CONTACT_ID ? CHAT_SEED : [],
  );

  protected readonly listEmpty = computed(() => this.messages().length === 0);

  protected onBack(): void {
    void this.router.navigate(['/chats']);
  }
}
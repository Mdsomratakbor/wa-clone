import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

interface MediaTile {
  messageId: string;
  name: string;
  size: string;
  label: string;
}

@Component({
  selector: 'app-media-page',
  imports: [NavigationBar],
  templateUrl: './media-page.html',
  styleUrl: './media-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ChatStore);

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly name = computed(() => this.store.contactName(this.chatId()));

  // Derived at read time: nothing here is persisted, so it does not belong in the
  // store's versioned snapshot. Copied before reversing because
  // conversationMessages() hands back the stored array (specs/044-media-screen).
  protected readonly media = computed<readonly MediaTile[]>(() =>
    [...this.store.conversationMessages(this.chatId())]
      .filter((message) => message.file !== null)
      .reverse()
      .map((message) => {
        const file = message.file;
        const name = `${file?.filename}.${file?.ext}`;
        return {
          messageId: message.id,
          name,
          size: file?.size ?? '',
          label: `${name}, ${file?.size ?? ''}`,
        };
      }),
  );

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/contact', this.chatId()]);
    }
  }

  protected onTileActivate(_tile: MediaTile): void {
    // FR-006: observable no-op. This design has no media viewer, so a tile must not
    // pretend to navigate. Kept as a handler so the no-op is testable rather than
    // an inert <div> with a click binding.
  }
}

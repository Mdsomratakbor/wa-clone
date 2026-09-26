import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { CHAT_SEED } from '../chat-list/chat-list.seed';

@Component({
  selector: 'app-edit-contact-page',
  imports: [NavigationBar],
  templateUrl: './edit-contact-page.html',
  styleUrl: './edit-contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditContactPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly chatId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly name = computed(() => {
    const chat = CHAT_SEED.find((c) => c.id === this.chatId());
    return chat?.contactName ?? 'Contact';
  });

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/contact', this.chatId()]);
    }
  }

  protected onSave(): void {
    // F-019: persistence is a later feature / map-external.
  }
}
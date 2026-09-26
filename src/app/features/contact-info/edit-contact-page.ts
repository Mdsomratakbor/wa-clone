import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatStore } from '../../core/chat.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

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
  private readonly store = inject(ChatStore);

  private readonly chatId = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly nameDraft = signal(this.store.contactName(this.chatId));
  protected readonly phoneDraft = signal(this.store.contactPhone(this.chatId));

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/contact', this.chatId]);
    }
  }

  protected onSave(): void {
    this.store.updateContact(this.chatId, this.nameDraft(), this.phoneDraft());
    void this.router.navigate(['/contact', this.chatId]);
  }
}
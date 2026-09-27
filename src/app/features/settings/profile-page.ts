import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PrefsStore } from '../../core/prefs.store';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';

@Component({
  selector: 'app-profile-page',
  imports: [NavigationBar],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly router = inject(Router);
  private readonly prefs = inject(PrefsStore);

  protected readonly nameDraft = signal(this.prefs.profile().name);
  protected readonly aboutDraft = signal(this.prefs.profile().about);

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onSave(): void {
    const name = this.nameDraft().trim();
    if (name.length === 0) {
      return;
    }
    this.prefs.updateProfile(name, this.aboutDraft().trim());
    void this.router.navigate(['/settings']);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { Toggle } from '../../shared/components/toggle/toggle';
import { PrefsStore } from '../../core/prefs.store';

@Component({
  selector: 'app-keyboard-page',
  imports: [NavigationBar, Toggle],
  templateUrl: './keyboard-page.html',
  styleUrl: './keyboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardPage {
  private readonly router = inject(Router);
  private readonly store = inject(PrefsStore);

  // F-059 FR-007: the keyboard screen exists so one preference owns one switch.
  protected readonly prefs = this.store.prefs;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onToggle(value: boolean): void {
    this.store.set('enterKeySends', value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings/chats']);
    }
  }
}
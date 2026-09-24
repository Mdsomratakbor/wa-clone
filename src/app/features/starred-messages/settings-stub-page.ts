import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { SettingsModal } from '../settings/settings-modal';

@Component({
  selector: 'app-settings-stub-page',
  imports: [NavigationBar, SettingsModal],
  templateUrl: './settings-stub-page.html',
  styleUrl: './settings-stub-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsStubPage {
  private readonly router = inject(Router);
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('settingsOptionsTrigger');

  protected readonly settingsModalOpen = signal(false);

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/starred-messages']);
    }
  }

  protected onSettingsOptions(): void {
    this.settingsModalOpen.set(true);
  }

  protected onSettingsAction(_id: string): void {
    // Row targets (notifications / storage / more) are later features (spec Non-Goals).
  }

  protected onDismissSettings(): void {
    this.settingsModalOpen.set(false);
    this.trigger().nativeElement.focus();
  }
}
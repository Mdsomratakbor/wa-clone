import { ChangeDetectionStrategy, Component, HostListener, output } from '@angular/core';
import { ActionSheet } from '../../shared/components/action-sheet/action-sheet';
import { CHAT_ACTIONS } from './chat-actions.seed';

@Component({
  selector: 'app-chat-actions-modal',
  imports: [ActionSheet],
  templateUrl: './chat-actions-modal.html',
  styleUrl: './chat-actions-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatActionsModal {
  readonly action = output<string>();
  readonly dismiss = output<void>();

  protected readonly actions = CHAT_ACTIONS;

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.dismiss.emit();
  }
}
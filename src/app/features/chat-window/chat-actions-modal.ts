import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
} from '@angular/core';
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

  readonly muted = input<boolean>(false);

  protected readonly actions = computed(() =>
    CHAT_ACTIONS.map((it) =>
      it.id === 'chat-mute'
        ? { ...it, label: this.muted() ? 'Unmute' : 'Mute' }
        : it,
    ),
  );

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.dismiss.emit();
  }
}
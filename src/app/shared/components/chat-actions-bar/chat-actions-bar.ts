import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-chat-actions-bar',
  templateUrl: './chat-actions-bar.html',
  styleUrl: './chat-actions-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatActionsBar {
  readonly selectedCount = input(0);

  readonly archive = output<void>();
  readonly readAll = output<void>();
  readonly delete = output<void>();

  protected readonly hasSelection = computed(() => this.selectedCount() > 0);
}
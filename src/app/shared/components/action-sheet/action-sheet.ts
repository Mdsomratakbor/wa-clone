import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Action } from './action-sheet.model';

@Component({
  selector: 'app-action-sheet',
  templateUrl: './action-sheet.html',
  styleUrl: './action-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionSheet {
  readonly title = input<string>('');
  readonly actions = input<readonly Action[]>([]);

  readonly action = output<string>();
  readonly dismiss = output<void>();

  protected onAction(id: string): void {
    this.action.emit(id);
  }

  protected onBackdrop(): void {
    this.dismiss.emit();
  }
}
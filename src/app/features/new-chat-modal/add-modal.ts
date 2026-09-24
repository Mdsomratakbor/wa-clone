import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { ActionSheet } from '../../shared/components/action-sheet/action-sheet';
import { Action } from '../../shared/components/action-sheet/action-sheet.model';

@Component({
  selector: 'app-add-modal',
  imports: [ActionSheet],
  templateUrl: './add-modal.html',
  styleUrl: './add-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddModal {
  readonly actions = input<readonly Action[]>([]);

  readonly action = output<string>();
  readonly dismiss = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.dismiss.emit();
  }
}
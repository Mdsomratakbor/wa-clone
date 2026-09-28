import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { ActionSheet } from '../../shared/components/action-sheet/action-sheet';
import { Action } from '../../shared/components/action-sheet/action-sheet.model';
import { CALL_INFO_ACTIONS } from './call-info.seed';

// Labels and order are PROVISIONAL: the design file has no call-info sheet
// (G1 blocked, Figma 429). See specs/043-call-info/spec.md.
@Component({
  selector: 'app-call-info-modal',
  imports: [ActionSheet],
  templateUrl: './call-info-modal.html',
  styleUrl: './call-info-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallInfoModal {
  readonly title = input<string>('');

  readonly action = output<string>();
  readonly dismiss = output<void>();

  protected readonly actions: readonly Action[] = CALL_INFO_ACTIONS;

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.dismiss.emit();
  }
}

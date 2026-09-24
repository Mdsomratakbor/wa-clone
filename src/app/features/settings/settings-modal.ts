import { ChangeDetectionStrategy, Component, HostListener, output } from '@angular/core';
import { ActionSheet } from '../../shared/components/action-sheet/action-sheet';
import { SETTINGS_ACTIONS } from './settings.seed';

@Component({
  selector: 'app-settings-modal',
  imports: [ActionSheet],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModal {
  readonly action = output<string>();
  readonly dismiss = output<void>();

  protected readonly actions = SETTINGS_ACTIONS;

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.dismiss.emit();
  }
}
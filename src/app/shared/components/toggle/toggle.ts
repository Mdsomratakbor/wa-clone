import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toggle {
  readonly checked = input(false);
  readonly label = input('');

  readonly checkedChange = output<boolean>();

  protected onActivate(): void {
    this.checkedChange.emit(!this.checked());
  }
}
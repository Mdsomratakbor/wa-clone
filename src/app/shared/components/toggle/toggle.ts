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
  // F-046: a setting with no consumer behind it must not be a live switch. The
  // native disabled attribute is what removes it from the tab order, so the
  // control cannot be keyboard-activated into a change nothing observes.
  readonly disabled = input(false);

  readonly checkedChange = output<boolean>();

  protected onActivate(): void {
    this.checkedChange.emit(!this.checked());
  }
}
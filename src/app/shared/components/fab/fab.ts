import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-fab',
  templateUrl: './fab.html',
  styleUrl: './fab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fab {
  readonly label = input<string>('Compose');
  readonly pressed = output<void>();

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  focus(): void {
    this.button()?.nativeElement.focus();
  }
}
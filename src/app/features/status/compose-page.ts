import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compose-page',
  imports: [],
  templateUrl: './compose-page.html',
  styleUrl: './compose-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposePage {
  private readonly router = inject(Router);

  protected onClose(): void {
    void this.router.navigate(['/status']);
  }

  protected onSend(): void {
    // F-007: publishing a status is a later feature.
  }

  protected onSendAlt(): void {
    // F-007: publishing a status is a later feature.
  }
}
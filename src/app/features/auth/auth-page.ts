import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

const DIGITS: readonly string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const MAX_DIGITS = 15;
const MIN_DIGITS = 7;

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  private readonly router = inject(Router);

  protected readonly digits: readonly string[] = DIGITS;
  protected readonly phone = signal('');
  protected readonly error = signal(false);
  protected readonly errorText = 'Enter your phone number to continue.';

  protected onKey(digit: string): void {
    if (this.phone().length >= MAX_DIGITS) {
      return;
    }
    this.phone.update((current) => current + digit);
    this.error.set(false);
  }

  protected onDelete(): void {
    if (this.phone().length === 0) {
      return;
    }
    this.phone.update((current) => current.slice(0, -1));
    this.error.set(false);
  }

  protected onContinue(): void {
    if (this.phone().length < MIN_DIGITS) {
      this.error.set(true);
      return;
    }
    this.error.set(false);
    void this.router.navigate(['/chats']);
  }
}

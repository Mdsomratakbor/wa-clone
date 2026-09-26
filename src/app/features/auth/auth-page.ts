import { ChangeDetectionStrategy, Component } from '@angular/core';

const DIGITS: readonly string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  protected readonly digits: readonly string[] = DIGITS;

  protected onKey(_digit: string): void {
    // F-021: keypad state is a later feature / map-external.
  }

  protected onDelete(): void {
    // F-021: keypad state is a later feature / map-external.
  }

  protected onContinue(): void {
    // F-021: phone verification flow is a later feature.
  }
}
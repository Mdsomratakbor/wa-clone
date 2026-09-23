import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatar {
  readonly src = input<string | null>(null);
  readonly name = input.required<string>();
  readonly size = input(48);

  protected readonly imageFailed = signal(false);

  protected readonly showImage = computed(() => !!this.src() && !this.imageFailed());

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + second).toUpperCase() || '?';
  });

  protected readonly ariaLabel = computed(() => `${this.name()} avatar`);

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}
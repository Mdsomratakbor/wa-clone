import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { FONT_SCALES, FontScale, PrefsStore } from '../../core/prefs.store';

export const FONT_SCALE_LABELS: Readonly<Record<FontScale, string>> = {
  small: 'Small',
  default: 'Default',
  large: 'Large',
  'extra-large': 'Extra large',
};

@Component({
  selector: 'app-font-size-page',
  imports: [NavigationBar],
  templateUrl: './font-size-page.html',
  styleUrl: './font-size-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FontSizePage {
  private readonly router = inject(Router);
  private readonly store = inject(PrefsStore);

  protected readonly options: readonly FontScale[] = FONT_SCALES;

  protected readonly fontScale = this.store.fontScale;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected label(value: FontScale): string {
    return FONT_SCALE_LABELS[value];
  }

  protected isSelected(value: FontScale): boolean {
    return this.fontScale() === value;
  }

  protected onSelect(value: FontScale): void {
    this.store.setFontScale(value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings/chats']);
    }
  }
}

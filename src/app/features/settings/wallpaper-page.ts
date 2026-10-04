import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { PrefsStore, WALLPAPERS, WallpaperId } from '../../core/prefs.store';

@Component({
  selector: 'app-wallpaper-page',
  imports: [NavigationBar],
  templateUrl: './wallpaper-page.html',
  styleUrl: './wallpaper-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallpaperPage {
  private readonly router = inject(Router);
  private readonly store = inject(PrefsStore);

  // F-059 FR-002/FR-003. The option list is a label-bearing PROVISIONAL set whose
  // swatches are painted through the corresponding [data-wallpaper] token scope.
  protected readonly options = WALLPAPERS;

  protected readonly wallpaper = this.store.wallpaper;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected isSelected(value: WallpaperId): boolean {
    return this.wallpaper() === value;
  }

  protected onSelect(value: WallpaperId): void {
    this.store.setWallpaper(value);
  }

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings/chats']);
    }
  }
}
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavAction } from '../chat-list/chat.model';
import { NavigationBar } from '../../shared/components/navigation-bar/navigation-bar';
import { DATA_STORAGE_ROWS, SettingsRowSeed } from './settings.seed';

@Component({
  selector: 'app-data-storage-page',
  imports: [NavigationBar],
  templateUrl: './data-storage-page.html',
  styleUrl: './data-storage-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataStoragePage {
  private readonly router = inject(Router);

  protected readonly rows: readonly SettingsRowSeed[] = DATA_STORAGE_ROWS;

  protected readonly leadingActions: readonly NavAction[] = [
    { id: 'back', label: 'Back', icon: 'back' },
  ];

  protected onNavAction(id: string): void {
    if (id === 'back') {
      void this.router.navigate(['/settings']);
    }
  }

  protected onRowActivate(_row: SettingsRowSeed): void {
    // F-018: storage/auto-download targets are later features.
  }
}
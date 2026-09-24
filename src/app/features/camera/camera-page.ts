import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TabItem, TabKey } from '../chat-list/chat.model';
import { TabBar } from '../../shared/components/tab-bar/tab-bar';

const TAB_KEYS: readonly TabKey[] = ['settings', 'chats', 'camera', 'calls', 'status'];
const TAB_LABELS: Record<TabKey, string> = {
  settings: 'Settings',
  chats: 'Chats',
  camera: 'Camera',
  calls: 'Calls',
  status: 'Status',
};

@Component({
  selector: 'app-camera-page',
  imports: [TabBar],
  templateUrl: './camera-page.html',
  styleUrl: './camera-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CameraPage {
  private readonly router = inject(Router);

  protected readonly activeTab = signal<TabKey>('camera');

  protected readonly tabs = computed<TabItem[]>(() =>
    TAB_KEYS.map((key) => ({ key, label: TAB_LABELS[key], active: key === this.activeTab() })),
  );

  protected readonly activeLabel = computed(() => TAB_LABELS[this.activeTab()]);

  protected onTabSelect(key: TabKey): void {
    if (key === 'chats') {
      void this.router.navigate(['/chats']);
      return;
    }
    if (key === 'calls') {
      void this.router.navigate(['/calls']);
      return;
    }
    if (key === 'status') {
      void this.router.navigate(['/status']);
      return;
    }
    // F-012: Settings (row 13) takes over this stub; camera tab is the active screen.
    this.activeTab.set(key);
  }

  protected onClose(): void {
    void this.router.navigate(['/chats']);
  }

  protected onShutter(): void {
    // F-012: capture pipeline is a later feature (Non-Goal).
  }

  protected onFlip(): void {
    // F-012: camera flip is control-only this feature (Non-Goal).
  }
}
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TabItem, TabKey } from '../../../features/chat-list/chat.model';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBar {
  readonly items = input.required<TabItem[]>();
  readonly select = output<TabKey>();

  protected onSelect(key: TabKey): void {
    this.select.emit(key);
  }
}
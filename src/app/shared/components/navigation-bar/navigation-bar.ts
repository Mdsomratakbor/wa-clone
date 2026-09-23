import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NavAction } from '../../../features/chat-list/chat.model';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationBar {
  readonly title = input<string>('');
  readonly leading = input<readonly NavAction[]>([]);
  readonly trailing = input<readonly NavAction[]>([]);
  readonly action = output<string>();

  protected onAction(id: string): void {
    this.action.emit(id);
  }
}
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CallEntry, CALL_DIRECTION_LABELS, isMissedCall } from '../../../features/calls/calls.model';
import { UserAvatar } from '../avatar/user-avatar';

@Component({
  selector: 'app-call-list-item',
  imports: [UserAvatar],
  templateUrl: './call-list-item.html',
  styleUrl: './call-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallListItem {
  readonly call = input.required<CallEntry>();
  readonly editMode = input(false);
  readonly selected = output<CallEntry>();
  readonly info = output<CallEntry>();
  readonly remove = output<CallEntry>();

  protected readonly isMissed = computed(() => isMissedCall(this.call()));
  protected readonly directionLabel = computed(() => CALL_DIRECTION_LABELS[this.call().direction]);
  protected readonly rowLabel = computed(() => {
    const call = this.call();
    return `${call.contactName}, ${this.directionLabel()}, ${call.date}`;
  });
  protected readonly infoLabel = computed(() => `Call info for ${this.call().contactName}`);
  protected readonly removeLabel = computed(() => `Remove call for ${this.call().contactName}`);

  protected onActivate(): void {
    this.selected.emit(this.call());
  }

  protected onInfo(event: Event): void {
    event.stopPropagation();
    this.info.emit(this.call());
  }

  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.call());
  }
}
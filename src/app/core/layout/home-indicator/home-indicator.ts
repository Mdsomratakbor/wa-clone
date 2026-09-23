import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-indicator',
  templateUrl: './home-indicator.html',
  styleUrl: './home-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIndicator {}
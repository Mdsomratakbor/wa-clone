import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-composer',
  templateUrl: './composer.html',
  styleUrl: './composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Composer {}
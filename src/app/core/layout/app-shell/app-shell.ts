import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeIndicator } from '../home-indicator/home-indicator';
import { StatusBar } from '../status-bar/status-bar';

@Component({
  selector: 'app-shell',
  imports: [StatusBar, HomeIndicator],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {}
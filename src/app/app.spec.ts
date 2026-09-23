import { TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { App } from './app';
import { AppShell } from './core/layout/app-shell/app-shell';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, AppShell, RouterOutlet],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should mount the app shell and router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const shell = fixture.nativeElement.querySelector('[data-testid="app-shell"]');
    expect(shell).not.toBeNull();
  });
});
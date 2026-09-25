import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CameraPage } from './camera-page';

describe('CameraPage', () => {
  let fixture: ComponentFixture<CameraPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(CameraPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the dark viewport with the Camera tab active', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-page"]')).not.toBeNull();
    const active = el.querySelector('[role="tab"][aria-selected="true"]');
    expect(active?.textContent?.trim()).toBe('Camera');
  });

  it('renders labelled Close, Shutter and Flip controls', () => {
    const el = render();
    expect(el.querySelector('[data-testid="camera-close"]')?.getAttribute('aria-label')).toBe(
      'Close camera',
    );
    expect(el.querySelector('[data-testid="camera-shutter"]')?.getAttribute('aria-label')).toBe(
      'Take photo',
    );
    expect(el.querySelector('[data-testid="camera-flip"]')?.getAttribute('aria-label')).toBe(
      'Switch camera',
    );
  });

  it('navigates to /chats from Close', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="camera-close"]') as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
  });

  it('routes Chats, Calls and Status tabs away', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const tab = (name: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
        (b) => b.textContent?.trim()?.startsWith(name),
      );
    tab('Chats')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/chats']);
    tab('Calls')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/calls']);
    tab('Status')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('navigates to /settings when the Settings tab is activated (feature 013)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    const settingsTab = [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) =>
      b.textContent?.trim()?.startsWith('Settings'),
    );
    settingsTab?.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });
});
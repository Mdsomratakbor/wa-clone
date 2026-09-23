import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ComposePage } from './compose-page';

describe('ComposePage', () => {
  let fixture: ComponentFixture<ComposePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ComposePage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the full-bleed compose surface with the three top glyphs', () => {
    const el = render();
    const surface = el.querySelector<HTMLElement>('[data-testid="compose-page"]');
    expect(surface).not.toBeNull();
    expect(getComputedStyle(surface!).backgroundColor).toBe('rgb(255, 138, 140)');
    expect(el.querySelector('[data-testid="compose-top"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-close"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-send-text"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="compose-send"]')).not.toBeNull();
  });

  it('renders the placeholder, caret and keyboard graphic', () => {
    const el = render();
    expect(el.querySelector('.compose__placeholder')?.textContent?.trim()).toBe('Type a status');
    expect(el.querySelector('.compose__caret')).not.toBeNull();
    const kb = el.querySelector<HTMLImageElement>('[data-testid="compose-keyboard"]');
    expect(kb?.src.endsWith('/status-compose-keyboard.png')).toBe(true);
  });

  it('renders no tab bar, navigation bar, FAB or title', () => {
    const el = render();
    expect(el.querySelector('app-navigation-bar')).toBeNull();
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector('.fab')).toBeNull();
    expect(el.querySelector('.navigation-bar__title')).toBeNull();
  });

  it('navigates to /status when Close is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="compose-close"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/status']);
  });

  it('send glyphs, placeholder and keyboard are no-ops', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('[data-testid="compose-send-text"]') as HTMLButtonElement).click();
    (el.querySelector('[data-testid="compose-send"]') as HTMLButtonElement).click();
    (el.querySelector('[data-testid="compose-type"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
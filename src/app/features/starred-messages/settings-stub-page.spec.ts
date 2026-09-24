import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SettingsStubPage } from './settings-stub-page';

describe('SettingsStubPage', () => {
  let fixture: ComponentFixture<SettingsStubPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsStubPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(SettingsStubPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Settings title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(actions[0]?.querySelector('svg.navigation-bar__icon')).not.toBeNull();
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Settings');
  });

  it('renders the placeholder body', () => {
    const el = render();
    expect(el.querySelector('[data-testid="settings-page"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="settings-page"]')?.textContent?.trim()).toContain(
      'coming soon',
    );
  });

  it('navigates to /starred-messages when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/starred-messages']);
  });
});
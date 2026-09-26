import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DataStoragePage } from './data-storage-page';
import { DATA_STORAGE_ROWS } from './settings.seed';

describe('DataStoragePage', () => {
  let fixture: ComponentFixture<DataStoragePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataStoragePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(DataStoragePage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Data & Storage title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Data & Storage',
    );
  });

  it('renders one row per seeded data & storage setting', () => {
    const el = render();
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="data-storage-row"]');
    expect(rows.length).toBe(DATA_STORAGE_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Storage usage');
  });

  it('does not render the tab bar (pushed surface)', () => {
    const el = render();
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('navigates to /settings when Back is activated', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('row activation is a no-op', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    el.querySelectorAll<HTMLButtonElement>('[data-testid="data-storage-row"]')[0]?.click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
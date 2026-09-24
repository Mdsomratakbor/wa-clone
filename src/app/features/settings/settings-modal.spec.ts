import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsModal } from './settings-modal';
import { SETTINGS_ACTIONS } from './settings.seed';

describe('SettingsModal', () => {
  let fixture: ComponentFixture<SettingsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsModal],
    }).compileComponents();
  });

  it('renders the action sheet with the supplied actions', () => {
    fixture = TestBed.createComponent(SettingsModal);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('[data-testid="action-sheet-row"]');
    expect(rows.length).toBe(SETTINGS_ACTIONS.length);
    SETTINGS_ACTIONS.forEach((action) => {
      expect(el.textContent).toContain(action.label);
    });
  });

  it('re-emits the row action id', () => {
    fixture = TestBed.createComponent(SettingsModal);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const seen: string[] = [];
    fixture.componentInstance.action.subscribe((id) => seen.push(id));
    el.querySelectorAll<HTMLButtonElement>('[data-testid="action-sheet-row"]')[1].click();
    expect(seen).toEqual([SETTINGS_ACTIONS[1].id]);
  });

  it('re-emits dismiss on backdrop activation', () => {
    fixture = TestBed.createComponent(SettingsModal);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    el.querySelector<HTMLButtonElement>('[data-testid="action-sheet-backdrop"]')?.click();
    expect(dismissed).toBe(1);
  });

  it('emits dismiss on the Escape key', () => {
    fixture = TestBed.createComponent(SettingsModal);
    fixture.detectChanges();
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dismissed).toBe(1);
  });
});
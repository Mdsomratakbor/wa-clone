import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { PrefsStore } from '../../core/prefs.store';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the header: Back leading, Edit Profile title', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Edit Profile');
  });

  it('prefills Name from the settings profile and renders About + Save', () => {
    const el = render();
    expect(el.querySelector<HTMLInputElement>('[data-testid="profile-name"]')?.value).toBe('Ani');
    expect(el.querySelector('[data-testid="profile-about"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="profile-save"]')?.textContent?.trim()).toBe('Save');
  });

  // F-055 FR-002: WhatsApp-style hints under both inputs, reusing the F-054
  // description style; the inputs keep their accessible names.
  it('F-055: each field shows its hint caption under the input', () => {
    const el = render();
    const hints = el.querySelectorAll<HTMLElement>('.profile__hint');
    expect(hints.length).toBe(2);
    expect(hints[0]?.textContent?.trim()).toBe('Your name is visible to everyone');
    expect(hints[1]?.textContent?.trim()).toBe('Shown next to your name in chats');
    expect(getComputedStyle(hints[0]).fontSize).toBe('13px');
    expect(getComputedStyle(hints[0]).color).toBe('rgb(142, 142, 147)');
    expect(el.querySelector('[data-testid="profile-name"]')?.getAttribute('aria-label')).toBe(
      'Name',
    );
    expect(el.querySelector('[data-testid="profile-about"]')?.getAttribute('aria-label')).toBe(
      'About',
    );
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

  it('Save persists the drafts and returns to /settings (F-036)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const prefs = TestBed.inject(PrefsStore);
    const el = render();

    const nameInput = el.querySelector<HTMLInputElement>('[data-testid="profile-name"]');
    const aboutInput = el.querySelector<HTMLInputElement>('[data-testid="profile-about"]');
    nameInput!.value = 'Anita';
    nameInput!.dispatchEvent(new Event('input'));
    aboutInput!.value = 'Building things';
    aboutInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    (el.querySelector('[data-testid="profile-save"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(prefs.profile()).toEqual({ name: 'Anita', about: 'Building things' });
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });

  it('seeds the drafts from the stored profile (F-036)', () => {
    TestBed.inject(PrefsStore).updateProfile('Stored', 'Stored about');
    const el = render();
    expect(el.querySelector<HTMLInputElement>('[data-testid="profile-name"]')?.value).toBe('Stored');
    expect(el.querySelector<HTMLInputElement>('[data-testid="profile-about"]')?.value).toBe(
      'Stored about',
    );
  });

  it('keeps the previous name and stays put when the name is blank (F-036)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const prefs = TestBed.inject(PrefsStore);
    prefs.updateProfile('Anita', 'About');
    const el = render();

    const nameInput = el.querySelector<HTMLInputElement>('[data-testid="profile-name"]');
    nameInput!.value = '   ';
    nameInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('[data-testid="profile-save"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(prefs.profile()).toEqual({ name: 'Anita', about: 'About' });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('Back discards uncommitted drafts (F-036)', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const prefs = TestBed.inject(PrefsStore);
    const el = render();

    const nameInput = el.querySelector<HTMLInputElement>('[data-testid="profile-name"]');
    nameInput!.value = 'Draft only';
    nameInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(prefs.profile().name).toBe('Ani');
    expect(router.navigate).toHaveBeenCalledWith(['/settings']);
  });
});
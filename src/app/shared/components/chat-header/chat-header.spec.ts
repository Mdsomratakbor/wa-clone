import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactHeader } from '../../../features/chat-window/chat-window.model';
import { ChatHeader } from './chat-header';

const CONTACT: ContactHeader = {
  name: 'Martha Craig',
  subtitle: 'tap here for contact info',
  avatarRef: null,
};

describe('ChatHeader', () => {
  let fixture: ComponentFixture<ChatHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHeader],
    }).compileComponents();
  });

  it('renders the contact name and subtitle', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chat-header__name')?.textContent).toBe('Martha Craig');
    expect(el.querySelector('.chat-header__subtitle')?.textContent).toBe('tap here for contact info');
  });

  it('falls back to MC initials for a null avatar', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    const avatar = (fixture.nativeElement as HTMLElement).querySelector('app-user-avatar');
    expect((avatar?.textContent ?? '').trim()).toBe('MC');
  });

  it('emits back when the back button is activated', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.back.subscribe(() => (emitted = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.chat-header__back')
      ?.click();
    expect(emitted).toBe(true);
  });

  it('renders video call and call affordances', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-label^="Video call"]')).not.toBeNull();
    expect(el.querySelector('[aria-label^="Call"]')).not.toBeNull();
  });

  it('renders the More options affordance', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="chat-header__more"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="chat-header__more"]')?.getAttribute('aria-label')).toBe(
      'More options',
    );
  });

  it('wraps the avatar and titles in a labelled identity button', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const identity = el.querySelector<HTMLButtonElement>('[data-testid="chat-header__identity"]');
    expect(identity).not.toBeNull();
    expect(identity?.getAttribute('aria-label')).toBe('Open contact info');
    expect(identity?.querySelector('app-user-avatar')).not.toBeNull();
    expect(identity?.querySelector('.chat-header__name')?.textContent).toBe('Martha Craig');
  });

  it('emits identity when the identity button is activated', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.identity.subscribe(() => (emitted = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__identity"]')
      ?.click();
    expect(emitted).toBe(true);
  });

  it('emits actions when More options is activated', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.actions.subscribe(() => (emitted = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="chat-header__more"]')
      ?.click();
    expect(emitted).toBe(true);
  });

  it('focus() focuses the More options trigger', () => {
    fixture = TestBed.createComponent(ChatHeader);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
    fixture.componentInstance.focus();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[data-testid="chat-header__more"]',
    );
    expect(document.activeElement).toBe(trigger);
  });
});
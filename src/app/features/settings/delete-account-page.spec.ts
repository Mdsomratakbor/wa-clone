import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DeleteAccountPage } from './delete-account-page';
import { AccountStore } from '../../core/account.store';
import { ChatStore } from '../../core/chat.store';
import { PrefsStore } from '../../core/prefs.store';
import { StatusStore } from '../../core/status.store';
import { CHAT_SEED } from '../chat-list/chat-list.seed';

describe('DeleteAccountPage', () => {
  let fixture: ComponentFixture<DeleteAccountPage>;
  let account: AccountStore;
  let chats: ChatStore;
  let prefs: PrefsStore;
  let status: StatusStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DeleteAccountPage],
      providers: [provideRouter([])],
    }).compileComponents();
    account = TestBed.inject(AccountStore);
    chats = TestBed.inject(ChatStore);
    prefs = TestBed.inject(PrefsStore);
    status = TestBed.inject(StatusStore);
    account.reset();
    chats.reset();
    prefs.reset();
    status.reset();
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(DeleteAccountPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function type(el: HTMLElement, testid: string, value: string): void {
    const input = el.querySelector<HTMLInputElement>(`[data-testid="${testid}"]`);
    input!.value = value;
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('renders the pushed header with the danger button disabled (FR-004)', () => {
    const el = render();
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Delete my account',
    );
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector<HTMLButtonElement>('[data-testid="delete-account-confirm-button"]')?.disabled).toBe(
      true,
    );
  });

  it('enables the danger button only for the exact confirmation word (FR-008)', () => {
    const el = render();
    const button = el.querySelector<HTMLButtonElement>('[data-testid="delete-account-confirm-button"]');

    type(el, 'delete-account-confirm', 'delete');
    expect(button?.disabled).toBe(true);

    type(el, 'delete-account-confirm', 'DELETE');
    expect(button?.disabled).toBe(false);
  });

  it('wipes chats, prefs, statuses and the account on confirm, then shows the deleted state (FR-008)', () => {
    chats.sendMessage('chat-001', 'one last message');
    prefs.set('enterKeySends', false);
    status.publish('last status', 1);
    account.setTwoStep('123456', 'a@b.co');

    const el = render();
    type(el, 'delete-account-confirm', 'DELETE');
    (el.querySelector('[data-testid="delete-account-confirm-button"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(chats.conversations().length).toBe(CHAT_SEED.length);
    expect(prefs.prefs().enterKeySends).toBe(true);
    expect(status.myStatus()).toBeNull();
    expect(account.account().twoStep).toBeNull();
    expect(account.account().deviceNumber).toBe('');

    expect(el.querySelector('[data-testid="delete-account-deleted"]')).not.toBeNull();
    expect(el.querySelector('.navigation-bar__action')).toBeNull();
    expect(el.querySelector('[data-testid="delete-account-deleted"]')?.textContent).toContain(
      'Your account has been deleted',
    );
  });

  it('Continue exits to /chats from the deleted state (FR-008)', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    const el = render();
    type(el, 'delete-account-confirm', 'DELETE');
    (el.querySelector('[data-testid="delete-account-confirm-button"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    (el.querySelector('[data-testid="delete-account-continue"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(['/chats']);
  });

  it('does not wipe anything while the confirmation is incomplete (FR-008)', () => {
    status.publish('still here', 1);
    const el = render();
    type(el, 'delete-account-confirm', 'DE');
    (el.querySelector('[data-testid="delete-account-confirm-button"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(status.myStatus()?.text).toBe('still here');
    expect(el.querySelector('[data-testid="delete-account-deleted"]')).toBeNull();
  });
});
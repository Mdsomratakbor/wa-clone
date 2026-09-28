import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ContactPage } from './contact-page';
import { ChatStore } from '../../core/chat.store';
import { CONTACT_ROWS } from './contact-info.seed';

describe('ContactPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
      providers: [provideRouter([{ path: 'contact/:id', component: ContactPage }])],
    }).compileComponents();
    TestBed.inject(ChatStore).reset();
  });

  async function render(id: string): Promise<{ el: HTMLElement; router: Router }> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/contact/${id}`, ContactPage);
    return {
      el: harness.fixture.nativeElement as HTMLElement,
      router: TestBed.inject(Router),
    };
  }

  it('renders the header: Back leading, Edit trailing, contact name title', async () => {
    const { el } = await render('chat-001');
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(2);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(actions[1]?.textContent?.trim()).toBe('Edit');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Maximillian Jacobson',
    );
  });

  it('renders the hero with the contact name from the store', async () => {
    const { el } = await render('chat-006');
    expect(el.querySelector('[data-testid="contact-hero"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="contact-name"]')?.textContent?.trim()).toBe(
      'Martha Craig',
    );
  });

  it('reflects a store-side rename on title and hero', async () => {
    TestBed.inject(ChatStore).updateContact('chat-006', 'Martha Craig II', '+1 555');
    const { el } = await render('chat-006');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Martha Craig II',
    );
    expect(el.querySelector('[data-testid="contact-name"]')?.textContent?.trim()).toBe(
      'Martha Craig II',
    );
  });

  it('renders the Messages action and one row per seeded contact setting', async () => {
    const { el } = await render('chat-001');
    expect(el.querySelector('[data-testid="contact-messages"]')?.textContent?.trim()).toBe(
      'Messages',
    );
    const rows = el.querySelectorAll<HTMLButtonElement>('[data-testid="contact-row"]');
    expect(rows.length).toBe(CONTACT_ROWS.length);
    expect(rows[0]?.getAttribute('aria-label')).toBe('Media, photos and links');
  });

  it('does not render the tab bar (pushed surface)', async () => {
    const { el } = await render('chat-001');
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('navigates to /chat/:id when Back is activated', async () => {
    const { el, router } = await render('chat-006');
    spyOn(router, 'navigate').and.resolveTo(true);
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/chat', 'chat-006']);
  });

  it('navigates to /contact/:id/edit when Edit is activated (feature 019)', async () => {
    const { el, router } = await render('chat-006');
    spyOn(router, 'navigate').and.resolveTo(true);
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    actions[1]?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/contact', 'chat-006', 'edit']);
  });

  it('Messages opens the chat and marks it read', async () => {
    const { el, router } = await render('chat-001');
    spyOn(router, 'navigate').and.resolveTo(true);
    el.querySelector<HTMLButtonElement>('[data-testid="contact-messages"]')?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/chat', 'chat-001']);
    expect(TestBed.inject(ChatStore).conversations().find((c) => c.id === 'chat-001')?.read).toBe(
      true,
    );
  });

  it('the Starred messages row routes to /starred-messages', async () => {
    const { el, router } = await render('chat-001');
    spyOn(router, 'navigate').and.resolveTo(true);
    const rows = [...el.querySelectorAll<HTMLButtonElement>('[data-testid="contact-row"]')];
    const starred = rows.find((r) => r.getAttribute('aria-label') === 'Starred messages');
    starred?.click();
    expect(router.navigate).toHaveBeenCalledWith(['/starred-messages']);
  });

  it('Media/Groups rows remain no-ops', async () => {
    const { el, router } = await render('chat-001');
    spyOn(router, 'navigate').and.resolveTo(true);
    const rows = [...el.querySelectorAll<HTMLButtonElement>('[data-testid="contact-row"]')];
    rows[0]?.click(); // Media, photos and links
    rows[1]?.click(); // Groups
    expect(router.navigate).not.toHaveBeenCalled();
  });

  describe('group awareness (F-040 clarified)', () => {
    it('shows the group name, a participant count and the participant list', async () => {
      const store = TestBed.inject(ChatStore);
      const contacts = store.contactConversations();
      const id = store.createGroup('Weekend plans', [contacts[0].id, contacts[1].id]);
      const { el } = await render(id);

      expect(el.querySelector('[data-testid="contact-name"]')?.textContent?.trim()).toBe(
        'Weekend plans',
      );
      expect(el.querySelector('[data-testid="contact-group-count"]')?.textContent?.trim()).toBe(
        '2 participants',
      );
      const participants = [
        ...el.querySelectorAll('[data-testid="contact-participant"]'),
      ].map((node) => node.textContent?.trim());
      expect(participants).toEqual([contacts[0].contactName, contacts[1].contactName]);
    });

    it('omits the single-contact rows for a group', async () => {
      const store = TestBed.inject(ChatStore);
      const id = store.createGroup('No rows', [store.contactConversations()[0].id]);
      const { el } = await render(id);
      expect(el.querySelector('[data-testid="contact-list"]')).toBeNull();
      expect(el.querySelectorAll('[data-testid="contact-row"]').length).toBe(0);
      expect(el.querySelector('[data-testid="contact-messages"]')).not.toBeNull();
    });

    it('keeps the direct-contact rows unchanged for a direct chat', async () => {
      const { el } = await render('chat-001');
      expect(el.querySelector('[data-testid="contact-group-count"]')).toBeNull();
      expect(el.querySelector('[data-testid="contact-participants"]')).toBeNull();
      expect(el.querySelectorAll('[data-testid="contact-row"]').length).toBe(
        CONTACT_ROWS.length,
      );
    });
  });
});
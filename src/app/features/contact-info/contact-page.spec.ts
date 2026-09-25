import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ContactPage } from './contact-page';
import { CONTACT_ROWS } from './contact-info.seed';

describe('ContactPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
      providers: [provideRouter([{ path: 'contact/:id', component: ContactPage }])],
    }).compileComponents();
  });

  async function render(id: string): Promise<{ el: HTMLElement; router: Router }> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/contact/${id}`, ContactPage);
    return {
      el: harness.fixture.nativeElement as HTMLElement,
      router: TestBed.inject(Router),
    };
  }

  it('renders the header: Back leading, contact name title', async () => {
    const { el } = await render('chat-001');
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe(
      'Maximillian Jacobson',
    );
  });

  it('renders the hero with the contact name from the chat seed', async () => {
    const { el } = await render('chat-006');
    expect(el.querySelector('[data-testid="contact-hero"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="contact-name"]')?.textContent?.trim()).toBe(
      'Martha Craig',
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

  it('row and Messages actions are no-ops', async () => {
    const { el } = await render('chat-001');
    el.querySelectorAll<HTMLButtonElement>('[data-testid="contact-row"]')[0]?.click();
    el.querySelector<HTMLButtonElement>('[data-testid="contact-messages"]')?.click();
    expect(el.querySelector('[data-testid="contact-page"]')).not.toBeNull();
  });
});
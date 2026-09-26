import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { EditContactPage } from './edit-contact-page';
import { ChatStore } from '../../core/chat.store';

describe('EditContactPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditContactPage],
      providers: [provideRouter([{ path: 'contact/:id/edit', component: EditContactPage }])],
    }).compileComponents();
    TestBed.inject(ChatStore).reset();
  });

  async function render(id: string): Promise<{ el: HTMLElement; router: Router }> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/contact/${id}/edit`, EditContactPage);
    return {
      el: harness.fixture.nativeElement as HTMLElement,
      router: TestBed.inject(Router),
    };
  }

  it('renders the header: Back leading, Edit Contact title', async () => {
    const { el } = await render('chat-006');
    const actions = [...el.querySelectorAll<HTMLButtonElement>('.navigation-bar__action')];
    expect(actions.length).toBe(1);
    expect(actions[0]?.textContent?.trim()).toBe('Back');
    expect(el.querySelector('.navigation-bar__title')?.textContent?.trim()).toBe('Edit Contact');
  });

  it('prefills Name and Phone from the store and renders Save', async () => {
    TestBed.inject(ChatStore).updateContact('chat-006', 'Martha Craig', '+1 555-0100');
    const { el } = await render('chat-006');
    const name = el.querySelector<HTMLInputElement>('[data-testid="edit-contact-name"]');
    const phone = el.querySelector<HTMLInputElement>('[data-testid="edit-contact-phone"]');
    expect(name?.value).toBe('Martha Craig');
    expect(phone?.value).toBe('+1 555-0100');
    expect(el.querySelector('[data-testid="edit-contact-save"]')?.textContent?.trim()).toBe(
      'Save',
    );
  });

  it('falls back to Contact for an unknown id', async () => {
    const { el } = await render('chat-999');
    expect(
      el.querySelector<HTMLInputElement>('[data-testid="edit-contact-name"]')?.value,
    ).toBe('Contact');
  });

  it('does not render the tab bar (pushed surface)', async () => {
    const { el } = await render('chat-006');
    expect(el.querySelector('[role="tab"]')).toBeNull();
  });

  it('navigates to /contact/:id when Back is activated', async () => {
    const { el, router } = await render('chat-006');
    spyOn(router, 'navigate').and.resolveTo(true);
    (el.querySelector('.navigation-bar__action') as HTMLButtonElement).click();
    expect(router.navigate).toHaveBeenCalledWith(['/contact', 'chat-006']);
  });

  it('Save updates the contact in the store and navigates back', async () => {
    const { el, router } = await render('chat-006');
    spyOn(router, 'navigate').and.resolveTo(true);
    const name = el.querySelector<HTMLInputElement>('[data-testid="edit-contact-name"]')!;
    const phone = el.querySelector<HTMLInputElement>('[data-testid="edit-contact-phone"]')!;
    name.value = 'Martha Craig II';
    name.dispatchEvent(new Event('input'));
    phone.value = '+1 555-0100';
    phone.dispatchEvent(new Event('input'));
    el.querySelector<HTMLButtonElement>('[data-testid="edit-contact-save"]')?.click();

    const store = TestBed.inject(ChatStore);
    expect(store.contactName('chat-006')).toBe('Martha Craig II');
    expect(store.contactPhone('chat-006')).toBe('+1 555-0100');
    expect(router.navigate).toHaveBeenCalledWith(['/contact', 'chat-006']);
  });

  it('Save with a blank name keeps the previous name', async () => {
    const { el, router } = await render('chat-006');
    spyOn(router, 'navigate').and.resolveTo(true);
    const name = el.querySelector<HTMLInputElement>('[data-testid="edit-contact-name"]')!;
    name.value = '   ';
    name.dispatchEvent(new Event('input'));
    el.querySelector<HTMLButtonElement>('[data-testid="edit-contact-save"]')?.click();

    expect(TestBed.inject(ChatStore).contactName('chat-006')).toBe('Martha Craig');
    expect(router.navigate).toHaveBeenCalledWith(['/contact', 'chat-006']);
  });
});
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { EditContactPage } from './edit-contact-page';

describe('EditContactPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditContactPage],
      providers: [provideRouter([{ path: 'contact/:id/edit', component: EditContactPage }])],
    }).compileComponents();
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

  it('prefills Name with the contact from the chat seed and renders Phone + Save', async () => {
    const { el } = await render('chat-006');
    const name = el.querySelector<HTMLInputElement>('[data-testid="edit-contact-name"]');
    expect(name?.value).toBe('Martha Craig');
    expect(el.querySelector('[data-testid="edit-contact-phone"]')).not.toBeNull();
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

  it('Save is a no-op', async () => {
    const { el, router } = await render('chat-006');
    spyOn(router, 'navigate').and.resolveTo(true);
    (el.querySelector('[data-testid="edit-contact-save"]') as HTMLButtonElement).click();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Composer, AttachmentDraft } from './composer';
import { PrefsStore } from '../../../core/prefs.store';
import { FileInfo } from '../../../features/chat-window/chat-window.model';

describe('Composer', () => {
  let fixture: ComponentFixture<Composer>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Composer],
      providers: [provideRouter([])],
    }).compileComponents();
    TestBed.inject(PrefsStore).reset();
  });

  it('renders the composer controls', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.composer__add')).not.toBeNull();
    expect(el.querySelector('.composer__sticker')).not.toBeNull();
    expect(el.querySelector('.composer__camera')).not.toBeNull();
    expect(el.querySelector('.composer__mic')).not.toBeNull();
  });

  it('provides an empty text input without placeholder', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input.composer__input',
    );
    expect(input).not.toBeNull();
    expect(input?.placeholder).toBe('');
  });

  it('accepts typed text locally', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input.composer__input',
    );
    input!.value = 'hello';
    input!.dispatchEvent(new Event('input'));
    expect(input!.value).toBe('hello');
  });

  it('reveals Send when the draft is non-empty and hides the mic', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
    expect(el.querySelector('.composer__mic')).not.toBeNull();

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = 'hello';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();
    expect(el.querySelector('.composer__mic')).toBeNull();
  });

  it('returns to mic when the draft is emptied', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = 'hello';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();

    input!.value = '';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
    expect(el.querySelector('.composer__mic')).not.toBeNull();
  });

  it('emits the trimmed text and clears the draft on Send', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let sent: string | undefined;
    fixture.componentInstance.send.subscribe((v: string) => (sent = v));

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = '  hello tokyo  ';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (el.querySelector('[aria-label="Send message"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(sent).toBe('hello tokyo');
    expect(input!.value).toBe('');
    expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
  });

  it('sends on Enter and drops blank drafts', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let sent: string | undefined;
    fixture.componentInstance.send.subscribe((v: string) => (sent = v));

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = '  ';
    input!.dispatchEvent(new Event('input'));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(sent).toBeUndefined();

    input!.value = 'go';
    input!.dispatchEvent(new Event('input'));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(sent).toBe('go');
    expect(input!.value).toBe('');
  });

  it('keeps Enter inert when the Enter key sends toggle is off', () => {
    TestBed.inject(PrefsStore).set('enterKeySends', false);
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    let sent: string | undefined;
    fixture.componentInstance.send.subscribe((v: string) => (sent = v));

    const input = el.querySelector<HTMLInputElement>('input.composer__input');
    input!.value = 'go';
    input!.dispatchEvent(new Event('input'));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(sent).toBeUndefined();
    expect(input!.value).toBe('go');
    expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();
  });

  it('exposes an accessible toolbar role', () => {
    fixture = TestBed.createComponent(Composer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.composer')?.getAttribute('role')).toBe('toolbar');
    expect(el.querySelector('.composer')?.getAttribute('aria-label')).toBe('Message composer');
  });

  describe('F-046 FR-004: every control is wired or honestly disabled', () => {
    function control(fixture: ComponentFixture<Composer>, label: string): HTMLButtonElement {
      return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        `[aria-label="${label}"]`,
      )!;
    }

    it('routes Camera to the existing camera screen', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const camera = control(fixture, 'Camera');
      expect(camera.disabled).toBe(false);
      camera.click();
      fixture.detectChanges();
      expect(navSpy).toHaveBeenCalledWith(['/camera']);
    });

    // F-058 wound Add attachment: it opens the attachment sheet (tests below), so
    // the F-046 disabled set is exactly the two controls whose destinations are a
    // separate feature.
    ['Emoji stickers', 'Record audio'].forEach((label) => {
      it(`renders ${label} as a genuinely disabled control`, () => {
        fixture = TestBed.createComponent(Composer);
        fixture.detectChanges();
        const button = control(fixture, label);
        expect(button).not.toBeNull();
        expect(button.textContent).toBe('');
        expect(button.getAttribute('aria-label')).toBe(label);
        expect(button.disabled).toBe(true);
      });
    });

    it('emits nothing when a disabled control is activated by mouse or keyboard', () => {
      const router = TestBed.inject(Router);
      const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      let sent: string | undefined;
      let attachment: AttachmentDraft | undefined;
      fixture.componentInstance.send.subscribe((v: string) => (sent = v));
      fixture.componentInstance.sendAttachment.subscribe((v: AttachmentDraft) => (attachment = v));
      ['Emoji stickers', 'Record audio'].forEach((label) => {
        const button = control(fixture, label);
        button.click();
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      });
      fixture.detectChanges();
      expect(sent).toBeUndefined();
      expect(attachment).toBeUndefined();
      expect(navSpy).not.toHaveBeenCalled();
    });

    it('leaves the live Send path working alongside the disabled controls', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const input = el.querySelector<HTMLInputElement>('input.composer__input')!;
      input.value = 'hello';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      let sent: string | undefined;
      fixture.componentInstance.send.subscribe((v: string) => (sent = v));
      el.querySelector<HTMLButtonElement>('[aria-label="Send message"]')?.click();
      fixture.detectChanges();
      expect(sent).toBe('hello');
    });
  });

  describe('F-058 FR-001..FR-005: attachment pipeline', () => {
    function chooseInput(el: HTMLElement, testid: string, file: File): void {
      const input = el.querySelector<HTMLInputElement>(`[data-testid="${testid}"]`)!;
      input.files = (() => {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        return transfer.files;
      })();
      input.dispatchEvent(new Event('change'));
    }

    it('re-enables Add attachment and opens a sheet offering exactly photos and a document', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const add = el.querySelector<HTMLButtonElement>('[aria-label="Add attachment"]')!;
      expect(add.disabled).toBe(false);

      add.click();
      fixture.detectChanges();

      const rows = [...el.querySelectorAll('[data-testid="action-sheet-row"]')].map(
        (row) => row.textContent?.trim(),
      );
      expect(rows).toEqual(['Photos & Videos', 'Document']);
    });

    it('dismisses the sheet with Escape', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      el.querySelector<HTMLButtonElement>('[aria-label="Add attachment"]')!.click();
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="action-sheet"]')).toBeNull();
    });

    it('decodes a picked photo into a removable pending preview (FR-002, FR-004)', async () => {
      fixture = TestBed.createComponent(Composer);
      fixture.componentInstance.decodePhoto = jasmine
        .createSpy('decodePhoto')
        .and.resolveTo('data:image/jpeg;base64,PHOTO');
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;

      chooseInput(el, 'composer-photo-input', new File(['x'], 'IMG_0475.png', { type: 'image/png' }));
      await fixture.whenStable();
      fixture.detectChanges();

      const thumb = el.querySelector<HTMLImageElement>('[data-testid="composer-pending-thumb"]');
      expect(thumb).not.toBeNull();
      expect(thumb?.getAttribute('src')).toBe('data:image/jpeg;base64,PHOTO');
      expect(el.querySelector('[data-testid="composer-pending-name"]')?.textContent?.trim()).toBe(
        'IMG_0475.jpg',
      );
      // A pending file makes Send reachable even with a blank draft.
      expect(el.querySelector('[aria-label="Send message"]')).not.toBeNull();
      expect(el.querySelector('.composer__mic')).toBeNull();
    });

    it('leaves the pending state empty when a photo fails to decode (FR-002)', async () => {
      fixture = TestBed.createComponent(Composer);
      fixture.componentInstance.decodePhoto = jasmine.createSpy('decodePhoto').and.resolveTo(null);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;

      chooseInput(el, 'composer-photo-input', new File(['broken'], 'broken.jpg', { type: 'image/jpeg' }));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(el.querySelector('[data-testid="composer-pending"]')).toBeNull();
      expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
    });

    it('holds a picked document as metadata only (FR-003)', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;

      chooseInput(el, 'composer-doc-input', new File(['x'.repeat(2048)], 'notes.pdf', { type: 'application/pdf' }));
      fixture.detectChanges();

      expect(el.querySelector('[data-testid="composer-pending-name"]')?.textContent?.trim()).toBe('notes.pdf');
      expect(el.querySelector('[data-testid="composer-pending-size"]')?.textContent?.trim()).toBe('2 KB');
      expect(el.querySelector('[data-testid="composer-pending-thumb"]')).toBeNull();
    });

    it('removes the attachment but keeps the draft text (FR-004)', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const input = el.querySelector<HTMLInputElement>('input.composer__input')!;
      input.value = 'caption draft';
      input.dispatchEvent(new Event('input'));

      chooseInput(el, 'composer-doc-input', new File(['x'], 'notes.pdf', { type: 'application/pdf' }));
      fixture.detectChanges();
      expect(el.querySelector('[data-testid="composer-pending"]')).not.toBeNull();

      el.querySelector<HTMLButtonElement>('[data-testid="composer-pending-remove"]')!.click();
      fixture.detectChanges();

      expect(el.querySelector('[data-testid="composer-pending"]')).toBeNull();
      expect(input.value).toBe('caption draft');
    });

    it('sends the caption and file together and clears both (FR-004, FR-005)', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const input = el.querySelector<HTMLInputElement>('input.composer__input')!;
      input.value = '  the report  ';
      input.dispatchEvent(new Event('input'));
      chooseInput(el, 'composer-doc-input', new File(['x'], 'notes.pdf', { type: 'application/pdf' }));
      fixture.detectChanges();

      let draft: AttachmentDraft | undefined;
      fixture.componentInstance.sendAttachment.subscribe((v: AttachmentDraft) => (draft = v));

      el.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click();
      fixture.detectChanges();

      const expectedFile: FileInfo = { filename: 'notes', ext: 'pdf', size: '1 B' };
      expect(draft).toEqual({ text: 'the report', file: expectedFile });
      expect(el.querySelector('[data-testid="composer-pending"]')).toBeNull();
      expect(input.value).toBe('');
      expect(el.querySelector('[aria-label="Send message"]')).toBeNull();
    });

    it('sends a file-only message when the draft is blank (FR-005)', () => {
      fixture = TestBed.createComponent(Composer);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      chooseInput(el, 'composer-doc-input', new File(['x'], 'notes.pdf', { type: 'application/pdf' }));
      fixture.detectChanges();

      let draft: AttachmentDraft | undefined;
      fixture.componentInstance.sendAttachment.subscribe((v: AttachmentDraft) => (draft = v));
      el.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click();
      fixture.detectChanges();

      expect(draft?.text).toBe('');
      expect(draft?.file.filename).toBe('notes');
    });
  });
});
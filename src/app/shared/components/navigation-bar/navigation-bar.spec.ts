import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavAction } from '../../../features/chat-list/chat.model';
import { NavigationBar } from './navigation-bar';

@Component({
  standalone: true,
  imports: [NavigationBar],
  template: `
    <app-navigation-bar title="" [leading]="leading" [trailing]="trailing">
      <div data-nav-center data-testid="center-slot">SEGMENT</div>
    </app-navigation-bar>
  `,
})
class HostComponent {
  leading: readonly NavAction[] = [{ id: 'edit', label: 'Edit' }];
  trailing: readonly NavAction[] = [{ id: 'new-call', label: 'New call', icon: 'new-call' }];
}

describe('NavigationBar', () => {
  describe('existing contract (title + text actions)', () => {
    let fixture: ComponentFixture<NavigationBar>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NavigationBar],
      }).compileComponents();
    });

    it('renders title and actions', () => {
      fixture = TestBed.createComponent(NavigationBar);
      fixture.componentRef.setInput('title', 'Chats');
      fixture.componentRef.setInput('leading', [
        { id: 'broadcast-lists', label: 'Broadcast Lists' },
        { id: 'new-group', label: 'New Group' },
      ] satisfies NavAction[]);
      fixture.componentRef.setInput('trailing', [{ id: 'edit', label: 'Edit' }] satisfies NavAction[]);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.navigation-bar__title')?.textContent).toBe('Chats');
      const labels = [...el.querySelectorAll('.navigation-bar__action')].map((n) =>
        n.textContent?.trim(),
      );
      expect(labels).toEqual(['Broadcast Lists', 'New Group', 'Edit']);
    });

    it('emits the action id on click', () => {
      fixture = TestBed.createComponent(NavigationBar);
      fixture.componentRef.setInput('title', 'Chats');
      fixture.componentRef.setInput('trailing', [{ id: 'edit', label: 'Edit' }] satisfies NavAction[]);
      fixture.detectChanges();
      let emitted: string | undefined;
      fixture.componentInstance.action.subscribe((v) => (emitted = v));
      const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.navigation-bar__action',
      ) as NodeListOf<HTMLButtonElement>;
      buttons[0].click();
      expect(emitted).toBe('edit');
    });

    it('actions are keyboard-focusable buttons', () => {
      fixture = TestBed.createComponent(NavigationBar);
      fixture.componentRef.setInput('title', 'Chats');
      fixture.componentRef.setInput('trailing', [{ id: 'edit', label: 'Edit' }] satisfies NavAction[]);
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector(
        '.navigation-bar__action',
      ) as HTMLButtonElement;
      expect(button?.tagName).toBe('BUTTON');
      expect(button?.tabIndex).toBe(0);
    });
  });

  describe('extended contract (feature 004)', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    });

    it('omits the title when empty and projects centre content', () => {
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.navigation-bar__title')).toBeNull();
      expect(el.querySelector('[data-testid="center-slot"]')?.textContent).toBe('SEGMENT');
    });

    it('renders an icon-only trailing action with a label', () => {
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const button = el.querySelector('.navigation-bar__group--trailing .navigation-bar__action');
      expect(button?.getAttribute('aria-label')).toBe('New call');
      expect(button?.querySelector('.navigation-bar__icon')).not.toBeNull();
      expect(button?.getAttribute('aria-label')).not.toBeNull();
    });
  });
});
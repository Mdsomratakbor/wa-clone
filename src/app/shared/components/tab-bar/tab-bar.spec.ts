import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabBar } from './tab-bar';
import { TabItem, TabKey } from '../../../features/chat-list/chat.model';

const ITEMS: TabItem[] = [
  { key: 'settings', label: 'Settings', active: false },
  { key: 'chats', label: 'Chats', active: true },
  { key: 'camera', label: 'Camera', active: false },
  { key: 'calls', label: 'Calls', active: false },
  { key: 'status', label: 'Status', active: false },
];

describe('TabBar', () => {
  let fixture: ComponentFixture<TabBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabBar],
    }).compileComponents();
  });

  it('renders one tab per item', () => {
    fixture = TestBed.createComponent(TabBar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(5);
  });

  it('marks the active tab', () => {
    fixture = TestBed.createComponent(TabBar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    const active = fixture.nativeElement.querySelector('.tab-bar__item--active');
    expect(active?.textContent?.trim()).toContain('Chats');
  });

  it('emits the tab key when selected', () => {
    fixture = TestBed.createComponent(TabBar);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    let emitted: TabKey | undefined;
    fixture.componentInstance.select.subscribe((v) => (emitted = v));
    const tabs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    tabs[3].click();
    expect(emitted).toBe('calls');
  });
});
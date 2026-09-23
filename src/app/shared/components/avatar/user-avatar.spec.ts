import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  let fixture: ComponentFixture<UserAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatar],
    }).compileComponents();
  });

  it('renders initials when no image source', () => {
    fixture = TestBed.createComponent(UserAvatar);
    fixture.componentRef.setInput('name', 'Maximillian Jacobson');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="img"]')?.textContent?.trim()).toBe('MJ');
    expect(el.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Maximillian Jacobson avatar',
    );
  });

  it('renders an image when a source is provided', () => {
    fixture = TestBed.createComponent(UserAvatar);
    fixture.componentRef.setInput('name', 'Maximillian Jacobson');
    fixture.componentRef.setInput('src', 'https://example.com/a.png');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://example.com/a.png');
  });

  it('falls back to initials when the image errors', () => {
    fixture = TestBed.createComponent(UserAvatar);
    fixture.componentRef.setInput('name', 'Maximillian Jacobson');
    fixture.componentRef.setInput('src', 'https://example.com/broken.png');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.user-avatar--initials')).not.toBeNull();
  });
});
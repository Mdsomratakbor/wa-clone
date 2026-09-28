// F-041: the chat-text scale is a scoped custom-property override. These tests
// assert the resolved computed values, not the stylesheet text, so a broken
// calc() or a leaked :root bump fails here.
import type { FontScale } from '../prefs.store';

describe('font scale token scope', () => {
  function px(value: string): number {
    return Number.parseFloat(value);
  }

  function probe(ancestorScale: FontScale | null, token: string): number {
    const host = document.createElement('div');
    if (ancestorScale !== null) {
      host.setAttribute('data-font-scale', ancestorScale);
    }
    const child = document.createElement('span');
    child.style.fontSize = `var(${token})`;
    host.appendChild(child);
    document.body.appendChild(host);
    try {
      return px(getComputedStyle(child).fontSize);
    } finally {
      host.remove();
    }
  }

  afterEach(() => {
    document.querySelectorAll('[data-font-scale]').forEach((el) => el.remove());
  });

  it('emits the captured chat-text values at the root (FR-010)', () => {
    expect(px(getComputedStyle(document.documentElement).getPropertyValue('--wa-fs-message'))).toBe(16);
    expect(px(getComputedStyle(document.documentElement).getPropertyValue('--wa-fs-bubble-time'))).toBe(11);
    expect(px(getComputedStyle(document.documentElement).getPropertyValue('--wa-fs-date'))).toBe(12);
    expect(px(getComputedStyle(document.documentElement).getPropertyValue('--wa-fs-preview'))).toBe(14);
    expect(px(getComputedStyle(document.documentElement).getPropertyValue('--wa-fs-chat-title'))).toBe(16);
  });

  it('leaves non-chat chrome tokens alone in a scale scope (FR-012)', () => {
    const outside = probe(null, '--wa-fs-message');
    const inside = probe('large', '--wa-fs-message');
    expect(outside).toBe(16);
    expect(inside).toBeGreaterThan(outside);

    // Nav/chrome tokens must resolve to the same value inside and outside.
    for (const token of ['--wa-fs-nav-title', '--wa-fs-tab', '--wa-fs-status-time', '--wa-fs-control']) {
      expect(probe('extra-large', token)).toBe(probe(null, token));
    }
  });

  it('resolves every scaled token inside a scale scope (FR-010, FR-011)', () => {
    const factors: Readonly<Record<FontScale, number>> = {
      small: 0.85,
      default: 1,
      large: 1.15,
      'extra-large': 1.3,
    };
    const bases: Readonly<Record<string, number>> = {
      '--wa-fs-message': 16,
      '--wa-fs-bubble-time': 11,
      '--wa-fs-date': 12,
      '--wa-fs-preview': 14,
      '--wa-fs-chat-title': 16,
    };
    for (const [step, factor] of Object.entries(factors)) {
      for (const [token, base] of Object.entries(bases)) {
        expect(probe(step as FontScale, token))
          .withContext(`${step} ${token}`)
          .toBeCloseTo(base * factor, 1);
      }
    }
  });

  it('scales monotonically: small < default < large < extra-large (FR-011)', () => {
    const sizes = (['small', 'default', 'large', 'extra-large'] as const).map((step) =>
      probe(step, '--wa-fs-message'),
    );
    expect(sizes[0]).toBeLessThan(sizes[1] as number);
    expect(sizes[1]).toBeLessThan(sizes[2] as number);
    expect(sizes[2]).toBeLessThan(sizes[3] as number);
  });

  it('renders the default step identically to the unscoped value (FR-010)', () => {
    expect(probe('default', '--wa-fs-message')).toBeCloseTo(probe(null, '--wa-fs-message'), 1);
    expect(probe('default', '--wa-fs-preview')).toBeCloseTo(probe(null, '--wa-fs-preview'), 1);
    expect(probe('default', '--wa-fs-chat-title')).toBeCloseTo(probe(null, '--wa-fs-chat-title'), 1);
  });
});

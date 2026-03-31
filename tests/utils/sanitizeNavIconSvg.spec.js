import { describe, it, expect } from 'vitest';
import { sanitizeNavIconSvg } from '../../src/utils/safeHtml';
import { ICONS } from '../../src/layouts/components/sidebarConfig.js';

describe('sanitizeNavIconSvg', () => {
  it('preserves dashboard icon fragment (rects) for sidebar SVG host', () => {
    const out = sanitizeNavIconSvg(ICONS.dashboard);
    expect(out).toContain('<rect');
    expect(out.length).toBeGreaterThan(10);
  });

  it('preserves polygon (star icon)', () => {
    const out = sanitizeNavIconSvg(ICONS.star);
    expect(out).toContain('<polygon');
  });

  it('strips script injection in fragment', () => {
    const out = sanitizeNavIconSvg('<script>alert(1)</script><circle cx="12" cy="12" r="10"></circle>');
    expect(out.toLowerCase()).not.toContain('script');
    expect(out).toContain('circle');
  });

  it('returns empty for empty input', () => {
    expect(sanitizeNavIconSvg('')).toBe('');
    expect(sanitizeNavIconSvg(null)).toBe('');
  });
});

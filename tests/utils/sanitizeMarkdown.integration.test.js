/**
 * Real DOMPurify + marked path (no mocks) — contract tests for API-derived markdown.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeMarkdown } from '../../src/utils/safeHtml';

describe('sanitizeMarkdown integration (real DOMPurify + marked)', () => {
  it('removes script tags from raw HTML in markdown', () => {
    const out = sanitizeMarkdown('Hello <script>alert(1)</script> world');
    expect(out.toLowerCase()).not.toContain('<script');
    expect(out).toMatch(/Hello/i);
  });

  it('does not preserve javascript: URLs from markdown links', () => {
    const out = sanitizeMarkdown('[click](javascript:alert(1))');
    expect(out.toLowerCase()).not.toMatch(/javascript\s*:/);
  });

  it('strips event handler attributes from HTML embedded in markdown', () => {
    const out = sanitizeMarkdown('<div onclick="alert(1)">x</div>');
    expect(out.toLowerCase()).not.toContain('onclick');
  });

  it('allows benign markdown structure after sanitization', () => {
    const out = sanitizeMarkdown('**bold** and [safe](https://example.com/path)');
    expect(out).toContain('bold');
    expect(out.toLowerCase()).toContain('https://example.com/path');
  });
});

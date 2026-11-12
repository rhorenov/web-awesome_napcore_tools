import { describe, expect, it } from 'vitest';
import { isPostVisible } from '@/core/utils/postVisibility';

const now = new Date('2026-06-01T12:00:00Z').getTime();

describe('isPostVisible', () => {
  it('shows a post without a publish date', () => {
    expect(isPostVisible({}, now, false)).toBe(true);
  });

  it('hides a draft, even in preview mode', () => {
    expect(isPostVisible({ published: false }, now, false)).toBe(false);
    expect(isPostVisible({ published: false }, now, true)).toBe(false);
  });

  it('hides a scheduled post until its publish date', () => {
    expect(isPostVisible({ publishDate: '2026-07-01' }, now, false)).toBe(false);
    expect(isPostVisible({ publishDate: '2026-05-01' }, now, false)).toBe(true);
    expect(isPostVisible({ publishDate: new Date('2026-07-01') }, now, false)).toBe(false);
  });

  it('shows a scheduled post in preview mode', () => {
    expect(isPostVisible({ publishDate: '2026-07-01' }, now, true)).toBe(true);
  });
});

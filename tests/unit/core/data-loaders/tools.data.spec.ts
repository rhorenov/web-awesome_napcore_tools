import { describe, it, expect, vi } from 'vitest';

// Mock the toolValidation module BEFORE importing the loader
vi.mock('@/core/validation/tools', () => ({
  validateToolWithCache: vi.fn((data, _file) => ({
    valid: !!(data.title && data.categories),
    errors: [],
    warnings: [],
  })),
}));

// Now import after mocking
import toolsDataLoader from '@/core/data-loaders/tools.data';

// tests/setup.ts mocks the loader module wholesale; the publiccode helpers are pure, so test the real ones
const { publiccodeMaintainers, toolFromPubliccode } = await vi.importActual<
  typeof import('@/core/data-loaders/tools.data')
>('@/core/data-loaders/tools.data');

describe('tools.data', () => {
  describe('Tool Loading', () => {
    it('should load tools successfully', () => {
      const tools = toolsDataLoader.load();

      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have required fields on each tool', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(tool).toHaveProperty('slug');
        expect(tool).toHaveProperty('title');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('categories');
        expect(tool).toHaveProperty('status');
      });
    });

    it('should have string slug from filename', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(typeof tool.slug).toBe('string');
        expect(tool.slug.length).toBeGreaterThan(0);
        // Slug should not contain .md extension
        expect(tool.slug).not.toContain('.md');
      });
    });

    it('should have title as non-empty string', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(typeof tool.title).toBe('string');
        expect(tool.title.length).toBeGreaterThan(0);
      });
    });

    it('should have categories as array', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(Array.isArray(tool.categories)).toBe(true);
        expect(tool.categories.length).toBeGreaterThan(0);

        // All category items should be strings
        tool.categories.forEach((cat) => {
          expect(typeof cat).toBe('string');
        });
      });
    });

    it('should have status field with valid value', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(typeof tool.status).toBe('string');
      });
    });

    it('should handle optional fields correctly', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        // Optional string fields should be string, null, or undefined
        if (tool.license !== undefined && tool.license !== null) {
          expect(typeof tool.license).toBe('string');
        }
        if (tool.repository !== undefined && tool.repository !== null) {
          expect(typeof tool.repository).toBe('string');
        }
        if (tool.website !== undefined && tool.website !== null) {
          expect(typeof tool.website).toBe('string');
        }
        if (tool.documentation !== undefined && tool.documentation !== null) {
          expect(typeof tool.documentation).toBe('string');
        }
      });
    });

    it('should have standards as array (empty is valid)', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(Array.isArray(tool.standards)).toBe(true);
      });
    });

    it('should have tags as array (empty is valid)', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(Array.isArray(tool.tags)).toBe(true);
      });
    });
  });

  describe('Tool Data Consistency', () => {
    it('should not have duplicate slugs', () => {
      const tools = toolsDataLoader.load();
      const slugs = tools.map((t) => t.slug);
      const uniqueSlugs = new Set(slugs);

      expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('should have unique titles or at least different slugs', () => {
      const tools = toolsDataLoader.load();
      const slugs = tools.map((t) => t.slug);
      const uniqueSlugs = new Set(slugs);

      expect(slugs.length).toBe(uniqueSlugs.size);
    });

    it('should have meaningful descriptions (non-empty or handled gracefully)', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(typeof tool.description).toBe('string');
        // Description can be empty, but should be a string
      });
    });
  });

  describe('Tool Category Association', () => {
    it('should have at least one category per tool', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(tool.categories.length).toBeGreaterThan(0);
      });
    });

    it('should have valid category values', () => {
      const tools = toolsDataLoader.load();
      const allCategories = new Set<string>();

      tools.forEach((tool) => {
        tool.categories.forEach((cat) => {
          allCategories.add(cat);
        });
      });

      // Categories should be non-empty strings
      allCategories.forEach((cat) => {
        expect(typeof cat).toBe('string');
        expect(cat.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tool Standards Association', () => {
    it('should have standards as array (even if empty)', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        expect(Array.isArray(tool.standards)).toBe(true);
      });
    });

    it('should have valid standard values when present', () => {
      const tools = toolsDataLoader.load();

      tools.forEach((tool) => {
        if (tool.standards && tool.standards.length > 0) {
          tool.standards.forEach((standard) => {
            expect(typeof standard).toBe('string');
            expect(standard.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe('publiccode maintainers', () => {
    const names = (maintenance: Record<string, unknown>) => publiccodeMaintainers(maintenance).map((m) => m.name);

    it('lists all named contacts in maintainedBy', () => {
      const tool = toolFromPubliccode('otp', undefined, {
        name: 'OpenTripPlanner',
        maintenance: {
          contacts: [
            { name: 'Andrew Byrd' },
            { name: 'Thomas Gran', affiliation: 'Entur AS' },
            { name: 'Leonard Ehrenfried' },
          ],
        },
      });
      expect(tool?.maintainedBy).toBe('Andrew Byrd, Thomas Gran, Leonard Ehrenfried');
    });

    it('caps the list at five names', () => {
      const contacts = Array.from({ length: 7 }, (_, i) => ({ name: `M${i + 1}` }));
      expect(toolFromPubliccode('x', undefined, { maintenance: { contacts } })?.maintainedBy).toBe(
        'M1, M2, M3, M4, M5 +2 more'
      );
    });

    it('falls back to contractors when there are no contacts', () => {
      expect(names({ contacts: [], contractors: [{ name: 'Acme Ltd' }] })).toEqual(['Acme Ltd']);
    });

    it('skips entries without a name', () => {
      expect(names({ contacts: [{ email: 'x@example.com' }, { name: '  ' }, { name: 'Alice' }] })).toEqual(['Alice']);
    });

    it('leaves maintainedBy undefined without a maintenance block', () => {
      expect(publiccodeMaintainers(undefined)).toEqual([]);
      expect(toolFromPubliccode('x', undefined, {})?.maintainedBy).toBeUndefined();
    });

    it('lets a registry override win', () => {
      const tool = toolFromPubliccode('x', { maintainedBy: 'NAPCORE' }, { maintenance: { contacts: [{ name: 'A' }] } });
      expect(tool?.maintainedBy).toBe('NAPCORE');
    });
  });
});

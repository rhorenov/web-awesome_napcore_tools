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
const { PUBLICCODE_LIMITS, loadPubliccode, publiccodeMaintainers, sanitisePubliccode, toolFromPubliccode } =
  await vi.importActual<typeof import('@/core/data-loaders/tools.data')>('@/core/data-loaders/tools.data');

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

  describe('publiccode sanitisation', () => {
    const sanitise = (record: Record<string, unknown>) => {
      const cuts: string[] = [];
      return { result: sanitisePubliccode(record, (msg) => cuts.push(msg)), cuts };
    };

    it('returns a normal record unchanged, without reports', () => {
      const record = {
        name: 'OpenTripPlanner',
        url: 'https://github.com/opentripplanner/opentripplanner',
        logo: 'docs/logo.svg',
        tags: ['routing', 'gtfs'],
        maintenance: { type: 'community', contacts: [{ name: 'Andrew Byrd', email: 'andrew@fastmail.net' }] },
      };
      const { result, cuts } = sanitise(record);
      expect(result).toEqual(record);
      expect(cuts).toEqual([]);
    });

    it('does not modify its input', () => {
      const record = { tags: Array.from({ length: 60 }, (_, i) => `t${i}`) };
      sanitise(record);
      expect(record.tags).toHaveLength(60);
    });

    it('caps arrays at the item limit, at any depth', () => {
      const contacts = Array.from({ length: 73 }, (_, i) => ({ name: `M${i}` }));
      const { result, cuts } = sanitise({ maintenance: { contacts } });
      const kept = (result.maintenance as { contacts: unknown[] }).contacts;
      expect(kept).toHaveLength(PUBLICCODE_LIMITS.arrayItems);
      expect(cuts).toEqual(['maintenance.contacts truncated (73 → 50 items)']);
    });

    it('caps string length', () => {
      const { result, cuts } = sanitise({ name: 'x'.repeat(PUBLICCODE_LIMITS.stringLength + 5) });
      expect(result.name).toHaveLength(PUBLICCODE_LIMITS.stringLength);
      expect(cuts).toHaveLength(1);
    });

    it('caps the number of keys per object', () => {
      const description = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`l${i}`, {}]));
      const { result, cuts } = sanitise({ description });
      expect(Object.keys(result.description as object)).toHaveLength(PUBLICCODE_LIMITS.objectKeys);
      expect(cuts).toEqual(['description truncated (60 → 50 keys)']);
    });

    it('drops values nested deeper than the depth limit', () => {
      let deep: Record<string, unknown> = { leaf: 'x' };
      for (let i = 0; i < PUBLICCODE_LIMITS.depth + 2; i++) deep = { a: deep };
      const { cuts } = sanitise(deep);
      expect(cuts).toHaveLength(1);
      expect(cuts[0]).toMatch(/dropped \(nested deeper than 10 levels\)$/);
    });

    it('drops URLs with a scheme other than http(s)', () => {
      const { result, cuts } = sanitise({
        roadmap: 'javascript:alert(1)',
        landingURL: ' java\tscript:alert(1)',
        organisation: { name: 'Org', uri: 'data:text/html,x' },
        description: { en: { screenshots: ['https://example.com/a.png', 'img/b.png', 'vbscript:x'] } },
        url: 'https://github.com/x/y',
      });
      expect(result).toEqual({
        organisation: { name: 'Org' },
        description: { en: { screenshots: ['https://example.com/a.png', 'img/b.png'] } },
        url: 'https://github.com/x/y',
      });
      expect(cuts).toHaveLength(4);
    });

    it('drops a __proto__ key', () => {
      const { result, cuts } = sanitise(JSON.parse('{"__proto__": {"polluted": true}, "name": "x"}'));
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(result).toEqual({ name: 'x' });
      expect(cuts).toEqual(['__proto__ dropped (reserved key)']);
    });

    it('loadPubliccode returns a sanitised record, or null for a missing file', () => {
      expect(loadPubliccode('open_trip_planner')?.name).toBe('OpenTripPlanner');
      expect(loadPubliccode('does-not-exist')).toBeNull();
    });
  });
});

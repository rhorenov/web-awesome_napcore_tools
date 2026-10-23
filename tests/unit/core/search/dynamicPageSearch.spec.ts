import { afterEach, describe, expect, it, vi } from 'vitest';
import categoriesDataLoader from '@/core/data-loaders/categories.data';
import standardsDataLoader, { type Standard } from '@/core/data-loaders/standards.data';
import {
  splitCategoryIntoSections,
  splitDynamicPageIntoSections,
  splitStandardIntoSections,
} from '@/core/search/dynamicPageSearch';

// Data loaders are mocked in tests/setup.ts (validators/converters, datex-ii/netex).

describe('dynamicPageSearch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('indexes a generated category page with its description and related titles', () => {
    vi.spyOn(categoriesDataLoader, 'load').mockReturnValue({
      'data-aggregators': {
        title: 'Data Aggregators',
        icon: '📡',
        description: 'Collect and redistribute feeds',
        related: ['converters'],
      },
      converters: { title: 'Converters & Transformers', icon: '⇄', description: 'Conversion' },
    });

    const sections = splitCategoryIntoSections('/repo/docs/categories/data-aggregators.md');
    expect(sections).toEqual([
      { anchor: '', titles: ['Data Aggregators'], text: expect.stringContaining('redistribute') },
    ]);
    expect(sections![0].text).toContain('Converters & Transformers');
  });

  it('indexes a generated standard page with its fields and related titles', () => {
    vi.spyOn(standardsDataLoader, 'load').mockReturnValue({
      netex: {
        title: 'NeTEx',
        longTitle: 'Network Timetable Exchange',
        purpose: 'Public transport schedules',
        related_standards: ['siri'],
      } as Standard,
      siri: { title: 'SIRI' } as Standard,
    });

    const sections = splitStandardIntoSections('C:\\repo\\docs\\standards\\netex.md');
    expect(sections).toHaveLength(1);
    expect(sections![0].titles).toEqual(['NeTEx']);
    expect(sections![0].text).toContain('Network Timetable Exchange');
    expect(sections![0].text).toContain('Public transport schedules');
    expect(sections![0].text).toContain('SIRI');
  });

  it('ignores unknown slugs, route templates and index pages', () => {
    expect(splitCategoryIntoSections('/repo/docs/categories/no-such-category.md')).toBeUndefined();
    expect(splitCategoryIntoSections('/repo/docs/categories/[category].md')).toBeUndefined();
    expect(splitStandardIntoSections('/repo/docs/standards/index.md')).toBeUndefined();
  });

  it('leaves pages with rendered content to the default splitter', () => {
    expect(splitDynamicPageIntoSections('/repo/docs/categories/validators.md', '<p>x</p>')).toBeUndefined();
  });

  it('dispatches empty pages by section', () => {
    expect(splitDynamicPageIntoSections('/repo/docs/categories/validators.md', '')?.[0].titles).toEqual(['Validators']);
    expect(splitDynamicPageIntoSections('/repo/docs/standards/netex.md', '')?.[0].titles).toEqual(['NeTEx']);
    expect(splitDynamicPageIntoSections('/repo/docs/guide/unknown.md', '')).toBeUndefined();
  });
});

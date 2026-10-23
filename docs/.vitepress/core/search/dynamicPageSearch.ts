/**
 * Local-search indexing for all dynamic-route pages.
 *
 * Dynamic routes have no Markdown file on disk, so VitePress' local-search indexer
 * renders them to empty HTML and they become unsearchable (see publiccodeSearch.ts
 * for the full explanation). This module covers every such route:
 *
 * - `tools/<slug>`: publiccode tools, rebuilt from publiccode.yml (publiccodeSearch.ts)
 * - `categories/<slug>`: categories without a hand-crafted page, from categories.yaml
 * - `standards/<slug>`: standards pages, from standards.yaml
 *
 * Pages with real content (non-empty `html`) always go to VitePress' default splitter.
 */

import categoriesDataLoader from '../data-loaders/categories.data';
import standardsDataLoader from '../data-loaders/standards.data';
import { type SearchSection, splitPubliccodeToolIntoSections } from './publiccodeSearch';

/** Matches `.../<section>/<slug>.md`, skipping route templates and index pages. */
function dynamicSlug(file: string, section: string): string | undefined {
  const match = new RegExp(`(?:^|[/\\\\])${section}[/\\\\]([^/\\\\]+)\\.md$`).exec(file);
  const slug = match?.[1];
  if (!slug || slug.startsWith('[') || slug === 'index') return undefined;
  return slug;
}

function joinTerms(terms: (string | undefined)[]): string {
  return terms.filter(Boolean).join(' · ');
}

/** Search section for a generated category page: title, description, related categories. */
export function splitCategoryIntoSections(file: string): SearchSection[] | undefined {
  const slug = dynamicSlug(file, 'categories');
  if (!slug) return undefined;

  const categories = categoriesDataLoader.load();
  const category = categories[slug];
  if (!category) return undefined;

  const related = (category.related ?? []).map((s) => categories[s]?.title);
  return [
    { anchor: '', titles: [category.title], text: joinTerms([category.title, category.description, ...related]) },
  ];
}

/** Search section for a generated standard page, from the fields the page displays. */
export function splitStandardIntoSections(file: string): SearchSection[] | undefined {
  const slug = dynamicSlug(file, 'standards');
  if (!slug) return undefined;

  const standards = standardsDataLoader.load();
  const standard = standards[slug];
  if (!standard) return undefined;

  const related = (standard.related_standards ?? []).map((s) => standards[s]?.title);
  return [
    {
      anchor: '',
      titles: [standard.title],
      text: joinTerms([
        standard.title,
        standard.longTitle,
        standard.description,
        standard.domain,
        standard.purpose,
        standard.format_technology,
        standard.maintainer_origin,
        standard.status,
        ...related,
      ]),
    },
  ];
}

/**
 * VitePress `search.options.miniSearch._splitIntoSections` implementation.
 *
 * Returns sections for dynamic tool, category and standard pages (no file on disk,
 * so empty `html`); returns `undefined` for everything else so the default splitter runs.
 */
export function splitDynamicPageIntoSections(file: string, html: string): SearchSection[] | undefined {
  if (html) return undefined;
  return (
    splitPubliccodeToolIntoSections(file, html) ?? splitCategoryIntoSections(file) ?? splitStandardIntoSections(file)
  );
}

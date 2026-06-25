/**
 * Local-search indexing for dynamic publiccode tool pages.
 *
 * Publiccode tools render through the `docs/tools/[slug].md` dynamic route, so
 * they have no Markdown file on disk. VitePress' local-search indexer reads page
 * source straight from the filesystem (`render()` returns "" when the file does
 * not exist) and never goes through the dynamic-route plugin, so these pages were
 * being indexed empty — i.e. unsearchable.
 *
 * The one indexer seam that still runs for them is `miniSearch._splitIntoSections`,
 * which is called for every page with the (empty) rendered HTML. Here we detect a
 * dynamic publiccode tool page, rebuild its searchable text from `publiccode.yml`
 * plus the registry, and hand the indexer a single section. For any other file we
 * return `undefined` so VitePress' default splitter handles it normally.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import { type PubliccodeRecord, type Tool, loadRegistry, toolFromPubliccode } from '../data-loaders/tools.data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// docs/.vitepress/core/search → docs/data/...
const publiccodeDir = path.resolve(__dirname, '../../../data/publiccode');
const registryPath = path.resolve(__dirname, '../../../data/publiccode-registry.yaml');

/**
 * A single search index section, matching the shape VitePress' default splitter
 * yields: the last `titles` entry becomes the result title, the rest its breadcrumb.
 */
interface SearchSection {
  anchor: string;
  titles: string[];
  text: string;
}

/**
 * Flatten a publiccode tool's metadata into one bag of plain text for the search
 * index. Mirrors the fields a reader would search by — name, description, people,
 * licence, categories, standards, tags, platforms, languages, users, funders.
 */
export function publiccodeSearchText(tool: Tool, pc: PubliccodeRecord): string {
  const loc = (pc.localisation as PubliccodeRecord) ?? {};
  const org = (pc.organisation as PubliccodeRecord) ?? {};
  const funded = (pc.fundedBy as PubliccodeRecord[]) ?? [];

  const terms = [
    tool.title,
    tool.description,
    tool.longDescription,
    tool.developer,
    tool.maintainedBy,
    tool.license,
    pc.softwareType as string,
    org.name as string,
    ...(tool.features ?? []),
    ...(tool.categories ?? []),
    ...(tool.standards ?? []),
    ...(tool.tags ?? []),
    ...((pc.platforms as string[]) ?? []),
    ...((loc.availableLanguages as string[]) ?? []),
    ...((pc.usedBy as string[]) ?? []),
    ...funded.map((f) => f.name as string),
  ].filter(Boolean) as string[];

  return terms.join(' · ');
}

/**
 * VitePress `search.options.miniSearch._splitIntoSections` implementation.
 *
 * Returns sections only for dynamic publiccode tool pages (no file on disk → empty
 * `html`); returns `undefined` for everything else so the default splitter runs.
 */
export function splitPubliccodeToolIntoSections(file: string, html: string): SearchSection[] | undefined {
  // A real page rendered to HTML — let VitePress' default section splitter handle it.
  if (html) return undefined;

  const match = /(?:^|[/\\])tools[/\\]([^/\\]+)\.md$/.exec(file);
  if (!match) return undefined;
  const slug = match[1];
  if (slug.startsWith('[') || slug === 'index') return undefined;

  const pcPath = path.join(publiccodeDir, slug, 'publiccode.yml');
  if (!fs.existsSync(pcPath)) return undefined; // not a publiccode tool

  let pc: PubliccodeRecord;
  try {
    pc = (parseYaml(fs.readFileSync(pcPath, 'utf-8')) as PubliccodeRecord) ?? {};
  } catch {
    return undefined;
  }

  const registry = loadRegistry(registryPath);
  const tool = toolFromPubliccode(slug, registry[slug]?.['napcore-tools'], pc);
  if (!tool) return undefined;

  return [{ anchor: '', titles: [tool.title], text: publiccodeSearchText(tool, pc) }];
}

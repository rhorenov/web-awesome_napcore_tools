// Dynamic path generator for standard pages
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import standardsDataLoader from '../.vitepress/core/data-loaders/standards.data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  /**
   * Generates dynamic paths for standard pages in VitePress.
   * Creates routes for each standard with its title and its entry from standards.yaml.
   *
   * @returns Array of path objects with params for dynamic routing
   */
  paths() {
    // Load standards data
    const standards = standardsDataLoader.load();

    // Collect slugs that already have a dedicated .md page; those standards are skipped
    // below so an optional hand-crafted prose overlay won't collide with the generated
    // route (same precedence as docs/tools/[slug] and docs/categories/[category]).
    const existingSlugs = new Set(
      fs
        .readdirSync(__dirname)
        .filter((f) => f.endsWith('.md') && !f.startsWith('[') && f !== 'index.md')
        .map((f) => f.replace('.md', ''))
    );

    // Create paths for each standard with title and details
    return Object.keys(standards)
      .filter((slug) => !existingSlugs.has(slug))
      .map((slug) => {
        const standard = standards[slug];
        const title = standard?.title || slug; // Fallback to slug if not found

        return {
          params: {
            standard: slug,
            standardName: title,
            title: `Tools supporting ${title}`, // For transformPageData hook
            details: standard || null, // Pass details or null if not found
          },
        };
      });
  },
};

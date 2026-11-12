/**
 * VitePress dynamic route paths generator for category pages.
 *
 * Generates one route per category defined in docs/data/categories.yaml that has
 * no hand-crafted .md file in docs/categories/. A category with a dedicated .md
 * takes priority and is excluded here, exactly as docs/tools/[slug].paths.ts skips
 * tools that have a hand-crafted page.
 *
 * Today no category has a hand-crafted page, so every category page is generated.
 *
 * Mirrors docs/standards/[standard].paths.ts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import categoriesDataLoader from '../.vitepress/core/data-loaders/categories.data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  /**
   * Generates dynamic paths for category pages in VitePress.
   *
   * @returns Array of path objects with params for dynamic routing
   */
  paths() {
    const categories = categoriesDataLoader.load();
    // categoriesDir is the same directory as this file — used to discover hand-crafted .md files
    const categoriesDir = __dirname;

    // Collect slugs that already have a dedicated .md page; those categories are skipped below
    const existingSlugs = new Set(
      fs
        .readdirSync(categoriesDir)
        .filter((f) => f.endsWith('.md') && !f.startsWith('[') && f !== 'index.md')
        .map((f) => f.replace('.md', ''))
    );

    return (
      Object.entries(categories)
        // Hand-crafted pages take priority — skip categories that already have one
        .filter(([slug]) => !existingSlugs.has(slug))
        .map(([slug, category]) => {
          const title = category.title || slug;

          return {
            params: {
              category: slug, // VitePress route parameter — matches [category] in filename
              categoryName: title,
              title, // picked up by transformPageData in config.ts to set <title>
              icon: category.icon,
              description: category.description,
            },
          };
        })
    );
  },
};

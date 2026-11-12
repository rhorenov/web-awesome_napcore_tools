import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect, type APIRequestContext } from '@playwright/test';
import { hiddenBlogPosts } from '@/core/llms/llmsMarkdown';

/**
 * llms.txt Tests
 *
 * llms.txt and llms-full.txt are built from page sources written for VitePress, so Vue
 * templates and components can leak into them. These check the generated files.
 *
 * The dev server answers 200 for any path, so a link is checked by fetching the page's
 * Markdown copy, which the llms plugin serves as text/markdown.
 */

const SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs');
const FILES = ['/llms.txt', '/llms-full.txt'];

const LEFTOVERS: [string, RegExp][] = [
  ['Vue interpolation', /\{\{/],
  ['script block', /<script\b/],
  ['Vue component', /<[A-Z][A-Za-z]*[\s/>]/],
];

/** The text outside fenced code blocks, where XML examples may look like components. */
function prose(markdown: string): string {
  return markdown.replace(/^```[\s\S]*?^```/gm, '');
}

/** Root-relative link targets in a Markdown text, without duplicates. */
function siteLinks(markdown: string): string[] {
  return [...new Set([...markdown.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]))];
}

/** The Markdown copy of a page: "/about.html", "/all" and "/all/" become "/about.md", "/all.md". */
function markdownCopy(link: string): string {
  if (link.endsWith('.md')) return link;
  const route = link.replace(/\.html$/, '').replace(/\/$/, '');
  return `${route || '/index'}.md`;
}

async function fetchText(request: APIRequestContext, url: string): Promise<string> {
  const response = await request.get(url);
  expect(response.status(), url).toBe(200);
  return response.text();
}

/** Links whose Markdown copy is not served as Markdown. OKF files are served as plain text. */
async function brokenLinks(request: APIRequestContext, links: string[]): Promise<string[]> {
  const broken: string[] = [];
  for (const link of links) {
    const copy = markdownCopy(link);
    const type = (await request.get(copy)).headers()['content-type'] ?? '';
    if (!/text\/(markdown|plain)/.test(type)) broken.push(`${link} (${copy}: ${type || 'no content type'})`);
  }
  return broken;
}

test.describe('llms.txt', () => {
  for (const file of FILES) {
    test(`${file} has no template leftovers`, async ({ request }) => {
      const lines = prose(await fetchText(request, file)).split('\n');
      for (const [name, pattern] of LEFTOVERS) {
        expect(
          lines.filter((line) => pattern.test(line)),
          `${name} in ${file}`
        ).toEqual([]);
      }
    });
  }

  test('leaves out drafts and scheduled blog posts', async ({ request }) => {
    const hidden = hiddenBlogPosts(SRC_DIR).map((glob) => glob.replace(/^\*\*/, '').replace(/\.md$/, ''));
    for (const file of FILES) {
      const text = await fetchText(request, file);
      expect(
        hidden.filter((post) => text.includes(post)),
        `hidden posts in ${file}`
      ).toEqual([]);
    }
  });

  test('every page linked from llms.txt has a Markdown copy', async ({ request }) => {
    const links = siteLinks(await fetchText(request, '/llms.txt'));
    expect(links.length).toBeGreaterThan(0);
    expect(await brokenLinks(request, links)).toEqual([]);
  });

  test('every Markdown link in llms-full.txt resolves', async ({ request }) => {
    const links = siteLinks(await fetchText(request, '/llms-full.txt')).filter((link) => link.endsWith('.md'));
    expect(links.length).toBeGreaterThan(0);
    expect(await brokenLinks(request, links)).toEqual([]);
  });
});

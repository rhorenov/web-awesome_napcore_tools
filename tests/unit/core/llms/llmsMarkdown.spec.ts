import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import type { Tool } from '@/core/data-loaders/tools.data';
import type { Standard } from '@/core/data-loaders/standards.data';
import { type LlmsContext, type LlmsPage, cleanLlmsPage, hiddenBlogPosts, toUrlPath } from '@/core/llms/llmsMarkdown';

const tool = (slug: string, extra: Partial<Tool> = {}): Tool => ({
  slug,
  title: slug.toUpperCase(),
  description: `${slug} description`,
  categories: ['validators'],
  status: 'active',
  standards: ['netex'],
  ...extra,
});

const ctx = (handCrafted: string[] = []): LlmsContext => ({
  tools: [
    tool('antu', { longDescription: 'Long text', features: ['Validates NeTEx'], license: 'EUPL-1.2' }),
    tool('motis', { categories: ['converters'], standards: [], endorsed: true }),
  ],
  standards: {
    netex: {
      title: 'NeTEx',
      domain: 'Public transport',
      purpose: 'Timetables',
      related_standards: ['siri'],
    } as Standard,
    siri: { title: 'SIRI' } as Standard,
  },
  categories: {
    validators: { title: 'Validators', icon: '', description: 'Check data', related: ['converters'] },
    converters: { title: 'Converters', icon: '', description: 'Convert data' },
  },
  hasSourceFile: (p) => handCrafted.includes(p),
});

const page = (path: string, body: string, frontmatter: Record<string, unknown> = {}): LlmsPage => ({
  path,
  url: path.replace('.md', ''),
  title: '',
  llmUrl: path,
  frontmatter,
  content: `---\nURL: "x"\nLLMS_URL: "${path.replace(/\//g, '\\\\')}"\n---\n\n${body}`,
});

describe('llmsMarkdown', () => {
  it('normalises Windows separators', () => {
    expect(toUrlPath('/\\tools\\antu.md')).toBe('/tools/antu.md');
  });

  it('writes a registry tool page from its data instead of the Vue template', () => {
    const out = cleanLlmsPage(page('\\tools\\antu.md', '# {{ $params.title }}\n\n<ToolPubliccodeView />'), ctx());
    expect(out.path).toBe('/tools/antu.md');
    expect(out.content).toContain('LLMS_URL: "/tools/antu.md"');
    expect(out.content).toContain('# ANTU');
    expect(out.content).toContain('- Licence: EUPL-1.2');
    expect(out.content).toContain('- Standards: NeTEx');
    expect(out.content).toContain('- Validates NeTEx');
    expect(out.content).not.toMatch(/\{\{|<ToolPubliccodeView/);
  });

  it('writes a standard page with related standards and its tools', () => {
    const out = cleanLlmsPage(page('/standards/netex.md', '<div v-if="$params.details">{{ x }}</div>'), ctx());
    expect(out.content).toContain('# NeTEx');
    expect(out.content).toContain('- Domain: Public transport');
    expect(out.content).toContain('[SIRI](/standards/siri.md)');
    expect(out.content).toContain('[ANTU](/tools/antu.md)');
    expect(out.content).not.toContain('MOTIS');
    expect(out.content).not.toContain('v-if');
  });

  it('writes a generated category page', () => {
    const out = cleanLlmsPage(page('/categories/validators.md', '<ToolsFilter />'), ctx());
    expect(out.content).toContain('# Validators');
    expect(out.content).toContain('[Converters](/categories/converters.md)');
    expect(out.content).toContain('[ANTU](/tools/antu.md)');
  });

  it('cleans a hand-crafted CRLF page and replaces its components', () => {
    const src =
      '---\r\ndocument: category\r\n---\r\n\r\n# Converters\r\n\r\nProse.\r\n\r\n<RelatedCategories />\r\n\r\n<ToolsFilter />\r\n\r\n<StatsBar />\r\n';
    const out = cleanLlmsPage(page('/categories/converters.md', src), ctx(['/categories/converters.md']));
    expect(out.content).toContain('Prose.');
    expect(out.content).toContain('[MOTIS](/tools/motis.md)');
    expect(out.content).not.toMatch(/document: category|<[A-Z]|\r/);
  });

  it('replaces RelatedStandards on a hand-crafted standard page', () => {
    const src = '# NeTEx\n\nProse.\n\n<RelatedStandards />\n';
    const out = cleanLlmsPage(page('/standards/netex.md', src), ctx(['/standards/netex.md']));
    expect(out.content).toContain('[SIRI](/standards/siri.md)');
    expect(out.content).not.toContain('<RelatedStandards');
  });

  it('turns a withBase() link into a Markdown link and drops the script that imports it', () => {
    const src =
      "<script setup>\nimport { withBase } from 'vitepress';\n</script>\n\n# About\n\n" +
      'Start from <a :href="withBase(\'/okf/index.md\')" target="_self">the bundle index</a>.\n';
    const out = cleanLlmsPage(page('/about.md', src), ctx(['/about.md']));
    expect(out.content).toContain('Start from [the bundle index](/okf/index.md).');
    expect(out.content).not.toMatch(/withBase|<script/);
  });

  it('adds Quick Info to a hand-crafted tool page and drops ToolMetadata', () => {
    const out = cleanLlmsPage(
      page('/tools/motis.md', 'Body text.\n\n<ToolMetadata />', { document: 'tool' }),
      ctx(['/tools/motis.md'])
    );
    expect(out.content).toMatch(/# MOTIS\n\n> motis description\n\n## Quick Info/);
    expect(out.content).toContain('- Endorsed by NAPCORE: Yes');
    expect(out.content).toContain('Body text.');
    expect(out.content).not.toContain('<ToolMetadata');
  });
});

describe('hiddenBlogPosts', () => {
  const dirs: string[] = [];
  afterEach(() => dirs.splice(0).forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  const srcDir = (posts: Record<string, string>): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-blog-'));
    dirs.push(dir);
    fs.mkdirSync(path.join(dir, 'blog', 'posts'), { recursive: true });
    for (const [file, frontmatter] of Object.entries(posts)) {
      // CRLF, as on a Windows checkout
      fs.writeFileSync(path.join(dir, 'blog', 'posts', file), `---\r\n${frontmatter}\r\n---\r\n\r\n# Post\r\n`);
    }
    return dir;
  };

  it('lists drafts and scheduled posts as ignore globs', () => {
    const dir = srcDir({
      'public.md': 'title: Public\r\npublishDate: 2020-01-01',
      'draft.md': 'title: Draft\r\npublished: false',
      'scheduled.md': 'title: Later\r\npublishDate: 2099-12-01',
      'plain.md': 'title: Plain',
    });
    expect(hiddenBlogPosts(dir).sort()).toEqual(['**/blog/posts/draft.md', '**/blog/posts/scheduled.md']);
  });

  it('returns nothing when there is no blog', () => {
    expect(hiddenBlogPosts(os.tmpdir() + '/does-not-exist')).toEqual([]);
  });
});

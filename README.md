# Awesome NAPCORE Tools

A community catalogue of open tools for European mobility data standards such as DATEX II,
NeTEx, SIRI and mobilityDCAT-AP, published at [awesome.napcore.eu](https://awesome.napcore.eu/).
It is run by [NAPCORE](https://napcore.eu), which coordinates the National Access Points for
mobility data in Europe. The [About page](./docs/about.md) has the background and the
acknowledgements.

## Contributing

- Suggest a tool: check the inclusion criteria in [contribute.md](./docs/contribute.md), then
  [start a discussion](https://github.com/napcore-tools/web-awesome_napcore_tools/discussions/new?category=tool-suggestions)
  in the Tool Suggestions category.
- Add a tool with a pull request: see [TOOLS.md](./TOOLS.md) or [PUBLICCODE.md](./PUBLICCODE.md).
- Fix a page: use "Suggest changes to this page" at the bottom of any page.
- Report a problem: [open an issue](https://github.com/napcore-tools/web-awesome_napcore_tools/issues).

## Concepts

- A tool is one entry in the catalogue. Its slug is its identifier and the last part of its
  URL (`/tools/<slug>`).
- A tool comes from a hand-crafted page or from a registry entry. A hand-crafted page is
  `docs/tools/<slug>.md`, with the metadata in frontmatter and free prose below it
  ([TOOLS.md](./TOOLS.md)). A registry entry is a `publiccode.yml` file listed in
  `docs/data/publiccode-registry.yaml` and cached in `docs/data/publiccode/`
  ([PUBLICCODE.md](./PUBLICCODE.md)). When both exist for a slug, the hand-crafted page wins.
- A category groups tools by what they do (validators, converters, SDKs). A standard is a
  data standard that tools support (DATEX II, NeTEx, GTFS). Both are defined in
  `docs/data/categories.yaml` and `docs/data/standards.yaml`, each gets a generated page,
  and the build rejects a tool that names an unknown one.
- "By NAPCORE" lists the tools whose frontmatter has `endorsed: true`.
- A blog post is a Markdown file in `docs/blog/posts/`. A scheduled post has a future
  `publishDate` and stays hidden until then ([BLOG.md](./BLOG.md)).
- The OKF bundle is the whole catalogue in Google's
  [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/README.md)
  v0.2: one Markdown file per tool, standard and category, served at `/okf/index.md` and as
  `/napcore-tools-okf.zip`. The build also writes `llms.txt` and `llms-full.txt`. All three
  are generated from the catalogue data, so there is nothing to maintain by hand.

## Installation

Requires Node.js 22.12+ or 24+ and npm.

```bash
git clone https://github.com/napcore-tools/web-awesome_napcore_tools.git
cd web-awesome_napcore_tools
npm install
npx playwright install chromium # browser for the end-to-end tests
```

`npm install` also sets up a pre-commit hook that runs lint-staged and the end-to-end tests.

## Configuration

Local work needs no configuration. These environment variables change the site:

| Variable            | Effect                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `SITE_URL`          | Absolute site URL used in the RSS feed and the OKF bundle. Default `https://awesome.napcore.eu`.        |
| `VITEPRESS_BASE`    | Base path when the site is not served from the domain root, such as `/web-awesome_napcore_tools/`.      |
| `VITE_PREVIEW_MODE` | Any value shows scheduled blog posts, on the site and in the RSS feed, with a banner on the blog pages. |

For example `VITE_PREVIEW_MODE=1 npm run dev`, or `$env:VITE_PREVIEW_MODE="1"; npm run dev` in
PowerShell.

## Usage

| Command                   | Purpose                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`             | Development server at <http://localhost:5173>                                             |
| `npm run build`           | Production build into `docs/.vitepress/dist`; fails on invalid frontmatter and dead links |
| `npm run preview`         | Serves the production build                                                               |
| `npm test`                | Unit tests (Vitest), then end-to-end tests (Playwright) against the development server    |
| `npm run lint`            | ESLint; `npm run lint:fix` applies the fixes                                              |
| `npm run format`          | Prettier check; `npm run format:fix` applies the fixes                                    |
| `npm run sync:publiccode` | Refreshes the cached `publiccode.yml` files of the registry entries                       |

`feed.rss`, `llms.txt` and `llms-full.txt` exist only in a build. The OKF bundle is also
served by the development server.

## Repository Layout

The site is built with [VitePress](https://vitepress.dev/) (Vue 3, TypeScript).

- `docs/`: the pages (tools, categories, standards, blog, about, contribute)
- `docs/data/`: catalogue data (categories, standards, blog tags, the publiccode registry
  and its cache)
- `docs/.vitepress/core/`: data loaders, validation, sidebar, the OKF and llms exporters
- `docs/.vitepress/theme/`: Vue components and CSS
- `docs/.vitepress/plugins/`: Markdown and development server plugins
- `scripts/`: the publiccode sync
- `tests/`: unit tests (`unit/`) and end-to-end tests (`e2e/`)

## Licence

- Code: MIT, see [LICENSE](LICENSE)
- Catalogue content (pages, tool and standard descriptions, the OKF bundle): CC BY 4.0, see [LICENSE-CONTENT](LICENSE-CONTENT)
- Third-party material keeps its own terms: the listed tools, the cached `publiccode.yml` files under `docs/data/publiccode/`, and the logos of NAPCORE, tools and standards

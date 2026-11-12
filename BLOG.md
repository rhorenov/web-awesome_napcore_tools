# Writing blog posts

This guide explains how to add a post to the blog at `/blog/`. Posts are Markdown files in
`docs/blog/posts/`, listed newest first and published in the RSS feed (`/feed.rss`).

## Quick start

1. Create `docs/blog/posts/YYYY-MM-DD-post-slug.md`.
2. Add the frontmatter (see below).
3. Start the body with `<BlogPostMeta />`, then the `# Title` heading and the content.

```markdown
---
title: Your Post Title
description: A short description for the listing page and the feed
date: 2026-11-12
author: Your Name
tags:
  - datex-ii
  - technical
---

<BlogPostMeta />

# Your Post Title

Your content here.
```

## Frontmatter

- `title` and `description` are shown on the listing page and in the feed.
- `date` is the date shown on the post; posts are sorted by it.
- `author` and `tags` are optional.
- `published: false` makes the post a draft, hidden everywhere, also in preview mode.
- `publishDate` schedules the post: it stays hidden until that date.

## Scheduled posts

Set `publishDate` to a future date. To see scheduled posts before then, set
`VITE_PREVIEW_MODE` to any value:

```bash
VITE_PREVIEW_MODE=1 npm run dev

# PowerShell
$env:VITE_PREVIEW_MODE="1"; npm run dev
```

The blog pages then show a banner, and scheduled posts appear on the site and in the feed.

## Tags

A tag is a slug. Its title and link depend on what the slug matches, checked in this order:

1. A category in `docs/data/categories.yaml`, such as `validators`: titled "Validators",
   links to `/categories/validators`.
2. A standard in `docs/data/standards.yaml`, such as `datex-ii`: titled "DATEX II", links to
   `/standards/datex-ii`.
3. A blog tag in `docs/data/blogTags.yaml`, such as `technical`: titled "Technical", links to
   `/blog?tag=technical`, which filters the blog.
4. Anything else is shown as written and filters the blog in the same way.

To give a blog tag a title, add it to `docs/data/blogTags.yaml`:

```yaml
your-tag-slug:
  title: Your Tag Title
```

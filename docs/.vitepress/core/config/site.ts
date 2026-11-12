/**
 * Canonical origin of the published site, without a trailing slash.
 * Used wherever a build product needs absolute URLs (RSS feed, OKF bundle).
 * Override with the SITE_URL environment variable.
 */
export const siteUrl = (process.env.SITE_URL || 'https://awesome.napcore.eu').replace(/\/+$/, '');

/**
 * Prefixes a root-relative URL ("/about.md") with the site base ("/sub/"), for places
 * VitePress does not rewrite itself: `head` tags and generated files.
 * Other URLs (relative, external, protocol-relative) are returned unchanged.
 */
export function withBasePath(url: string, base: string): string {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  return base.replace(/\/+$/, '') + url;
}

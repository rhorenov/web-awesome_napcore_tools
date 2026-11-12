/** Frontmatter fields that decide whether a blog post is public. */
export interface PostVisibility {
  published?: boolean;
  /** YAML parsers return a date either as a string or as a Date. */
  publishDate?: string | Date;
}

/** True when VITE_PREVIEW_MODE is set, which shows scheduled posts too. */
export function isPreviewMode(): boolean {
  return typeof process.env.VITE_PREVIEW_MODE !== 'undefined';
}

/**
 * Whether a blog post is public: it is not a draft (`published: false`) and,
 * outside preview mode, its `publishDate` has arrived.
 */
export function isPostVisible(post: PostVisibility, now = Date.now(), preview = isPreviewMode()): boolean {
  if (post.published === false) return false;
  if (preview || !post.publishDate) return true;
  return new Date(post.publishDate).getTime() <= now;
}

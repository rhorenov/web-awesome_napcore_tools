/**
 * STANDARDS MODULE - Client-safe standard metadata access
 *
 * This module is safe to import in both Node.js (build time) and browser (client) code.
 * The actual data is loaded from standards.yaml via the VitePress data loader (standards.data.ts).
 */

import { data as STANDARDS } from '../data-loaders/standards.data';
import type { Standard } from '../data-loaders/standards.data';

// Re-export the Standard interface for convenience
export type { Standard };

/**
 * For backward compatibility - subset of Standard interface
 * Used by components that only need title, icon, description
 */
export interface StandardMetadata {
  title: string;
  endorsed?: boolean;
  icon: string;
  description?: string;
}

/**
 * Get metadata for a standard, with fallback to default values
 * @param standardSlug - The slugified standard name (e.g., 'datex-ii')
 * @returns StandardMetadata object with title, icon, description
 *
 * Note: This function maintains backward compatibility by returning
 * only the UI-relevant fields (title, icon, description)
 */
export function getStandardMetadata(standardSlug: string): StandardMetadata {
  const standard = STANDARDS[standardSlug];

  if (standard) {
    return {
      title: standard.title,
      endorsed: standard.endorsed,
      icon: standard.icon,
      description: standard.description,
    };
  }

  // Fallback for unknown standards
  return {
    title: standardSlug,
    endorsed: undefined,
    icon: '📄',
    description: undefined,
  };
}

/**
 * A standard with its slug attached. The YAML keys entries by slug, so the
 * Standard value type itself has none; resolvers attach it for callers that
 * need to key/link by slug.
 */
export interface ResolvedStandard extends Standard {
  slug: string;
}

/**
 * Resolve a slug to its full Standard plus slug, falling back to a minimal
 * placeholder (title = slug) for an unknown slug so callers always get a
 * renderable entity. Build-time validation already rejects unknown slugs, so the
 * fallback is purely defensive. Shared by the tool metadata views that turn slugs
 * into linked titles.
 */
export function resolveStandard(slug: string): ResolvedStandard {
  const standard = STANDARDS[slug];
  return standard
    ? { slug, ...standard }
    : {
        slug,
        title: slug,
        icon: '📄',
        domain: '',
        purpose: '',
        format_technology: '',
        maintainer_origin: '',
        status: '',
      };
}

/**
 * Resolve a list of standard slugs, preserving order. Undefined/empty input → [].
 */
export function resolveStandards(slugs: string[] | undefined): ResolvedStandard[] {
  return (slugs ?? []).map(resolveStandard);
}

/**
 * Export the complete standards data for modules that need full details
 */
export { STANDARDS };

/**
 * lib/cloudinary.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central Cloudinary URL helper for DevTracker.
 *
 * URL anatomy this library expects:
 *   https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}
 *
 * resource_type is either:
 *   • "image" — user-uploaded images (supports all transformations)
 *   • "raw"   — PDFs and other non-image files (NO transformations allowed)
 *
 * All functions are pure (no side-effects) and safe to call with any string —
 * non-Cloudinary URLs are returned unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Internal helpers ──────────────────────────────────────────────────────────

/** True when the URL belongs to Cloudinary's delivery CDN. */
export const isCloudinaryUrl = (url: string): boolean =>
  url.includes('res.cloudinary.com');

/** True when the URL is an image resource (supports transformations). */
export const isCloudinaryImage = (url: string): boolean =>
  isCloudinaryUrl(url) && url.includes('/image/upload/');

/** True when the URL is a raw resource (PDFs, docs — NO transformations). */
export const isCloudinaryRaw = (url: string): boolean =>
  isCloudinaryUrl(url) && url.includes('/raw/upload/');

/**
 * Splits a Cloudinary URL around the "/upload/" segment.
 * Returns [base, rest] or null if the URL doesn't contain "/upload/".
 *
 * e.g. "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"
 *   → ["https://res.cloudinary.com/demo/image/upload", "v1/sample.jpg"]
 */
function splitAtUpload(url: string): [string, string] | null {
  const idx = url.indexOf('/upload/');
  if (idx === -1) return null;
  return [url.slice(0, idx + '/upload/'.length), url.slice(idx + '/upload/'.length)];
}

/**
 * Injects Cloudinary transformation segments between "/upload/" and the
 * public ID, respecting any existing transformation string.
 *
 * Existing transformations (e.g. "v1234567890/") are preserved as a chained
 * layer after our optimisation params.
 */
function injectTransformations(url: string, transforms: string): string {
  const parts = splitAtUpload(url);
  if (!parts) return url;
  const [base, rest] = parts;
  return `${base}${transforms}/${rest}`;
}

// ── Core transformation presets ───────────────────────────────────────────────

/**
 * Optimised image URL:
 *   f_auto  → serves WebP to supporting browsers, AVIF where available
 *   q_auto  → Cloudinary picks the best quality/size trade-off automatically
 *   fl_progressive → progressive JPEG rendering (visual improvement on slow
 *                    connections; ignored for WebP/AVIF)
 *
 * Safe to call on any URL — non-Cloudinary or raw URLs pass through unchanged.
 *
 * @example
 * getOptimisedUrl("https://res.cloudinary.com/demo/image/upload/v1/dog.jpg")
 * // → "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,fl_progressive/v1/dog.jpg"
 */
export function getOptimisedUrl(url: string): string {
  if (!isCloudinaryImage(url)) return url;
  // Avoid double-injecting if transforms are already present
  if (url.includes('f_auto') || url.includes('q_auto')) return url;
  return injectTransformations(url, 'f_auto,q_auto,fl_progressive');
}

/**
 * Generates a responsive `srcSet` string for use in <img srcSet=...>.
 *
 * Produces three width variants: 400w, 800w, 1200w.
 * Each variant also has f_auto + q_auto for format/quality optimisation.
 * Non-Cloudinary image URLs → returns undefined (no srcSet).
 *
 * @example
 * getSrcSet("https://res.cloudinary.com/demo/image/upload/v1/hero.jpg")
 * // → "https://.../w_400,f_auto,q_auto/v1/hero.jpg 400w,
 * //    https://.../w_800,f_auto,q_auto/v1/hero.jpg 800w,
 * //    https://.../w_1200,f_auto,q_auto/v1/hero.jpg 1200w"
 */
export function getSrcSet(url: string): string | undefined {
  if (!isCloudinaryImage(url)) return undefined;
  const widths = [400, 800, 1200] as const;
  return widths
    .map(w => `${injectTransformations(url, `w_${w},f_auto,q_auto`)} ${w}w`)
    .join(', ');
}

/**
 * Returns the `sizes` attribute companion to getSrcSet().
 * Matches the layout used in StudyNotes (full-width up to max-w content area).
 *
 * Override with your own value if the image is used in a different layout.
 */
export const DEFAULT_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 640px';

// ── Download URL ──────────────────────────────────────────────────────────────

/**
 * Appends fl_attachment so the browser downloads rather than previews.
 * Works for both image and raw resource types.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * Consolidates the duplicate `getDownloadUrl` from StudyNotes.tsx and
 * Shortcuts.tsx — import from here instead.
 */
export function getDownloadUrl(url: string): string {
  if (!isCloudinaryUrl(url)) return url;
  const parts = splitAtUpload(url);
  if (!parts) return url;
  const [base, rest] = parts;
  return `${base}fl_attachment/${rest}`;
}

// ── PDF URL fix ───────────────────────────────────────────────────────────────

/**
 * Corrects legacy PDF URLs that were accidentally uploaded with resource_type
 * 'image' instead of 'raw'. Rewrites /image/upload/ → /raw/upload/ so the
 * browser receives the correct Content-Type header.
 *
 * Consolidates the duplicate `fixCloudinaryPdfUrl` from StudyNotes.tsx.
 */
export function fixPdfUrl(url: string, mediaType?: string): string {
  if (
    mediaType === 'application/pdf' &&
    isCloudinaryUrl(url) &&
    url.includes('/image/upload/')
  ) {
    return url.replace('/image/upload/', '/raw/upload/');
  }
  return url;
}

// ── Google Docs viewer URL ────────────────────────────────────────────────────

/**
 * Wraps a document URL for the Google Docs Viewer iframe embed.
 * Avoids cross-origin iframe restrictions that block direct PDF embeds.
 * Consolidates the duplicate `getGoogleDocsViewerUrl` from StudyNotes.tsx.
 */
export function getGoogleDocsViewerUrl(url: string, mediaType?: string): string {
  const fixed = fixPdfUrl(url, mediaType);
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fixed)}&embedded=true`;
}

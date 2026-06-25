/**
 * components/CloudinaryImage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A drop-in <img> replacement for Cloudinary-hosted images that:
 *
 *  1. Auto-optimises the URL with f_auto + q_auto + fl_progressive
 *  2. Generates a responsive srcSet (400w / 800w / 1200w) for Cloudinary images
 *  3. Uses native loading="lazy" + decoding="async" where supported
 *  4. Falls back to IntersectionObserver for browsers that lack native lazy
 *     loading (Safari < 15.4, older WebViews)
 *  5. Shows a skeleton shimmer placeholder until the image loads
 *  6. Fades the image in on load for a polished UX
 *
 * Usage:
 *   // Basic — replaces a plain <img>
 *   <CloudinaryImage src={note.media_url} alt="Note attachment" />
 *
 *   // With explicit dimensions (prevents CLS — use when dimensions are known)
 *   <CloudinaryImage src={url} alt="Avatar" width={64} height={64} />
 *
 *   // Priority image (above-the-fold — disables lazy loading)
 *   <CloudinaryImage src={url} alt="Hero" priority />
 *
 *   // Custom sizing hint (overrides DEFAULT_SIZES)
 *   <CloudinaryImage src={url} alt="Thumbnail" sizes="33vw" />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useEffect, useState, ImgHTMLAttributes } from 'react';
import { getOptimisedUrl, getSrcSet, DEFAULT_SIZES } from '../lib/cloudinary';

// ── Native lazy-loading support detection ─────────────────────────────────────
// Cached once at module load — never changes during a session.
const supportsNativeLazy =
  typeof HTMLImageElement !== 'undefined' &&
  'loading' in HTMLImageElement.prototype;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CloudinaryImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'loading'> {
  /** The Cloudinary (or any) image URL. Non-Cloudinary URLs pass through. */
  src: string;
  /** Alt text — required for accessibility. */
  alt: string;
  /**
   * Set true for above-the-fold images (hero, first visible avatar).
   * Disables lazy loading and adds fetchpriority="high".
   * Default: false
   */
  priority?: boolean;
  /**
   * Overrides the auto-generated sizes attribute.
   * Default: "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 640px"
   */
  sizes?: string;
  /** Called when the image finishes loading. */
  onLoad?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CloudinaryImage({
  src,
  alt,
  priority = false,
  sizes = DEFAULT_SIZES,
  className = '',
  width,
  height,
  onLoad,
  ...rest
}: CloudinaryImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  // Track whether we should reveal the real src (for IO fallback path)
  const [shouldLoad, setShouldLoad] = useState(priority || supportsNativeLazy);
  // Track load completion for fade-in animation
  const [isLoaded, setIsLoaded] = useState(false);

  // ── IntersectionObserver fallback (Safari < 15.4, old WebViews) ────────────
  useEffect(() => {
    // Skip if: priority image, native lazy supported, or already triggered
    if (priority || supportsNativeLazy || shouldLoad) return;

    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        // Start loading when image is 200px away from viewport
        rootMargin: '200px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  // ── URL optimisation ────────────────────────────────────────────────────────
  const optimisedSrc = shouldLoad ? getOptimisedUrl(src) : undefined;
  const srcSet = shouldLoad ? getSrcSet(src) : undefined;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
    >
      {/* Skeleton shimmer — visible until image loads */}
      {!isLoaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gray-800/60 animate-pulse rounded-[inherit]"
        />
      )}

      <img
        ref={imgRef}
        // When using IO fallback and not yet in viewport, omit src entirely
        // so no network request fires. The browser sees an empty src-less img.
        src={optimisedSrc}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        // Native lazy loading — ignored when priority=true
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // fetchpriority tells the browser to boost or defer the fetch.
        // "high" for above-fold heroes, "low" for everything else.
        // Cast needed because React's types lag behind the HTML spec.
        {...(priority
          ? { fetchPriority: 'high' as 'high' | 'low' | 'auto' }
          : { fetchPriority: 'low' as 'high' | 'low' | 'auto' })}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        className={[
          // Fade-in transition: invisible until loaded, then opacity-100
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    </span>
  );
}

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // ── Progressive Web App ────────────────────────────────────────────────
    VitePWA({
      // autoUpdate: SW updates silently in the background after a new deploy.
      // On the user's next page navigation, the new version loads automatically.
      registerType: 'autoUpdate',

      // Static assets to include in the precache manifest
      includeAssets: ['logo.svg', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],

      // ── Web App Manifest ─────────────────────────────────────────────────
      // This is what Android/iOS use to show the install prompt, name the app
      // on the home screen, and set the splash screen background.
      manifest: {
        name: 'DevTracker',
        short_name: 'DevTracker',
        description: 'Track your coding journey, daily goals, LeetCode stats, and career progress.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',       // No browser chrome — looks like a native app
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            // 'maskable' icons use a safe zone so Android can apply
            // adaptive icon shapes (circle, squircle, etc.)
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // Screenshots tell the Play Store / Edge what the app looks like
        screenshots: [],
      },

      // ── Workbox Service Worker config ─────────────────────────────────────
      workbox: {
        // Precache all built JS/CSS/HTML/font/image assets.
        // Content-hashed files are safe to cache forever.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // ── Runtime caching strategies ──────────────────────────────────────
        runtimeCaching: [
          // API calls — NEVER cache. Always fetch live data.
          // This is critical: stale goals/problems would be worse than an error.
          {
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
          },

          // Google Fonts CSS — cache for 1 year, serve instantly from cache
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Google Fonts woff2 files — cache for 1 year (fonts never change)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Cloudinary images — StaleWhileRevalidate: serve from cache instantly,
          // update the cached copy in the background for next time.
          // Max 60 entries, 30 day expiry (user-uploaded content changes).
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Google favicon API (Shortcuts panel)
          {
            urlPattern: /^https:\/\/www\.google\.com\/s2\/favicons.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'favicons',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // For SPA: serve index.html for all navigation requests that miss the
        // cache (handles client-side routes like /dashboard, /settings etc.)
        navigateFallback: 'index.html',

        // Don't apply the SPA fallback to API routes — let those fail normally
        navigateFallbackDenylist: [/^\/api\//],

        // Clean up old caches from previous SW versions automatically
        cleanupOutdatedCaches: true,

        // Skip waiting so the new SW activates immediately after install
        skipWaiting: true,
        clientsClaim: true,
      },

      // Disable the SW in dev mode — hot reload and SW don't mix well
      devOptions: {
        enabled: false,
      },
    }),
  ],

  server: {
    port: 5173,
  },

  build: {
    // Target modern browsers — avoids heavy legacy polyfills
    target: ['es2020', 'chrome87', 'firefox78', 'safari14', 'edge88'],

    // Disable sourcemaps in production (cuts ~30% of output size)
    sourcemap: false,

    // Warn when a chunk exceeds this size (kb)
    chunkSizeWarningLimit: 500,

    // Use Rollup for fine-grained splitting
    rollupOptions: {
      output: {
        // ── Manual chunk splitting ──────────────────────────────────────────
        manualChunks(id) {
          // 1. React core — tiny, loads first, heavily cached
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          // 2. Framer Motion — large animation lib, split so it loads async
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer-motion';
          }

          // 3. Lucide icons — many small SVG components, isolate for caching
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }

          // 4. Axios — HTTP client, small but changes rarely
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }

          // 5. Any other node_modules go into a generic vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }

          // 6. App feature chunks — group by component area
          if (id.includes('/src/components/')) {
            return 'app-components';
          }

          if (id.includes('/src/contexts/') ||
              id.includes('/src/utils/') ||
              id.includes('/src/lib/')) {
            return 'app-core';
          }

          if (id.includes('/src/data/')) {
            return 'app-data';
          }
        },

        // ── Output file naming — enables long-term caching ─────────────────
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(css)$/.test(name ?? '')) return 'assets/css/[name]-[hash][extname]';
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name ?? '')) return 'assets/img/[name]-[hash][extname]';
          if (/\.(woff2?|ttf|eot)$/.test(name ?? '')) return 'assets/fonts/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // ── Minification ────────────────────────────────────────────────────────
    minify: 'esbuild',

    // Inline assets smaller than this as base64 (reduces HTTP round-trips)
    assetsInlineLimit: 4096, // 4 KB

    // Split CSS per-chunk (prevents unused CSS blocking render)
    cssCodeSplit: true,

    // Enable CSS minification
    cssMinify: true,
  },

  // ── Dependency pre-bundling ──────────────────────────────────────────────
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'axios',
      'framer-motion',
    ],
    esbuildOptions: {
      treeShaking: true,
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },
});

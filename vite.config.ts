import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
    // esbuild is faster; use 'terser' if you want maximum compression
    minify: 'esbuild',

    // Inline assets smaller than this as base64 (reduces HTTP round-trips)
    assetsInlineLimit: 4096, // 4 KB

    // Split CSS per-chunk (prevents unused CSS blocking render)
    cssCodeSplit: true,

    // Enable CSS minification
    cssMinify: true,
  },

  // ── Dependency pre-bundling ──────────────────────────────────────────────
  // Forces Vite to pre-bundle these in dev so HMR is fast; also hints
  // the optimizer about what to treeshake in prod.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'axios',
      // Explicitly include only the framer-motion entry so the optimizer
      // can dead-code-eliminate unused exports (layout, 3D, etc.)
      'framer-motion',
    ],
    // Tell esbuild to treeshake these packages aggressively
    esbuildOptions: {
      treeShaking: true,
      // Drop console.log and debugger in production
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },
});

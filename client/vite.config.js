import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Resolve the owning package name for a module id, e.g.
 *   .../node_modules/@react-three/drei/core/x.js -> "@react-three/drei"
 *   .../node_modules/react-dom/client.js         -> "react-dom"
 * Returns null for anything outside node_modules (i.e. our own source).
 *
 * Matching on the package NAME rather than a substring of the full path is the
 * whole point: `id.includes('react')` also matches @react-three/drei,
 * react-hook-form, react-i18next, @radix-ui/react-avatar and friends, which
 * collapses most of the dependency tree into one "react" chunk.
 */
function getPackageName(id) {
  const normalized = id.replace(/\\/g, '/')            // Windows paths
  const match = normalized.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/)
  return match ? match[1] : null
}

/**
 * Only list packages that are genuinely part of the INITIAL load.
 *
 * Anything used solely behind a lazy() boundary must be left out — naming a
 * chunk for it (or falling through to a catch-all 'vendor') forces it into a
 * static chunk that Vite then modulepreloads from index.html, so every visitor
 * downloads it on the homepage. That is exactly what happened to three.js:
 * ~896 kB preloaded on every page for a Gallery-only background.
 *
 * three / @react-three/* are deliberately absent: their only importer is
 * GalleryBackground.jsx, which GalleryHero lazy-loads.
 */
const CHUNK_GROUPS = {
  react: ['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom'],
  motion: ['framer-motion', 'motion', 'motion-dom', 'motion-utils'],
  gsap: ['gsap'],
  lenis: ['lenis'],
  // Stable, always-eager libs kept together so app-code edits don't invalidate
  // them. An explicit list, never a catch-all — see the note above.
  vendor: [
    'axios',
    'i18next',
    'i18next-browser-languagedetector',
    'react-i18next',
    'react-hook-form',
    'react-hot-toast',
    'react-helmet-async',
    'lucide-react',
    '@radix-ui/react-avatar',
    '@radix-ui/react-slot',
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
    'split-type',
  ],
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Opt-in so ordinary builds don't pay the visualizer's cost (~47% of build
    // time) or emit stats.html. Use `npm run build:analyze`.
    //
    // Driven by --mode rather than an env var because `ANALYZE=1 npm run build`
    // is bash-only — it fails on PowerShell and cmd, which is how this repo is
    // usually built. ANALYZE is still honoured for CI shells that set it.
    //
    // Note: --mode analyze makes Vite load .env/.env.analyze instead of
    // .env.production. Harmless today (client/ has no .env.production); if one
    // is ever added, mirror the vars into .env.analyze.
    (mode === 'analyze' || process.env.ANALYZE) &&
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        open: true,
      }),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          const pkg = getPackageName(id)
          if (!pkg) return                                  // app source — leave to Vite

          for (const [chunk, packages] of Object.entries(CHUNK_GROUPS)) {
            if (packages.includes(pkg)) return chunk
          }

          // No catch-all 'vendor': returning undefined lets Vite place the
          // module by reachability, so lazily-imported deps stay in the lazy
          // chunk instead of being hoisted into the initial payload.
          return undefined
        },
      },
    },
  },
}))
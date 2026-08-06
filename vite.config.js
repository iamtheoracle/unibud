import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — most-shared, smallest chunk
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          // Radix UI primitives
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-query';
          }
          // Recharts (large — keep separate for lazy-loaded chart pages)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/victory-vendor') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // date-fns
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-datefns';
          }
          // DnD — only used in specific pages
          if (id.includes('node_modules/@hello-pangea/dnd')) {
            return 'vendor-dnd';
          }
        },
      },
    },
  },
});

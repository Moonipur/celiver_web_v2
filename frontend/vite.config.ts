import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  server: {
    host: 'localhost',
    port: 3000,
    allowedHosts: ['clumpy-overfit-miguel.ngrok-free.dev'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),

    // --- CRITICAL ORDERING ---
    tanstackStart(), // 1. Must come before React and Nitro
    viteReact(), // 2. Standard React transforms
    nitro(), // 3. Nitro handles the final server bundling
    // -------------------------
  ],
  optimizeDeps: {
    include: ['react-to-print'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  ssr: {
    noExternal: ['react-to-print'],
  },
})

export default config

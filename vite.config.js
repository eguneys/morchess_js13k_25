import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

let reserved = []

export default defineConfig({
  base: './',
  plugins: [viteImagemin({
    optipng: { optimizationLevel: 7 }
  })],
  build: {
    assetsInlineLimit: 0,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      mangle: {
        module: true,
        properties: {
          keep_quoted: 'strict',
          reserved
        }
      }
    },
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].min.js',
      }
    }
  }
})
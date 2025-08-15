import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

let infos = [
  'welcome',
  'no_piece',
  'yes_piece',
  'zero_attacked_by_lower',
  'zero_attacked_by_upper',
  'attacks',
  'attacked_by',
  'blocks',
  'blocked_attacks',
  'blocked_attacked_by',
]
let reserved = ['mid', 'bass', 'treble', 'black', 'white', ...infos]


export default defineConfig({
  base: './',
  plugins: [viteImagemin({
    optipng: { optimizationLevel: 7 }
  })],
  build: {
    assetsInlineLimit: 0,
    target: 'esnext',
    minify: 'terser',
    /*
    terserOptions: {
      mangle: {
        module: true,
        properties: {
          keep_quoted: 'strict',
          reserved,
          //debug: true
        },
      },
    },
    */
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
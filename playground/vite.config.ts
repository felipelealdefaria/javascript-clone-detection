import { defineConfig } from 'vite'

export default defineConfig({
  root: import.meta.dirname,
  // Relative asset paths work both locally and under /javascript-clone-detection/ on GitHub Pages.
  base: './',
  // Babel + CodeMirror make one ~1.1 MB chunk (~320 kB gzipped); fine for a single-page tool.
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2022', chunkSizeWarningLimit: 1500 },
})

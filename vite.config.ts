import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import * as path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/strict-store.ts',
      name: 'strict-store',
      fileName: 'strict-store',
      formats: ['es']
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: '.',
      rollupTypes: true,
      insertTypesEntry: true
    }
  )]
})

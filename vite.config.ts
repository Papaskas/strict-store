import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.module.ts',
      name: 'strict-store',
      fileName: 'strict-store',
      formats: ['es'],
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'strict-store': path.resolve(__dirname, './src/index.module.ts'),
      '@core': path.resolve(__dirname, './src/modules/core'),
      '@strict-store': path.resolve(__dirname, './src/modules/strict-store'),
      '@strict-json': path.resolve(__dirname, './src/modules/strict-json'),
    },
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: '.',
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
});

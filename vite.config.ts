/// <reference types="vitest/config" />
import { AliasOptions, defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

const pathAlias: AliasOptions = {
  '@test': path.resolve(__dirname, './test'),

  'strict-store': path.resolve(__dirname, './src/index.module.ts'),
  '@core': path.resolve(__dirname, './src/modules/core'),
  '@strict-store': path.resolve(__dirname, './src/modules/strict-store'),
  '@strict-json': path.resolve(__dirname, './src/modules/strict-json'),
};

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
    alias: pathAlias,
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: '.',
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
  test: {
    alias: pathAlias,
    globals: true,
    environment: 'jsdom',
  },
});

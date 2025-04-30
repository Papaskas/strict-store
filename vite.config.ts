import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

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
  plugins: [dts()]
})

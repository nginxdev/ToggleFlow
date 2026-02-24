import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.e2e-spec.ts'],
    root: './test',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})

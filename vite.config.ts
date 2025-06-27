import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['fs', 'path', 'child_process', 'os', 'inquirer', 'commander', 'openai', 'fs-extra', 'dotenv']
    },
    target: 'node16',
    outDir: 'dist'
  },
  test: {
    environment: 'node'
  }
});
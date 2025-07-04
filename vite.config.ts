import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'fs', 'path', 'child_process', 'os', 'inquirer', 'commander', 'openai', 'fs-extra', 'dotenv', 'react', 'ink',
        'crypto', 'util', 'stream', 'http', 'https', 'net', 'tls', 'url', 'buffer', 'assert', 'events',
        'readline', 'zlib', 'string_decoder', 'querystring', 'punycode', 'dns', 'fs/promises',
        'node:process', 'node:fs', 'node:path', 'node:os', 'node:crypto', 'node:util', 'node:stream',
        'mustache', 'marked-terminal', 'md-to-pdf', 'ai', '@ai-sdk/anthropic', '@ai-sdk/mistral', '@ai-sdk/openai',
        'chalk'
      ],
      output: {
        interop: 'auto'
      }
    },
    target: 'node16',
    outDir: 'dist'
  },
});
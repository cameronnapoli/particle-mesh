import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  target: 'es2020',
  clean: true,
  external: ['react', 'three'],
  // esbuild strips module-level directives, so re-add it for Next.js server components
  banner: { js: '\'use client\';' },
});

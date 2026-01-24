import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { alphaTab } from '@coderline/alphatab-vite';

export default defineConfig({
  plugins: [alphaTab(), sveltekit()],
  resolve: {
    alias: {
      '$frets': '/src/frets',
      '$practice': '/src/practice'
    }
  }
});

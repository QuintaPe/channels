// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import path from 'path';


import vercel from '@astrojs/vercel';
import clerk from "@clerk/astro";

export default defineConfig({
  integrations: [react(), clerk()],
  adapter: vercel(),
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    }
  },
});
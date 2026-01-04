// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],

  image: {
    domains: ['devfolio.co', 'assets.devfolio.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.devfolio.co'
      }
    ]
  }
});
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://zypherpunk.d4mr.com',
  
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

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
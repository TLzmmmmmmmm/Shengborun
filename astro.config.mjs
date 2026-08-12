import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.shengborun.com',
  output: 'static',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});

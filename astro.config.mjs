import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.bjlmks.com.cn',
  output: 'static',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});

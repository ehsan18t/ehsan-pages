// @ts-check
import vercelAdapter from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import icon from "astro-icon";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://ehsankhan.me',
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercelAdapter(),
  integrations: [icon(), react(), sitemap()],
});
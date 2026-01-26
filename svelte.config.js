import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$assets: 'src/lib/assets',
			$data: 'src/lib/data',
			$utils: 'src/lib/utils',
			$icons: 'src/lib/icons',
			$routes: 'src/routes',
			$hooks: 'src/lib/hooks',
			$stores: 'src/lib/stores'
		}
	}
};

export default config;

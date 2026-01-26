import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Svelte 5 is more lenient with CSS warnings,
		// but you can explicitly ignore them here if they persist.
		cssHash: ({ hash, css }) => `s-${hash(css)}`
	},
	kit: {
		adapter: adapter(),
		alias: {
			$components: 'src/lib/components',
			$assets: 'src/lib/assets',
			$data: 'src/lib/data',
			$utils: 'src/lib/utils',
			$icons: 'src/lib/icons',
			$routes: 'src/routes',
			$hooks: 'src/lib/hooks'
		}
	}
};

export default config;

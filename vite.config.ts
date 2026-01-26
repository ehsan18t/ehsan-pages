import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
    plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
    ssr: {
        // GSAP is a client-only library - mark it as noExternal so Vite bundles it
        // properly during SSR build instead of trying to require() the ESM module
        noExternal: ['gsap']
    }
});

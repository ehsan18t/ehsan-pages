<script lang="ts">
	import { browser } from '$app/environment';
	import FloatingNav from '$components/layout/FloatingNav.svelte';
	import MobileNav from '$components/layout/MobileNav.svelte';
	import { navigation } from '$lib/stores';
	import { onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	// Initialize navigation system on mount
	onMount(() => {
		if (browser) {
			navigation.init();

			return () => {
				navigation.destroy();
			};
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<FloatingNav />
<MobileNav />
{@render children()}

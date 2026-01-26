<script lang="ts">
	import { browser } from '$app/environment';
	import FloatingNav from '$components/layout/FloatingNav.svelte';
	import MobileNav from '$components/layout/MobileNav.svelte';
	import { destroyNavigation, initNavigation } from '$lib/stores';
	import { onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	// Initialize navigation system on mount
	onMount(() => {
		if (browser) {
			initNavigation();

			return () => {
				destroyNavigation();
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

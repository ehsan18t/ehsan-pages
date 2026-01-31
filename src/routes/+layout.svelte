<script lang="ts">
	import { browser } from '$app/environment';
	import FloatingNav from '$components/layout/FloatingNav.svelte';
	import MobileNav from '$components/layout/MobileNav.svelte';
	import { navigation } from '$lib/stores';
	import './layout.css';

	let { children } = $props();

	// Initialize navigation system via $effect
	$effect(() => {
		if (!browser) return;

		navigation.init();

		return () => {
			navigation.destroy();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<FloatingNav />
<MobileNav />
{@render children()}

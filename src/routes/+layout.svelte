<script lang="ts">
	import initObservation from '$assets/animations';
	import FloatingNav from '$components/layout/FloatingNav.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { onDestroy, onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	// Cleanup function for animation observers
	let cleanup: (() => void) | undefined;

	onMount(() => {
		cleanup = initObservation();
	});

	onDestroy(() => {
		if (cleanup) cleanup();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<FloatingNav />
{@render children()}

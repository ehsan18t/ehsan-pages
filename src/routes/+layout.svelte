<script lang="ts">
	import FloatingNav from '$components/layout/FloatingNav.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<FloatingNav />
{@render children()}

<script lang="ts">
	import FloatingNav from '$components/layout/FloatingNav.svelte';
	import MobileNav from '$components/layout/MobileNav.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<FloatingNav />
<MobileNav />
{@render children()}

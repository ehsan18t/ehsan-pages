<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		size: number;
		duration?: number;
		rotation?: number;
		opacity?: number;
		starOnly?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		size,
		duration = 10,
		rotation = 0,
		opacity = 100,
		starOnly = false,
		class: className,
		children
	}: Props = $props();
</script>

{#if !starOnly}
	<div
		class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-300/5 shadow-[0_0_80px_inset] shadow-emerald-300/5"
		style="width: {size}rem; height: {size}rem; opacity: {opacity}%;"
	></div>
{/if}

{#if children}
	<div class="animate-when-visible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
		<div
			class="animate-when-visible"
			style="animation: custom-spin {duration}s linear infinite; width: {size}rem; height: {size}rem; transform: rotate({rotation}deg); --initial-rotation: {rotation}deg;"
		>
			{@render children()}
		</div>
	</div>
{/if}

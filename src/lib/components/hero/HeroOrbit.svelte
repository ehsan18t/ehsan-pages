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
		class: className = '',
		children
	}: Props = $props();
</script>

{#if !starOnly}
	<div
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-300/5 shadow-[0_0_80px_inset] shadow-emerald-300/5 {className}"
		style="width: {size}rem; height: {size}rem; opacity: {opacity}%;"
	></div>
{/if}

{#if children}
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div
			class="orbit-spin"
			style="
				--duration: {duration}s;
				--initial-rotation: {rotation}deg;
				width: {size}rem;
				height: {size}rem;
			"
		>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.orbit-spin {
		animation: orbit-spin var(--duration) linear infinite;
		transform: rotate(var(--initial-rotation));
	}

	@keyframes orbit-spin {
		from {
			transform: rotate(var(--initial-rotation));
		}
		to {
			transform: rotate(calc(var(--initial-rotation) + 360deg));
		}
	}
</style>

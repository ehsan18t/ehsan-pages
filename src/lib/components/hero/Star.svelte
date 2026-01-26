<script lang="ts">
	/**
	 * Star Component - Animated spinning star with viewport optimization
	 *
	 * CSS animation pauses when outside viewport to save battery on mobile
	 */
	import { viewportAnimation } from '$lib/actions';
	import Icon from '@iconify/svelte';

	interface Props {
		size: number;
		duration?: number;
		opacity?: number;
	}

	let { size, duration = 10, opacity = 100 }: Props = $props();
</script>

<div
	use:viewportAnimation={{ rootMargin: '100px' }}
	class="star-spin absolute z-0 text-emerald-300"
	style="
		width: {size}rem;
		height: {size}rem;
		opacity: {opacity}%;
		--duration: {duration}s;
	"
>
	<Icon icon="mdi:star-four-points" class="h-full w-full" />
</div>

<style>
	.star-spin {
		animation: spin var(--duration) linear infinite;
		will-change: transform;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.star-spin {
			animation: none;
		}
	}
</style>

<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		size: number;
		duration?: number;
		opacity?: number;
	}

	let { size, duration = 10, opacity = 100 }: Props = $props();
</script>

<div
	class="absolute z-0 text-emerald-300"
	style="
		width: {size}rem;
		height: {size}rem;
		opacity: {opacity}%;
		animation: spin {duration}s linear infinite;
	"
>
	<Icon icon="mdi:star-four-points" class="h-full w-full" />
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>

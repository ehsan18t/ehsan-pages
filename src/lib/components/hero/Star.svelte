<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		size: number;
		duration?: number;
		opacity?: number;
	}

	let { size, duration = 10, opacity = 100 }: Props = $props();
</script>

<Icon
	icon="mdi:star-four-points"
	class="animate-when-visible absolute z-0 animate-spin text-emerald-300"
	style="width: {size}rem; height: {size}rem; animation-duration: {duration}s; opacity: {opacity}%;"
/>

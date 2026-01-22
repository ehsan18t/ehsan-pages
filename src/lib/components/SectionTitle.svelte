<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		p1: string;
		p2: string;
		subtitle?: string;
		class?: string;
	}

	let { p1, p2, subtitle, class: className }: Props = $props();
</script>

<div class={cn('mb-12 text-center md:mb-16', className)}>
	<h2
		id="testimonials-heading"
		class="font-doto mb-4 flex flex-wrap justify-center gap-3 text-4xl font-bold md:text-5xl"
	>
		<span class="text-accent-title">{p1}</span>
		<span>{p2}</span>
	</h2>
	{#if subtitle}
		<div class="from-accent-500 to-accent-900 mx-auto h-1 w-24 rounded-full bg-linear-to-r"></div>
		<p class="text-foreground-muted mx-auto mt-6 max-w-2xl text-lg">{subtitle}</p>
	{/if}
</div>

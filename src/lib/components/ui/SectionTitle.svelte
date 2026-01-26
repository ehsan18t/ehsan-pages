<script lang="ts">
	import { cn } from '$utils/cn';

	interface Props {
		p1: string;
		p2: string;
		subtitle?: string;
		class?: string;
		id?: string;
	}

	let { p1, p2, subtitle, class: className, id }: Props = $props();
</script>

<div class={cn('mb-12 text-center md:mb-16', className)}>
	<h2
		{id}
		class="mb-4 flex flex-wrap justify-center gap-3 font-doto text-4xl font-bold md:text-5xl"
	>
		<span class="text-accent-title">{p1}</span>
		<span>{p2}</span>
	</h2>
	{#if subtitle}
		<div class="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-accent-500 to-accent-900"></div>
		<p class="mx-auto mt-6 max-w-2xl text-lg text-foreground-muted">{subtitle}</p>
	{/if}
</div>

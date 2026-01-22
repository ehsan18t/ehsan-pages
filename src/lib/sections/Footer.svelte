<script lang="ts">
	import SectionTitle from '$components/SectionTitle.svelte';
	import Terminal from '$components/Terminal.svelte';
	import Icon from '@iconify/svelte';

	const currentYear = new Date().getFullYear();

	const tech = [
		{
			name: 'Svelte',
			icon: 'simple-icons:svelte'
		},
		{
			name: 'SvelteKit',
			icon: 'simple-icons:svelte'
		},
		{
			name: 'TailwindCSS',
			icon: 'simple-icons:tailwindcss'
		}
	];
</script>

<footer
	id="contact"
	class="from-background via-background/90 relative mt-12 overflow-hidden bg-linear-to-t to-transparent pt-16 pb-10"
>
	<!-- Main Footer Content -->
	<div class="relative z-10 container mx-auto px-4">
		<!-- Interactive Logo -->
		<SectionTitle p1="Contact" p2="me" class="group mb-8 flex justify-center md:mb-8" />

		<!-- Terminal Section -->
		<Terminal />

		<!-- Footer bottom -->
		<div class="flex flex-col-reverse items-center justify-between gap-1 pt-4 md:flex-row">
			<p
				class="text-foreground-muted hover:text-foreground text-sm transition-colors duration-300"
			>
				© <span class="text-foreground">{currentYear}</span> Ehsan Khan. All rights reserved.
			</p>
			<div class="text-foreground-muted mt-4 flex items-center gap-1 text-sm md:mt-0">
				<span class="bg-accent-text inline-block h-2 w-2 animate-pulse rounded-full"></span>
				<span class="flex items-center gap-1">
					Built with
					<span class="ml-2 flex items-center gap-2.5">
						{#each tech as item}
							<span
								class="tech-icon bg-accent-bg/20 hover:text-accent-300 hover:bg-accent-bg/30 text-accent-text relative flex h-7 w-7 items-center justify-center rounded-md p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_-2px_oklch(var(--accent-bg)/0.5)]"
								title={item.name}
							>
								<Icon icon={item.icon} width={20} height={20} />
							</span>
						{/each}
					</span>
				</span>
			</div>

			<!-- Easter Egg: Hidden Message -->
			<div class="hidden">Thanks for checking out my code!</div>
		</div>
	</div>
</footer>

<style>
	.tech-icon:hover::before {
		content: attr(title);
		position: absolute;
		top: -24px;
		font-size: 10px;
		background: oklch(var(--accent-bg) / 0.8);
		color: oklch(var(--accent-text));
		padding: 2px 6px;
		border-radius: 4px;
		white-space: nowrap;
	}
</style>

<script lang="ts">
	import Terminal from '$components/contact/Terminal.svelte';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import Icon from '@iconify/svelte';

	const currentYear = new Date().getFullYear();

	const tech = [
		{
			name: 'TypeScript',
			icon: 'simple-icons:typescript'
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
	class="relative mt-12 overflow-hidden bg-linear-to-t from-background via-background/90 to-transparent pt-16 pb-10"
>
	<!-- Main Footer Content -->
	<div class="relative z-10 container mx-auto px-4">
		<!-- Interactive Logo -->
		<SectionTitle p1="Contact" p2="me" class="group mb-8 flex justify-center md:mb-8" />

		<!-- Terminal Section -->
		<Terminal />

		<!-- Footer bottom -->
		<div class="flex flex-col-reverse items-center justify-between gap-1 pt-4 md:flex-row">
			<p class="text-sm text-foreground-muted transition-colors duration-300 hover:text-foreground">
				© <span class="text-foreground">{currentYear}</span> Ehsan Khan. All rights reserved.
			</p>
			<div class="mt-4 flex items-center gap-1 text-sm text-foreground-muted md:mt-0">
				<span class="animate-pulse inline-block h-2 w-2 rounded-full bg-accent-text"></span>
				<span class="flex items-center gap-1 select-none">
					Built with
					<span class="ml-2 flex items-center gap-2.5">
						{#each tech as item (item.name)}
							<span
								class="footer-tech-icon relative flex cursor-pointer items-center justify-center rounded-md bg-accent-bg/20 p-1.5 text-accent-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-bg/30 hover:text-accent-300 hover:shadow-[0_4px_8px_-2px_oklch(var(--accent-bg)/0.5)]"
								title={item.name}
							>
								<Icon icon={item.icon} />
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
	.footer-tech-icon:hover::before {
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

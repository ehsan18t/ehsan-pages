<script lang="ts">
	import ImageSlider from '$components/media/ImageSlider.svelte';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import TechPill from '$components/ui/TechPill.svelte';
	import { projects } from '$data';
	import Icon from '@iconify/svelte';
</script>

<section id="projects" class="scroll-mt-20 py-20 md:py-28">
	<div class="container mx-auto px-4">
		<SectionTitle
			p1="My"
			p2="Creations"
			subtitle="A selection of projects where code meets creativity."
		/>

		<div
			id="project-grid-container"
			class="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3"
		>
			{#each projects as project, index (project.title)}
				<article
					class="project-card card-elevated flex h-full flex-col overflow-hidden"
					style="--delay: {index * 0.1}s; contain: content;"
				>
					<ImageSlider
						title={project.title}
						images={project.imageUrls}
						imageLayout={project.imageLayout}
					/>

					<div class="flex flex-1 flex-col gap-3 border-t border-foreground/8 p-5">
						<h3
							class="m-0 text-xl leading-tight font-semibold text-foreground transition-colors duration-300 group-hover:text-accent-500"
						>
							{project.title}
						</h3>
						<p class="m-0 grow text-justify text-sm leading-relaxed text-foreground-muted">
							{project.shortDescription}
						</p>

						<div class="mt-1">
							<div class="flex flex-wrap gap-1.5">
								{#each project.techStack as tech (tech)}
									<TechPill name={tech} />
								{/each}
							</div>
						</div>

						<div
							class="mt-2 flex w-full flex-wrap justify-between border-t border-foreground/8 pt-3"
						>
							<a
								href={project.liveUrl || '#'}
								target="_blank"
								rel="noopener noreferrer"
								class="project-link inline-flex min-w-[calc(50%-0.5rem)] items-center justify-center gap-1.5 rounded-md bg-foreground/5 px-3 py-1.5 text-sm font-medium text-accent-500 transition-colors duration-200 hover:bg-accent-500/10"
								class:disabled={!project.liveUrl}
								aria-disabled={!project.liveUrl}
								title={project.liveUrl ? 'View live demo' : 'Live demo not available'}
								onclick={!project.liveUrl ? (e) => e.preventDefault() : undefined}
							>
								<Icon icon="mdi:open-in-new" class="h-4 w-4" />
								<span>View Live</span>
							</a>
							<a
								href={project.repoUrl || '#'}
								target="_blank"
								rel="noopener noreferrer"
								class="project-link inline-flex min-w-[calc(50%-0.5rem)] items-center justify-center gap-1.5 rounded-md bg-foreground/5 px-3 py-1.5 text-sm font-medium text-accent-500 transition-colors duration-200 hover:bg-accent-500/10"
								class:disabled={!project.repoUrl}
								aria-disabled={!project.repoUrl}
								title={project.repoUrl ? 'View source code' : 'Source code not available'}
								onclick={!project.repoUrl ? (e) => e.preventDefault() : undefined}
							>
								<Icon icon="mdi:github" class="h-4 w-4" />
								<span>Source Code</span>
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Hover effect for title */
	.project-card:hover h3 {
		@apply text-accent-500;
	}

	/* Disabled link styles */
	.project-link.disabled {
		@apply pointer-events-none cursor-not-allowed opacity-50;
	}

	/* Scroll optimization class */
	:global(.scroll-active) .project-card {
		transition: none !important;
		will-change: auto !important;
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.project-card,
		.project-link {
			transition: none !important;
		}

		.project-card:hover {
			transform: none !important;
		}
	}
</style>

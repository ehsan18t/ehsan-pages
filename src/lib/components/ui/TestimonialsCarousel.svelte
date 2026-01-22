<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
	import emblaCarouselSvelte from 'embla-carousel-svelte';

	interface Testimonial {
		id: number;
		content: string;
		name: string;
		role: string;
		image?: string;
	}

	interface Props {
		testimonials: Testimonial[];
	}

	let { testimonials }: Props = $props();

	let selectedIndex = $state(0);
	let scrollSnaps = $state<number[]>([]);
	let emblaApi = $state<EmblaCarouselType | undefined>(undefined);

	const options: EmblaOptionsType = {
		loop: true,
		containScroll: 'trimSnaps',
		skipSnaps: true,
		duration: 15
	};

	function onEmblaInit(event: CustomEvent<EmblaCarouselType>) {
		emblaApi = event.detail;
		scrollSnaps = emblaApi.scrollSnapList();
		selectedIndex = emblaApi.selectedScrollSnap();

		emblaApi.on('select', () => {
			selectedIndex = emblaApi!.selectedScrollSnap();
		});

		emblaApi.on('reInit', () => {
			scrollSnaps = emblaApi!.scrollSnapList();
		});
	}

	function scrollNext() {
		emblaApi?.scrollNext();
	}

	function scrollPrev() {
		emblaApi?.scrollPrev();
	}

	function scrollTo(index: number) {
		emblaApi?.scrollTo(index);
	}
</script>

<div class="testimonial-section">
	<h2 class="mb-4 text-center font-doto text-4xl font-bold md:text-5xl">
		<span class="text-accent-title">Client</span> Testimonials
	</h2>
	<p class="mx-auto mb-16 max-w-2xl text-center text-foreground-muted">
		Don't just take my word for it - here's what clients have to say about working with me.
	</p>

	<div class="testimonial-carousel-container">
		<div
			class="testimonial-carousel-viewport"
			use:emblaCarouselSvelte={{ options, plugins: [] }}
			onemblaInit={onEmblaInit}
		>
			<div class="testimonial-carousel-slides">
				{#each testimonials as testimonial, index}
					<div class="testimonial-slide {selectedIndex === index ? 'slide-visible' : ''}">
						<div class="testimonial-card gap-6">
							<div class="testimonial-accent"></div>
							<Icon icon="fa6-solid:quote-left" class="quote-icon" />
							<p class="testimonial-content">{testimonial.content}</p>
							<div class="testimonial-author-container">
								<div class="testimonial-author-avatar">
									{#if testimonial.image}
										<img
											src={testimonial.image}
											alt={testimonial.name}
											class="testimonial-author-image"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<div class="testimonial-author-initials">
											{testimonial.name
												.split(' ')
												.map((n) => n[0])
												.join('')}
										</div>
									{/if}
								</div>
								<div class="testimonial-author-details">
									<h4 class="testimonial-author-name">{testimonial.name}</h4>
									<p class="testimonial-author-role">{testimonial.role}</p>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="pointer-events-none absolute inset-0 z-10">
			<button
				onclick={scrollPrev}
				aria-label="Previous testimonial"
				class="testimonial-btn-base testimonial-prev"
			>
				<Icon icon="mdi:chevron-left" class="h-6 w-6" />
			</button>
			<button
				onclick={scrollNext}
				aria-label="Next testimonial"
				class="testimonial-btn-base testimonial-next"
			>
				<Icon icon="mdi:chevron-right" class="h-6 w-6" />
			</button>
		</div>
	</div>

	<div class="testimonial-pagination">
		{#each scrollSnaps as _, i}
			<button
				class="testimonial-dot {i === selectedIndex
					? 'testimonial-dot-active'
					: 'testimonial-dot-inactive'}"
				onclick={() => scrollTo(i)}
				aria-label="View testimonial {i + 1}"
			></button>
		{/each}
	</div>
</div>

<style>
	/* Testimonial Carousel Animation Variables */
	:root {
		--testimonial-duration-normal: 300ms;
		--testimonial-duration-short: 200ms;
		--testimonial-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		--testimonial-timing-function-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
		--testimonial-shadow-normal: 0 4px 14px rgba(0, 0, 0, 0.08);
		--testimonial-shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	/* Testimonial Container */
	.testimonial-section {
		position: relative;
		margin: 0 auto;
		width: 100%;
		max-width: 72rem;
		padding-bottom: 2rem;
	}

	/* Testimonial Carousel Container */
	.testimonial-carousel-container {
		position: relative;
		cursor: grab;
		overflow: visible;
		user-select: none;
	}

	/* Carousel Viewport */
	.testimonial-carousel-viewport {
		overflow: hidden;
		border-radius: 1rem;
	}

	/* Slides container */
	:global(.testimonial-carousel-slides) {
		display: flex;
		will-change: transform;
	}

	/* Individual Slide */
	.testimonial-slide {
		width: 100%;
		min-width: 0;
		flex: 0 0 100%;
		padding: 1rem;
		opacity: 0;
		user-select: none;
		transition: opacity 0.5s var(--testimonial-timing-function);
		will-change: opacity;
	}

	.slide-visible {
		opacity: 1;
		z-index: 1;
	}

	/* Card Design */
	.testimonial-card {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 1rem;
		border: 1px solid oklch(var(--accent-bg) / 0.15);
		padding: 2rem;
		opacity: 0.4;
		backdrop-filter: blur(12px);
		background: linear-gradient(
			135deg,
			oklch(var(--accent-bg) / 0.08),
			oklch(var(--accent-bg) / 0.03)
		);
		box-shadow: var(--testimonial-shadow-normal);
		transition:
			opacity 0.2s ease,
			box-shadow 0.3s ease;
	}

	.slide-visible .testimonial-card {
		opacity: 1;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
		transition-property: opacity, box-shadow;
		transition-duration: 0.2s;
		will-change: opacity, box-shadow;
	}

	.testimonial-card:hover {
		box-shadow: var(--testimonial-shadow-hover);
	}

	/* Top accent border */
	.testimonial-accent {
		position: absolute;
		top: 0;
		left: 0;
		height: 0.25rem;
		width: 100%;
		border-radius: 0.375rem 0.375rem 0 0;
		background: linear-gradient(to right, oklch(var(--accent-text) / 0.7), var(--accent-title));
	}

	/* Quote icon */
	:global(.quote-icon) {
		height: 3rem;
		width: 3rem;
		color: oklch(var(--accent-text));
		opacity: 0.8;
	}

	/* Content */
	.testimonial-content {
		padding: 2rem 0;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 600;
		font-style: italic;
		color: var(--foreground);
		line-height: 1.7;
		flex-grow: 1;
	}

	@media (min-width: 1024px) {
		.testimonial-content {
			font-size: 1.125rem;
		}
	}

	/* Author info */
	.testimonial-author-container {
		margin-top: auto;
		display: flex;
		align-items: center;
		border-top: 1px solid oklch(var(--accent-bg) / 0.15);
		padding-top: 1.25rem;
	}

	.testimonial-author-avatar {
		margin-right: 1rem;
		height: 3.5rem;
		width: 3.5rem;
		overflow: hidden;
		border-radius: 50%;
		border: 2px solid oklch(var(--accent-text) / 0.3);
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		background: linear-gradient(135deg, oklch(var(--accent-bg) / 0.2), transparent);
	}

	.testimonial-author-image {
		height: 100%;
		width: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.testimonial-author-initials {
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
		font-weight: 700;
		text-transform: uppercase;
		color: oklch(var(--accent-text));
		background: linear-gradient(
			135deg,
			oklch(var(--accent-text) / 0.15),
			oklch(var(--accent-text) / 0.25)
		);
		letter-spacing: 0.025em;
	}

	.testimonial-author-name {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.testimonial-author-role {
		font-size: 0.875rem;
		color: oklch(var(--accent-text) / 0.7);
	}

	/* Next/Prev Button */
	.testimonial-btn-base {
		pointer-events: auto;
		position: absolute;
		top: 50%;
		z-index: 10;
		display: flex;
		height: 2.5rem;
		width: 2.5rem;
		transform: translateY(-50%);
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: 1px solid oklch(var(--accent-text) / 0.15);
		background-color: oklch(var(--accent-bg) / 0.1);
		color: oklch(var(--accent-text));
		opacity: 0.7;
		backdrop-filter: blur(12px);
		transition:
			opacity var(--testimonial-duration-normal) ease,
			background-color var(--testimonial-duration-normal) ease,
			transform var(--testimonial-duration-normal) ease,
			box-shadow var(--testimonial-duration-normal) ease;
		will-change: opacity, background-color, transform, box-shadow;
	}

	@media (min-width: 640px) {
		.testimonial-btn-base {
			height: 3rem;
			width: 3rem;
		}
	}

	.testimonial-btn-base:hover {
		background-color: oklch(var(--accent-bg) / 0.2);
		transform: translateY(-50%) scale(1.05);
		opacity: 1;
		box-shadow: 0 0 15px oklch(var(--accent-text) / 0.3);
	}

	.testimonial-next {
		right: 0.5rem;
	}

	@media (min-width: 768px) {
		.testimonial-next {
			right: 0;
		}
	}

	.testimonial-prev {
		left: 0.5rem;
	}

	@media (min-width: 768px) {
		.testimonial-prev {
			left: 0;
		}
	}

	/* Pagination Dots */
	.testimonial-pagination {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.testimonial-dot {
		height: 0.75rem;
		cursor: pointer;
		border-radius: 9999px;
		border: none;
		transform-origin: center;
		will-change: width, background-color;
		transition:
			width 0.3s var(--testimonial-timing-function-spring),
			background-color 0.3s ease;
	}

	.testimonial-dot-active {
		width: 2rem;
		background-color: oklch(var(--accent-text));
	}

	.testimonial-dot-inactive {
		width: 0.75rem;
		background-color: oklch(var(--accent-text) / 0.3);
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.testimonial-card,
		.testimonial-btn-base,
		.testimonial-dot {
			transition: none !important;
			animation: none !important;
			transform: none !important;
			opacity: 1 !important;
		}
	}
</style>

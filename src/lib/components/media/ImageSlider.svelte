<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';
	import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import { onDestroy } from 'svelte';

	interface Props {
		images: string[];
		title: string;
		imageLayout?: 'cover' | 'contain';
		autoplay?: boolean;
		autoplayInterval?: number;
	}

	let {
		images,
		title,
		imageLayout = 'cover',
		autoplay = false,
		autoplayInterval = 5000
	}: Props = $props();

	let selectedIndex = $state(0);
	let scrollSnaps = $state<number[]>([]);
	let isFullscreen = $state(false);
	let showControls = $state(false);
	let emblaApi = $state<EmblaCarouselType | undefined>(undefined);

	// Lightbox state
	let lightboxIndex = $state(0);
	let lightboxImageContainerRef = $state<HTMLDivElement | null>(null);

	// Use $derived for values that depend on images prop
	let hasMultipleImages = $derived(images.length > 1);

	// Embla options need to be reactive
	let options = $derived<EmblaOptionsType>({
		loop: images.length > 1,
		align: 'start',
		containScroll: 'trimSnaps'
	});

	function onEmblaInit(event: CustomEvent<EmblaCarouselType>) {
		emblaApi = event.detail;
		scrollSnaps = emblaApi.scrollSnapList();

		emblaApi.on('select', () => {
			selectedIndex = emblaApi!.selectedScrollSnap();
		});

		emblaApi.on('reInit', () => {
			scrollSnaps = emblaApi!.scrollSnapList();
		});
	}

	function scrollPrev() {
		emblaApi?.scrollPrev();
	}

	function scrollNext() {
		emblaApi?.scrollNext();
	}

	function scrollTo(index: number) {
		emblaApi?.scrollTo(index);
	}

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
		lightboxIndex = selectedIndex;

		if (isFullscreen) {
			document.body.classList.add('lightbox-open');
		} else {
			document.body.classList.remove('lightbox-open');
		}
	}

	function closeLightbox() {
		isFullscreen = false;
		document.body.classList.remove('lightbox-open');
	}

	function lightboxPrev() {
		if (!lightboxImageContainerRef) return;
		lightboxImageContainerRef.dataset.direction = 'prev';
		lightboxImageContainerRef.classList.remove('transitioning');
		void lightboxImageContainerRef.offsetWidth; // Force reflow
		lightboxImageContainerRef.classList.add('transitioning');
		lightboxIndex = lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1;
	}

	function lightboxNext() {
		if (!lightboxImageContainerRef) return;
		lightboxImageContainerRef.dataset.direction = 'next';
		lightboxImageContainerRef.classList.remove('transitioning');
		void lightboxImageContainerRef.offsetWidth; // Force reflow
		lightboxImageContainerRef.classList.add('transitioning');
		lightboxIndex = lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0;
	}

	// Keyboard navigation for lightbox
	function handleKeydown(e: KeyboardEvent) {
		if (!isFullscreen) return;

		if (e.key === 'Escape') closeLightbox();
		else if (e.key === 'ArrowLeft') lightboxPrev();
		else if (e.key === 'ArrowRight') lightboxNext();
	}

	// Autoplay
	let autoplayTimer: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		if (emblaApi && autoplay) {
			autoplayTimer = setInterval(() => {
				if (emblaApi?.canScrollNext()) {
					emblaApi.scrollNext();
				} else if (options.loop) {
					emblaApi?.scrollTo(0);
				}
			}, autoplayInterval);

			return () => {
				if (autoplayTimer) clearInterval(autoplayTimer);
			};
		}
	});

	onDestroy(() => {
		if (!browser) return;
		if (autoplayTimer) clearInterval(autoplayTimer);
		document.body.classList.remove('lightbox-open');
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if images && images.length > 0}
	<div
		class="slider embla"
		onmouseenter={() => (showControls = true)}
		onmouseleave={() => (showControls = false)}
		style:--slider-image-count={images.length}
		style:--current-index={selectedIndex}
		aria-label="{title} image gallery"
		role="region"
	>
		<div
			class="embla__viewport"
			use:emblaCarouselSvelte={{ options, plugins: [] }}
			onemblaInit={onEmblaInit}
		>
			<div class="embla__container">
				{#each images as image, index}
					<div class="embla__slide">
						<img
							src={image}
							alt="{title} - image {index + 1}"
							class="slider-image"
							style:object-fit={imageLayout}
							loading={index === 0 ? 'eager' : 'lazy'}
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Controls -->
		<div class="slider-controls {showControls ? 'visible' : ''}">
			{#if hasMultipleImages}
				<button
					class="slider-button slider-prev"
					onclick={scrollPrev}
					disabled={!emblaApi?.canScrollPrev() && !options.loop}
					aria-label="Previous slide"
				>
					<Icon icon="mdi:chevron-left" />
				</button>

				<button
					class="slider-button slider-next"
					onclick={scrollNext}
					disabled={!emblaApi?.canScrollNext() && !options.loop}
					aria-label="Next slide"
				>
					<Icon icon="mdi:chevron-right" />
				</button>

				<div class="slider-pagination">
					{#each scrollSnaps as _, index}
						<button
							class="slider-dot {index === selectedIndex ? 'active' : ''}"
							onclick={() => scrollTo(index)}
							aria-label="Go to slide {index + 1}"
						></button>
					{/each}
				</div>

				<div class="slider-counter">
					{selectedIndex + 1}/{images.length}
				</div>
			{/if}

			<button class="slider-fullscreen" onclick={toggleFullscreen} aria-label="View fullscreen">
				<Icon icon="mdi:fullscreen" />
			</button>
		</div>
	</div>

	<!-- Lightbox -->
	{#if isFullscreen}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="slider-lightbox"
			onclick={closeLightbox}
			onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				class="slider-lightbox-content"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div
					bind:this={lightboxImageContainerRef}
					class="slider-lightbox-image-container"
					data-direction="next"
				>
					<img
						src={images[lightboxIndex]}
						alt="{title} - image {lightboxIndex + 1}"
						class="slider-lightbox-image animate-zoom-in fill-forwards"
						loading="eager"
					/>
				</div>

				<button
					class="slider-lightbox-close animate-fade-in fill-forwards"
					onclick={closeLightbox}
					aria-label="Close fullscreen view"
				>
					<Icon icon="mdi:close" />
				</button>

				{#if hasMultipleImages}
					<button
						class="slider-lightbox-nav slider-prev animate-fade-in fill-forwards animation-delay-200"
						onclick={lightboxPrev}
						aria-label="Previous image"
					>
						<Icon icon="mdi:chevron-left" />
					</button>
					<button
						class="slider-lightbox-nav slider-next animate-fade-in fill-forwards animation-delay-200"
						onclick={lightboxNext}
						aria-label="Next image"
					>
						<Icon icon="mdi:chevron-right" />
					</button>
					<div class="slider-lightbox-counter animate-fade-up fill-forwards animation-delay-300">
						{lightboxIndex + 1} / {images.length}
					</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style>
	/* Common animation values as CSS variables */
	:root {
		--slider-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
		--slider-shadow-normal: 0 4px 12px rgba(0, 0, 0, 0.2);
		--slider-shadow-hover: 0 8px 20px rgba(0, 0, 0, 0.35);
		--slider-bg-normal: rgba(0, 0, 0, 0.5);
		--slider-bg-hover: rgba(0, 0, 0, 0.85);
		--slider-duration-normal: 0.4s;
		--slider-duration-short: 0.3s;
	}

	/* --- Core Embla Styles --- */
	.embla {
		position: relative;
		aspect-ratio: 16 / 10;
		width: 100%;
		overflow: hidden;
		border-radius: 0.75rem 0.75rem 0 0;
		background-color: #f0f0f0;
		user-select: none;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
		transition: box-shadow 0.5s ease;
	}

	.embla:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
	}

	:global(.embla__viewport) {
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	:global(.embla__container) {
		display: flex;
		height: 100%;
		will-change: transform;
	}

	.embla__slide {
		position: relative;
		height: 100%;
		flex: 0 0 100%;
		overflow: hidden;
		transition: opacity 0.3s ease-out;
	}

	/* --- Images --- */
	.slider-image {
		display: block;
		height: 100%;
		width: 100%;
		object-fit: cover;
		transition:
			transform 0.5s ease,
			filter 0.5s ease;
		filter: brightness(0.95) contrast(1.02);
		will-change: transform, filter;
	}

	.embla__slide:hover .slider-image {
		transform: scale(1.05);
		filter: brightness(1.05) contrast(1.05);
	}

	/* --- Controls --- */
	.slider-controls {
		pointer-events: none;
		position: absolute;
		inset: 0;
		z-index: 1;
		background-color: transparent;
		opacity: 0;
		transition: opacity 0.5s ease;
		will-change: opacity;
	}

	.embla:hover .slider-controls,
	.slider-controls.visible {
		background-color: rgba(0, 0, 0, 0.05);
		opacity: 1;
	}

	/* Enable pointer events for controls */
	.slider-button,
	.slider-pagination,
	.slider-counter,
	.slider-fullscreen {
		pointer-events: auto;
	}

	/* --- Navigation Buttons --- */
	.slider-button {
		pointer-events: auto;
		position: absolute;
		top: 50%;
		z-index: 5;
		display: flex;
		height: 2.75rem;
		width: 2.75rem;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		transform: translateY(-50%);
		transition:
			background-color var(--slider-duration-normal) ease,
			transform var(--slider-duration-normal) var(--slider-timing-function),
			border-color var(--slider-duration-normal) ease;
		box-shadow: var(--slider-shadow-normal);
		will-change: transform, background-color;
	}

	.slider-button:hover {
		background-color: var(--slider-bg-hover);
		transform: translateY(-50%) scale(1.08);
		box-shadow: var(--slider-shadow-hover);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.slider-button:disabled {
		pointer-events: none;
		cursor: not-allowed;
		opacity: 0.3;
	}

	.slider-button:active:not(:disabled) {
		transform: translateY(-50%) scale(0.92);
		transition: transform 0.2s ease-out;
	}

	.slider-button.slider-prev {
		left: 1rem;
	}

	.slider-button.slider-next {
		right: 1rem;
	}

	.slider-button :global(svg) {
		width: 1.5rem;
		height: 1.5rem;
		transition: transform var(--slider-duration-short) ease;
	}

	.slider-button:hover:not(:disabled) :global(svg) {
		transform: scale(1.15);
	}

	/* --- Pagination Dots --- */
	.slider-pagination {
		pointer-events: auto;
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		z-index: 5;
		display: flex;
		gap: 0.625rem;
		border-radius: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background-color: rgba(0, 0, 0, 0.45);
		padding: 0.5rem 1rem;
		backdrop-filter: blur(4px);
		transform: translateX(-50%);
		box-shadow: var(--slider-shadow-normal);
		transition: transform var(--slider-duration-normal) var(--slider-timing-function);
	}

	.slider-pagination:hover {
		transform: translateX(-50%) scale(1.05);
		box-shadow: var(--slider-shadow-hover);
	}

	.slider-dot {
		height: 0.6rem;
		width: 0.6rem;
		cursor: pointer;
		border-radius: 50%;
		border: 0;
		background-color: rgba(255, 255, 255, 0.5);
		padding: 0;
		transition:
			background-color 0.3s ease,
			transform 0.3s var(--slider-timing-function);
	}

	.slider-dot:hover {
		background-color: rgba(255, 255, 255, 0.9);
		transform: scale(1.25);
	}

	.slider-dot.active {
		background-color: white;
		transform: scale(1.4);
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
	}

	/* --- Counter --- */
	.slider-counter {
		pointer-events: auto;
		position: absolute;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: 5;
		border-radius: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background-color: rgba(0, 0, 0, 0.45);
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
		backdrop-filter: blur(4px);
		box-shadow: var(--slider-shadow-normal);
		letter-spacing: 0.6px;
	}

	/* --- Fullscreen Button --- */
	.slider-fullscreen {
		pointer-events: auto;
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 5;
		display: flex;
		height: 2rem;
		width: 2rem;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background-color: rgba(0, 0, 0, 0.45);
		color: white;
		transition:
			transform var(--slider-duration-normal) var(--slider-timing-function),
			background-color var(--slider-duration-normal) ease;
		box-shadow: var(--slider-shadow-normal);
		backdrop-filter: blur(6px);
		will-change: transform, background-color;
	}

	.slider-fullscreen:hover {
		background-color: var(--slider-bg-hover);
		transform: scale(1.18);
		box-shadow: var(--slider-shadow-hover);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.slider-fullscreen :global(svg) {
		width: 1.2rem;
		height: 1.2rem;
		transition: transform var(--slider-duration-short) ease;
	}

	.slider-fullscreen:hover :global(svg) {
		transform: scale(1.12);
	}

	/* --- Slide Progress Indicator --- */
	.embla::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: 6;
		height: 4px;
		background: linear-gradient(to right, #3498db, #2ecc71);
		transition: transform 0.7s var(--slider-timing-function);
		width: calc(100% / var(--slider-image-count, 1));
		transform: translateX(calc(var(--current-index, 0) * 100%));
		box-shadow: 0 0 10px rgba(46, 204, 113, 0.4);
		pointer-events: none;
	}

	/* --- Lightbox --- */
	.slider-lightbox {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(10px);
	}

	.slider-lightbox-image-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	/* Image transition using pure CSS - classes applied via JS */
	:global(.slider-lightbox-image-container.transitioning .slider-lightbox-image) {
		animation-name: var(--transition-animation);
		animation-duration: 450ms;
		animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
		animation-fill-mode: forwards;
	}

	:global(.slider-lightbox-image-container[data-direction='next'].transitioning) {
		--transition-animation: slide-from-right;
	}

	:global(.slider-lightbox-image-container[data-direction='prev'].transitioning) {
		--transition-animation: slide-from-left;
	}

	.slider-lightbox-image {
		position: absolute;
		border-radius: 0.25rem;
		max-width: 90vw;
		max-height: 85vh;
		object-fit: contain;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
	}

	.slider-lightbox-content {
		position: relative;
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		justify-content: center;
		perspective: 1000px;
	}

	/* Lightbox Close Button */
	.slider-lightbox-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 10;
		display: flex;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: white;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background-color: rgba(255, 30, 30, 0.6);
		transition:
			background-color var(--slider-duration-normal) ease,
			transform var(--slider-duration-normal) var(--slider-timing-function),
			box-shadow var(--slider-duration-normal) ease;
		box-shadow: var(--slider-shadow-normal);
	}

	.slider-lightbox-close :global(svg) {
		width: 1.3rem;
		height: 1.3rem;
		transition: transform var(--slider-duration-short) ease;
	}

	.slider-lightbox-close:hover {
		background-color: rgba(255, 30, 30, 0.9);
		transform: scale(1.15);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.slider-lightbox-close:hover :global(svg) {
		transform: rotate(90deg);
	}

	/* Lightbox Navigation */
	.slider-lightbox-nav {
		position: absolute;
		top: 50%;
		z-index: 15;
		display: flex;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: white;
		transform: translateY(-50%);
		width: 3rem;
		height: 3rem;
		background-color: rgba(0, 0, 0, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.15);
		transition:
			background-color var(--slider-duration-normal) ease,
			transform var(--slider-duration-normal) var(--slider-timing-function),
			box-shadow var(--slider-duration-normal) ease,
			border-color var(--slider-duration-normal) ease;
		box-shadow: var(--slider-shadow-normal);
		will-change: transform, background-color;
	}

	.slider-lightbox-nav:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		pointer-events: none;
	}

	.slider-lightbox-nav.slider-prev {
		left: 2rem;
	}

	.slider-lightbox-nav.slider-next {
		right: 2rem;
	}

	.slider-lightbox-nav :global(svg) {
		width: 1.8rem;
		height: 1.8rem;
	}

	.slider-lightbox-nav:hover:not(:disabled) {
		background-color: var(--slider-bg-hover);
		transform: translateY(-50%) scale(1.08);
		box-shadow: var(--slider-shadow-hover);
		border-color: rgba(255, 255, 255, 0.5);
	}

	/* Lightbox Counter */
	.slider-lightbox-counter {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		z-index: 10;
		color: white;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.6);
		padding: 0.6rem 1.2rem;
		border-radius: 2rem;
		font-size: 1rem;
		box-shadow: var(--slider-shadow-normal);
		backdrop-filter: blur(6px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		font-weight: 600;
		letter-spacing: 0.6px;
	}

	/* --- Responsive Adjustments --- */
	@media (max-width: 768px) {
		.slider-lightbox-nav.slider-prev {
			left: 1rem;
		}
		.slider-lightbox-nav.slider-next {
			right: 1rem;
		}
		.slider-lightbox-close {
			top: 1rem;
			right: 1rem;
		}
		.slider-lightbox-counter {
			bottom: 1.5rem;
			font-size: 0.9rem;
		}
		.slider-button,
		.slider-fullscreen {
			width: 2.5rem;
			height: 2.5rem;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.embla__slide,
		.slider-image,
		.slider-button,
		.slider-dot,
		.slider-fullscreen,
		.slider-lightbox-image,
		.slider-lightbox-nav,
		.slider-lightbox-close {
			transition: none !important;
			animation: none !important;
		}
	}

	/* Slide animations */
	@keyframes slide-from-right {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slide-from-left {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* Body scroll management */
	:global(body.lightbox-open) {
		overflow: hidden !important;
	}
</style>

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
		class="slider embla relative aspect-video w-full overflow-hidden rounded-t-xl bg-neutral-100 shadow-lg transition-shadow duration-500 select-none hover:shadow-xl"
		onmouseenter={() => (showControls = true)}
		onmouseleave={() => (showControls = false)}
		style:--slider-image-count={images.length}
		style:--current-index={selectedIndex}
		aria-label="{title} image gallery"
		role="region"
	>
		<div
			class="embla__viewport h-full w-full overflow-hidden"
			use:emblaCarouselSvelte={{ options, plugins: [] }}
			onemblaInit={onEmblaInit}
		>
			<div class="embla__container flex h-full will-change-transform">
				{#each images as image, index (`${title}-${index}`)}
					<div
						class="embla__slide relative h-full shrink-0 grow-0 basis-full overflow-hidden transition-opacity duration-300"
					>
						<img
							src={image}
							alt="{title} - image {index + 1}"
							class="slider-image block h-full w-full object-cover transition-all duration-500 will-change-transform hover:scale-105"
							style:object-fit={imageLayout}
							loading={index === 0 ? 'eager' : 'lazy'}
							decoding="async"
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Controls -->
		<div
			class="slider-controls pointer-events-none absolute inset-0 z-1 opacity-0 transition-opacity duration-500"
			class:visible={showControls}
		>
			{#if hasMultipleImages}
				<button
					class="slider-control slider-button absolute top-1/2 left-4 z-5 h-11 w-11 -translate-y-1/2 transition-transform"
					onclick={scrollPrev}
					disabled={!emblaApi?.canScrollPrev() && !options.loop}
					aria-label="Previous slide"
				>
					<Icon icon="mdi:chevron-left" class="h-6 w-6" />
				</button>

				<button
					class="slider-control slider-button absolute top-1/2 right-4 z-5 h-11 w-11 -translate-y-1/2 transition-transform"
					onclick={scrollNext}
					disabled={!emblaApi?.canScrollNext() && !options.loop}
					aria-label="Next slide"
				>
					<Icon icon="mdi:chevron-right" class="h-6 w-6" />
				</button>

				<div
					class="slider-pagination pointer-events-auto absolute bottom-6 left-1/2 z-5 flex -translate-x-1/2 gap-2.5 rounded-full border border-white/15 bg-black/45 px-4 py-2 shadow-md backdrop-blur-sm"
				>
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each scrollSnaps as _, index (index)}
						<button
							class="slider-dot h-2.5 w-2.5 cursor-pointer rounded-full border-0 bg-white/50 p-0 transition-all duration-300 hover:scale-125 hover:bg-white/90"
							class:active={index === selectedIndex}
							onclick={() => scrollTo(index)}
							aria-label="Go to slide {index + 1}"
						></button>
					{/each}
				</div>

				<div
					class="slider-counter pointer-events-auto absolute right-6 bottom-6 z-5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-sm font-semibold tracking-wide text-white shadow-md backdrop-blur-sm"
				>
					{selectedIndex + 1}/{images.length}
				</div>
			{/if}

			<button
				class="slider-control slider-fullscreen absolute top-6 right-6 z-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
				onclick={toggleFullscreen}
				aria-label="View fullscreen"
			>
				<Icon icon="mdi:fullscreen" class="h-5 w-5" />
			</button>
		</div>
	</div>

	<!-- Lightbox -->
	{#if isFullscreen}
		<div
			class="slider-lightbox fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center bg-black/95 backdrop-blur-lg select-none"
			onclick={closeLightbox}
			onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				class="slider-lightbox-content relative flex h-full w-full items-center justify-center"
				style="perspective: 1000px;"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div
					bind:this={lightboxImageContainerRef}
					class="slider-lightbox-image-container relative flex h-full w-full items-center justify-center"
					data-direction="next"
				>
					<img
						src={images[lightboxIndex]}
						alt="{title} - image {lightboxIndex + 1}"
						class="slider-lightbox-image animate-zoom-in fill-forwards absolute max-h-[85vh] max-w-[90vw] rounded object-contain shadow-2xl"
						loading="eager"
						decoding="async"
					/>
				</div>

				<button
					class="slider-lightbox-close animate-fade-in fill-forwards absolute top-6 right-6 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-red-500/60 text-white shadow-md transition-all duration-300 hover:scale-115 hover:bg-red-500/90"
					onclick={closeLightbox}
					aria-label="Close fullscreen view"
				>
					<Icon
						icon="mdi:close"
						class="h-5 w-5 transition-transform duration-200 hover:rotate-90"
					/>
				</button>

				{#if hasMultipleImages}
					<button
						class="slider-control slider-lightbox-nav animate-fade-in fill-forwards animation-delay-200 absolute top-1/2 left-8 z-15 h-12 w-12 -translate-y-1/2"
						onclick={lightboxPrev}
						aria-label="Previous image"
					>
						<Icon icon="mdi:chevron-left" class="h-7 w-7" />
					</button>
					<button
						class="slider-control slider-lightbox-nav animate-fade-in fill-forwards animation-delay-200 absolute top-1/2 right-8 z-15 h-12 w-12 -translate-y-1/2"
						onclick={lightboxNext}
						aria-label="Next image"
					>
						<Icon icon="mdi:chevron-right" class="h-7 w-7" />
					</button>
					<div
						class="slider-lightbox-counter animate-fade-up fill-forwards animation-delay-300 absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-5 py-2.5 text-base font-semibold tracking-wide text-white shadow-md backdrop-blur-md"
					>
						{lightboxIndex + 1} / {images.length}
					</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Active dot state */
	.slider-dot.active {
		@apply scale-140 bg-white;
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
	}

	/* Slider controls visibility */
	.slider-controls.visible,
	.embla:hover .slider-controls {
		@apply bg-black/5 opacity-100;
	}

	/* Button disabled state */
	.slider-button:disabled {
		@apply pointer-events-none cursor-not-allowed opacity-30;
	}

	/* Button active state */
	.slider-button:active:not(:disabled) {
		transform: translateY(-50%) scale(0.92);
	}

	/* Slide Progress Indicator */
	.embla::after {
		content: '';
		@apply pointer-events-none absolute bottom-0 left-0 z-6 h-1;
		background: linear-gradient(to right, #3498db, #2ecc71);
		transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
		width: calc(100% / var(--slider-image-count, 1));
		transform: translateX(calc(var(--current-index, 0) * 100%));
		box-shadow: 0 0 10px rgba(46, 204, 113, 0.4);
	}

	/* Image transition using pure CSS */
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

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.slider-lightbox-nav {
			@apply right-4 left-4;
		}
		.slider-lightbox-close {
			@apply top-4 right-4;
		}
		.slider-lightbox-counter {
			@apply text-sm;
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

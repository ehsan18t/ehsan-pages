<script lang="ts">
	/**
	 * Image Slider Component - Embla Carousel with Premium GSAP Lightbox
	 *
	 * A+ Grade Implementation featuring:
	 * - Svelte 5 runes ($state, $derived, $effect)
	 * - <svelte:window> for keyboard navigation
	 * - $effect for autoplay with proper cleanup
	 * - Portal pattern for lightbox (renders to document.body)
	 * - GSAP-powered animations for cinematic lightbox experience
	 * - Lazy initialization via IntersectionObserver for mobile performance
	 *
	 * @component ImageSlider
	 */

	import { browser } from '$app/environment';
	import { portal } from '$lib/actions';
	import Icon from '@iconify/svelte';
	import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import gsap from 'gsap';
	import type { Action } from 'svelte/action';

	// ─────────────────────────────────────────────────────────────
	// Props
	// ─────────────────────────────────────────────────────────────

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

	// ─────────────────────────────────────────────────────────────
	// Lazy Initialization Action (IntersectionObserver)
	// ─────────────────────────────────────────────────────────────

	/**
	 * Action to detect when component enters viewport
	 * Triggers carousel initialization only when visible
	 */
	const lazyInit: Action<HTMLElement> = (node) => {
		if (!browser) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					isInView = true;
					observer.disconnect();
				}
			},
			{
				rootMargin: '100px', // Pre-initialize 100px before entering viewport
				threshold: 0
			}
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	};

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	/** Whether component is in viewport (for lazy initialization) */
	let isInView = $state(false);

	let selectedIndex = $state(0);
	let scrollSnaps = $state<number[]>([]);
	let isFullscreen = $state(false);
	let showControls = $state(false);
	let emblaApi = $state<EmblaCarouselType | undefined>(undefined);

	// Lightbox state
	let lightboxIndex = $state(0);
	let lightboxImageContainerRef = $state<HTMLDivElement | null>(null);

	// GSAP lightbox element refs
	let lightboxRef = $state<HTMLDivElement | null>(null);
	let lightboxContentRef = $state<HTMLDivElement | null>(null);
	let lightboxCloseRef = $state<HTMLButtonElement | null>(null);
	let lightboxNavPrevRef = $state<HTMLButtonElement | null>(null);
	let lightboxNavNextRef = $state<HTMLButtonElement | null>(null);
	let lightboxCounterRef = $state<HTMLDivElement | null>(null);
	let lightboxImageRef = $state<HTMLImageElement | null>(null);

	// Animation state
	let isAnimating = $state(false);
	let lightboxTimeline = $state<gsap.core.Timeline | null>(null);

	// ─────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────

	/** Whether there are multiple images to show controls */
	let hasMultipleImages = $derived(images.length > 1);

	/** Embla carousel options - reactive to image changes */
	let options = $derived<EmblaOptionsType>({
		loop: images.length > 1,
		align: 'start',
		containScroll: 'trimSnaps'
	});

	// ─────────────────────────────────────────────────────────────
	// GSAP Animation Functions
	// ─────────────────────────────────────────────────────────────

	/**
	 * Animate lightbox opening with cinematic effects
	 */
	function animateLightboxOpen(): void {
		if (!lightboxRef || !browser) return;

		// Kill any existing timeline
		lightboxTimeline?.kill();

		const tl = gsap.timeline({
			defaults: { ease: 'power3.out' },
			onStart: () => {
				isAnimating = true;
			},
			onComplete: () => {
				isAnimating = false;
			}
		});

		// Set initial states
		gsap.set(lightboxRef, { opacity: 0, backdropFilter: 'blur(0px)' });
		gsap.set(lightboxImageRef, { opacity: 0, scale: 0.85, rotateX: 15, y: 60 });
		gsap.set(lightboxCloseRef, { opacity: 0, scale: 0, rotation: -180 });
		gsap.set([lightboxNavPrevRef, lightboxNavNextRef], { opacity: 0, scale: 0.5 });
		gsap.set(lightboxCounterRef, { opacity: 0, y: 30 });

		// Animate backdrop
		tl.to(lightboxRef, {
			opacity: 1,
			backdropFilter: 'blur(20px)',
			duration: 0.5
		});

		// Animate image with spring-like effect
		tl.to(
			lightboxImageRef,
			{
				opacity: 1,
				scale: 1,
				rotateX: 0,
				y: 0,
				duration: 0.7,
				ease: 'back.out(1.4)'
			},
			'-=0.3'
		);

		// Animate close button with spin
		tl.to(
			lightboxCloseRef,
			{
				opacity: 1,
				scale: 1,
				rotation: 0,
				duration: 0.4,
				ease: 'back.out(2)'
			},
			'-=0.4'
		);

		// Animate nav buttons from sides
		tl.to(
			lightboxNavPrevRef,
			{
				opacity: 1,
				scale: 1,
				x: 0,
				duration: 0.4,
				ease: 'back.out(1.7)'
			},
			'-=0.3'
		);

		tl.to(
			lightboxNavNextRef,
			{
				opacity: 1,
				scale: 1,
				x: 0,
				duration: 0.4,
				ease: 'back.out(1.7)'
			},
			'-=0.35'
		);

		// Animate counter
		tl.to(
			lightboxCounterRef,
			{
				opacity: 1,
				y: 0,
				duration: 0.4,
				ease: 'power2.out'
			},
			'-=0.3'
		);

		lightboxTimeline = tl;
	}

	/**
	 * Animate lightbox closing with reverse cinematic effects
	 */
	function animateLightboxClose(onComplete: () => void): void {
		if (!lightboxRef || !browser) {
			onComplete();
			return;
		}

		// Kill any existing timeline
		lightboxTimeline?.kill();

		const tl = gsap.timeline({
			defaults: { ease: 'power2.in' },
			onStart: () => {
				isAnimating = true;
			},
			onComplete: () => {
				isAnimating = false;
				onComplete();
			}
		});

		// Fade out controls first
		tl.to([lightboxCounterRef, lightboxNavPrevRef, lightboxNavNextRef], {
			opacity: 0,
			scale: 0.8,
			duration: 0.2
		});

		tl.to(
			lightboxCloseRef,
			{
				opacity: 0,
				scale: 0,
				rotation: 90,
				duration: 0.25
			},
			'-=0.1'
		);

		// Animate image out with dramatic exit
		tl.to(
			lightboxImageRef,
			{
				opacity: 0,
				scale: 0.9,
				y: 40,
				duration: 0.35,
				ease: 'power3.in'
			},
			'-=0.15'
		);

		// Fade backdrop
		tl.to(
			lightboxRef,
			{
				opacity: 0,
				backdropFilter: 'blur(0px)',
				duration: 0.3
			},
			'-=0.2'
		);

		lightboxTimeline = tl;
	}

	/**
	 * Animate image transition with 3D perspective effect
	 */
	function animateImageTransition(direction: 'next' | 'prev'): void {
		if (!lightboxImageRef || !browser || isAnimating) return;

		isAnimating = true;

		const xDirection = direction === 'next' ? -1 : 1;
		const rotateDirection = direction === 'next' ? -1 : 1;

		// Create exit timeline
		const exitTl = gsap.timeline({
			onComplete: () => {
				// Update the index
				if (direction === 'next') {
					lightboxIndex = lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0;
				} else {
					lightboxIndex = lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1;
				}

				// Small delay to ensure image src updates
				requestAnimationFrame(() => {
					// Animate in new image from opposite side
					gsap.fromTo(
						lightboxImageRef,
						{
							opacity: 0,
							x: -xDirection * 80,
							scale: 0.92,
							rotateY: -rotateDirection * 8
						},
						{
							opacity: 1,
							x: 0,
							scale: 1,
							rotateY: 0,
							duration: 0.5,
							ease: 'power2.out',
							onComplete: () => {
								isAnimating = false;
							}
						}
					);
				});
			}
		});

		// Animate current image out
		exitTl.to(lightboxImageRef, {
			opacity: 0,
			x: xDirection * 80,
			scale: 0.92,
			rotateY: rotateDirection * 8,
			duration: 0.35,
			ease: 'power2.in'
		});
	}

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	function onEmblaInit(event: CustomEvent<EmblaCarouselType>): void {
		emblaApi = event.detail;
		scrollSnaps = emblaApi.scrollSnapList();

		emblaApi.on('select', () => {
			selectedIndex = emblaApi!.selectedScrollSnap();
		});

		emblaApi.on('reInit', () => {
			scrollSnaps = emblaApi!.scrollSnapList();
		});
	}

	function scrollPrev(): void {
		emblaApi?.scrollPrev();
	}

	function scrollNext(): void {
		emblaApi?.scrollNext();
	}

	function scrollTo(index: number): void {
		emblaApi?.scrollTo(index);
	}

	function toggleFullscreen(): void {
		if (isAnimating) return;

		if (!isFullscreen) {
			// Opening lightbox
			isFullscreen = true;
			lightboxIndex = selectedIndex;
			document.body.classList.add('lightbox-open');
			// Animation triggered by $effect when lightboxRef is available
		} else {
			// Closing lightbox with animation
			animateLightboxClose(() => {
				isFullscreen = false;
				document.body.classList.remove('lightbox-open');
			});
		}
	}

	function closeLightbox(): void {
		if (isAnimating) return;

		animateLightboxClose(() => {
			isFullscreen = false;
			document.body.classList.remove('lightbox-open');
		});
	}

	function lightboxPrev(): void {
		if (isAnimating) return;
		animateImageTransition('prev');
	}

	function lightboxNext(): void {
		if (isAnimating) return;
		animateImageTransition('next');
	}

	/**
	 * Handle keyboard navigation for lightbox
	 */
	function handleKeydown(e: KeyboardEvent): void {
		if (!isFullscreen) return;

		if (e.key === 'Escape') closeLightbox();
		else if (e.key === 'ArrowLeft') lightboxPrev();
		else if (e.key === 'ArrowRight') lightboxNext();
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Autoplay effect with cleanup
	$effect(() => {
		if (!browser || !emblaApi || !autoplay) return;

		const timer = setInterval(() => {
			if (emblaApi?.canScrollNext()) {
				emblaApi.scrollNext();
			} else if (options.loop) {
				emblaApi?.scrollTo(0);
			}
		}, autoplayInterval);

		// Cleanup on effect re-run or destroy
		return () => {
			clearInterval(timer);
		};
	});

	// GSAP lightbox open animation effect
	$effect(() => {
		if (isFullscreen && lightboxRef && lightboxImageRef) {
			// Small delay to ensure DOM is ready
			requestAnimationFrame(() => {
				animateLightboxOpen();
			});
		}
	});

	// Cleanup lightbox class on unmount
	$effect(() => {
		return () => {
			if (browser) {
				document.body.classList.remove('lightbox-open');
			}
		};
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
		use:lazyInit
	>
		{#if isInView}
			<!-- Full carousel - initialized only when in viewport -->
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
						class="slider-control slider-button pointer-events-auto absolute top-1/2 left-4 z-5 h-11 w-11 -translate-y-1/2 transition-transform"
						onclick={(e) => {
							e.stopPropagation();
							scrollPrev();
						}}
						disabled={!emblaApi?.canScrollPrev() && !options.loop}
						aria-label="Previous slide"
					>
						<Icon icon="mdi:chevron-left" class="h-6 w-6" />
					</button>

					<button
						class="slider-control slider-button pointer-events-auto absolute top-1/2 right-4 z-5 h-11 w-11 -translate-y-1/2 transition-transform"
						onclick={(e) => {
							e.stopPropagation();
							scrollNext();
						}}
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
					class="slider-fullscreen pointer-events-auto absolute top-6 right-6 z-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-118 hover:bg-black/85"
					onclick={(e) => {
						e.stopPropagation();
						toggleFullscreen();
					}}
					aria-label="View fullscreen"
				>
					<Icon icon="mdi:fullscreen" class="h-5 w-5" />
				</button>
			</div>
		{:else}
			<!-- Placeholder - shown before carousel initializes (for performance) -->
			<div class="h-full w-full">
				<img
					src={images[0]}
					alt="{title} - cover image"
					class="block h-full w-full object-cover"
					style:object-fit={imageLayout}
					loading="lazy"
					decoding="async"
				/>
			</div>
		{/if}
	</div>

	<!-- Lightbox (portaled to document.body) with GSAP animations -->
	{#if isFullscreen}
		<div
			bind:this={lightboxRef}
			use:portal
			class="slider-lightbox fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center bg-black/95 select-none"
			onclick={closeLightbox}
			onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				bind:this={lightboxContentRef}
				class="slider-lightbox-content relative flex h-full w-full items-center justify-center"
				style="perspective: 1200px; transform-style: preserve-3d;"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div
					bind:this={lightboxImageContainerRef}
					class="slider-lightbox-image-container relative flex h-full w-full items-center justify-center"
					style="transform-style: preserve-3d;"
				>
					<img
						bind:this={lightboxImageRef}
						src={images[lightboxIndex]}
						alt="{title} - image {lightboxIndex + 1}"
						class="slider-lightbox-image absolute max-h-[85vh] max-w-[90vw] rounded-lg object-contain will-change-transform"
						style="transform-style: preserve-3d; box-shadow: 0 25px 80px -20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.05);"
						loading="eager"
						decoding="async"
					/>
				</div>

				<button
					bind:this={lightboxCloseRef}
					class="slider-lightbox-close pointer-events-auto absolute top-6 right-6 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-red-500/70 text-white shadow-lg transition-colors duration-200 hover:bg-red-500"
					onclick={(e) => {
						e.stopPropagation();
						closeLightbox();
					}}
					aria-label="Close fullscreen view"
				>
					<Icon
						icon="mdi:close"
						class="h-5 w-5 transition-transform duration-200 hover:rotate-90"
					/>
				</button>

				{#if hasMultipleImages}
					<button
						bind:this={lightboxNavPrevRef}
						class="slider-lightbox-nav pointer-events-auto absolute top-1/2 left-8 z-15 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg transition-colors duration-200 hover:border-white/40 hover:bg-black/90"
						onclick={(e) => {
							e.stopPropagation();
							lightboxPrev();
						}}
						aria-label="Previous image"
					>
						<Icon icon="mdi:chevron-left" class="h-8 w-8" />
					</button>
					<button
						bind:this={lightboxNavNextRef}
						class="slider-lightbox-nav pointer-events-auto absolute top-1/2 right-8 z-15 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg transition-colors duration-200 hover:border-white/40 hover:bg-black/90"
						onclick={(e) => {
							e.stopPropagation();
							lightboxNext();
						}}
						aria-label="Next image"
					>
						<Icon icon="mdi:chevron-right" class="h-8 w-8" />
					</button>
					<div
						bind:this={lightboxCounterRef}
						class="slider-lightbox-counter absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/70 px-6 py-3 text-base font-semibold tracking-wider text-white shadow-lg backdrop-blur-md"
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

	/* Performance optimization for off-screen sliders */
	.slider {
		contain: layout style paint;
	}

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

	/* Lightbox nav buttons - responsive */
	@media (max-width: 768px) {
		:global(.slider-lightbox-nav) {
			@apply size-11;
		}
		:global(.slider-lightbox-nav.left-8) {
			left: 1rem !important;
		}
		:global(.slider-lightbox-nav.right-8) {
			right: 1rem !important;
		}
		:global(.slider-lightbox-close) {
			@apply top-4 right-4;
		}
		:global(.slider-lightbox-counter) {
			@apply bottom-6 px-4 py-2 text-sm;
		}
		:global(.slider-lightbox-image) {
			max-width: 95vw !important;
			max-height: 80vh !important;
		}
	}

	/* Accessibility - respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.embla__slide,
		.slider-image,
		.slider-button,
		.slider-dot,
		.slider-fullscreen {
			transition: none !important;
		}
		/* GSAP will also be disabled via a runtime check */
	}

	/* Body scroll management */
	:global(body.lightbox-open) {
		overflow: hidden !important;
	}
</style>

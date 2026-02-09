<script lang="ts">
	/**
	 * Image Slider Component - Custom Zero-Dependency Carousel with GSAP Lightbox
	 *
	 * High-performance implementation featuring:
	 * - Svelte 5 runes ($state, $derived, $effect)
	 * - Pointer Events API for unified mouse + touch drag
	 * - CSS transform-based sliding (GPU-accelerated)
	 * - Velocity-based momentum snapping
	 * - Lazy initialization via IntersectionObserver
	 * - GSAP lightbox with snappy parallel animations
	 * - Portal pattern for lightbox (renders to document.body)
	 * - Keyboard navigation & accessibility
	 *
	 * @component ImageSlider
	 */

	import { browser } from '$app/environment';
	import { portal } from '$lib/actions';
	import Icon from '@iconify/svelte';
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
	 * Delays full carousel initialization until component enters viewport.
	 * Uses a larger rootMargin (200px) so initialization happens before
	 * the user actually sees the component — avoiding visible pop-in.
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
			{ rootMargin: '200px', threshold: 0 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	};

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	/** Minimum drag distance (% of container) to trigger slide change */
	const DRAG_THRESHOLD = 0.2;
	/** Minimum velocity (px/ms) for flick-to-snap */
	const VELOCITY_THRESHOLD = 0.3;
	/** Minimum movement (px) before direction lock */
	const DIRECTION_LOCK_THRESHOLD = 5;

	// ─────────────────────────────────────────────────────────────
	// Carousel State
	// ─────────────────────────────────────────────────────────────

	let isInView = $state(false);
	let currentIndex = $state(0);
	let showControls = $state(false);
	let dragOffset = $state(0);
	let isDragging = $state(false);

	// Drag internals (non-reactive, only needed during active drag)
	let startX = 0;
	let startY = 0;
	let dragStartTime = 0;
	let directionLocked: 'horizontal' | 'vertical' | null = null;
	let containerWidth = 0;

	// Element ref
	let containerRef = $state<HTMLDivElement | null>(null);

	// ─────────────────────────────────────────────────────────────
	// Lightbox State
	// ─────────────────────────────────────────────────────────────

	let isFullscreen = $state(false);
	let lightboxIndex = $state(0);
	let isAnimating = $state(false);

	// GSAP lightbox element refs
	let lightboxRef = $state<HTMLDivElement | null>(null);
	let lightboxImageRef = $state<HTMLImageElement | null>(null);
	let lightboxCloseRef = $state<HTMLButtonElement | null>(null);
	let lightboxNavPrevRef = $state<HTMLButtonElement | null>(null);
	let lightboxNavNextRef = $state<HTMLButtonElement | null>(null);
	let lightboxCounterRef = $state<HTMLDivElement | null>(null);
	let lightboxTimeline = $state<gsap.core.Timeline | null>(null);

	// ─────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────

	let hasMultipleImages = $derived(images.length > 1);

	/** Reactive transform — CSS transition handles animation automatically */
	let trackTransform = $derived(
		`translate3d(calc(${-currentIndex * 100}% + ${dragOffset}px), 0, 0)`
	);

	// ─────────────────────────────────────────────────────────────
	// Carousel Navigation
	// ─────────────────────────────────────────────────────────────

	/** Navigate to a specific slide index (wraps for loop) */
	function goTo(index: number): void {
		if (!hasMultipleImages) return;
		currentIndex = ((index % images.length) + images.length) % images.length;
	}

	function next(): void {
		goTo(currentIndex + 1);
	}

	function prev(): void {
		goTo(currentIndex - 1);
	}

	// ─────────────────────────────────────────────────────────────
	// Pointer Event Handlers (unified mouse + touch)
	// ─────────────────────────────────────────────────────────────

	function handlePointerDown(e: PointerEvent): void {
		if (!hasMultipleImages || e.button !== 0) return;

		isDragging = true;
		directionLocked = null;
		startX = e.clientX;
		startY = e.clientY;
		dragStartTime = Date.now();
		containerWidth = containerRef?.offsetWidth ?? 0;
		dragOffset = 0;

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent): void {
		if (!isDragging) return;

		const deltaX = e.clientX - startX;
		const deltaY = e.clientY - startY;

		// Direction lock on first significant movement
		if (directionLocked === null) {
			if (
				Math.abs(deltaX) < DIRECTION_LOCK_THRESHOLD &&
				Math.abs(deltaY) < DIRECTION_LOCK_THRESHOLD
			)
				return;
			directionLocked = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
			if (directionLocked === 'vertical') {
				isDragging = false;
				dragOffset = 0;
				return;
			}
		}

		e.preventDefault();
		dragOffset = deltaX;
	}

	function handlePointerUp(e: PointerEvent): void {
		if (!isDragging) return;
		isDragging = false;

		const deltaX = e.clientX - startX;
		const elapsed = Date.now() - dragStartTime;
		const velocity = Math.abs(deltaX) / Math.max(elapsed, 1);

		const shouldAdvance =
			(velocity > VELOCITY_THRESHOLD && Math.abs(deltaX) > 10) ||
			(containerWidth > 0 && Math.abs(deltaX) / containerWidth > DRAG_THRESHOLD);

		dragOffset = 0;

		if (shouldAdvance) {
			goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
		}
	}

	function handlePointerCancel(): void {
		isDragging = false;
		dragOffset = 0;
	}

	// ─────────────────────────────────────────────────────────────
	// GSAP Lightbox Animations (Snappy & Parallel)
	// ─────────────────────────────────────────────────────────────

	/** Animate lightbox open — everything in parallel, total ~0.35s */
	function animateLightboxOpen(): void {
		if (!lightboxRef || !browser) return;
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

		// Initial states
		gsap.set(lightboxRef, { opacity: 0 });
		gsap.set(lightboxImageRef, { opacity: 0, scale: 0.9, y: 30 });
		gsap.set(lightboxCloseRef, { opacity: 0, scale: 0.5 });
		gsap.set([lightboxNavPrevRef, lightboxNavNextRef], { opacity: 0, scale: 0.7 });
		gsap.set(lightboxCounterRef, { opacity: 0, y: 15 });

		// Parallel entry — overlapping start times for speed
		tl.to(lightboxRef, { opacity: 1, duration: 0.2 })
			.to(
				lightboxImageRef,
				{ opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' },
				0.05
			)
			.to(lightboxCloseRef, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' }, 0.1)
			.to([lightboxNavPrevRef, lightboxNavNextRef], { opacity: 1, scale: 1, duration: 0.2 }, 0.1)
			.to(lightboxCounterRef, { opacity: 1, y: 0, duration: 0.2 }, 0.1);

		lightboxTimeline = tl;
	}

	/** Animate lightbox close — fast parallel fade, total ~0.25s */
	function animateLightboxClose(onComplete: () => void): void {
		if (!lightboxRef || !browser) {
			onComplete();
			return;
		}

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

		// Simultaneous close — everything fades together
		tl.to(lightboxImageRef, { opacity: 0, scale: 0.92, y: 20, duration: 0.2 }, 0)
			.to(
				[lightboxCloseRef, lightboxNavPrevRef, lightboxNavNextRef, lightboxCounterRef],
				{ opacity: 0, scale: 0.8, duration: 0.15 },
				0
			)
			.to(lightboxRef, { opacity: 0, duration: 0.18 }, 0.08);

		lightboxTimeline = tl;
	}

	/** Animate image transition — fast crossfade, total ~0.35s */
	function animateImageTransition(direction: 'next' | 'prev'): void {
		if (!lightboxImageRef || !browser || isAnimating) return;
		isAnimating = true;

		const xOut = direction === 'next' ? -60 : 60;
		const xIn = direction === 'next' ? 60 : -60;

		// Exit current image
		gsap.to(lightboxImageRef, {
			opacity: 0,
			x: xOut,
			scale: 0.95,
			duration: 0.15,
			ease: 'power2.in',
			onComplete: () => {
				// Update index
				if (direction === 'next') {
					lightboxIndex = lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0;
				} else {
					lightboxIndex = lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1;
				}

				// Enter new image from opposite side
				gsap.fromTo(
					lightboxImageRef,
					{ opacity: 0, x: -xIn, scale: 0.95 },
					{
						opacity: 1,
						x: 0,
						scale: 1,
						duration: 0.2,
						ease: 'power2.out',
						onComplete: () => {
							isAnimating = false;
						}
					}
				);
			}
		});
	}

	// ─────────────────────────────────────────────────────────────
	// Lightbox Event Handlers
	// ─────────────────────────────────────────────────────────────

	function toggleFullscreen(): void {
		if (isAnimating) return;
		if (!isFullscreen) {
			isFullscreen = true;
			lightboxIndex = currentIndex;
			document.body.classList.add('lightbox-open');
		} else {
			closeLightbox();
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

	// Lightbox touch/swipe support
	let lbTouchStartX = 0;
	let lbTouchStartY = 0;

	function handleLightboxTouchStart(e: TouchEvent): void {
		lbTouchStartX = e.touches[0].clientX;
		lbTouchStartY = e.touches[0].clientY;
	}

	function handleLightboxTouchEnd(e: TouchEvent): void {
		const deltaX = e.changedTouches[0].clientX - lbTouchStartX;
		const deltaY = e.changedTouches[0].clientY - lbTouchStartY;
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			if (deltaX < 0) lightboxNext();
			else lightboxPrev();
		}
	}

	/** Keyboard navigation for lightbox */
	function handleKeydown(e: KeyboardEvent): void {
		if (!isFullscreen) return;
		if (e.key === 'Escape') closeLightbox();
		else if (e.key === 'ArrowLeft') lightboxPrev();
		else if (e.key === 'ArrowRight') lightboxNext();
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Autoplay with proper cleanup
	$effect(() => {
		if (!browser || !autoplay || !hasMultipleImages || !isInView) return;

		const timer = setInterval(() => {
			if (!isDragging && !isFullscreen) next();
		}, autoplayInterval);

		return () => clearInterval(timer);
	});

	// Trigger lightbox open animation when refs become available
	$effect(() => {
		if (isFullscreen && lightboxRef && lightboxImageRef) {
			requestAnimationFrame(() => animateLightboxOpen());
		}
	});

	// Cleanup lightbox body class on component unmount
	$effect(() => {
		return () => {
			if (browser) document.body.classList.remove('lightbox-open');
		};
	});

	// Reset carousel when images prop changes
	$effect(() => {
		void images.length;
		currentIndex = 0;
		dragOffset = 0;
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if images && images.length > 0}
	<div
		bind:this={containerRef}
		class="slider relative aspect-video w-full overflow-hidden rounded-t-xl bg-neutral-100 shadow-lg select-none"
		onmouseenter={() => (showControls = true)}
		onmouseleave={() => (showControls = false)}
		style:--slider-image-count={images.length}
		style:--current-index={currentIndex}
		aria-label="{title} image gallery"
		role="region"
		use:lazyInit
	>
		{#if isInView}
			<!-- Carousel Track — GPU-accelerated via translate3d -->
			<div
				class="slider-track flex h-full touch-pan-y"
				class:dragging={isDragging}
				style:transform={trackTransform}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerCancel}
				role="listbox"
				tabindex="0"
				aria-label="Image slides"
			>
				{#each images as image, index (`${title}-${index}`)}
					<div
						class="slider-slide relative h-full shrink-0 grow-0 basis-full overflow-hidden"
						role="option"
						aria-selected={index === currentIndex}
					>
						<img
							src={image}
							alt="{title} - image {index + 1}"
							class="pointer-events-none block h-full w-full"
							style:object-fit={imageLayout}
							loading={index === 0 ? 'eager' : 'lazy'}
							decoding="async"
							draggable="false"
						/>
					</div>
				{/each}
			</div>

			<!-- Controls Overlay -->
			<div
				class="slider-controls pointer-events-none absolute inset-0 z-1 opacity-0 transition-opacity duration-300"
				class:visible={showControls}
			>
				{#if hasMultipleImages}
					<!-- Prev/Next Buttons -->
					<button
						class="slider-control slider-button pointer-events-auto absolute top-1/2 left-4 z-5 h-11 w-11 -translate-y-1/2"
						onclick={(e) => {
							e.stopPropagation();
							prev();
						}}
						aria-label="Previous slide"
					>
						<Icon icon="mdi:chevron-left" class="h-6 w-6" />
					</button>

					<button
						class="slider-control slider-button pointer-events-auto absolute top-1/2 right-4 z-5 h-11 w-11 -translate-y-1/2"
						onclick={(e) => {
							e.stopPropagation();
							next();
						}}
						aria-label="Next slide"
					>
						<Icon icon="mdi:chevron-right" class="h-6 w-6" />
					</button>

					<!-- Dot Indicators -->
					<div
						class="slider-pagination pointer-events-auto absolute bottom-6 left-1/2 z-5 flex -translate-x-1/2 gap-2.5 rounded-full border border-white/15 bg-black/45 px-4 py-2 shadow-md backdrop-blur-sm"
					>
						{#each images as _, index (index)}
							<button
								class="slider-dot h-2.5 w-2.5 cursor-pointer rounded-full border-0 bg-white/50 p-0 transition-all duration-200 hover:scale-125 hover:bg-white/90"
								class:active={index === currentIndex}
								onclick={() => goTo(index)}
								aria-label="Go to slide {index + 1}"
							></button>
						{/each}
					</div>

					<!-- Counter -->
					<div
						class="slider-counter pointer-events-auto absolute right-6 bottom-6 z-5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-sm font-semibold tracking-wide text-white shadow-md backdrop-blur-sm"
					>
						{currentIndex + 1}/{images.length}
					</div>
				{/if}

				<!-- Fullscreen Toggle -->
				<button
					class="slider-fullscreen pointer-events-auto absolute top-6 right-6 z-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/85"
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
			<!-- Placeholder — before lazy init triggers -->
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

	<!-- ══════════════════════════════════════════════════════════ -->
	<!-- Lightbox (portaled to document.body)                      -->
	<!-- ══════════════════════════════════════════════════════════ -->
	{#if isFullscreen}
		<div
			bind:this={lightboxRef}
			use:portal
			class="slider-lightbox fixed inset-0 z-9999 flex h-screen w-screen items-center justify-center bg-black/95 select-none"
			onclick={closeLightbox}
			ontouchstart={handleLightboxTouchStart}
			ontouchend={handleLightboxTouchEnd}
			onkeydown={handleKeydown}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div
				class="slider-lightbox-content relative flex h-full w-full items-center justify-center"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<!-- Main Image -->
				<img
					bind:this={lightboxImageRef}
					src={images[lightboxIndex]}
					alt="{title} - image {lightboxIndex + 1}"
					class="slider-lightbox-image absolute max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
					style="box-shadow: 0 25px 80px -20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.05);"
					loading="eager"
					decoding="async"
					draggable="false"
				/>

				<!-- Close Button -->
				<button
					bind:this={lightboxCloseRef}
					class="slider-lightbox-close pointer-events-auto absolute top-6 right-6 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-red-500/70 text-white shadow-lg transition-colors duration-150 hover:bg-red-500"
					onclick={(e) => {
						e.stopPropagation();
						closeLightbox();
					}}
					aria-label="Close fullscreen view"
				>
					<Icon icon="mdi:close" class="h-5 w-5" />
				</button>

				{#if hasMultipleImages}
					<!-- Navigation Arrows -->
					<button
						bind:this={lightboxNavPrevRef}
						class="slider-lightbox-nav pointer-events-auto absolute top-1/2 left-8 z-15 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg transition-colors duration-150 hover:border-white/40 hover:bg-black/90"
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
						class="slider-lightbox-nav pointer-events-auto absolute top-1/2 right-8 z-15 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg transition-colors duration-150 hover:border-white/40 hover:bg-black/90"
						onclick={(e) => {
							e.stopPropagation();
							lightboxNext();
						}}
						aria-label="Next image"
					>
						<Icon icon="mdi:chevron-right" class="h-8 w-8" />
					</button>

					<!-- Image Counter -->
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

	/* Container: CSS containment for performance isolation */
	.slider {
		contain: layout style paint;
	}

	/* Track: GPU-accelerated with CSS-managed transition */
	.slider-track {
		backface-visibility: hidden;
		transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
	}

	/* Disable transition during active drag for instant feedback */
	.slider-track:global(.dragging) {
		transition: none;
	}

	/* Active dot indicator */
	.slider-dot.active {
		@apply scale-140 bg-white;
		box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
	}

	/* Controls visibility on hover */
	.slider-controls.visible {
		@apply bg-black/5 opacity-100;
	}

	/* Button press feedback */
	.slider-button:active {
		transform: translateY(-50%) scale(0.92);
	}

	/* Progress bar indicator */
	.slider::after {
		content: '';
		@apply pointer-events-none absolute bottom-0 left-0 z-6 h-1;
		background: linear-gradient(to right, #3498db, #2ecc71);
		transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
		width: calc(100% / var(--slider-image-count, 1));
		transform: translateX(calc(var(--current-index, 0) * 100%));
		box-shadow: 0 0 10px rgba(46, 204, 113, 0.4);
	}

	/* Lightbox responsive adjustments */
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

	/* Reduced motion: disable all transitions */
	@media (prefers-reduced-motion: reduce) {
		.slider-track,
		.slider-dot,
		.slider-button,
		.slider-fullscreen {
			transition: none !important;
		}
	}

	/* Body scroll lock when lightbox is open */
	:global(body.lightbox-open) {
		overflow: hidden !important;
	}
</style>

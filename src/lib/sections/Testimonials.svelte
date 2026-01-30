<script lang="ts">
	import { browser } from '$app/environment';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import { testimonials } from '$data';
	import gsap from 'gsap';
	import { onDestroy, onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';

	// Get initials from name
	function getInitials(name: string): string {
		return name
			.split(' ')
			.slice(0, 2)
			.map((w) => w[0])
			.join('')
			.toUpperCase();
	}

	const AUTOPLAY_INTERVAL = 6000;
	// Animation duration for smooth transitions
	const ANIMATION_DURATION = 0.4;

	let activeIndex = $state(0);
	let isAnimating = $state(false);
	let isPaused = $state(false);
	let cardsContainer = $state<HTMLElement | null>(null);
	let autoplayTimer: ReturnType<typeof setInterval> | null = null;
	let isVisible = $state(false);

	// Get card elements
	function getCards(): HTMLElement[] {
		if (!cardsContainer) return [];
		return Array.from(cardsContainer.querySelectorAll('.testimonial-card'));
	}

	// Kill all existing tweens on cards to prevent memory leaks and stacking
	function killCardTweens() {
		const cards = getCards();
		cards.forEach((card) => gsap.killTweensOf(card));
	}

	// Position cards - show only active card with bouncy entrance
	function positionCards(animate = true) {
		const cards = getCards();
		const shouldAnimate = animate && !prefersReducedMotion.current;
		const duration = shouldAnimate ? ANIMATION_DURATION : 0;

		// Kill existing tweens before starting new ones
		if (animate) {
			killCardTweens();
		}

		cards.forEach((card, i) => {
			const isActive = i === activeIndex;

			if (isActive) {
				// Active card: bouncy entrance with scale
				const props: gsap.TweenVars = {
					opacity: 1,
					scale: 1,
					y: 0,
					zIndex: 10,
					pointerEvents: 'auto',
					duration: shouldAnimate ? duration * 1.2 : 0,
					ease: 'back.out(1.4)', // Bouncy easing
					overwrite: true
				};

				if (shouldAnimate) {
					// Start slightly scaled down for bounce effect
					gsap.fromTo(card, { scale: 0.95, y: 10, opacity: 0 }, props);
				} else {
					gsap.set(card, props);
				}
			} else {
				// Hidden cards: fade out
				const props: gsap.TweenVars = {
					opacity: 0,
					scale: 0.95,
					zIndex: 0,
					pointerEvents: 'none',
					duration,
					ease: 'power2.out',
					overwrite: true
				};

				if (shouldAnimate) {
					gsap.to(card, props);
				} else {
					gsap.set(card, props);
				}
			}
		});
	}

	// Navigate to next testimonial
	function next() {
		if (isAnimating || !isVisible) return;
		isAnimating = true;

		activeIndex = (activeIndex + 1) % testimonials.length;
		positionCards();

		setTimeout(() => {
			isAnimating = false;
		}, ANIMATION_DURATION * 1000);
	}

	// Navigate to previous testimonial
	function prev() {
		if (isAnimating || !isVisible) return;
		isAnimating = true;

		activeIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
		positionCards();

		setTimeout(() => {
			isAnimating = false;
		}, ANIMATION_DURATION * 1000);
	}

	// Go to specific index
	function goTo(index: number) {
		if (isAnimating || index === activeIndex || !isVisible) return;
		isAnimating = true;

		activeIndex = index;
		positionCards();

		setTimeout(() => {
			isAnimating = false;
		}, ANIMATION_DURATION * 1000);
	}

	// Autoplay controls
	function startAutoplay() {
		if (autoplayTimer || !isVisible) return;
		autoplayTimer = setInterval(() => {
			if (!isPaused && !isAnimating && isVisible) {
				next();
			}
		}, AUTOPLAY_INTERVAL);
	}

	function stopAutoplay() {
		if (autoplayTimer) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	}

	function pause() {
		isPaused = true;
	}

	function resume() {
		isPaused = false;
	}

	// Touch/swipe handling with passive event support
	let touchStartX = 0;
	let touchStartY = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		pause();
	}

	function handleTouchEnd(e: TouchEvent) {
		const deltaX = e.changedTouches[0].clientX - touchStartX;
		const deltaY = e.changedTouches[0].clientY - touchStartY;

		// Only swipe if horizontal movement is greater than vertical
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			if (deltaX > 0) {
				prev();
			} else {
				next();
			}
		}
		resume();
	}

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (!isVisible) return;
		if (e.key === 'ArrowLeft') {
			prev();
		} else if (e.key === 'ArrowRight') {
			next();
		}
	}

	// Intersection observer for autoplay and visibility tracking
	let sectionRef = $state<HTMLElement | null>(null);
	let observer: IntersectionObserver | null = null;

	onMount(() => {
		if (!browser) return;

		// Initial positioning without animation
		requestAnimationFrame(() => {
			positionCards(false);
		});

		// Set up intersection observer with optimized threshold
		observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				isVisible = entry.isIntersecting;

				if (entry.isIntersecting) {
					startAutoplay();
				} else {
					stopAutoplay();
					// Kill all tweens when section is not visible to free resources
					killCardTweens();
				}
			},
			{ threshold: 0.2, rootMargin: '50px' }
		);

		if (sectionRef) {
			observer.observe(sectionRef);
		}

		// Keyboard listener
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (!browser) return;
		stopAutoplay();
		// Clean up all GSAP tweens to prevent memory leaks
		killCardTweens();
		observer?.disconnect();
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<section
	bind:this={sectionRef}
	id="testimonials"
	class="section-container relative mx-auto w-full max-w-6xl pb-16"
	aria-labelledby="testimonials-heading"
>
	<SectionTitle
		id="testimonials-heading"
		p1="Client"
		p2="Testimonials"
		subtitle="Don't just take my word for it — here's what clients say about working with me."
	/>

	<div
		class="relative flex flex-col items-center gap-8"
		role="region"
		aria-roledescription="carousel"
		aria-label="Client testimonials"
	>
		<!-- Card Stack - Optimized: removed 3D transforms for better mobile performance -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={cardsContainer}
			class="cards-container relative h-96 w-full max-w-160 touch-pan-y sm:h-88 md:h-80"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
			onmouseenter={pause}
			onmouseleave={resume}
			role="group"
			aria-label="Testimonial cards"
		>
			{#each testimonials as testimonial, index (testimonial.name)}
				<div
					class="testimonial-card card-glass absolute top-0 left-0 flex h-full w-full flex-col p-6 sm:p-8"
					class:is-active={index === activeIndex}
					role="tabpanel"
					aria-roledescription="slide"
					aria-label={`Testimonial from ${testimonial.name}`}
					aria-hidden={index !== activeIndex}
				>
					<!-- Quote mark -->
					<div
						class="absolute top-4 right-6 h-10 w-10 text-accent-text/15 sm:top-6 sm:right-8 sm:h-12 sm:w-12"
						aria-hidden="true"
					>
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
							/>
						</svg>
					</div>

					<!-- Content -->
					<blockquote class="flex flex-1 items-center overflow-hidden">
						<p
							class="line-clamp-6 text-sm leading-7 text-foreground/90 italic sm:line-clamp-5 sm:text-base md:line-clamp-4 md:text-[1.0625rem]"
						>
							{testimonial.content}
						</p>
					</blockquote>

					<!-- Author -->
					<footer class="mt-auto flex items-center gap-3.5 border-t border-accent-text/10 pt-4">
						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent-text/20"
							style="background: linear-gradient(135deg, oklch(var(--accent-text) / 0.2), oklch(var(--accent-bg) / 0.3));"
						>
							{#if testimonial.image}
								<img
									src={testimonial.image}
									alt=""
									loading="lazy"
									decoding="async"
									class="h-full w-full object-cover"
								/>
							{:else}
								<span class="text-base font-bold text-accent-text"
									>{getInitials(testimonial.name)}</span
								>
							{/if}
						</div>
						<div class="flex min-w-0 flex-col gap-0.5">
							<cite class="truncate text-base font-semibold text-foreground not-italic"
								>{testimonial.name}</cite
							>
							<span class="truncate text-[0.8125rem] text-accent-text/70">{testimonial.role}</span>
						</div>
					</footer>
				</div>
			{/each}
		</div>

		<!-- Navigation -->
		<div class="flex items-center gap-4">
			<button
				class="btn-icon h-11 w-11"
				onclick={prev}
				aria-label="Previous testimonial"
				disabled={isAnimating}
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>

			<!-- Indicators -->
			<div class="flex gap-2" role="tablist">
				{#each testimonials as testimonial, index (testimonial.name)}
					<button
						class="indicator-dot"
						class:active={index === activeIndex}
						onclick={() => goTo(index)}
						aria-label={`Go to testimonial ${index + 1}`}
						aria-selected={index === activeIndex}
						role="tab"
					></button>
				{/each}
			</div>

			<button
				class="btn-icon h-11 w-11"
				onclick={next}
				aria-label="Next testimonial"
				disabled={isAnimating}
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	/* Optimized card container - no expensive 3D context */
	.cards-container {
		/* Contain layout and paint to prevent repaints from affecting other elements */
		contain: layout style;
	}

	/* Base card styles - GPU optimizations managed by GSAP's force3D */
	.testimonial-card {
		/* Hide cards by default until GSAP positions them */
		opacity: 0;
		/* Prevent text selection during swipe */
		user-select: none;
		/* Optimize for touch scrolling */
		-webkit-overflow-scrolling: touch;
		/* Backface visibility for potential 3D transforms */
		backface-visibility: hidden;
	}

	/* Show first card immediately before JS runs */
	.testimonial-card.is-active {
		opacity: 1;
		z-index: 10;
	}

	/* Reduced motion: disable all animations */
	@media (prefers-reduced-motion: reduce) {
		.testimonial-card {
			transition: none !important;
			animation: none !important;
		}

		.cards-container {
			/* Instant transitions for accessibility */
			transition: none !important;
		}
	}
</style>

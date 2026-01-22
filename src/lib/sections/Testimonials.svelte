<script lang="ts">
	import { browser } from '$app/environment';
	import SectionTitle from '$components/SectionTitle.svelte';
	import { testimonials } from '$data';
	import { onDestroy, onMount } from 'svelte';

	// Helper function to get initials from name
	function getInitials(name: string): string {
		const words = name.trim().split(' ');
		if (words.length === 1) {
			return words[0].charAt(0).toUpperCase();
		}
		return words
			.slice(0, 2)
			.map((word) => word.charAt(0).toUpperCase())
			.join('');
	}

	const autoplayDelay = 5000;
	const autoplayDelayAfterInterruption = 10000;
	const swipeThreshold = 50;

	let currentIndex = $state(0);
	let isAnimating = $state(false);
	let animationClass = $state<string | null>(null);
	let isInViewport = $state(false);

	let carouselRef = $state<HTMLElement | null>(null);
	let sectionRef = $state<HTMLElement | null>(null);
	let interval: number | undefined;

	// Touch and drag state
	let startX = 0;
	let isDragging = false;
	let mouseStartX = 0;

	function showTestimonial(index: number, reverse = false) {
		if (isAnimating || index === currentIndex) return;
		isAnimating = true;

		// Add animation class to current slide
		animationClass = reverse ? 'entering' : 'leaving';

		// Wait for animation, then switch
		setTimeout(() => {
			animationClass = null;
			currentIndex = index;
			setTimeout(() => {
				isAnimating = false;
			}, 500);
		}, 500);
	}

	function nextTestimonial() {
		const newIndex = (currentIndex + 1) % testimonials.length;
		showTestimonial(newIndex);
	}

	function prevTestimonial() {
		const newIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
		showTestimonial(newIndex, true);
	}

	function startAutoplay() {
		stopAutoplay();
		interval = window.setInterval(nextTestimonial, autoplayDelay);
	}

	function stopAutoplay() {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}

	function handleDotClick(index: number) {
		stopAutoplay();
		showTestimonial(index);
		if (isInViewport) {
			setTimeout(startAutoplay, autoplayDelayAfterInterruption);
		}
	}

	function handlePrevClick() {
		stopAutoplay();
		prevTestimonial();
		if (isInViewport) {
			setTimeout(startAutoplay, autoplayDelayAfterInterruption);
		}
	}

	function handleNextClick() {
		stopAutoplay();
		nextTestimonial();
		if (isInViewport) {
			setTimeout(startAutoplay, autoplayDelayAfterInterruption);
		}
	}

	// Touch handlers
	function handleTouchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		stopAutoplay();
	}

	function handleTouchEnd(e: TouchEvent) {
		const endX = e.changedTouches[0].clientX;
		const diff = endX - startX;
		if (Math.abs(diff) > swipeThreshold) {
			if (diff < 0) {
				nextTestimonial();
			} else {
				prevTestimonial();
			}
		}
		if (isInViewport) {
			setTimeout(startAutoplay, autoplayDelayAfterInterruption);
		}
	}

	// Mouse drag handlers
	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		mouseStartX = e.clientX;
		if (carouselRef) carouselRef.style.cursor = 'grabbing';
		stopAutoplay();
		e.preventDefault();
	}

	function handleMouseUp(e: MouseEvent) {
		if (!isDragging) return;

		const endX = e.clientX;
		const diff = endX - mouseStartX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff < 0) {
				nextTestimonial();
			} else {
				prevTestimonial();
			}
		}

		isDragging = false;
		if (carouselRef) carouselRef.style.cursor = 'grab';

		if (isInViewport) {
			setTimeout(startAutoplay, autoplayDelayAfterInterruption);
		}
	}

	function handleMouseEnter() {
		stopAutoplay();
	}

	function handleMouseLeave() {
		if (!isDragging && isInViewport) {
			setTimeout(startAutoplay, autoplayDelay);
		}
	}

	let observer: IntersectionObserver;

	onMount(() => {
		// Set up intersection observer
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isInViewport = entry.isIntersecting;
					if (isInViewport) {
						startAutoplay();
					} else {
						stopAutoplay();
					}
				});
			},
			{ threshold: 0.1 }
		);

		if (sectionRef) {
			observer.observe(sectionRef);
		}

		// Global mouse events for drag
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('mouseleave', () => {
			if (isDragging) {
				isDragging = false;
				if (carouselRef) carouselRef.style.cursor = 'grab';
				if (isInViewport) {
					setTimeout(startAutoplay, autoplayDelayAfterInterruption);
				}
			}
		});

		if (isInViewport) {
			startAutoplay();
		}
	});

	onDestroy(() => {
		if (!browser) return;
		if (observer) observer.disconnect();
		stopAutoplay();
		window.removeEventListener('mouseup', handleMouseUp);
	});
</script>

<section
	bind:this={sectionRef}
	class="testimonial-section"
	id="testimonials"
	aria-labelledby="testimonials-heading"
>
	<SectionTitle
		p1="Client"
		p2="Testimonials"
		subtitle="Don't just take my word for it - here's what clients have to say about working with me."
	/>

	<!-- Main carousel container -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={carouselRef}
		class="testimonial-carousel-container"
		role="region"
		aria-roledescription="carousel"
		aria-label="Client testimonials carousel"
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		onmousedown={handleMouseDown}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<!-- Navigation Controls -->
		<div class="testimonial-controls">
			<button
				class="testimonial-btn-base testimonial-prev"
				aria-label="Previous testimonial"
				type="button"
				onclick={handlePrevClick}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"
					></path>
				</svg>
			</button>

			<button
				class="testimonial-btn-base testimonial-next"
				aria-label="Next testimonial"
				type="button"
				onclick={handleNextClick}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"
					></path>
				</svg>
			</button>
		</div>

		<!-- Viewport for slides -->
		<div class="testimonial-carousel-viewport" aria-live="polite">
			{#each testimonials as testimonial, index}
				{@const isVisible = index === currentIndex && !animationClass}
				{@const isLeaving = index === currentIndex && animationClass}
				<div
					class="testimonial-slide"
					class:slide-visible={isVisible || isLeaving}
					class:entering={animationClass === 'entering' && isLeaving}
					class:leaving={animationClass === 'leaving' && isLeaving}
					data-index={index}
					role="tabpanel"
					aria-roledescription="slide"
					aria-label={`Testimonial from ${testimonial.name}`}
					aria-hidden={!isVisible && !isLeaving}
					style:display={isVisible || isLeaving ? 'block' : 'none'}
				>
					<div class="testimonial-card">
						<div class="testimonial-accent" aria-hidden="true"></div>
						<svg class="quote-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
							/>
						</svg>

						<p class="testimonial-content">{testimonial.content}</p>

						<div class="testimonial-author-container">
							<div class="testimonial-author-avatar">
								{#if testimonial.image}
									<img
										src={testimonial.image}
										class="testimonial-author-image"
										alt="{testimonial.name}, {testimonial.role}"
										loading="lazy"
									/>
								{:else}
									<div class="testimonial-author-initials">
										{getInitials(testimonial.name)}
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

		<!-- Pagination dots -->
		<div class="testimonial-pagination" role="tablist">
			{#each testimonials as testimonial, index}
				<button
					class="testimonial-dot"
					class:testimonial-dot-active={index === currentIndex}
					class:testimonial-dot-inactive={index !== currentIndex}
					data-index={index}
					aria-label={`View testimonial from ${testimonial.name}`}
					role="tab"
					aria-selected={index === currentIndex}
					type="button"
					onclick={() => handleDotClick(index)}
				></button>
			{/each}
		</div>
	</div>
</section>

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

	/* Individual Slide */
	.testimonial-slide {
		width: 100%;
		min-width: 0;
		padding: 1rem;
		opacity: 0;
		user-select: none;
		contain: style;
		transition: opacity 0.5s var(--testimonial-timing-function);
		will-change: opacity;
		transform: translateZ(0);
	}

	.slide-visible {
		opacity: 1;
		z-index: 1;
	}

	.testimonial-slide.entering {
		animation: fade-out-up 500ms forwards;
	}

	.testimonial-slide.leaving {
		animation: fade-out-down 500ms forwards;
	}

	@keyframes fade-out-up {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(-20px);
		}
	}

	@keyframes fade-out-down {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(20px);
		}
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
		contain: content;
		background: linear-gradient(
			135deg,
			oklch(var(--accent-bg) / 0.08),
			oklch(var(--accent-bg) / 0.03)
		);
		box-shadow: var(--testimonial-shadow-normal);
		transition:
			opacity 0.2s ease,
			box-shadow 0.3s ease;
		transform: translateZ(0);
	}

	.slide-visible .testimonial-card {
		opacity: 1;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -4px rgba(0, 0, 0, 0.1);
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
		background: linear-gradient(to right, oklch(var(--accent-text) / 0.7), oklch(var(--accent-title)));
	}

	/* Quote icon */
	.quote-icon {
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
		color: rgb(var(--foreground));
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
		border-radius: 9999px;
		border: 2px solid oklch(var(--accent-text) / 0.3);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		background: linear-gradient(135deg, oklch(var(--accent-bg) / 0.2), transparent);
	}

	.testimonial-author-image {
		height: 100%;
		width: 100%;
		border-radius: 9999px;
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
		border-radius: 9999px;
		border: 1px solid oklch(var(--accent-text) / 0.15);
		background: oklch(var(--accent-bg) / 0.1);
		color: oklch(var(--accent-text));
		opacity: 0.7;
		backdrop-filter: blur(12px);
		pointer-events: auto;
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
		background: oklch(var(--accent-bg) / 0.2);
		transform: translateY(-50%) scale(1.05);
		opacity: 1;
		box-shadow: 0 0 15px oklch(var(--accent-text) / 0.3);
	}

	.testimonial-next {
		right: 0.5rem;
	}

	.testimonial-prev {
		left: 0.5rem;
	}

	@media (min-width: 768px) {
		.testimonial-next {
			right: 0;
		}
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
		width: 0.75rem;
		cursor: pointer;
		border-radius: 9999px;
		border: none;
		background: oklch(var(--accent-text) / 0.3);
		transform-origin: center;
		will-change: width, background-color;
		transition:
			width 0.3s var(--testimonial-timing-function-spring),
			background-color 0.3s ease;
	}

	.testimonial-dot-active {
		background: oklch(var(--accent-text));
		width: 2rem;
	}

	.testimonial-dot-inactive {
		background: oklch(var(--accent-text) / 0.3);
		width: 0.75rem;
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.testimonial-card,
		.testimonial-btn-base,
		.testimonial-dot,
		.testimonial-slide {
			transition: none !important;
			animation: none !important;
		}

		.slide-visible {
			opacity: 1;
		}
	}
</style>

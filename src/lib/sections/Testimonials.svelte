<script lang="ts">
	import { browser } from '$app/environment';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import { testimonials } from '$data';
	import gsap from 'gsap';
	import { onDestroy, onMount } from 'svelte';

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
	const ANIMATION_DURATION = 0.5;

	let activeIndex = $state(0);
	let isAnimating = $state(false);
	let isPaused = $state(false);
	let cardsContainer = $state<HTMLElement | null>(null);
	let autoplayTimer: ReturnType<typeof setInterval> | null = null;

	// Get card elements
	function getCards(): HTMLElement[] {
		if (!cardsContainer) return [];
		return Array.from(cardsContainer.querySelectorAll('.testimonial-card'));
	}

	// Position cards in stack formation
	function positionCards(animate = true) {
		const cards = getCards();
		const total = cards.length;

		cards.forEach((card, i) => {
			// Calculate position relative to active card
			let offset = i - activeIndex;

			// Wrap around for infinite effect
			if (offset < -1) offset += total;
			if (offset > total - 2) offset -= total;

			const isActive = offset === 0;
			const isBehind = offset < 0;
			const position = Math.abs(offset);

			// Calculate transforms
			const scale = isActive ? 1 : Math.max(0.85 - position * 0.05, 0.7);
			const y = isActive ? 0 : -20 - position * 10;
			const z = -position * 50;
			const opacity = position > 2 ? 0 : isActive ? 1 : 0.6 - position * 0.15;
			const blur = isActive ? 0 : position * 2;

			const props = {
				scale,
				y,
				z,
				opacity,
				filter: `blur(${blur}px)`,
				zIndex: total - position,
				pointerEvents: isActive ? 'auto' : 'none',
				duration: animate ? ANIMATION_DURATION : 0,
				ease: 'power2.out'
			};

			gsap.to(card, props);
		});
	}

	// Navigate to next testimonial
	function next() {
		if (isAnimating) return;
		isAnimating = true;

		activeIndex = (activeIndex + 1) % testimonials.length;
		positionCards();

		setTimeout(() => {
			isAnimating = false;
		}, ANIMATION_DURATION * 1000);
	}

	// Navigate to previous testimonial
	function prev() {
		if (isAnimating) return;
		isAnimating = true;

		activeIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
		positionCards();

		setTimeout(() => {
			isAnimating = false;
		}, ANIMATION_DURATION * 1000);
	}

	// Go to specific index
	function goTo(index: number) {
		if (isAnimating || index === activeIndex) return;
		isAnimating = true;

		activeIndex = index;
		positionCards();

		setTimeout(() => {
			isAnimating = false;
		}, ANIMATION_DURATION * 1000);
	}

	// Autoplay controls
	function startAutoplay() {
		if (autoplayTimer) return;
		autoplayTimer = setInterval(() => {
			if (!isPaused && !isAnimating) {
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

	// Touch/swipe handling
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
		if (e.key === 'ArrowLeft') {
			prev();
		} else if (e.key === 'ArrowRight') {
			next();
		}
	}

	// Intersection observer for autoplay
	let sectionRef = $state<HTMLElement | null>(null);
	let observer: IntersectionObserver | null = null;

	onMount(() => {
		if (!browser) return;

		// Initial positioning without animation
		requestAnimationFrame(() => {
			positionCards(false);
		});

		// Set up intersection observer
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					startAutoplay();
				} else {
					stopAutoplay();
				}
			},
			{ threshold: 0.3 }
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
		observer?.disconnect();
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<section
	bind:this={sectionRef}
	id="testimonials"
	class="testimonials-section"
	aria-labelledby="testimonials-heading"
>
	<SectionTitle
		p1="Client"
		p2="Testimonials"
		subtitle="Don't just take my word for it — here's what clients say about working with me."
	/>

	<div
		class="testimonials-wrapper"
		role="region"
		aria-roledescription="carousel"
		aria-label="Client testimonials"
	>
		<!-- Card Stack -->
		<div
			bind:this={cardsContainer}
			class="cards-container"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
			onmouseenter={pause}
			onmouseleave={resume}
		>
			{#each testimonials as testimonial, index}
				<article
					class="testimonial-card"
					role="tabpanel"
					aria-roledescription="slide"
					aria-label={`Testimonial from ${testimonial.name}`}
					aria-hidden={index !== activeIndex}
				>
					<!-- Quote mark -->
					<div class="quote-mark" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
							/>
						</svg>
					</div>

					<!-- Content -->
					<blockquote class="testimonial-content">
						<p>{testimonial.content}</p>
					</blockquote>

					<!-- Author -->
					<footer class="testimonial-author">
						<div class="author-avatar">
							{#if testimonial.image}
								<img src={testimonial.image} alt="" loading="lazy" decoding="async" />
							{:else}
								<span class="avatar-initials">{getInitials(testimonial.name)}</span>
							{/if}
						</div>
						<div class="author-info">
							<cite class="author-name">{testimonial.name}</cite>
							<span class="author-role">{testimonial.role}</span>
						</div>
					</footer>
				</article>
			{/each}
		</div>

		<!-- Navigation -->
		<div class="navigation">
			<button
				class="nav-btn prev"
				onclick={prev}
				aria-label="Previous testimonial"
				disabled={isAnimating}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>

			<!-- Indicators -->
			<div class="indicators" role="tablist">
				{#each testimonials as _, index}
					<button
						class="indicator"
						class:active={index === activeIndex}
						onclick={() => goTo(index)}
						aria-label={`Go to testimonial ${index + 1}`}
						aria-selected={index === activeIndex}
						role="tab"
					></button>
				{/each}
			</div>

			<button
				class="nav-btn next"
				onclick={next}
				aria-label="Next testimonial"
				disabled={isAnimating}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	.testimonials-section {
		position: relative;
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 1rem 4rem;
	}

	.testimonials-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	/* Card Stack Container */
	.cards-container {
		position: relative;
		width: 100%;
		max-width: 40rem;
		height: 24rem;
		perspective: 1000px;
		touch-action: pan-y;
	}

	@media (min-width: 640px) {
		.cards-container {
			height: 22rem;
		}
	}

	@media (min-width: 768px) {
		.cards-container {
			height: 20rem;
		}
	}

	/* Individual Card */
	.testimonial-card {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		border-radius: 1.25rem;
		background: linear-gradient(
			145deg,
			oklch(var(--accent-bg) / 0.12),
			oklch(var(--accent-bg) / 0.04)
		);
		border: 1px solid oklch(var(--accent-text) / 0.15);
		backdrop-filter: blur(20px);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px oklch(var(--accent-text) / 0.05);
		transform-style: preserve-3d;
		will-change: transform, opacity;
	}

	@media (min-width: 640px) {
		.testimonial-card {
			padding: 2rem;
		}
	}

	/* Quote Mark */
	.quote-mark {
		position: absolute;
		top: 1rem;
		right: 1.5rem;
		width: 2.5rem;
		height: 2.5rem;
		color: oklch(var(--accent-text) / 0.15);
	}

	@media (min-width: 640px) {
		.quote-mark {
			width: 3rem;
			height: 3rem;
			top: 1.5rem;
			right: 2rem;
		}
	}

	/* Content */
	.testimonial-content {
		flex: 1;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.testimonial-content p {
		font-size: 0.875rem;
		line-height: 1.75;
		color: rgb(var(--foreground) / 0.9);
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 6;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.testimonial-content p {
			font-size: 1rem;
			-webkit-line-clamp: 5;
		}
	}

	@media (min-width: 768px) {
		.testimonial-content p {
			font-size: 1.0625rem;
			-webkit-line-clamp: 4;
		}
	}

	/* Author Section */
	.testimonial-author {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding-top: 1rem;
		border-top: 1px solid oklch(var(--accent-text) / 0.1);
		margin-top: auto;
	}

	.author-avatar {
		flex-shrink: 0;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		overflow: hidden;
		background: linear-gradient(
			135deg,
			oklch(var(--accent-text) / 0.2),
			oklch(var(--accent-bg) / 0.3)
		);
		border: 2px solid oklch(var(--accent-text) / 0.2);
	}

	.author-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-initials {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 1rem;
		font-weight: 700;
		color: oklch(var(--accent-text));
	}

	.author-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.author-name {
		font-size: 1rem;
		font-weight: 600;
		font-style: normal;
		color: rgb(var(--foreground));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.author-role {
		font-size: 0.8125rem;
		color: oklch(var(--accent-text) / 0.7);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Navigation */
	.navigation {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		border: 1px solid oklch(var(--accent-text) / 0.2);
		background: oklch(var(--accent-bg) / 0.1);
		color: oklch(var(--accent-text));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-btn:hover:not(:disabled) {
		background: oklch(var(--accent-bg) / 0.2);
		border-color: oklch(var(--accent-text) / 0.3);
		transform: scale(1.05);
	}

	.nav-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.nav-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.nav-btn svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Indicators */
	.indicators {
		display: flex;
		gap: 0.5rem;
	}

	.indicator {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		border: none;
		background: oklch(var(--accent-text) / 0.25);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.indicator:hover {
		background: oklch(var(--accent-text) / 0.5);
	}

	.indicator.active {
		width: 1.5rem;
		border-radius: 0.25rem;
		background: oklch(var(--accent-text));
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.testimonial-card,
		.nav-btn,
		.indicator {
			transition: none !important;
		}
	}
</style>

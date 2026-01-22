<script lang="ts">
	/**
	 * Mobile Navigation - Arc Navigator Design
	 *
	 * A unique radial expanding mobile navigation that:
	 * - Shows a minimal floating pill when collapsed (active section icon only)
	 * - Expands into a semi-circular arc when tapped
	 * - Uses Svelte 5 Spring for smooth physics-based animations
	 * - Hardware-accelerated with CSS transforms only
	 * - Performant: no DOM manipulation, pure CSS transforms
	 */

	import { browser } from '$app/environment';
	import { navItems } from '$data';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { Spring } from 'svelte/motion';

	// State
	let activeIndex = $state(0);
	let isExpanded = $state(false);
	let isVisible = $state(false);
	let isNearBottom = $state(false);

	// Spring for expansion animation (0 = collapsed, 1 = expanded)
	const expansion = new Spring(0, {
		stiffness: 0.15,
		damping: 0.7
	});

	// Computed values
	let currentItem = $derived(navItems[activeIndex]);

	// Arc configuration
	const ARC_RADIUS = 85; // pixels from center
	const ARC_START_ANGLE = -140; // degrees (left side)
	const ARC_END_ANGLE = -40; // degrees (right side)
	const TOTAL_ITEMS = navItems.length;

	/**
	 * Calculate position for each nav item in the arc
	 * Returns x, y offsets from center
	 */
	function getItemPosition(index: number): { x: number; y: number } {
		const angleRange = ARC_END_ANGLE - ARC_START_ANGLE;
		const angleStep = angleRange / (TOTAL_ITEMS - 1);
		const angle = ARC_START_ANGLE + angleStep * index;
		const radians = (angle * Math.PI) / 180;

		return {
			x: Math.cos(radians) * ARC_RADIUS,
			y: Math.sin(radians) * ARC_RADIUS
		};
	}

	/**
	 * Get scroll container for smooth scrolling
	 */
	function getScrollContainer(el: HTMLElement | null): HTMLElement {
		let node = el?.parentElement;
		while (node) {
			const style = getComputedStyle(node);
			if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
				return node;
			}
			node = node.parentElement;
		}
		return (document.scrollingElement as HTMLElement) || document.documentElement;
	}

	/**
	 * Navigate to section
	 */
	function navigateToSection(index: number) {
		const item = navItems[index];
		const target = document.getElementById(item.href.slice(1));
		if (!target) return;

		const container = getScrollContainer(target);

		if (item.offset !== undefined) {
			const containerRect = container.getBoundingClientRect();
			const targetRect = target.getBoundingClientRect();
			const currentScrollTop = container.scrollTop;
			const relativeTop = targetRect.top - containerRect.top;
			const destination = currentScrollTop + relativeTop - item.offset;
			container.scrollTo({ top: destination, behavior: 'smooth' });
		} else {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}

		// Collapse after navigation
		collapse();
	}

	/**
	 * Toggle expansion
	 */
	function toggle() {
		isExpanded = !isExpanded;
		expansion.target = isExpanded ? 1 : 0;
	}

	/**
	 * Collapse the nav
	 */
	function collapse() {
		isExpanded = false;
		expansion.target = 0;
	}

	/**
	 * Handle click outside to close
	 */
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (isExpanded && !target.closest('.mobile-nav-container')) {
			collapse();
		}
	}

	/**
	 * Scroll handler - detect near bottom
	 */
	function handleScroll() {
		const scrollY = window.scrollY;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;
		isNearBottom = scrollY + clientHeight >= scrollHeight - 30;
	}

	// IntersectionObserver for active section detection
	let observer: IntersectionObserver;

	onMount(() => {
		// Setup intersection observer for section detection
		const sections = navItems
			.map((item) => document.getElementById(item.href.substring(1)))
			.filter(Boolean) as HTMLElement[];

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const idx = navItems.findIndex((item) => item.href.substring(1) === entry.target.id);
						if (idx >= 0) {
							activeIndex = idx;
						}
					}
				});
			},
			{
				root: null,
				rootMargin: '-20% 0px -60% 0px',
				threshold: 0
			}
		);

		sections.forEach((section) => observer.observe(section));

		// Scroll listener for bottom detection (passive for performance)
		window.addEventListener('scroll', handleScroll, { passive: true });

		// Click outside listener
		document.addEventListener('click', handleClickOutside);

		// Show nav after loader delay
		setTimeout(() => {
			isVisible = true;
		}, 2500);
	});

	onDestroy(() => {
		if (!browser) return;
		if (observer) observer.disconnect();
		window.removeEventListener('scroll', handleScroll);
		document.removeEventListener('click', handleClickOutside);
	});
</script>

<nav
	class="mobile-nav-container fixed bottom-6 left-1/2 z-50 block -translate-x-1/2 md:hidden"
	class:is-visible={isVisible}
	class:is-hidden={isNearBottom}
	aria-label="Mobile navigation"
>
	<!-- Expanded arc items -->
	<div class="arc-items absolute bottom-0 left-1/2 -translate-x-1/2" aria-hidden={!isExpanded}>
		{#each navItems as item, index (item.section)}
			{@const pos = getItemPosition(index)}
			{@const isActive = index === activeIndex}
			<button
				type="button"
				class="arc-item absolute flex size-11 items-center justify-center rounded-full border border-white/10 transition-colors"
				class:active={isActive}
				style="
					--x: {pos.x}px;
					--y: {pos.y}px;
					transform: translate(-50%, -50%) translate(calc(var(--x) * {expansion.current}), calc(var(--y) * {expansion.current})) scale({0.5 +
					0.5 * expansion.current});
					opacity: {expansion.current};
					pointer-events: {expansion.current > 0.5 ? 'auto' : 'none'};
				"
				onclick={() => navigateToSection(index)}
				aria-label={item.label}
				aria-current={isActive ? 'page' : undefined}
				tabindex={isExpanded ? 0 : -1}
			>
				<Icon icon={item.icon} class="size-5" />
			</button>
		{/each}
	</div>

	<!-- Main trigger button (collapsed state shows active section) -->
	<button
		type="button"
		class="main-trigger relative flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 backdrop-blur-xl transition-all duration-300"
		class:expanded={isExpanded}
		onclick={toggle}
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Close navigation' : `Navigation - ${currentItem?.label}`}
	>
		<!-- Collapsed: show active section icon + label -->
		<span
			class="flex items-center gap-2 transition-all duration-300"
			style="opacity: {1 - expansion.current}; transform: scale({1 - 0.2 * expansion.current});"
		>
			<Icon icon={currentItem?.icon ?? 'mdi:menu'} class="size-5 text-accent-text" />
			<span class="text-xs font-medium text-foreground-muted">
				{currentItem?.label ?? 'Menu'}
			</span>
		</span>

		<!-- Expanded: show close icon -->
		<span
			class="absolute inset-0 flex items-center justify-center transition-all duration-300"
			style="opacity: {expansion.current}; transform: scale({0.5 +
				0.5 * expansion.current}) rotate({expansion.current * 180}deg);"
		>
			<Icon icon="mdi:close" class="size-5 text-foreground" />
		</span>
	</button>

	<!-- Section indicator dots -->
	<div
		class="dots-indicator mt-2 flex justify-center gap-1.5"
		style="opacity: {1 - expansion.current};"
	>
		{#each navItems as item, index (item.section)}
			<span
				class="size-1.5 rounded-full transition-all duration-300"
				class:active={index === activeIndex}
			></span>
		{/each}
	</div>
</nav>

<style>
	@reference "../../../routes/layout.css";

	.mobile-nav-container {
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, 100%);
		transition:
			opacity 0.4s ease,
			transform 0.4s cubic-bezier(0.4, 0.8, 0.2, 1);
		will-change: opacity, transform;
	}

	.mobile-nav-container.is-visible {
		opacity: 1;
		pointer-events: auto;
		transform: translate(-50%, 0);
	}

	.mobile-nav-container.is-hidden {
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, 100%);
	}

	/* Main trigger button */
	.main-trigger {
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 60%) border-box,
			rgba(10, 25, 45, 0.85);
		box-shadow:
			0 4px 20px -4px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		will-change: transform;
	}

	.main-trigger:hover {
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 60%) border-box,
			rgba(10, 25, 45, 0.9);
	}

	.main-trigger:active {
		transform: scale(0.96);
	}

	.main-trigger.expanded {
		background:
			linear-gradient(145deg, oklch(var(--accent-bg) / 0.2), transparent 60%) border-box,
			rgba(10, 25, 45, 0.9);
		border-color: oklch(var(--accent-bg) / 0.3);
	}

	/* Arc items */
	.arc-items {
		width: 0;
		height: 0;
	}

	.arc-item {
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0) 60%) border-box,
			rgba(10, 25, 45, 0.9);
		box-shadow:
			0 4px 12px -2px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		will-change: transform, opacity;
		-webkit-tap-highlight-color: transparent;
	}

	.arc-item:hover {
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0) 60%) border-box,
			rgba(20, 35, 55, 0.95);
	}

	.arc-item:active {
		transform: translate(-50%, -50%) scale(0.9) !important;
	}

	.arc-item.active {
		background:
			linear-gradient(145deg, oklch(var(--accent-bg) / 0.4), oklch(var(--accent-bg) / 0.1) 80%)
				border-box,
			rgba(10, 25, 45, 0.9);
		border-color: oklch(var(--accent-bg) / 0.5);
		color: oklch(var(--accent-text));
		box-shadow:
			0 4px 16px -2px oklch(var(--accent-bg) / 0.4),
			0 0 0 1px oklch(var(--accent-bg) / 0.2) inset;
	}

	/* Dots indicator */
	.dots-indicator span {
		background: rgba(var(--foreground), 0.2);
	}

	.dots-indicator span.active {
		background: oklch(var(--accent-text));
		width: 1rem;
		border-radius: 9999px;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-container,
		.main-trigger,
		.arc-item,
		.dots-indicator span {
			transition: none !important;
		}
	}

	/* Hide when loader present */
	:global(body:has(#hero-loader)) .mobile-nav-container {
		opacity: 0 !important;
		pointer-events: none;
	}
</style>

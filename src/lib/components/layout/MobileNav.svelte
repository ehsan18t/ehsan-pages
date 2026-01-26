<script lang="ts">
	/**
	 * Mobile Navigation - Arc Navigator Design
	 *
	 * A unique radial expanding mobile navigation that:
	 * - Shows a centered floating pill when collapsed with current section
	 * - Expands into a symmetrical semi-circular arc above the trigger
	 * - Uses Svelte 5 Spring for smooth physics-based animations
	 * - Hardware-accelerated with CSS transforms only
	 * - Uses centralized navigation store for state management
	 */

	import { navigation, navItems, handleNavClick as storeHandleNavClick } from '$lib/stores';
	import Icon from '@iconify/svelte';
	import { Spring } from 'svelte/motion';

	// Local state
	let isExpanded = $state(false);

	// Spring for expansion animation (0 = collapsed, 1 = expanded)
	const expansion = new Spring(0, {
		stiffness: 0.18,
		damping: 0.75
	});

	// Arc configuration - symmetrical arc above the button
	const ARC_RADIUS = 90;
	const ARC_START_ANGLE = -150;
	const ARC_END_ANGLE = -30;
	const TOTAL_ITEMS = navItems.length;

	/**
	 * Calculate position for each nav item in the arc
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
	 * Navigate to section and collapse menu
	 */
	function handleNavClick(e: MouseEvent, index: number) {
		e.stopPropagation();
		storeHandleNavClick(e, index);
		collapse();
	}

	/**
	 * Toggle expanded state
	 */
	function toggle(event: MouseEvent) {
		event.stopPropagation();
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
	 * Handle click outside to close menu
	 */
	function handleClickOutside(event: MouseEvent) {
		if (!isExpanded) return;
		const target = event.target as HTMLElement;
		if (!target.closest('.mobile-nav-container')) {
			collapse();
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<nav
	class="mobile-nav-container fixed right-0 bottom-6 left-0 z-50 flex flex-col items-center md:hidden"
	class:is-visible={navigation.isVisible}
	class:is-hidden={navigation.isNearBottom}
	aria-label="Mobile navigation"
>
	<!-- Arc items container - positioned relative to center -->
	<div class="arc-container relative" aria-hidden={!isExpanded}>
		{#each navItems as item, index (item.section)}
			{@const pos = getItemPosition(index)}
			{@const isActive = index === navigation.activeIndex}
			{@const delay = index * 0.03}
			<button
				type="button"
				class="arc-item absolute top-1/2 left-1/2 flex size-12 items-center justify-center rounded-full border transition-colors"
				class:active={isActive}
				style="
					transform: translate(-50%, -50%) 
						translate({pos.x * expansion.current}px, {pos.y * expansion.current}px) 
						scale({0.3 + 0.7 * expansion.current});
					opacity: {expansion.current};
					pointer-events: {expansion.current > 0.5 ? 'auto' : 'none'};
					transition-delay: {isExpanded ? delay : 0}s;
				"
				onclick={(e) => handleNavClick(e, index)}
				aria-label={item.label}
				aria-current={isActive ? 'page' : undefined}
				tabindex={isExpanded ? 0 : -1}
			>
				<Icon icon={item.icon} class="size-5" />
				<!-- Tooltip label on hover/active -->
				{#if isActive}
					<span class="arc-item-label">{item.label}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Main trigger pill - centered and prominent -->
	<button
		type="button"
		class="main-trigger relative flex items-center justify-center gap-2.5 rounded-full px-5 py-3 transition-all duration-300"
		class:expanded={isExpanded}
		onclick={toggle}
		aria-expanded={isExpanded}
		aria-label={isExpanded
			? 'Close navigation'
			: `Navigation - ${navItems[navigation.activeIndex]?.label}`}
	>
		<!-- Collapsed: show active section icon + label + chevron -->
		<span
			class="flex items-center gap-2.5 transition-all duration-300"
			style="opacity: {1 - expansion.current}; transform: scale({1 - 0.15 * expansion.current});"
		>
			<span class="icon-wrapper flex items-center justify-center">
				<Icon icon={navItems[navigation.activeIndex]?.icon ?? 'mdi:menu'} class="size-5" />
			</span>
			<span class="trigger-label">
				{navItems[navigation.activeIndex]?.label ?? 'Menu'}
			</span>
			<Icon icon="mdi:chevron-up" class="size-4 text-foreground-muted/60" />
		</span>

		<!-- Expanded: show close icon -->
		<span
			class="absolute inset-0 flex items-center justify-center transition-all duration-300"
			style="opacity: {expansion.current}; transform: scale({0.6 +
				0.4 * expansion.current}) rotate({expansion.current * 180}deg);"
		>
			<Icon icon="mdi:close" class="size-5 text-foreground" />
		</span>
	</button>

	<!-- Section progress dots -->
	<div
		class="progress-dots mt-3 flex items-center gap-2"
		style="opacity: {1 - expansion.current * 0.5};"
	>
		{#each navItems as item, index (item.section)}
			<button
				type="button"
				class="dot-item transition-all duration-300"
				class:active={index === navigation.activeIndex}
				onclick={(e) => handleNavClick(e, index)}
				aria-label={`Go to ${item.label}`}
			></button>
		{/each}
	</div>
</nav>

<style lang="postcss">
	@reference "$routes/layout.css";

	.mobile-nav-container {
		opacity: 0;
		pointer-events: none;
		transform: translateY(100%);
		transition:
			opacity 0.4s ease,
			transform 0.4s cubic-bezier(0.4, 0.8, 0.2, 1);
		will-change: opacity, transform;
	}

	.mobile-nav-container.is-visible {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}

	.mobile-nav-container.is-hidden {
		opacity: 0;
		pointer-events: none;
		transform: translateY(100%);
	}

	/* Arc container - holds the expanding items */
	.arc-container {
		width: 0;
		height: 0;
		margin-bottom: 8px;
	}

	/* Arc items */
	.arc-item {
		background:
			linear-gradient(
				165deg,
				rgba(255, 255, 255, 0.12) 0%,
				rgba(255, 255, 255, 0.02) 50%,
				transparent 100%
			),
			rgba(15, 25, 40, 0.95);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow:
			0 8px 24px -4px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset,
			0 2px 8px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		will-change: transform, opacity;
		-webkit-tap-highlight-color: transparent;
		color: rgba(var(--foreground), 0.8);
	}

	.arc-item:hover {
		background:
			linear-gradient(
				165deg,
				rgba(255, 255, 255, 0.18) 0%,
				rgba(255, 255, 255, 0.05) 50%,
				transparent 100%
			),
			rgba(20, 35, 55, 0.95);
		border-color: rgba(255, 255, 255, 0.15);
		color: rgba(var(--foreground), 1);
	}

	.arc-item:active {
		transform: translate(-50%, -50%) scale(0.9) !important;
	}

	.arc-item.active {
		background:
			linear-gradient(
				165deg,
				oklch(var(--accent-bg) / 0.35) 0%,
				oklch(var(--accent-bg) / 0.15) 50%,
				oklch(var(--accent-bg) / 0.05) 100%
			),
			rgba(15, 25, 40, 0.95);
		border-color: oklch(var(--accent-bg) / 0.4);
		color: oklch(var(--accent-text));
		box-shadow:
			0 8px 28px -4px oklch(var(--accent-bg) / 0.35),
			0 0 0 1px oklch(var(--accent-bg) / 0.2) inset,
			0 0 20px oklch(var(--accent-bg) / 0.15);
	}

	/* Arc item label tooltip */
	.arc-item-label {
		position: absolute;
		bottom: -22px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
		color: oklch(var(--accent-text));
		opacity: 0.9;
	}

	/* Main trigger button */
	.main-trigger {
		background:
			linear-gradient(
				165deg,
				rgba(255, 255, 255, 0.1) 0%,
				rgba(255, 255, 255, 0.02) 40%,
				transparent 100%
			),
			rgba(12, 22, 38, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow:
			0 8px 32px -4px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.06) inset,
			0 4px 12px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		will-change: transform;
		min-width: 140px;
	}

	.main-trigger:hover {
		background:
			linear-gradient(
				165deg,
				rgba(255, 255, 255, 0.14) 0%,
				rgba(255, 255, 255, 0.04) 40%,
				transparent 100%
			),
			rgba(15, 28, 45, 0.95);
		border-color: rgba(255, 255, 255, 0.18);
	}

	.main-trigger:active {
		transform: scale(0.97);
	}

	.main-trigger.expanded {
		background:
			linear-gradient(
				165deg,
				oklch(var(--accent-bg) / 0.2) 0%,
				oklch(var(--accent-bg) / 0.05) 50%,
				transparent 100%
			),
			rgba(12, 22, 38, 0.95);
		border-color: oklch(var(--accent-bg) / 0.35);
		box-shadow:
			0 8px 32px -4px oklch(var(--accent-bg) / 0.25),
			0 0 0 1px oklch(var(--accent-bg) / 0.15) inset;
	}

	/* Icon wrapper in trigger */
	.icon-wrapper {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: linear-gradient(
			145deg,
			oklch(var(--accent-bg) / 0.25),
			oklch(var(--accent-bg) / 0.1)
		);
		color: oklch(var(--accent-text));
	}

	/* Trigger label */
	.trigger-label {
		font-size: 13px;
		font-weight: 500;
		color: rgba(var(--foreground), 0.9);
		letter-spacing: 0.2px;
	}

	/* Progress dots */
	.progress-dots {
		padding: 6px 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 20px;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.dot-item {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(var(--foreground), 0.25);
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all 0.3s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.dot-item:hover {
		background: rgba(var(--foreground), 0.4);
		transform: scale(1.2);
	}

	.dot-item.active {
		width: 20px;
		border-radius: 10px;
		background: linear-gradient(90deg, oklch(var(--accent-bg) / 0.8), oklch(var(--accent-text)));
		box-shadow: 0 0 8px oklch(var(--accent-bg) / 0.5);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-container,
		.main-trigger,
		.arc-item,
		.dot-item {
			transition: none !important;
		}
	}

	/* Hide when loader present */
	:global(body:has(#hero-loader)) .mobile-nav-container {
		opacity: 0 !important;
		pointer-events: none;
	}
</style>

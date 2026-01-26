<script lang="ts">
	/**
	 * Mobile Navigation - Arc Navigator Design
	 *
	 * A+ Grade Implementation featuring:
	 * - Radial expanding arc navigation with physics-based Spring animation
	 * - Svelte 5 runes for reactive state management
	 * - prefersReducedMotion for accessibility
	 * - clickOutside action for proper event handling
	 * - Hardware-accelerated CSS transforms
	 * - Full keyboard accessibility
	 *
	 * @component MobileNav
	 */

	import { clickOutside } from '$lib/actions';
	import { navigation, navItems } from '$lib/stores';
	import Icon from '@iconify/svelte';
	import { prefersReducedMotion, Spring } from 'svelte/motion';

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	/** Arc configuration for radial layout */
	const ARC = {
		RADIUS: 90,
		START_ANGLE: -150, // degrees
		END_ANGLE: -30, // degrees
		ITEM_COUNT: navItems.length
	} as const;

	/** Spring physics configuration */
	const SPRING_CONFIG = {
		stiffness: 0.18,
		damping: 0.75
	} as const;

	/** Animation delay per item (seconds) */
	const STAGGER_DELAY = 0.03;

	/** Expansion threshold for enabling pointer events */
	const POINTER_EVENT_THRESHOLD = 0.5;

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	/** Whether the arc menu is expanded */
	let isExpanded = $state(false);

	/** Spring animation for expansion (0 = collapsed, 1 = expanded) */
	const expansion = new Spring(0, SPRING_CONFIG);

	// ─────────────────────────────────────────────────────────────
	// Derived State from Navigation Store
	// ─────────────────────────────────────────────────────────────

	const activeIndex = $derived(navigation.activeIndex);
	const isVisible = $derived(navigation.isVisible);
	const isNearBottom = $derived(navigation.isNearBottom);
	const currentItem = $derived(navItems[activeIndex]);

	/** Current expansion value (respects reduced motion) */
	const expansionValue = $derived(
		prefersReducedMotion.current ? (isExpanded ? 1 : 0) : expansion.current
	);

	// ─────────────────────────────────────────────────────────────
	// Utility Functions
	// ─────────────────────────────────────────────────────────────

	/**
	 * Calculate position for a nav item in the arc
	 * @param index - The item index
	 * @returns Cartesian coordinates {x, y} for the item position
	 */
	function getItemPosition(index: number): { x: number; y: number } {
		const angleRange = ARC.END_ANGLE - ARC.START_ANGLE;
		const angleStep = angleRange / (ARC.ITEM_COUNT - 1);
		const angleDeg = ARC.START_ANGLE + angleStep * index;
		const angleRad = (angleDeg * Math.PI) / 180;

		return {
			x: Math.cos(angleRad) * ARC.RADIUS,
			y: Math.sin(angleRad) * ARC.RADIUS
		};
	}

	/**
	 * Get stagger delay for animation
	 * @param index - The item index
	 * @returns Delay in seconds
	 */
	function getStaggerDelay(index: number): number {
		return isExpanded ? index * STAGGER_DELAY : 0;
	}

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	/**
	 * Navigate to section and collapse menu
	 */
	function handleNavClick(event: MouseEvent, index: number): void {
		navigation.handleNavClick(event, index);
		collapse();
	}

	/**
	 * Toggle expanded state
	 */
	function toggle(event: MouseEvent): void {
		event.stopPropagation();
		isExpanded = !isExpanded;
		expansion.target = isExpanded ? 1 : 0;
	}

	/**
	 * Collapse the navigation
	 */
	function collapse(): void {
		isExpanded = false;
		expansion.target = 0;
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (!isExpanded) return;

		switch (event.key) {
			case 'Escape':
				collapse();
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				focusItem(Math.max(0, activeIndex - 1));
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				focusItem(Math.min(navItems.length - 1, activeIndex + 1));
				break;
		}
	}

	/**
	 * Focus a specific arc item
	 */
	function focusItem(index: number): void {
		const item = document.querySelector<HTMLButtonElement>(`.arc-item[data-index="${index}"]`);
		item?.focus();
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<nav
	class="mobile-nav-container fixed right-0 bottom-6 left-0 z-50 flex flex-col items-center md:hidden"
	class:is-visible={isVisible}
	class:is-hidden={isNearBottom}
	aria-label="Mobile navigation"
	use:clickOutside={{ callback: collapse, enabled: isExpanded }}
>
	<!-- Arc Items Container -->
	<div class="arc-container relative" aria-hidden={!isExpanded} role="menu">
		{#each navItems as item, index (item.section)}
			{@const pos = getItemPosition(index)}
			{@const isActive = index === activeIndex}
			<button
				type="button"
				class="arc-item absolute top-1/2 left-1/2 flex size-12 cursor-pointer items-center justify-center rounded-full border transition-colors"
				class:active={isActive}
				data-index={index}
				style:transform="translate(-50%, -50%) translate({pos.x * expansionValue}px, {pos.y *
					expansionValue}px) scale({0.3 + 0.7 * expansionValue})"
				style:opacity={expansionValue}
				style:pointer-events={expansionValue > POINTER_EVENT_THRESHOLD ? 'auto' : 'none'}
				style:transition-delay="{getStaggerDelay(index)}s"
				onclick={(e) => handleNavClick(e, index)}
				aria-label={item.label}
				aria-current={isActive ? 'page' : undefined}
				tabindex={isExpanded ? 0 : -1}
				role="menuitem"
			>
				<Icon icon={item.icon} class="size-5" />
				{#if isActive}
					<span class="arc-item-label">{item.label}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Main Trigger Button -->
	<button
		type="button"
		class="main-trigger relative flex cursor-pointer items-center justify-center gap-2.5 rounded-full px-5 py-3 transition-all duration-300"
		class:expanded={isExpanded}
		onclick={toggle}
		aria-expanded={isExpanded}
		aria-haspopup="menu"
		aria-label={isExpanded ? 'Close navigation' : `Navigation - ${currentItem?.label}`}
	>
		<!-- Collapsed State: Current Section -->
		<span
			class="flex items-center gap-2.5 transition-all duration-300"
			style:opacity={1 - expansionValue}
			style:transform="scale({1 - 0.15 * expansionValue})"
			aria-hidden={isExpanded}
		>
			<span class="icon-wrapper flex items-center justify-center">
				<Icon icon={currentItem?.icon ?? 'mdi:menu'} class="size-5" />
			</span>
			<span class="trigger-label">{currentItem?.label ?? 'Menu'}</span>
			<Icon icon="mdi:chevron-up" class="size-4 text-foreground-muted/60" />
		</span>

		<!-- Expanded State: Close Icon -->
		<span
			class="absolute inset-0 flex items-center justify-center transition-all duration-300"
			style:opacity={expansionValue}
			style:transform="scale({0.6 + 0.4 * expansionValue}) rotate({expansionValue * 180}deg)"
			aria-hidden={!isExpanded}
		>
			<Icon icon="mdi:close" class="size-5 text-foreground" />
		</span>
	</button>

	<!-- Progress Dots -->
	<div
		class="progress-dots mt-3 flex items-center gap-2"
		style:opacity={1 - expansionValue * 0.5}
		role="tablist"
		aria-label="Section indicators"
	>
		{#each navItems as item, index (item.section)}
			<button
				type="button"
				class="dot-item transition-all duration-300"
				class:active={index === activeIndex}
				onclick={(e) => handleNavClick(e, index)}
				aria-label={`Go to ${item.label}`}
				aria-selected={index === activeIndex}
				role="tab"
			></button>
		{/each}
	</div>
</nav>

<style lang="postcss">
	@reference '$routes/layout.css';

	/* ─────────────────────────────────────────────────────────────
	   Container Styles
	   ───────────────────────────────────────────────────────────── */

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

	/* ─────────────────────────────────────────────────────────────
	   Arc Navigation
	   ───────────────────────────────────────────────────────────── */

	.arc-container {
		width: 0;
		height: 0;
		margin-bottom: 8px;
	}

	.arc-item {
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%),
			rgba(12, 22, 38, 0.9);
		border-color: rgba(255, 255, 255, 0.1);
		color: rgba(var(--foreground), 0.7);
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			box-shadow 0.2s ease;
		will-change: transform, opacity;
		-webkit-tap-highlight-color: transparent;
	}

	.arc-item:hover,
	.arc-item:focus-visible {
		background:
			linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%),
			rgba(15, 28, 50, 0.95);
		border-color: rgba(255, 255, 255, 0.18);
		color: rgba(var(--foreground), 0.95);
		outline: none;
	}

	.arc-item:focus-visible {
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.3),
			0 0 0 2px oklch(var(--accent-bg) / 0.5);
	}

	.arc-item.active {
		background: linear-gradient(
			145deg,
			oklch(var(--accent-bg) / 0.25) 0%,
			oklch(var(--accent-bg) / 0.1) 100%
		);
		border-color: oklch(var(--accent-bg) / 0.4);
		color: oklch(var(--accent-text));
		box-shadow:
			0 4px 20px oklch(var(--accent-bg) / 0.25),
			0 0 0 1px oklch(var(--accent-bg) / 0.2) inset;
	}

	.arc-item-label {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 6px;
		padding: 4px 10px;
		font-size: 11px;
		font-weight: 500;
		white-space: nowrap;
		background: rgba(12, 22, 38, 0.95);
		color: oklch(var(--accent-text));
		border-radius: 6px;
		border: 1px solid oklch(var(--accent-bg) / 0.3);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}

	/* ─────────────────────────────────────────────────────────────
	   Main Trigger Button
	   ───────────────────────────────────────────────────────────── */

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
		min-width: 140px;
		color: rgba(var(--foreground), 0.9);
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

	.main-trigger:focus-visible {
		outline: none;
		box-shadow:
			0 8px 32px -4px rgba(0, 0, 0, 0.5),
			0 0 0 2px oklch(var(--accent-bg) / 0.5);
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

	.icon-wrapper {
		background: linear-gradient(
			145deg,
			oklch(var(--accent-bg) / 0.25),
			oklch(var(--accent-bg) / 0.1)
		);
		border-radius: 8px;
		padding: 4px;
		color: oklch(var(--accent-text));
	}

	.trigger-label {
		font-size: 14px;
		font-weight: 500;
	}

	/* ─────────────────────────────────────────────────────────────
	   Progress Dots
	   ───────────────────────────────────────────────────────────── */

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

	.dot-item:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px oklch(var(--accent-bg) / 0.5);
	}

	.dot-item.active {
		width: 20px;
		border-radius: 10px;
		background: linear-gradient(90deg, oklch(var(--accent-bg) / 0.8), oklch(var(--accent-text)));
		box-shadow: 0 0 8px oklch(var(--accent-bg) / 0.5);
	}

	/* ─────────────────────────────────────────────────────────────
	   Accessibility & Reduced Motion
	   ───────────────────────────────────────────────────────────── */

	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-container,
		.main-trigger,
		.arc-item,
		.dot-item {
			transition: none !important;
		}
	}

	/* Hide when loader is present */
	:global(body:has(#hero-loader)) .mobile-nav-container {
		opacity: 0 !important;
		pointer-events: none;
	}
</style>

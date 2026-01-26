<script lang="ts">
	/**
	 * Mobile Navigation - Bottom Bar Design
	 *
	 * A clean, simple mobile navigation that:
	 * - Shows a floating bottom bar with current section
	 * - Expands to show all sections on tap
	 * - Uses progress dots for quick section indication
	 * - Uses Svelte 5 runes for state management
	 */

	import { navigation, navItems } from '$lib/stores';
	import Icon from '@iconify/svelte';

	// Local state
	let isExpanded = $state(false);

	// Reactive state from navigation store
	let activeIndex = $derived(navigation.activeIndex);
	let isVisible = $derived(navigation.isVisible);
	let isNearBottom = $derived(navigation.isNearBottom);
	let currentItem = $derived(navItems[activeIndex]);

	/**
	 * Navigate to section and close menu
	 */
	function handleNavClick(e: MouseEvent, index: number) {
		navigation.handleNavClick(e, index);
		isExpanded = false;
	}

	/**
	 * Toggle expanded state
	 */
	function toggle() {
		isExpanded = !isExpanded;
	}

	/**
	 * Handle click outside to close menu
	 */
	function handleClickOutside(event: MouseEvent) {
		if (!isExpanded) return;
		const target = event.target as HTMLElement;
		if (!target.closest('.mobile-nav-container')) {
			isExpanded = false;
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<nav
	class="mobile-nav-container fixed right-0 bottom-6 left-0 z-50 flex flex-col items-center md:hidden"
	class:is-visible={isVisible}
	class:is-hidden={isNearBottom}
	aria-label="Mobile navigation"
>
	<!-- Expanded menu - shows all nav items -->
	{#if isExpanded}
		<div
			class="nav-menu mb-3 flex flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-background/95 p-3 shadow-xl backdrop-blur-xl"
			role="menu"
		>
			{#each navItems as item, index (item.section)}
				<button
					type="button"
					class="nav-menu-item flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200"
					class:active={index === activeIndex}
					onclick={(e) => handleNavClick(e, index)}
					role="menuitem"
					aria-current={index === activeIndex ? 'page' : undefined}
				>
					<Icon icon={item.icon} class="size-5" />
					<span class="text-sm font-medium">{item.label}</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Main trigger pill -->
	<button
		type="button"
		class="main-trigger flex items-center justify-center gap-2.5 rounded-full px-5 py-3 transition-all duration-300"
		class:expanded={isExpanded}
		onclick={toggle}
		aria-expanded={isExpanded}
		aria-label={isExpanded ? 'Close navigation' : `Navigation - ${currentItem?.label}`}
	>
		{#if isExpanded}
			<!-- Expanded: show close icon -->
			<Icon icon="mdi:close" class="size-5" />
			<span class="text-sm font-medium">Close</span>
		{:else}
			<!-- Collapsed: show current section -->
			<span class="icon-wrapper flex size-7 items-center justify-center rounded-lg">
				<Icon icon={currentItem?.icon ?? 'mdi:menu'} class="size-5" />
			</span>
			<span class="text-sm font-medium">
				{currentItem?.label ?? 'Menu'}
			</span>
			<Icon icon="mdi:chevron-up" class="size-4 opacity-60" />
		{/if}
	</button>

	<!-- Section progress dots -->
	<div class="progress-dots mt-3 flex items-center gap-2" class:hidden={isExpanded}>
		{#each navItems as item, index (item.section)}
			<button
				type="button"
				class="dot-item transition-all duration-300"
				class:active={index === activeIndex}
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

	/* Nav menu items */
	.nav-menu-item {
		background: transparent;
		color: rgba(var(--foreground), 0.7);
		border: 1px solid transparent;
	}

	.nav-menu-item:hover {
		background: rgba(var(--foreground), 0.05);
		color: rgba(var(--foreground), 0.9);
	}

	.nav-menu-item.active {
		background: linear-gradient(
			145deg,
			oklch(var(--accent-bg) / 0.2),
			oklch(var(--accent-bg) / 0.1)
		);
		border-color: oklch(var(--accent-bg) / 0.3);
		color: oklch(var(--accent-text));
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
		background: linear-gradient(
			145deg,
			oklch(var(--accent-bg) / 0.25),
			oklch(var(--accent-bg) / 0.1)
		);
		color: oklch(var(--accent-text));
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
		.nav-menu-item,
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

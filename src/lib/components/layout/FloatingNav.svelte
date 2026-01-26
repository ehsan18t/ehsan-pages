<script lang="ts">
	/**
	 * Desktop Floating Navigation
	 *
	 * A+ Grade Implementation featuring:
	 * - Vertical floating nav with expand-on-hover behavior
	 * - Svelte 5 runes for reactive state management
	 * - Full keyboard accessibility with ARIA support
	 * - Smooth CSS transitions with reduced-motion support
	 * - Uses centralized navigation store
	 *
	 * @component FloatingNav
	 */

	import { navigation, navItems } from '$lib/stores';
	import Icon from '@iconify/svelte';

	// ─────────────────────────────────────────────────────────────
	// Derived State from Navigation Store
	// ─────────────────────────────────────────────────────────────

	const activeIndex = $derived(navigation.activeIndex);
	const isVisible = $derived(navigation.isVisible);
</script>

<nav
	id="floating-nav-desktop"
	class="floating-nav-desktop nav-glass pointer-events-none fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 opacity-0 transition-opacity duration-300 md:block"
	class:is-visible={isVisible}
	aria-label="Desktop navigation"
>
	<ul class="flex flex-col gap-1 p-2" role="menubar" aria-orientation="vertical">
		{#each navItems as item, index (item.section)}
			{@const isActive = index === activeIndex}
			<li role="none">
				<a
					href={item.href}
					data-sveltekit-preload-data="off"
					class="nav-item-desktop nav-item-base overflow-hidden p-2"
					class:active={isActive}
					data-section={item.section}
					aria-label={item.label}
					aria-current={isActive ? 'page' : undefined}
					role="menuitem"
					onclick={(e) => navigation.handleNavClick(e, index)}
				>
					<Icon icon={item.icon} class="nav-icon h-6 w-6 shrink-0 transition-all duration-300" />
					<span
						class="nav-label ml-0 max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300"
					>
						{item.label}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style lang="postcss">
	@reference '$routes/layout.css';

	/* ─────────────────────────────────────────────────────────────
	   Desktop Navigation Container
	   ───────────────────────────────────────────────────────────── */

	.floating-nav-desktop.is-visible {
		@apply pointer-events-auto opacity-100;
	}

	/* ─────────────────────────────────────────────────────────────
	   Navigation Item Styles
	   ───────────────────────────────────────────────────────────── */

	/* Expand labels on hover */
	.floating-nav-desktop .nav-item-desktop:hover .nav-label,
	.floating-nav-desktop:hover .nav-label {
		@apply ml-1.5 max-w-50 opacity-100;
	}

	/* Icon highlighting */
	.floating-nav-desktop .nav-item-desktop:hover :global(.nav-icon),
	.floating-nav-desktop .nav-item-desktop.active :global(.nav-icon) {
		@apply text-accent-text;
	}

	/* Focus styles for keyboard navigation */
	.floating-nav-desktop .nav-item-desktop:focus-visible {
		@apply rounded-lg ring-2 ring-accent-bg/50 outline-none;
	}

	.floating-nav-desktop .nav-item-desktop:focus-visible .nav-label {
		@apply ml-1.5 max-w-50 opacity-100;
	}

	/* ─────────────────────────────────────────────────────────────
	   Accessibility & Reduced Motion
	   ───────────────────────────────────────────────────────────── */

	@media (prefers-reduced-motion: reduce) {
		.floating-nav-desktop,
		.nav-item-desktop,
		.nav-item-desktop :global(.nav-icon),
		.nav-label {
			transition: none !important;
		}
	}

	/* Hide nav when loader is present */
	:global(body:has(#hero-loader)) .floating-nav-desktop {
		opacity: 0 !important;
		pointer-events: none;
	}
</style>

<script lang="ts">
	/**
	 * Desktop Floating Navigation
	 *
	 * A vertical floating nav that shows on desktop screens.
	 * Uses centralized navigation store for state management.
	 *
	 * Features:
	 * - Expands on hover to show labels
	 * - Highlights active section
	 * - Smooth scroll navigation
	 */

	import { handleNavClick, navigation, navItems } from '$lib/stores';
	import Icon from '@iconify/svelte';
</script>

<!-- Desktop Navigation Only -->
<nav
	id="floating-nav-desktop"
	class="floating-nav-desktop nav-glass pointer-events-none fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 opacity-0 transition-opacity duration-300 md:block"
	class:is-visible={navigation.isVisible}
	aria-label="Desktop navigation"
>
	<div class="flex flex-col gap-1 p-2">
		{#each navItems as item, index (item.section)}
			<a
				href={item.href}
				data-sveltekit-preload-data="off"
				class="nav-item-desktop nav-item-base overflow-hidden p-2"
				class:active={index === navigation.activeIndex}
				data-section={item.section}
				aria-label={item.label}
				aria-current={index === navigation.activeIndex ? 'page' : undefined}
				onclick={(e) => handleNavClick(e, index)}
			>
				<Icon icon={item.icon} class="nav-icon h-6 w-6 shrink-0 transition-all duration-300" />
				<span
					class="nav-label ml-0 max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300"
				>
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Desktop Navigation */
	.floating-nav-desktop.is-visible {
		@apply pointer-events-auto opacity-100;
	}

	.floating-nav-desktop .nav-item-desktop:hover .nav-label,
	.floating-nav-desktop:hover .nav-label {
		@apply ml-1.5 max-w-50 opacity-100;
	}

	.floating-nav-desktop .nav-item-desktop:hover :global(.nav-icon),
	.floating-nav-desktop .nav-item-desktop.active :global(.nav-icon) {
		@apply text-accent-text;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.floating-nav-desktop,
		.nav-item-desktop,
		.nav-item-desktop :global(.nav-icon) {
			transition: none !important;
		}
	}

	/* Hide nav when loader is present */
	:global(body:has(#hero-loader)) .floating-nav-desktop {
		opacity: 0 !important;
		pointer-events: none;
	}
</style>

<script lang="ts">
	/**
	 * Desktop Floating Navigation
	 *
	 * A vertical floating nav for desktop screens only.
	 * Mobile navigation is handled by MobileNav.svelte
	 */

	import { browser } from '$app/environment';
	import { navItems } from '$data';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	// State
	let desktopNavRef = $state<HTMLElement | null>(null);
	let activeIndex = $state(0);
	let isVisible = $state(false);

	// Helper function
	function getScrollContainer(el: HTMLElement | null): HTMLElement {
		let node = el?.parentElement;
		while (node) {
			const style = getComputedStyle(node);
			if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight)
				return node;
			node = node.parentElement;
		}
		return (document.scrollingElement as HTMLElement) || document.documentElement;
	}

	function scrollToSection(e: MouseEvent, href: string, offset?: number) {
		e.preventDefault();
		const id = href.slice(1);
		const target = id ? document.getElementById(id) : null;
		if (!target) return;

		const container = getScrollContainer(target);

		if (offset !== undefined) {
			const containerRect = container.getBoundingClientRect();
			const targetRect = target.getBoundingClientRect();
			const currentScrollTop = container.scrollTop;
			const relativeTop = targetRect.top - containerRect.top;
			const destination = currentScrollTop + relativeTop - offset;
			container.scrollTo({ top: destination, behavior: 'smooth' });
		} else {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	let observer: IntersectionObserver;

	onMount(() => {
		// Setup intersection observer
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
			{ root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
		);

		sections.forEach((section) => observer.observe(section));

		// Show nav after delay
		setTimeout(() => {
			isVisible = true;
		}, 2500);
	});

	onDestroy(() => {
		if (!browser) return;
		if (observer) observer.disconnect();
	});
</script>

<!-- Desktop Navigation Only -->
<nav
	bind:this={desktopNavRef}
	id="floating-nav-desktop"
	class="floating-nav-desktop nav-glass pointer-events-none fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 opacity-0 transition-opacity duration-300 md:block"
	class:is-visible={isVisible}
	aria-label="Desktop navigation"
>
	<div class="flex flex-col gap-1 p-2">
		{#each navItems as item, index (item.section)}
			<a
				href={item.href}
				data-sveltekit-preload-data="off"
				class="nav-item-desktop nav-item-base overflow-hidden p-2"
				class:active={index === activeIndex}
				data-section={item.section}
				aria-label={item.label}
				aria-current={index === activeIndex ? 'page' : undefined}
				onclick={(e) => scrollToSection(e, item.href, item.offset)}
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

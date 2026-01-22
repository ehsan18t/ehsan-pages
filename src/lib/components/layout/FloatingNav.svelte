<script lang="ts">
	import { browser } from '$app/environment';
	import { navItems } from '$data';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	// State
	let desktopNavRef = $state<HTMLElement | null>(null);
	let mobileNavRef = $state<HTMLElement | null>(null);
	let indicatorRef = $state<HTMLElement | null>(null);
	let activeIndex = $state(0);
	let isHidden = $state(false);
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

	function updateIndicator() {
		if (!indicatorRef || !mobileNavRef) return;
		const links = mobileNavRef.querySelectorAll('.nav-item-mobile');
		const activeEl = links[activeIndex] as HTMLElement;
		if (activeEl) {
			const width = activeEl.offsetWidth;
			const left = activeEl.offsetLeft;
			indicatorRef.style.width = `${width}px`;
			indicatorRef.style.transform = `translateX(${left}px)`;
		}
	}

	let resizeRAF: number;
	function handleResize() {
		cancelAnimationFrame(resizeRAF);
		resizeRAF = requestAnimationFrame(updateIndicator);
	}

	function handleScroll() {
		const scrollY = window.scrollY;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;
		isHidden = scrollY + clientHeight >= scrollHeight - 30;
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

		// Event listeners
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);
		window.addEventListener('scroll', handleScroll, { passive: true });

		// Show nav after delay
		setTimeout(() => {
			isVisible = true;
			setTimeout(updateIndicator, 40);
		}, 2500);
	});

	onDestroy(() => {
		if (!browser) return;
		if (observer) observer.disconnect();
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('orientationchange', handleResize);
		window.removeEventListener('scroll', handleScroll);
	});

	// Reactive indicator update
	$effect(() => {
		if (isVisible) {
			updateIndicator();
		}
	});
</script>

<!-- Desktop Navigation -->
<nav
	bind:this={desktopNavRef}
	id="floating-nav-desktop"
	class="floating-nav-desktop nav-glass pointer-events-none fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 opacity-0 transition-opacity duration-300 md:block"
	class:is-visible={isVisible}
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

<!-- Mobile Navigation -->
<nav
	bind:this={mobileNavRef}
	id="floating-nav-mobile"
	class="floating-nav-mobile pointer-events-none fixed inset-x-4 bottom-4 z-50 block opacity-0 backdrop-blur-sm transition-all duration-400 ease-[cubic-bezier(0.4,0.8,0.2,1)] md:hidden"
	class:is-visible={isVisible}
	class:is-hidden={isHidden}
	aria-label="Primary navigation"
>
	<div
		class="nav-container relative isolate flex w-full items-stretch justify-between gap-1 overflow-hidden rounded-3xl border border-white/12 p-2 saturate-150 backdrop-blur-xl"
		style="background: linear-gradient(140deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 60%) border-box, rgba(10, 25, 45, 0.55);
			   box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.4), 0 8px 28px -6px rgba(0, 0, 0, 0.45);"
	>
		<div
			bind:this={indicatorRef}
			class="active-indicator absolute top-1.5 left-0 z-0 h-[calc(100%-12px)] w-0 rounded-[18px] border border-accent-bg/50 transition-all duration-450 ease-[cubic-bezier(0.55,0.2,0.15,1)] will-change-[transform,width]"
			style="background: linear-gradient(145deg, oklch(var(--accent-bg) / 0.55), oklch(var(--accent-bg) / 0.25));
				   box-shadow: inset 0 0 0 1px oklch(var(--accent-bg) / 0.35), 0 4px 10px -2px oklch(var(--accent-bg) / 0.55);"
			aria-hidden="true"
		></div>
		{#each navItems as item, index (item.section)}
			<a
				href={item.href}
				data-sveltekit-preload-data="off"
				class="nav-item-mobile relative z-1 flex min-w-15 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] leading-none font-medium text-foreground-muted no-underline transition-colors duration-300 select-none"
				class:active={index === activeIndex}
				data-section={item.section}
				aria-label={item.label}
				aria-current={index === activeIndex ? 'page' : undefined}
				onclick={(e) => scrollToSection(e, item.href, item.offset)}
				style="-webkit-tap-highlight-color: transparent;"
			>
				<span
					class="icon-wrapper flex h-6.5 w-6.5 items-center justify-center rounded-[10px] transition-all duration-300"
				>
					<Icon icon={item.icon} class="nav-icon h-5 w-5 transition-all duration-350" />
				</span>
				<span class="nav-label tracking-wide opacity-85 transition-opacity duration-300">
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	@reference "../../../routes/layout.css";

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

	/* Mobile Navigation */
	.floating-nav-mobile.is-visible {
		@apply pointer-events-auto opacity-100;
	}

	.floating-nav-mobile.is-hidden {
		@apply pointer-events-none translate-y-full opacity-0;
	}

	.floating-nav-mobile .nav-item-mobile:focus-visible {
		@apply outline-2 outline-offset-2 outline-accent-bg;
	}

	.floating-nav-mobile .nav-item-mobile.active .icon-wrapper,
	.floating-nav-mobile .nav-item-mobile:hover .icon-wrapper {
		background: oklch(var(--accent-bg) / 0.18);
	}

	.floating-nav-mobile .nav-item-mobile.active :global(.nav-icon) {
		transform: scale(1.07);
		filter: drop-shadow(0 2px 4px oklch(var(--accent-bg) / 0.55));
	}

	.floating-nav-mobile .nav-item-mobile:not(.active) .nav-label {
		@apply opacity-65;
	}

	.floating-nav-mobile .nav-item-mobile.active,
	.floating-nav-mobile .nav-item-mobile:hover {
		@apply text-accent-text;
	}

	.floating-nav-mobile .nav-item-mobile:active .icon-wrapper {
		transform: scale(0.92);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.active-indicator,
		.floating-nav-mobile,
		.floating-nav-desktop,
		.nav-item-mobile,
		.nav-item-desktop,
		.icon-wrapper,
		.nav-item-mobile :global(.nav-icon),
		.nav-item-desktop :global(.nav-icon) {
			transition: none !important;
		}
	}

	/* Hide nav when loader is present */
	:global(body:has(#hero-loader)) .floating-nav-desktop,
	:global(body:has(#hero-loader)) .floating-nav-mobile {
		opacity: 0 !important;
		pointer-events: none;
	}
</style>

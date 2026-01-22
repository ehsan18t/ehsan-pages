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
		const links = mobileNavRef.querySelectorAll('.nav-item');
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
						const idx = navItems.findIndex(
							(item) => item.href.substring(1) === entry.target.id
						);
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
	class="floating-nav-desktop"
	class:is-visible={isVisible}
>
	<div class="nav-container">
		{#each navItems as item, index}
			<a
				href={item.href}
				class="nav-item"
				class:active={index === activeIndex}
				data-section={item.section}
				aria-label={item.label}
				onclick={(e) => scrollToSection(e, item.href, item.offset)}
			>
				<Icon icon={item.icon} class="nav-icon" />
				<span class="nav-label">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>

<!-- Mobile Navigation -->
<nav
	bind:this={mobileNavRef}
	id="floating-nav-mobile"
	class="floating-nav-mobile"
	class:is-visible={isVisible}
	class:is-hidden={isHidden}
	aria-label="Primary navigation"
>
	<div class="nav-container">
		<div bind:this={indicatorRef} class="active-indicator" aria-hidden="true"></div>
		{#each navItems as item, index}
			<a
				href={item.href}
				class="nav-item"
				class:active={index === activeIndex}
				data-section={item.section}
				aria-label={item.label}
				aria-current={index === activeIndex ? 'page' : undefined}
				onclick={(e) => scrollToSection(e, item.href, item.offset)}
			>
				<span class="icon-wrapper">
					<Icon icon={item.icon} class="nav-icon" />
				</span>
				<span class="nav-label">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	/* ========================
	   Desktop Navigation
	   ======================== */
	.floating-nav-desktop {
		display: none;
	}

	@media (min-width: 768px) {
		.floating-nav-desktop {
			position: fixed;
			top: 50%;
			left: 1.5rem;
			z-index: 50;
			display: block;
			opacity: 0;
			pointer-events: none;
			transform: translateY(-50%);
			transition: opacity 0.3s ease-in-out;
		}

		.floating-nav-desktop.is-visible {
			opacity: 1;
			pointer-events: auto;
		}

		.floating-nav-desktop .nav-container {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			padding: 0.5rem;
			border-radius: 0.75rem;
			border: 1px solid rgba(224, 230, 237, 0.1);
			background: rgba(2, 21, 38, 0.85);
			backdrop-filter: blur(16px);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		}

		.floating-nav-desktop .nav-item {
			position: relative;
			display: flex;
			cursor: pointer;
			align-items: center;
			overflow: hidden;
			border-radius: 0.5rem;
			padding: 0.5rem;
			text-decoration: none;
			color: rgb(var(--foreground-muted));
			transition: all 0.2s ease-in-out;
		}

		.floating-nav-desktop .nav-item :global(.nav-icon) {
			height: 1.5rem;
			width: 1.5rem;
			flex-shrink: 0;
			transition: all 0.3s ease-in-out;
		}

		.floating-nav-desktop .nav-label {
			overflow: hidden;
			font-size: 0.875rem;
			font-weight: 500;
			white-space: nowrap;
			opacity: 0;
			max-width: 0;
			margin-left: 0;
			transition: all 0.3s ease-in-out;
		}

		.floating-nav-desktop .nav-container:hover .nav-label {
			opacity: 1;
			max-width: 200px;
			margin-left: 0.375rem;
		}

		.floating-nav-desktop .nav-item:hover,
		.floating-nav-desktop .nav-item.active {
			color: oklch(var(--accent-text));
			background: oklch(var(--accent-bg) / 0.2);
		}

		.floating-nav-desktop .nav-item.active {
			background: oklch(var(--accent-bg) / 0.3);
		}

		.floating-nav-desktop .nav-item:hover :global(.nav-icon),
		.floating-nav-desktop .nav-item.active :global(.nav-icon) {
			color: oklch(var(--accent-text));
		}
	}

	/* ========================
	   Mobile Navigation
	   ======================== */
	.floating-nav-mobile {
		display: none;
	}

	@media (max-width: 767px) {
		.floating-nav-mobile {
			position: fixed;
			inset-inline: 1rem;
			bottom: 1rem;
			z-index: 50;
			display: block;
			opacity: 0;
			pointer-events: none;
			backdrop-filter: blur(2px);
			transition:
				opacity 0.4s cubic-bezier(0.4, 0.8, 0.2, 1),
				transform 0.4s cubic-bezier(0.4, 0.8, 0.2, 1);
		}

		.floating-nav-mobile.is-visible {
			opacity: 1;
			pointer-events: auto;
		}

		.floating-nav-mobile.is-hidden {
			transform: translateY(100%);
			opacity: 0;
			pointer-events: none;
		}

		.floating-nav-mobile .nav-container {
			position: relative;
			display: flex;
			width: 100%;
			align-items: stretch;
			justify-content: space-between;
			gap: 0.25rem;
			padding: 0.5rem;
			border-radius: 1.5rem;
			overflow: hidden;
			isolation: isolate;
			filter: saturate(1.5);
			backdrop-filter: blur(16px);
			background:
				linear-gradient(140deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0) 60%)
					border-box,
				rgba(10, 25, 45, 0.55);
			border: 1px solid rgba(255, 255, 255, 0.12);
			box-shadow:
				0 4px 10px -2px rgba(0, 0, 0, 0.4),
				0 8px 28px -6px rgba(0, 0, 0, 0.45);
			pointer-events: auto;
		}

		.active-indicator {
			position: absolute;
			top: 6px;
			left: 0;
			height: calc(100% - 12px);
			width: 0;
			box-sizing: border-box;
			background: linear-gradient(
				145deg,
				oklch(var(--accent-bg) / 0.55),
				oklch(var(--accent-bg) / 0.25)
			);
			border: 1px solid oklch(var(--accent-bg) / 0.5);
			box-shadow:
				inset 0 0 0 1px oklch(var(--accent-bg) / 0.35),
				0 4px 10px -2px oklch(var(--accent-bg) / 0.55);
			border-radius: 18px;
			transform: translateX(0);
			transition:
				transform 0.45s cubic-bezier(0.55, 0.2, 0.15, 1),
				width 0.28s cubic-bezier(0.55, 0.2, 0.15, 1);
			will-change: transform, width;
			z-index: 0;
			pointer-events: none;
		}

		.floating-nav-mobile .nav-item {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;
			padding: 0.5rem 0.75rem;
			min-width: 60px;
			font-size: 11px;
			font-weight: 500;
			text-decoration: none;
			color: rgb(var(--foreground-muted));
			border-radius: 1rem;
			line-height: 1;
			user-select: none;
			-webkit-tap-highlight-color: transparent;
			transition: color 0.3s;
			z-index: 1;
		}

		.floating-nav-mobile .nav-item:focus-visible {
			outline: 2px solid oklch(var(--accent-bg));
			outline-offset: 2px;
		}

		.floating-nav-mobile .icon-wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 26px;
			height: 26px;
			border-radius: 10px;
			transition:
				background 0.3s,
				transform 0.3s;
		}

		.floating-nav-mobile .nav-item :global(.nav-icon) {
			height: 1.25rem;
			width: 1.25rem;
			transition:
				transform 0.35s,
				filter 0.35s;
		}

		.floating-nav-mobile .nav-item.active .icon-wrapper,
		.floating-nav-mobile .nav-item:hover .icon-wrapper {
			background: oklch(var(--accent-bg) / 0.18);
		}

		.floating-nav-mobile .nav-item.active :global(.nav-icon) {
			transform: scale(1.07);
			filter: drop-shadow(0 2px 4px oklch(var(--accent-bg) / 0.55));
		}

		.floating-nav-mobile .nav-label {
			letter-spacing: 0.25px;
			opacity: 0.85;
			transition: opacity 0.3s;
		}

		.floating-nav-mobile .nav-item:not(.active) .nav-label {
			opacity: 0.65;
		}

		.floating-nav-mobile .nav-item.active,
		.floating-nav-mobile .nav-item:hover {
			color: oklch(var(--accent-text));
		}

		.floating-nav-mobile .nav-item:active .icon-wrapper {
			transform: scale(0.92);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.active-indicator,
		.floating-nav-mobile,
		.floating-nav-desktop,
		.nav-item,
		.icon-wrapper,
		.nav-item :global(.nav-icon) {
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

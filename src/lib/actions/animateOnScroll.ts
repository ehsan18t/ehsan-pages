/**
 * Animate On Scroll Action - Svelte 5 Action for CSS-based scroll animations
 *
 * A+ Grade Implementation featuring:
 * - Uses IntersectionObserver for efficient detection
 * - CSS class-based animations (no JS animation overhead)
 * - Supports staggered child animations
 * - prefersReducedMotion support for accessibility
 * - Type-safe with proper JSDoc
 *
 * @example
 * ```svelte
 * <div use:animateOnScroll={{ animation: 'fade-up', delay: 200 }}>...</div>
 * <div use:animateOnScroll={'fade-up'}>...</div>
 * ```
 *
 * @module animateOnScroll
 */

import { browser } from '$app/environment';
import type { Action } from 'svelte/action';
import { prefersReducedMotion } from 'svelte/motion';

/** Options for animate on scroll action */
export interface AnimateOnScrollOptions {
	/** Animation class to apply (e.g., 'fade-up', 'slide-left') */
	animation?: string;
	/** Delay before animation starts (ms) */
	delay?: number;
	/** Duration of the animation (ms) */
	duration?: number;
	/** Threshold for intersection (0-1) */
	threshold?: number;
	/** Root margin for intersection observer */
	rootMargin?: string;
	/** Whether animation should replay when element leaves and re-enters */
	replay?: boolean;
	/** Whether to animate only once */
	once?: boolean;
	/** Easing function name */
	easing?: string;
}

/** Default options */
const DEFAULT_OPTIONS: Required<AnimateOnScrollOptions> = {
	animation: 'fade-up',
	delay: 0,
	duration: 0,
	threshold: 0.15,
	rootMargin: '0px 0px -10% 0px',
	replay: false,
	once: true,
	easing: ''
};

/**
 * Svelte action for CSS class-based scroll animations
 * @deprecated Use scrollReveal action instead for GSAP-based animations
 */
export const animateOnScroll: Action<HTMLElement, AnimateOnScrollOptions | string | undefined> = (
	node,
	options = {}
) => {
	if (!browser) return {};

	// Normalize options
	const opts: Required<AnimateOnScrollOptions> = {
		...DEFAULT_OPTIONS,
		...(typeof options === 'string' ? { animation: options } : options)
	};

	const shouldAnimate = !prefersReducedMotion.current;
	let observer: IntersectionObserver | null = null;
	let hasAnimated = false;

	// Apply initial hidden state
	if (shouldAnimate) {
		node.style.opacity = '0';
		node.classList.add('animate-hidden');

		// Set CSS custom properties for delay/duration/easing
		if (opts.delay) {
			node.style.setProperty('--animation-delay', `${opts.delay}ms`);
		}
		if (opts.duration) {
			node.style.setProperty('--animation-duration', `${opts.duration}ms`);
		}
		if (opts.easing) {
			node.style.setProperty('--animation-easing', opts.easing);
		}
	}

	/**
	 * Show the element with animation
	 */
	function showElement(): void {
		if (shouldAnimate) {
			setTimeout(() => {
				node.style.opacity = '';
				node.classList.remove('animate-hidden');
				node.classList.add('animate-visible', opts.animation);
			}, opts.delay);
		}
	}

	/**
	 * Hide the element (for replay)
	 */
	function hideElement(): void {
		if (shouldAnimate) {
			node.style.opacity = '0';
			node.classList.remove('animate-visible', opts.animation);
			node.classList.add('animate-hidden');
		}
	}

	/**
	 * Handle intersection observer callback
	 */
	function handleIntersection(entries: IntersectionObserverEntry[]): void {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				if (!hasAnimated || opts.replay) {
					showElement();

					if (opts.once) {
						hasAnimated = true;
						observer?.unobserve(node);
					}
				}
			} else if (opts.replay && hasAnimated) {
				hideElement();
			}
		}
	}

	// Create and start observer
	observer = new IntersectionObserver(handleIntersection, {
		threshold: opts.threshold,
		rootMargin: opts.rootMargin
	});

	observer.observe(node);

	return {
		update(newOptions: AnimateOnScrollOptions | string | undefined = {}) {
			// Update options (limited support for live updates)
			const newOpts =
				typeof newOptions === 'string' ? { animation: newOptions } : (newOptions ?? {});
			Object.assign(opts, newOpts);
		},
		destroy() {
			observer?.disconnect();
			observer = null;
		}
	};
};

/** Options for stagger children action */
export interface StaggerOptions extends AnimateOnScrollOptions {
	/** Delay between each child (ms) */
	stagger?: number;
	/** Selector for children to animate */
	selector?: string;
}

/**
 * Svelte action for staggered child animations
 *
 * Applies animation to children with increasing delays.
 * @deprecated Use scrollReveal action with GSAP stagger instead
 */
export const staggerChildren: Action<HTMLElement, StaggerOptions | undefined> = (
	node,
	options = {}
) => {
	if (!browser) return {};

	const {
		stagger = 100,
		selector = ':scope > *',
		animation = 'fade-up',
		threshold = 0.1,
		rootMargin = '0px 0px -5% 0px',
		once = true
	} = options;

	const shouldAnimate = !prefersReducedMotion.current;
	const children = node.querySelectorAll(selector);
	let observer: IntersectionObserver | null = null;
	let hasAnimated = false;

	// Hide all children initially
	if (shouldAnimate) {
		children.forEach((child) => {
			(child as HTMLElement).style.opacity = '0';
			child.classList.add('animate-hidden');
		});
	}

	/**
	 * Handle intersection observer callback
	 */
	function handleIntersection(entries: IntersectionObserverEntry[]): void {
		for (const entry of entries) {
			if (entry.isIntersecting && !hasAnimated) {
				// Animate children with stagger
				children.forEach((child, index) => {
					const el = child as HTMLElement;

					if (shouldAnimate) {
						setTimeout(() => {
							el.style.opacity = '';
							el.classList.remove('animate-hidden');
							el.classList.add('animate-visible', animation);
						}, index * stagger);
					} else {
						el.style.opacity = '';
						el.classList.remove('animate-hidden');
					}
				});

				if (once) {
					hasAnimated = true;
					observer?.unobserve(node);
				}
			}
		}
	}

	// Create and start observer
	observer = new IntersectionObserver(handleIntersection, {
		threshold,
		rootMargin
	});

	observer.observe(node);

	return {
		destroy() {
			observer?.disconnect();
			observer = null;
		}
	};
};

export default animateOnScroll;

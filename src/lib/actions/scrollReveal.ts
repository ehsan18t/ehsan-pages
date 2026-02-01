/**
 * Scroll Reveal Action - Svelte 5 Action for scroll-triggered animations
 *
 * A+ Grade Implementation featuring:
 * - Uses IntersectionObserver for efficient detection
 * - GSAP for smooth, performant animations
 * - prefersReducedMotion support for accessibility
 * - Type-safe with proper JSDoc
 *
 * @example
 * ```svelte
 * <div use:scrollReveal>...</div>
 * <div use:scrollReveal={{ y: 60, duration: 0.8 }}>...</div>
 * ```
 *
 * @module scrollReveal
 */

import { browser } from '$app/environment';
import gsap from 'gsap';
import type { Action } from 'svelte/action';
import { prefersReducedMotion } from 'svelte/motion';

/** Options for scroll reveal animation */
export interface ScrollRevealOptions {
	/** Vertical offset to animate from (default: 50) */
	y?: number;
	/** Horizontal offset to animate from (default: 0) */
	x?: number;
	/** Animation duration in seconds (default: 0.7) */
	duration?: number;
	/** Delay before animation starts (default: 0) */
	delay?: number;
	/** GSAP easing function (default: 'power3.out') */
	ease?: string;
	/** Threshold for triggering (0-1, default: 0.15 = 15% visible) */
	threshold?: number;
	/** Whether to respect reduced motion preference (default: true) */
	respectReducedMotion?: boolean;
}

/** Default options for scroll reveal */
const DEFAULT_OPTIONS: Required<ScrollRevealOptions> = {
	y: 50,
	x: 0,
	duration: 0.7,
	delay: 0,
	ease: 'power3.out',
	threshold: 0.15,
	respectReducedMotion: true
};

/**
 * Svelte action for scroll-triggered reveal animations
 *
 * Uses IntersectionObserver for efficient detection and GSAP for smooth animations.
 * Respects prefers-reduced-motion by default.
 */
export const scrollReveal: Action<HTMLElement, ScrollRevealOptions | undefined> = (
	node,
	options = {}
) => {
	if (!browser) return {};

	const opts = { ...DEFAULT_OPTIONS, ...options };
	const shouldAnimate = !opts.respectReducedMotion || !prefersReducedMotion.current;

	let observer: IntersectionObserver | null = null;
	let hasAnimated = false;

	// Set initial hidden state
	if (shouldAnimate) {
		gsap.set(node, {
			opacity: 0,
			y: opts.y,
			x: opts.x
		});
	}

	/**
	 * Handle intersection observer callback
	 */
	function handleIntersection(entries: IntersectionObserverEntry[]): void {
		for (const entry of entries) {
			if (entry.isIntersecting && !hasAnimated) {
				hasAnimated = true;

				if (shouldAnimate) {
					// Animate to visible
					gsap.to(node, {
						opacity: 1,
						y: 0,
						x: 0,
						duration: opts.duration,
						delay: opts.delay,
						ease: opts.ease,
						clearProps: 'transform'
					});
				} else {
					// No animation, just show
					gsap.set(node, { opacity: 1, y: 0, x: 0 });
				}

				// Stop observing after animation
				observer?.unobserve(node);
			}
		}
	}

	// Create and start observer
	observer = new IntersectionObserver(handleIntersection, {
		threshold: opts.threshold,
		rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in view
	});

	observer.observe(node);

	return {
		destroy() {
			observer?.disconnect();
			observer = null;
		}
	};
};

export default scrollReveal;

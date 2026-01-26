/**
 * GSAP-based Scroll Animation Actions
 *
 * A+ Grade Implementation featuring:
 * - Proper Svelte Action typing
 * - Accessibility: respects prefers-reduced-motion
 * - Performant scroll-triggered animations using GSAP and ScrollTrigger
 * - Multiple animation presets (fadeIn, slideUp, slideLeft, slideRight, scaleIn, staggerIn)
 *
 * @example
 * <div use:gsapFadeIn>...</div>
 * <div use:gsapFadeIn={{ y: 50, duration: 0.8, delay: 0.2 }}>...</div>
 */

import { browser } from '$app/environment';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Action } from 'svelte/action';
import { prefersReducedMotion } from 'svelte/motion';

// Register GSAP plugins (only in browser)
if (browser) {
	gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface GsapScrollOptions {
	/** Starting Y offset (default: 30) */
	y?: number;
	/** Starting X offset (default: 0) */
	x?: number;
	/** Starting opacity (default: 0) */
	opacity?: number;
	/** Starting scale (default: 1) */
	scale?: number;
	/** Animation duration in seconds (default: 0.6) */
	duration?: number;
	/** Animation delay in seconds (default: 0) */
	delay?: number;
	/** GSAP easing (default: 'power2.out') */
	ease?: string;
	/** ScrollTrigger start position (default: 'top 85%') */
	start?: string;
	/** Whether animation plays only once (default: true) */
	once?: boolean;
	/** Stagger delay for child elements (if > 0, animates children) */
	stagger?: number;
	/** Selector for children to animate */
	childSelector?: string;
}

// ─────────────────────────────────────────────────────────────
// Main Action
// ─────────────────────────────────────────────────────────────

/**
 * Fade in animation with scroll trigger
 */
export const gsapFadeIn: Action<HTMLElement, GsapScrollOptions | undefined> = (
	node,
	options = {}
) => {
	if (!browser) return {};

	// Respect prefers-reduced-motion
	if (prefersReducedMotion.current) {
		node.style.opacity = '1';
		return {};
	}

	gsap.registerPlugin(ScrollTrigger);

	const {
		y = 30,
		x = 0,
		opacity = 0,
		scale = 1,
		duration = 0.6,
		delay = 0,
		ease = 'power2.out',
		start = 'top 85%',
		once = true,
		stagger = 0,
		childSelector
	} = options;

	let animation: gsap.core.Tween | null = null;
	let scrollTrigger: ScrollTrigger | null = null;

	const targets = stagger > 0 && childSelector ? node.querySelectorAll(childSelector) : node;

	// Set initial state
	gsap.set(targets, { opacity, y, x, scale });

	// Create a paused tween and play only on enter
	animation = gsap.to(targets, {
		opacity: 1,
		y: 0,
		x: 0,
		scale: 1,
		duration,
		delay,
		ease,
		stagger: stagger > 0 ? stagger : undefined,
		paused: true,
		clearProps: 'transform,opacity'
	});

	scrollTrigger = ScrollTrigger.create({
		trigger: node,
		start,
		once,
		onEnter: () => {
			animation?.play();
		},
		onEnterBack: () => {
			if (!once) animation?.play();
		}
	});

	ScrollTrigger.refresh(true);

	return {
		update(newOptions: GsapScrollOptions = {}) {
			// Respect prefers-reduced-motion
			if (prefersReducedMotion.current) {
				node.style.opacity = '1';
				return;
			}

			// Kill old animation and create new one
			if (animation) animation.kill();
			if (scrollTrigger) scrollTrigger.kill();

			const newTargets =
				newOptions.stagger && newOptions.childSelector
					? node.querySelectorAll(newOptions.childSelector)
					: node;

			gsap.set(newTargets, {
				opacity: newOptions.opacity ?? 0,
				y: newOptions.y ?? 30,
				x: newOptions.x ?? 0,
				scale: newOptions.scale ?? 1
			});

			animation = gsap.to(newTargets, {
				opacity: 1,
				y: 0,
				x: 0,
				scale: 1,
				duration: newOptions.duration ?? 0.6,
				delay: newOptions.delay ?? 0,
				ease: newOptions.ease ?? 'power2.out',
				stagger: newOptions.stagger,
				paused: true,
				clearProps: 'transform,opacity'
			});

			scrollTrigger = ScrollTrigger.create({
				trigger: node,
				start: newOptions.start ?? 'top 85%',
				once: newOptions.once !== false,
				onEnter: () => {
					animation?.play();
				},
				onEnterBack: () => {
					if (newOptions.once === false) animation?.play();
				}
			});

			ScrollTrigger.refresh(true);
		},
		destroy() {
			if (animation) animation.kill();
			if (scrollTrigger) scrollTrigger.kill();
		}
	};
};

// ─────────────────────────────────────────────────────────────
// Preset Actions
// ─────────────────────────────────────────────────────────────

interface SlideOptions extends Omit<GsapScrollOptions, 'y' | 'x'> {
	distance?: number;
}

interface ScaleOptions extends Omit<GsapScrollOptions, 'scale'> {
	fromScale?: number;
}

interface StaggerOptions extends GsapScrollOptions {
	selector?: string;
}

/**
 * Slide up animation
 */
export const gsapSlideUp: Action<HTMLElement, SlideOptions | undefined> = (node, options = {}) => {
	return gsapFadeIn(node, { ...options, y: options.distance ?? 50 });
};

/**
 * Slide in from left
 */
export const gsapSlideLeft: Action<HTMLElement, SlideOptions | undefined> = (
	node,
	options = {}
) => {
	return gsapFadeIn(node, { ...options, x: -(options.distance ?? 50), y: 0 });
};

/**
 * Slide in from right
 */
export const gsapSlideRight: Action<HTMLElement, SlideOptions | undefined> = (
	node,
	options = {}
) => {
	return gsapFadeIn(node, { ...options, x: options.distance ?? 50, y: 0 });
};

/**
 * Scale in animation
 */
export const gsapScaleIn: Action<HTMLElement, ScaleOptions | undefined> = (node, options = {}) => {
	return gsapFadeIn(node, { ...options, scale: options.fromScale ?? 0.9, y: 0 });
};

/**
 * Stagger children animation
 */
export const gsapStaggerIn: Action<HTMLElement, StaggerOptions | undefined> = (
	node,
	options = {}
) => {
	return gsapFadeIn(node, {
		...options,
		stagger: options.stagger ?? 0.1,
		childSelector: options.selector ?? ':scope > *'
	});
};

export default gsapFadeIn;

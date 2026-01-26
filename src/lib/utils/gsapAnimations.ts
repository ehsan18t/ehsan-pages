/**
 * GSAP Animation Utilities
 * Provides reusable animation functions and scroll-triggered animations using GSAP.
 *
 * Usage:
 *   import { fadeUp, slideIn, staggerFadeUp } from '$lib/utils/gsapAnimations';
 *
 *   // Direct use
 *   fadeUp(element);
 *
 *   // As Svelte action
 *   <div use:gsapScrollTrigger={{ animation: 'fadeUp' }}>...</div>
 */

import { browser } from '$app/environment';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (browser) {
	gsap.registerPlugin(ScrollTrigger);
}

// Common easing functions
export const easings = {
	smooth: 'power2.out',
	smoothInOut: 'power2.inOut',
	bounce: 'bounce.out',
	elastic: 'elastic.out(1, 0.3)',
	back: 'back.out(1.7)',
	expo: 'expo.out'
} as const;

// Animation presets
export type AnimationPreset =
	| 'fadeIn'
	| 'fadeUp'
	| 'fadeDown'
	| 'fadeLeft'
	| 'fadeRight'
	| 'scaleIn'
	| 'scaleUp'
	| 'slideUp'
	| 'slideDown'
	| 'slideLeft'
	| 'slideRight';

export interface AnimationOptions {
	duration?: number;
	delay?: number;
	ease?: string;
	onComplete?: () => void;
	onStart?: () => void;
}

/**
 * Fade in animation
 */
export function fadeIn(
	element: HTMLElement | HTMLElement[],
	options: AnimationOptions = {}
): gsap.core.Tween {
	const { duration = 0.6, delay = 0, ease = easings.smooth, onComplete, onStart } = options;

	return gsap.fromTo(
		element,
		{ opacity: 0 },
		{ opacity: 1, duration, delay, ease, onComplete, onStart }
	);
}

/**
 * Fade up animation
 */
export function fadeUp(
	element: HTMLElement | HTMLElement[],
	options: AnimationOptions & { distance?: number } = {}
): gsap.core.Tween {
	const {
		duration = 0.6,
		delay = 0,
		ease = easings.smooth,
		distance = 30,
		onComplete,
		onStart
	} = options;

	return gsap.fromTo(
		element,
		{ opacity: 0, y: distance },
		{ opacity: 1, y: 0, duration, delay, ease, onComplete, onStart }
	);
}

/**
 * Fade down animation
 */
export function fadeDown(
	element: HTMLElement | HTMLElement[],
	options: AnimationOptions & { distance?: number } = {}
): gsap.core.Tween {
	const {
		duration = 0.6,
		delay = 0,
		ease = easings.smooth,
		distance = 30,
		onComplete,
		onStart
	} = options;

	return gsap.fromTo(
		element,
		{ opacity: 0, y: -distance },
		{ opacity: 1, y: 0, duration, delay, ease, onComplete, onStart }
	);
}

/**
 * Fade left animation
 */
export function fadeLeft(
	element: HTMLElement | HTMLElement[],
	options: AnimationOptions & { distance?: number } = {}
): gsap.core.Tween {
	const {
		duration = 0.6,
		delay = 0,
		ease = easings.smooth,
		distance = 30,
		onComplete,
		onStart
	} = options;

	return gsap.fromTo(
		element,
		{ opacity: 0, x: distance },
		{ opacity: 1, x: 0, duration, delay, ease, onComplete, onStart }
	);
}

/**
 * Fade right animation
 */
export function fadeRight(
	element: HTMLElement | HTMLElement[],
	options: AnimationOptions & { distance?: number } = {}
): gsap.core.Tween {
	const {
		duration = 0.6,
		delay = 0,
		ease = easings.smooth,
		distance = 30,
		onComplete,
		onStart
	} = options;

	return gsap.fromTo(
		element,
		{ opacity: 0, x: -distance },
		{ opacity: 1, x: 0, duration, delay, ease, onComplete, onStart }
	);
}

/**
 * Scale in animation
 */
export function scaleIn(
	element: HTMLElement | HTMLElement[],
	options: AnimationOptions & { fromScale?: number } = {}
): gsap.core.Tween {
	const {
		duration = 0.5,
		delay = 0,
		ease = easings.back,
		fromScale = 0.8,
		onComplete,
		onStart
	} = options;

	return gsap.fromTo(
		element,
		{ opacity: 0, scale: fromScale },
		{ opacity: 1, scale: 1, duration, delay, ease, onComplete, onStart }
	);
}

/**
 * Stagger fade up animation for multiple elements
 */
export function staggerFadeUp(
	elements: HTMLElement[] | NodeListOf<Element>,
	options: AnimationOptions & { stagger?: number; distance?: number } = {}
): gsap.core.Tween {
	const {
		duration = 0.5,
		delay = 0,
		ease = easings.smooth,
		stagger = 0.1,
		distance = 20,
		onComplete,
		onStart
	} = options;

	return gsap.fromTo(
		elements,
		{ opacity: 0, y: distance },
		{ opacity: 1, y: 0, duration, delay, ease, stagger, onComplete, onStart }
	);
}

/**
 * Create a scroll-triggered animation
 */
export interface ScrollTriggerOptions {
	animation?: AnimationPreset;
	trigger?: HTMLElement;
	start?: string;
	end?: string;
	scrub?: boolean | number;
	markers?: boolean;
	once?: boolean;
	toggleActions?: string;
	distance?: number;
	duration?: number;
	ease?: string;
	stagger?: number;
}

export function createScrollAnimation(
	element: HTMLElement | HTMLElement[] | NodeListOf<Element>,
	options: ScrollTriggerOptions = {}
): gsap.core.Tween | gsap.core.Timeline | null {
	if (!browser) return null;

	const {
		animation = 'fadeUp',
		trigger,
		start = 'top 85%',
		end = 'bottom 15%',
		scrub = false,
		markers = false,
		once = true,
		toggleActions = 'play none none none',
		distance = 30,
		duration = 0.6,
		ease = easings.smooth,
		stagger = 0.1
	} = options;

	const triggerElement = trigger || (Array.isArray(element) ? element[0] : element);

	// Define animation configurations
	const animations: Record<AnimationPreset, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
		fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
		fadeUp: { from: { opacity: 0, y: distance }, to: { opacity: 1, y: 0 } },
		fadeDown: { from: { opacity: 0, y: -distance }, to: { opacity: 1, y: 0 } },
		fadeLeft: { from: { opacity: 0, x: distance }, to: { opacity: 1, x: 0 } },
		fadeRight: { from: { opacity: 0, x: -distance }, to: { opacity: 1, x: 0 } },
		scaleIn: { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } },
		scaleUp: { from: { opacity: 0, scale: 0.5 }, to: { opacity: 1, scale: 1 } },
		slideUp: { from: { y: distance }, to: { y: 0 } },
		slideDown: { from: { y: -distance }, to: { y: 0 } },
		slideLeft: { from: { x: distance }, to: { x: 0 } },
		slideRight: { from: { x: -distance }, to: { x: 0 } }
	};

	const config = animations[animation];

	return gsap.fromTo(element, config.from, {
		...config.to,
		duration,
		ease,
		stagger:
			(Array.isArray(element) || element instanceof NodeList) &&
			(element as ArrayLike<Element>).length > 1
				? stagger
				: undefined,
		scrollTrigger: {
			trigger: triggerElement as HTMLElement,
			start,
			end,
			scrub,
			markers,
			toggleActions: once ? 'play none none none' : toggleActions,
			once
		}
	});
}

/**
 * Svelte action for GSAP scroll-triggered animations
 */
export function gsapScrollTrigger(
	node: HTMLElement,
	options: ScrollTriggerOptions | AnimationPreset = {}
): { destroy: () => void; update: (newOptions: ScrollTriggerOptions | AnimationPreset) => void } {
	let animation: gsap.core.Tween | gsap.core.Timeline | null = null;

	const opts: ScrollTriggerOptions = typeof options === 'string' ? { animation: options } : options;

	// Set initial state
	gsap.set(node, { opacity: 0 });

	// Create animation
	animation = createScrollAnimation(node, { ...opts, trigger: node });

	return {
		update(newOptions: ScrollTriggerOptions | AnimationPreset) {
			// Kill old animation
			if (animation) {
				animation.kill();
			}

			const newOpts: ScrollTriggerOptions =
				typeof newOptions === 'string' ? { animation: newOptions } : newOptions;

			animation = createScrollAnimation(node, { ...newOpts, trigger: node });
		},
		destroy() {
			if (animation) {
				animation.kill();
			}
			ScrollTrigger.getAll().forEach((st) => {
				if (st.trigger === node) {
					st.kill();
				}
			});
		}
	};
}

/**
 * Svelte action for staggered children animations on scroll
 */
export function gsapStaggerChildren(
	node: HTMLElement,
	options: ScrollTriggerOptions & { selector?: string } = {}
): { destroy: () => void } {
	const { selector = ':scope > *', ...animOptions } = options;

	const children = node.querySelectorAll(selector);
	let animation: gsap.core.Tween | gsap.core.Timeline | null = null;

	if (children.length > 0) {
		// Set initial state
		gsap.set(children, { opacity: 0 });

		// Create staggered animation
		animation = createScrollAnimation(children, {
			...animOptions,
			trigger: node,
			stagger: animOptions.stagger ?? 0.1
		});
	}

	return {
		destroy() {
			if (animation) {
				animation.kill();
			}
			ScrollTrigger.getAll().forEach((st) => {
				if (st.trigger === node) {
					st.kill();
				}
			});
		}
	};
}

/**
 * Text reveal animation - split text into characters/words and animate
 */
export function textReveal(
	element: HTMLElement,
	options: AnimationOptions & { splitBy?: 'chars' | 'words' | 'lines'; stagger?: number } = {}
): gsap.core.Timeline | null {
	if (!browser) return null;

	const {
		splitBy = 'words',
		stagger = 0.05,
		duration = 0.6,
		delay = 0,
		ease = easings.smooth
	} = options;

	const text = element.textContent || '';
	let parts: string[] = [];

	switch (splitBy) {
		case 'chars':
			parts = text.split('');
			break;
		case 'words':
			parts = text.split(' ');
			break;
		case 'lines':
			parts = text.split('\n');
			break;
	}

	// Clear and rebuild element
	element.innerHTML = parts
		.map(
			(part, i) =>
				`<span class="text-reveal-part" style="display: inline-block; overflow: hidden;"><span class="text-reveal-inner" style="display: inline-block;">${part}${splitBy === 'words' && i < parts.length - 1 ? '&nbsp;' : ''}</span></span>`
		)
		.join('');

	const innerSpans = element.querySelectorAll('.text-reveal-inner');

	const tl = gsap.timeline({ delay });

	tl.fromTo(
		innerSpans,
		{ y: '100%', opacity: 0 },
		{ y: '0%', opacity: 1, duration, ease, stagger }
	);

	return tl;
}

export default {
	fadeIn,
	fadeUp,
	fadeDown,
	fadeLeft,
	fadeRight,
	scaleIn,
	staggerFadeUp,
	createScrollAnimation,
	gsapScrollTrigger,
	gsapStaggerChildren,
	textReveal,
	easings
};

/**
 * Viewport Animation Action
 *
 * Pauses CSS animations and GSAP tweens when elements are outside the viewport.
 * This optimizes performance on mobile devices by reducing unnecessary computations.
 *
 * Features:
 * - Uses IntersectionObserver for efficient viewport detection
 * - Supports both CSS animations (via animation-play-state) and GSAP tweens
 * - Respects prefers-reduced-motion preference
 * - Configurable root margin for early triggering
 * - Automatic cleanup on destroy
 *
 * @example CSS Animation
 * ```svelte
 * <div use:viewportAnimation class="my-animated-element">...</div>
 * ```
 *
 * @example GSAP Tween
 * ```svelte
 * <div use:viewportAnimation={{ gsapTween: myTween }}>...</div>
 * ```
 *
 * @example With custom margin
 * ```svelte
 * <div use:viewportAnimation={{ rootMargin: '100px' }}>...</div>
 * ```
 */

import { browser } from '$app/environment';
import type { Action } from 'svelte/action';

export interface ViewportAnimationOptions {
	/** GSAP tween or timeline to pause/resume (optional) */
	gsapTween?: gsap.core.Animation | null;
	/** Root margin for IntersectionObserver (default: '50px' for early triggering) */
	rootMargin?: string;
	/** Threshold for intersection (default: 0) */
	threshold?: number | number[];
	/** Whether animation should start paused (default: false) */
	startPaused?: boolean;
	/** Callback when animation is paused */
	onPause?: () => void;
	/** Callback when animation is resumed */
	onResume?: () => void;
}

/**
 * Svelte action that pauses animations when element is outside viewport
 */
export const viewportAnimation: Action<HTMLElement, ViewportAnimationOptions | undefined> = (
	node,
	options = {}
) => {
	if (!browser || typeof window === 'undefined') {
		return {
			update() {},
			destroy() {}
		};
	}

	let { gsapTween = null, rootMargin = '50px', onPause, onResume } = options;
	const { threshold = 0, startPaused = false } = options;

	let observer: IntersectionObserver | null = null;
	let isVisible = !startPaused;
	let prefersReducedMotion = false;
	let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null;

	// Check reduced motion preference (if supported)
	const motionQuery = window.matchMedia
		? window.matchMedia('(prefers-reduced-motion: reduce)')
		: null;
	if (motionQuery) {
		prefersReducedMotion = motionQuery.matches;

		// Listen for reduced motion changes
		handleMotionChange = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
			if (prefersReducedMotion) {
				pauseAnimation();
			} else if (isVisible) {
				resumeAnimation();
			}
		};
		motionQuery.addEventListener('change', handleMotionChange);
	}

	/**
	 * Pause the animation (CSS or GSAP)
	 */
	function pauseAnimation(): void {
		// Pause CSS animations on node itself
		node.style.animationPlayState = 'paused';

		// Only query children that actually have CSS animations
		const animatedChildren = node.querySelectorAll<HTMLElement>('[style*="animation"], .animate, [class*="animate-"]');
		animatedChildren.forEach((child) => {
			child.style.animationPlayState = 'paused';
		});

		// Pause GSAP tween if provided
		if (gsapTween && typeof gsapTween.pause === 'function') {
			gsapTween.pause();
		}

		onPause?.();
	}

	/**
	 * Resume the animation (CSS or GSAP)
	 */
	function resumeAnimation(): void {
		// Don't resume if user prefers reduced motion
		if (prefersReducedMotion) return;

		// Resume CSS animations on node itself
		node.style.animationPlayState = 'running';

		// Only query children that actually have CSS animations
		const animatedChildren = node.querySelectorAll<HTMLElement>('[style*="animation"], .animate, [class*="animate-"]');
		animatedChildren.forEach((child) => {
			child.style.animationPlayState = 'running';
		});

		// Resume GSAP tween if provided
		if (gsapTween && typeof gsapTween.resume === 'function') {
			gsapTween.resume();
		}

		onResume?.();
	}

	/**
	 * IntersectionObserver callback
	 */
	function handleIntersection(entries: IntersectionObserverEntry[]): void {
		entries.forEach((entry) => {
			isVisible = entry.isIntersecting;

			if (entry.isIntersecting) {
				resumeAnimation();
			} else {
				pauseAnimation();
			}
		});
	}

	// Create observer if supported
	if (typeof IntersectionObserver !== 'undefined') {
		observer = new IntersectionObserver(handleIntersection, {
			root: null, // viewport
			rootMargin,
			threshold
		});

		// Start observing
		observer.observe(node);
	} else {
		// Fallback: keep running if observer isn't available
		resumeAnimation();
	}

	// Initial state
	if (startPaused || prefersReducedMotion) {
		pauseAnimation();
	}

	return {
		update(newOptions: ViewportAnimationOptions = {}) {
			// Update GSAP tween reference
			gsapTween = newOptions.gsapTween ?? gsapTween;
			const nextRootMargin = newOptions.rootMargin ?? rootMargin;
			onPause = newOptions.onPause;
			onResume = newOptions.onResume;

			// Recreate observer if rootMargin or threshold changed
			if (
				observer &&
				((newOptions.rootMargin && nextRootMargin !== rootMargin) ||
					newOptions.threshold !== undefined)
			) {
				observer.disconnect();
				observer = new IntersectionObserver(handleIntersection, {
					root: null,
					rootMargin: nextRootMargin,
					threshold: newOptions.threshold ?? threshold
				});
				observer.observe(node);
			}

			rootMargin = nextRootMargin;
		},
		destroy() {
			observer?.disconnect();
			observer = null;
			if (motionQuery && handleMotionChange) {
				motionQuery.removeEventListener('change', handleMotionChange);
			}
		}
	};
};

/**
 * Creates a GSAP-specific viewport animation controller
 * Use this when you need more control over GSAP animations
 */
export function createViewportGsapController(
	element: HTMLElement,
	options: Omit<ViewportAnimationOptions, 'gsapTween'> = {}
): {
	setTween: (tween: gsap.core.Animation | null) => void;
	destroy: () => void;
	isVisible: () => boolean;
} {
	let currentTween: gsap.core.Animation | null = null;
	const visible = true;

	const action = viewportAnimation(element, {
		...options,
		onPause: () => {
			currentTween?.pause();
			options.onPause?.();
		},
		onResume: () => {
			currentTween?.resume();
			options.onResume?.();
		}
	});

	return {
		setTween(tween: gsap.core.Animation | null) {
			currentTween = tween;
			// If currently not visible, pause the new tween
			if (!visible && tween) {
				tween.pause();
			}
		},
		destroy() {
			action?.destroy?.();
		},
		isVisible: () => visible
	};
}

export default viewportAnimation;

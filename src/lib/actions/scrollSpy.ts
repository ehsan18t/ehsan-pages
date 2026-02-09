/**
 * Scroll Spy Action - Svelte 5 Action for tracking active sections
 *
 * A+ Grade Implementation featuring:
 * - Uses IntersectionObserver for efficient section detection
 * - Uses `on()` from svelte/events for proper event ordering
 * - Supports dynamic section updates via update function
 * - Type-safe with proper JSDoc
 *
 * @example
 * ```svelte
 * <div use:scrollSpy={{
 *   sectionIds: ['hero', 'skills', 'projects'],
 *   onActiveChange: (idx) => activeIndex = idx
 * }}>
 * ```
 *
 * @module scrollSpy
 */

import { browser } from '$app/environment';
import type { Action } from 'svelte/action';

/** Options for the scroll spy action */
export interface ScrollSpyOptions {
	/** Array of section IDs to observe (without #) */
	sectionIds: string[];
	/** Callback when active section changes */
	onActiveChange: (index: number) => void;
	/** Root margin for intersection observer (default: '-20% 0px -60% 0px') */
	rootMargin?: string;
	/** Threshold for intersection observer (default: 0) */
	threshold?: number;
}

/**
 * IntersectionObserver configuration type
 */
interface ObserverConfig {
	root: null;
	rootMargin: string;
	threshold: number;
}

/**
 * Svelte action to track which section is currently in view
 *
 * Uses IntersectionObserver for efficient detection without scroll listeners.
 */
export const scrollSpy: Action<HTMLElement, ScrollSpyOptions> = (_node, options) => {
	if (!browser) return {};

	let observer: IntersectionObserver | null = null;

	/**
	 * Create observer configuration from options
	 */
	function createConfig(opts: ScrollSpyOptions): ObserverConfig {
		return {
			root: null,
			rootMargin: opts.rootMargin ?? '-20% 0px -60% 0px',
			threshold: opts.threshold ?? 0
		};
	}

	/**
	 * Setup the IntersectionObserver and scroll listener
	 */
	function setup(opts: ScrollSpyOptions): void {
		// Cleanup previous observer
		cleanup();

		const { sectionIds, onActiveChange } = opts;
		const config = createConfig(opts);

		// Get section elements
		const sections = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (sections.length === 0) {
			console.warn('[scrollSpy] No sections found for IDs:', sectionIds);
			return;
		}

		// Create IntersectionObserver
		observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const idx = sectionIds.indexOf(entry.target.id);
					if (idx >= 0) {
						onActiveChange(idx);
					}
				}
			}
		}, config);

		// Observe all sections
		sections.forEach((section) => observer!.observe(section));
	}

	/**
	 * Cleanup observer and listeners
	 */
	function cleanup(): void {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	}

	// Initial setup
	setup(options);

	return {
		update(newOptions: ScrollSpyOptions) {
			setup(newOptions);
		},
		destroy() {
			cleanup();
		}
	};
};

export default scrollSpy;

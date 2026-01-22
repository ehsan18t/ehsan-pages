/**
 * Scroll Spy Action - Svelte action to track active section via IntersectionObserver
 *
 * Usage:
 *   <div use:scrollSpy={{ sectionIds: ['hero', 'skills'], onActiveChange: (idx) => activeIndex = idx }}>
 */

import { browser } from '$app/environment';

export interface ScrollSpyOptions {
	/** Array of section IDs to observe (without #) */
	sectionIds: string[];
	/** Callback when active section changes */
	onActiveChange: (index: number) => void;
	/** Root margin for intersection observer */
	rootMargin?: string;
	/** Threshold for intersection observer */
	threshold?: number;
}

export function scrollSpy(
	_node: HTMLElement,
	options: ScrollSpyOptions
): { update: (opts: ScrollSpyOptions) => void; destroy: () => void } {
	if (!browser) return { update: () => {}, destroy: () => {} };

	let observer: IntersectionObserver | null = null;
	let currentOptions = options;

	function setup(opts: ScrollSpyOptions) {
		// Cleanup previous observer
		if (observer) {
			observer.disconnect();
		}

		const { sectionIds, onActiveChange, rootMargin = '-20% 0px -60% 0px', threshold = 0 } = opts;

		// Get section elements
		const sections = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (sections.length === 0) return;

		// Create observer
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const idx = sectionIds.indexOf(entry.target.id);
						if (idx >= 0) {
							onActiveChange(idx);
						}
					}
				}
			},
			{ root: null, rootMargin, threshold }
		);

		// Observe all sections
		sections.forEach((section) => observer!.observe(section));
	}

	setup(options);

	return {
		update(newOptions: ScrollSpyOptions) {
			currentOptions = newOptions;
			setup(currentOptions);
		},
		destroy() {
			if (observer) {
				observer.disconnect();
				observer = null;
			}
		}
	};
}

export default scrollSpy;

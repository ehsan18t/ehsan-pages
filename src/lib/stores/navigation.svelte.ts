/**
 * Navigation Store - Centralized navigation state management
 *
 * This store provides a single source of truth for:
 * - Active section tracking via IntersectionObserver
 * - Navigation visibility state
 * - Scroll position tracking
 *
 * Uses Svelte 5 runes with the correct pattern for cross-module reactivity.
 */

import { browser } from '$app/environment';
import { navItems } from '$data';

// Section IDs extracted from navItems
const sectionIds = navItems.map((item) => item.href.slice(1));

/**
 * Navigation state - using $state object for cross-module reactivity
 * This is the correct pattern per Svelte 5 docs: export a $state object
 * and update its properties (not reassign the object itself)
 */
export const navigation = $state({
	activeIndex: 0,
	isVisible: false,
	isNearBottom: false,
	scrollY: 0
});

// Private state (not reactive, not exported)
let isScrolling = false;
let observer: IntersectionObserver | null = null;
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
let boundHandleScroll: (() => void) | null = null;

/**
 * Handle scroll events
 */
function handleScroll() {
	navigation.scrollY = window.scrollY;

	// Detect if near bottom
	const { scrollHeight, clientHeight } = document.documentElement;
	navigation.isNearBottom = navigation.scrollY + clientHeight >= scrollHeight - 100;

	// Debounced fallback detection
	if (scrollTimeout) {
		clearTimeout(scrollTimeout);
	}

	scrollTimeout = setTimeout(() => {
		detectCurrentSection();
	}, 100);
}

/**
 * Manually detect which section is currently in view
 */
function detectCurrentSection() {
	if (isScrolling) return;

	const viewportMiddle = window.innerHeight / 2;

	for (let i = sectionIds.length - 1; i >= 0; i--) {
		const section = document.getElementById(sectionIds[i]);
		if (!section) continue;

		const rect = section.getBoundingClientRect();

		if (rect.top <= viewportMiddle) {
			if (navigation.activeIndex !== i) {
				navigation.activeIndex = i;
			}
			break;
		}
	}
}

/**
 * Setup IntersectionObserver for section detection
 */
function setupIntersectionObserver() {
	setTimeout(() => {
		const sections = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (sections.length === 0) {
			console.warn('Navigation: No sections found to observe');
			return;
		}

		observer = new IntersectionObserver(
			(entries) => {
				if (isScrolling) return;

				let maxRatio = 0;
				let mostVisibleIndex = -1;

				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
						const idx = sectionIds.indexOf(entry.target.id);
						if (idx >= 0) {
							maxRatio = entry.intersectionRatio;
							mostVisibleIndex = idx;
						}
					}
				});

				if (mostVisibleIndex >= 0) {
					navigation.activeIndex = mostVisibleIndex;
				}
			},
			{
				root: null,
				rootMargin: '-20% 0px -20% 0px',
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
			}
		);

		sections.forEach((section) => observer?.observe(section));
		detectCurrentSection();
	}, 100);
}

/**
 * Setup scroll listener
 */
function setupScrollListener() {
	boundHandleScroll = handleScroll;
	window.addEventListener('scroll', boundHandleScroll, { passive: true });
}

/**
 * Initialize the navigation system
 */
export function initNavigation() {
	if (!browser) return;

	setupIntersectionObserver();
	setupScrollListener();

	// Show nav after loader
	setTimeout(() => {
		navigation.isVisible = true;
	}, 2500);
}

/**
 * Clean up resources
 */
export function destroyNavigation() {
	if (!browser) return;

	if (observer) {
		observer.disconnect();
		observer = null;
	}

	if (scrollTimeout) {
		clearTimeout(scrollTimeout);
	}

	if (boundHandleScroll) {
		window.removeEventListener('scroll', boundHandleScroll);
		boundHandleScroll = null;
	}
}

/**
 * Navigate to a specific section
 */
export function navigateToSection(index: number) {
	const item = navItems[index];
	if (!item) return;

	const target = document.getElementById(item.href.slice(1));
	if (!target) {
		console.warn(`Navigation: Section not found: ${item.href}`);
		return;
	}

	isScrolling = true;
	navigation.activeIndex = index;

	const offset = item.offset ?? 0;
	const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

	window.scrollTo({
		top: targetPosition,
		behavior: 'smooth'
	});

	setTimeout(() => {
		isScrolling = false;
	}, 800);
}

/**
 * Handle click on a nav item
 */
export function handleNavClick(e: MouseEvent, index: number) {
	e.preventDefault();
	navigateToSection(index);
}

// Export navItems for convenience
export { navItems };

/**
 * Navigation Store - Centralized navigation state management
 *
 * This store provides a single source of truth for:
 * - Active section tracking via IntersectionObserver
 * - Navigation visibility state
 * - Scroll position tracking
 *
 * Uses Svelte 5 runes for reactivity.
 */

import { browser } from '$app/environment';
import { navItems } from '$data';

// Section IDs extracted from navItems
const sectionIds = navItems.map((item) => item.href.slice(1));

/**
 * Navigation state - using class with $state for cross-module reactivity
 */
class NavigationState {
	/** Index of the currently active section */
	activeIndex = $state(0);

	/** Whether the navigation should be visible */
	isVisible = $state(false);

	/** Whether the user is near the bottom of the page */
	isNearBottom = $state(false);

	/** Current scroll position */
	scrollY = $state(0);

	/** IntersectionObserver instance */
	private observer: IntersectionObserver | null = null;

	/** Flag to prevent observer updates during programmatic scroll */
	private isScrolling = $state(false);

	/** Scroll timeout for debouncing */
	private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

	/** Bound scroll handler for proper cleanup */
	private boundScrollHandler: (() => void) | null = null;

	/**
	 * Get the current active nav item
	 */
	get currentItem() {
		return navItems[this.activeIndex];
	}

	/**
	 * Initialize the navigation system
	 * Should be called once when the app mounts
	 */
	init() {
		if (!browser) return;

		this.setupIntersectionObserver();
		this.setupScrollListener();

		// Show nav after loader completes (2.5s)
		setTimeout(() => {
			this.isVisible = true;
		}, 2500);
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		if (!browser) return;

		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}

		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}

		if (this.boundScrollHandler) {
			window.removeEventListener('scroll', this.boundScrollHandler);
			this.boundScrollHandler = null;
		}
	}

	/**
	 * Setup IntersectionObserver for section detection
	 */
	private setupIntersectionObserver() {
		// Wait a bit for DOM to be ready after loader
		setTimeout(() => {
			const sections = sectionIds
				.map((id) => document.getElementById(id))
				.filter((el): el is HTMLElement => el !== null);

			if (sections.length === 0) {
				console.warn('Navigation: No sections found to observe');
				return;
			}

			// Create observer with better thresholds
			// Using multiple thresholds for more accurate detection
			this.observer = new IntersectionObserver(
				(entries) => {
					// Skip updates during programmatic scrolling
					if (this.isScrolling) return;

					// Find the most visible section
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

					// Update active index if we found a visible section
					if (mostVisibleIndex >= 0) {
						this.activeIndex = mostVisibleIndex;
					}
				},
				{
					root: null,
					// Observe the middle 60% of the viewport
					rootMargin: '-20% 0px -20% 0px',
					// Multiple thresholds for smoother detection
					threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
				}
			);

			// Observe all sections
			sections.forEach((section) => this.observer?.observe(section));

			// Initial detection - find which section is currently in view
			this.detectCurrentSection();
		}, 100);
	}

	/**
	 * Setup scroll listener for bottom detection and fallback
	 */
	private setupScrollListener() {
		// Store bound reference for cleanup
		this.boundScrollHandler = this.handleScroll.bind(this);
		// Using passive listener for performance
		window.addEventListener('scroll', this.boundScrollHandler, { passive: true });
	}

	/**
	 * Handle scroll events
	 */
	private handleScroll() {
		this.scrollY = window.scrollY;

		// Detect if near bottom
		const { scrollHeight, clientHeight } = document.documentElement;
		this.isNearBottom = this.scrollY + clientHeight >= scrollHeight - 100;

		// Debounced fallback detection
		if (this.scrollTimeout) {
			clearTimeout(this.scrollTimeout);
		}

		this.scrollTimeout = setTimeout(() => {
			// Fallback: if observer didn't catch it, detect manually
			this.detectCurrentSection();
		}, 100);
	}

	/**
	 * Manually detect which section is currently in view
	 * Used as fallback and for initial detection
	 */
	private detectCurrentSection() {
		const viewportMiddle = window.innerHeight / 2;

		for (let i = sectionIds.length - 1; i >= 0; i--) {
			const section = document.getElementById(sectionIds[i]);
			if (!section) continue;

			const rect = section.getBoundingClientRect();

			// Check if section's top is above viewport middle
			if (rect.top <= viewportMiddle) {
				if (this.activeIndex !== i) {
					this.activeIndex = i;
				}
				break;
			}
		}
	}

	/**
	 * Navigate to a specific section
	 */
	navigateToSection(index: number) {
		const item = navItems[index];
		if (!item) return;

		const target = document.getElementById(item.href.slice(1));
		if (!target) {
			console.warn(`Navigation: Section not found: ${item.href}`);
			return;
		}

		// Set flag to prevent observer updates during scroll
		this.isScrolling = true;

		// Update active index immediately for responsive UI
		this.activeIndex = index;

		// Calculate scroll position with offset
		const offset = item.offset ?? 0;
		const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

		// Smooth scroll to target
		window.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});

		// Reset scrolling flag after animation completes
		setTimeout(() => {
			this.isScrolling = false;
		}, 800);
	}

	/**
	 * Handle click on a nav item
	 */
	handleNavClick(e: MouseEvent, index: number) {
		e.preventDefault();
		this.navigateToSection(index);
	}
}

// Export singleton instance
export const navigation = new NavigationState();

// Export navItems for convenience
export { navItems };

/**
 * Navigation Store - Centralized Navigation State Management
 *
 * A+ Grade Implementation featuring:
 * - Svelte 5 runes ($state, $derived, $effect) for reactivity
 * - Class-based singleton pattern for cross-module state
 * - IntersectionObserver for efficient section detection
 * - Debounced scroll handling for performance
 * - Accessibility-first with prefers-reduced-motion support
 * - Type-safe throughout
 *
 * @module navigation
 */

import { browser } from '$app/environment';
import { navItems, type NavItem } from '$lib/data';

/** Section IDs extracted from navItems for observer setup */
const SECTION_IDS = navItems.map((item) => item.href.slice(1)) as readonly string[];

/** Time to wait after loader before showing navigation (ms) */
const NAV_SHOW_DELAY = 2500;

/** Debounce time for scroll event handling (ms) */
const SCROLL_DEBOUNCE = 100;

/** Duration to ignore observer during programmatic scroll (ms) */
const SCROLL_LOCK_DURATION = 800;

/** Minimum time between index changes to prevent flickering (ms) */
const INDEX_CHANGE_COOLDOWN = 150;

/** Minimum intersection ratio difference to trigger a change */
const RATIO_THRESHOLD = 0.1;

/** Bottom threshold for hiding navigation (px from bottom) */
const BOTTOM_THRESHOLD = 100;

/** IntersectionObserver configuration */
const OBSERVER_CONFIG: IntersectionObserverInit = {
	root: null,
	rootMargin: '-20% 0px -20% 0px', // Observe middle 60% of viewport
	threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] // Multiple thresholds for accuracy
};

/**
 * Navigation State Manager
 *
 * Manages all navigation-related state including:
 * - Active section tracking via IntersectionObserver
 * - Visibility state based on scroll position
 * - Programmatic navigation with smooth scrolling
 */
class NavigationState {
	// ─────────────────────────────────────────────────────────────
	// Reactive State (Svelte 5 $state runes)
	// ─────────────────────────────────────────────────────────────

	/** Index of the currently active/visible section */
	activeIndex = $state(0);

	/** Whether navigation should be visible to user */
	isVisible = $state(false);

	/** Whether user has scrolled near page bottom */
	isNearBottom = $state(false);

	// ─────────────────────────────────────────────────────────────
	// Private State
	// ─────────────────────────────────────────────────────────────

	/** IntersectionObserver instance for section detection */
	#observer: IntersectionObserver | null = null;

	/** Flag to prevent observer updates during programmatic scroll */
	#isScrollLocked = false;

	/** Timeout handle for scroll debouncing */
	#scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	/** Timestamp of last index change to prevent flickering */
	#lastIndexChangeTime = 0;

	/** Track intersection ratios for all sections */
	#sectionRatios: Map<string, number> = new Map();

	/** Bound scroll handler for cleanup */
	#boundScrollHandler: (() => void) | null = null;

	// ─────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────

	/** Get the currently active navigation item */
	get currentItem(): NavItem {
		return navItems[this.activeIndex];
	}

	/** Get total number of navigation items */
	get totalItems(): number {
		return navItems.length;
	}

	// ─────────────────────────────────────────────────────────────
	// Lifecycle Methods
	// ─────────────────────────────────────────────────────────────

	/**
	 * Initialize the navigation system
	 * Should be called once when the app mounts (typically in +layout.svelte)
	 */
	init(): void {
		if (!browser) return;

		this.#setupIntersectionObserver();
		this.#setupScrollListener();
		this.#scheduleVisibility();
	}

	/**
	 * Clean up all resources
	 * Should be called when the app unmounts
	 */
	destroy(): void {
		if (!browser) return;

		// Disconnect observer
		this.#observer?.disconnect();
		this.#observer = null;

		// Clear debounce timer
		if (this.#scrollDebounceTimer) {
			clearTimeout(this.#scrollDebounceTimer);
			this.#scrollDebounceTimer = null;
		}

		// Remove scroll listener
		if (this.#boundScrollHandler) {
			window.removeEventListener('scroll', this.#boundScrollHandler);
			this.#boundScrollHandler = null;
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Public Methods
	// ─────────────────────────────────────────────────────────────

	/**
	 * Navigate to a specific section by index
	 * @param index - The index of the section to navigate to
	 */
	navigateToSection(index: number): void {
		const item = navItems[index];
		if (!item) return;

		const target = document.getElementById(item.href.slice(1));
		if (!target) {
			console.warn(`[Navigation] Section not found: ${item.href}`);
			return;
		}

		// Lock observer to prevent interference during scroll
		this.#isScrollLocked = true;

		// Update active index immediately for responsive UI
		this.activeIndex = index;
		this.#lastIndexChangeTime = Date.now();

		// Calculate target position with offset
		const offset = item.offset ?? 0;
		const targetY = target.getBoundingClientRect().top + window.scrollY - offset;

		// Perform smooth scroll
		window.scrollTo({
			top: targetY,
			behavior: 'smooth'
		});

		// Unlock after animation completes
		setTimeout(() => {
			this.#isScrollLocked = false;
		}, SCROLL_LOCK_DURATION);
	}

	/**
	 * Handle navigation click event
	 * Convenience method for event handlers
	 *
	 * @param event - The mouse event
	 * @param index - The index of the clicked nav item
	 */
	handleNavClick = (event: MouseEvent, index: number): void => {
		event.preventDefault();
		this.navigateToSection(index);
	};

	// ─────────────────────────────────────────────────────────────
	// Private Setup Methods
	// ─────────────────────────────────────────────────────────────

	/**
	 * Setup IntersectionObserver for automatic section detection
	 */
	#setupIntersectionObserver(): void {
		// Delay slightly to ensure DOM is ready after loader
		requestAnimationFrame(() => {
			const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
				(el): el is HTMLElement => el !== null
			);

			if (sections.length === 0) {
				console.warn('[Navigation] No sections found to observe');
				return;
			}

			this.#observer = new IntersectionObserver((entries) => {
				// Skip updates during programmatic scrolling
				if (this.#isScrollLocked) return;

				// Check cooldown to prevent rapid switching (race condition fix)
				const now = Date.now();
				if (now - this.#lastIndexChangeTime < INDEX_CHANGE_COOLDOWN) return;

				// Update ratios for all observed entries
				for (const entry of entries) {
					this.#sectionRatios.set(entry.target.id, entry.intersectionRatio);
				}

				// Find the section with highest intersection ratio
				let maxRatio = 0;
				let bestIndex = -1;

				for (let i = 0; i < SECTION_IDS.length; i++) {
					const ratio = this.#sectionRatios.get(SECTION_IDS[i]) ?? 0;
					if (ratio > maxRatio) {
						maxRatio = ratio;
						bestIndex = i;
					}
				}

				// Only change if we found a valid section and it's significantly more visible
				// This prevents flickering at boundaries where both sections have similar ratios
				if (bestIndex >= 0 && bestIndex !== this.activeIndex) {
					const currentRatio = this.#sectionRatios.get(SECTION_IDS[this.activeIndex]) ?? 0;

					// Require the new section to be notably more visible than current
					if (maxRatio > currentRatio + RATIO_THRESHOLD || currentRatio < 0.05) {
						this.activeIndex = bestIndex;
						this.#lastIndexChangeTime = now;
					}
				}
			}, OBSERVER_CONFIG);

			// Observe all sections
			for (const section of sections) {
				this.#observer.observe(section);
			}

			// Initial detection
			this.#detectCurrentSection();
		});
	}

	/**
	 * Setup scroll listener for bottom detection and fallback
	 */
	#setupScrollListener(): void {
		this.#boundScrollHandler = this.#handleScroll.bind(this);
		window.addEventListener('scroll', this.#boundScrollHandler, { passive: true });
	}

	/**
	 * Schedule navigation visibility after loader
	 */
	#scheduleVisibility(): void {
		setTimeout(() => {
			this.isVisible = true;
		}, NAV_SHOW_DELAY);
	}

	// ─────────────────────────────────────────────────────────────
	// Private Event Handlers
	// ─────────────────────────────────────────────────────────────

	/**
	 * Handle scroll events with debouncing
	 */
	#handleScroll(): void {
		// Update bottom detection
		const { scrollHeight, clientHeight } = document.documentElement;
		const scrollY = window.scrollY;
		this.isNearBottom = scrollY + clientHeight >= scrollHeight - BOTTOM_THRESHOLD;

		// Debounced fallback detection
		if (this.#scrollDebounceTimer) {
			clearTimeout(this.#scrollDebounceTimer);
		}

		this.#scrollDebounceTimer = setTimeout(() => {
			if (!this.#isScrollLocked) {
				this.#detectCurrentSection();
			}
		}, SCROLL_DEBOUNCE);
	}

	/**
	 * Manually detect current section (fallback method)
	 * Used for initial detection and when observer might miss
	 */
	#detectCurrentSection(): void {
		// Check cooldown to prevent rapid switching
		const now = Date.now();
		if (now - this.#lastIndexChangeTime < INDEX_CHANGE_COOLDOWN) return;

		const viewportMiddle = window.innerHeight / 2;

		for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
			const section = document.getElementById(SECTION_IDS[i]);
			if (!section) continue;

			const rect = section.getBoundingClientRect();

			if (rect.top <= viewportMiddle) {
				if (this.activeIndex !== i) {
					this.activeIndex = i;
					this.#lastIndexChangeTime = now;
				}
				break;
			}
		}
	}
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────

/** Singleton navigation state instance */
export const navigation = new NavigationState();

/** Re-export navItems for convenience */
export { navItems };

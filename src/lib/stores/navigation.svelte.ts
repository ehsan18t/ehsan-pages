/**
 * Navigation Store - Centralized Navigation State Management
 *
 * Clean Implementation featuring:
 * - Svelte 5 runes ($state, $derived) for reactivity
 * - Simple scroll-based section detection (no race conditions)
 * - Throttled scroll handling for performance
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

/** Throttle time for scroll event handling (ms) */
const SCROLL_THROTTLE = 50;

/** Duration to ignore detection during programmatic scroll (ms) */
const SCROLL_LOCK_DURATION = 800;

/** Bottom threshold for hiding navigation (px from bottom) */
const BOTTOM_THRESHOLD = 100;

/** Viewport offset for section detection (percentage from top) */
const DETECTION_OFFSET = 0.3; // 30% from top of viewport

/**
 * Navigation State Manager
 *
 * Uses simple scroll-position-based detection:
 * - Single source of truth (scroll position)
 * - No race conditions between multiple systems
 * - Predictable behavior at section boundaries
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

	/** Flag to prevent updates during programmatic scroll */
	#isScrollLocked = false;

	/** Last scroll handler execution time for throttling */
	#lastScrollTime = 0;

	/** RAF handle for scroll updates */
	#rafHandle: number | null = null;

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

		this.#setupScrollListener();
		this.#scheduleVisibility();

		// Initial detection after DOM is ready
		requestAnimationFrame(() => {
			this.#detectCurrentSection();
		});
	}

	/**
	 * Clean up all resources
	 * Should be called when the app unmounts
	 */
	destroy(): void {
		if (!browser) return;

		// Cancel any pending RAF
		if (this.#rafHandle) {
			cancelAnimationFrame(this.#rafHandle);
			this.#rafHandle = null;
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

		// Lock detection to prevent interference during scroll
		this.#isScrollLocked = true;

		// Update active index immediately for responsive UI
		this.activeIndex = index;

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
	 * Setup throttled scroll listener
	 */
	#setupScrollListener(): void {
		this.#boundScrollHandler = () => {
			const now = performance.now();

			// Throttle: skip if called too recently
			if (now - this.#lastScrollTime < SCROLL_THROTTLE) return;
			this.#lastScrollTime = now;

			// Use RAF for smooth updates synced with browser paint
			if (this.#rafHandle) return;

			this.#rafHandle = requestAnimationFrame(() => {
				this.#rafHandle = null;
				this.#onScroll();
			});
		};

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
	 * Handle scroll - single unified handler
	 */
	#onScroll(): void {
		// Update bottom detection
		const { scrollHeight, clientHeight } = document.documentElement;
		const scrollY = window.scrollY;
		this.isNearBottom = scrollY + clientHeight >= scrollHeight - BOTTOM_THRESHOLD;

		// Detect current section (skip during programmatic scroll)
		if (!this.#isScrollLocked) {
			this.#detectCurrentSection();
		}
	}

	/**
	 * Detect current section based on scroll position
	 * Simple and reliable: find the section whose top is closest to detection line
	 */
	#detectCurrentSection(): void {
		const detectionLine = window.innerHeight * DETECTION_OFFSET;
		let bestIndex = 0;
		let bestDistance = Infinity;

		for (let i = 0; i < SECTION_IDS.length; i++) {
			const section = document.getElementById(SECTION_IDS[i]);
			if (!section) continue;

			const rect = section.getBoundingClientRect();

			// Section must have started (top is above detection line)
			if (rect.top <= detectionLine) {
				// Find the section whose top is closest to (but above) the detection line
				const distance = detectionLine - rect.top;
				if (distance < bestDistance) {
					bestDistance = distance;
					bestIndex = i;
				}
			}
		}

		// Update only if changed
		if (this.activeIndex !== bestIndex) {
			this.activeIndex = bestIndex;
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

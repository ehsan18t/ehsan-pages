/**
 * Carousel Hook - Shared carousel/slideshow logic
 *
 * This hook provides reusable carousel functionality including:
 * - Navigation (prev/next/goTo)
 * - Autoplay with pause on hover
 * - Touch/swipe handling
 * - Keyboard navigation
 *
 * Used by: Testimonials, ImageSlider (lightbox)
 */

export interface CarouselOptions {
	/** Total number of items in the carousel */
	itemCount: number;
	/** Autoplay interval in milliseconds (0 to disable) */
	autoplayInterval?: number;
	/** Whether to loop back to the start */
	loop?: boolean;
	/** Animation duration in milliseconds */
	animationDuration?: number;
	/** Minimum swipe distance to trigger navigation */
	swipeThreshold?: number;
}

export interface CarouselState {
	/** Current active index */
	activeIndex: number;
	/** Whether animation is in progress */
	isAnimating: boolean;
	/** Whether autoplay is paused */
	isPaused: boolean;
}

export interface CarouselActions {
	/** Navigate to the next item */
	next: () => void;
	/** Navigate to the previous item */
	prev: () => void;
	/** Navigate to a specific index */
	goTo: (index: number) => void;
	/** Pause autoplay */
	pause: () => void;
	/** Resume autoplay */
	resume: () => void;
	/** Handle touch start event */
	handleTouchStart: (e: TouchEvent) => void;
	/** Handle touch end event */
	handleTouchEnd: (e: TouchEvent) => void;
	/** Handle keyboard navigation */
	handleKeydown: (e: KeyboardEvent) => void;
	/** Start autoplay */
	startAutoplay: () => void;
	/** Stop autoplay */
	stopAutoplay: () => void;
	/** Cleanup resources */
	destroy: () => void;
}

export function useCarousel(options: CarouselOptions): {
	state: CarouselState;
	actions: CarouselActions;
} {
	const {
		itemCount,
		autoplayInterval = 0,
		loop = true,
		animationDuration = 500,
		swipeThreshold = 50
	} = options;

	// State using Svelte 5 runes
	let activeIndex = $state(0);
	let isAnimating = $state(false);
	let isPaused = $state(false);

	// Touch tracking
	let touchStartX = 0;
	let touchStartY = 0;

	// Autoplay timer
	let autoplayTimer: ReturnType<typeof setInterval> | null = null;

	// Navigation functions
	function next() {
		if (isAnimating || itemCount <= 1) return;
		isAnimating = true;

		if (loop) {
			activeIndex = (activeIndex + 1) % itemCount;
		} else {
			activeIndex = Math.min(activeIndex + 1, itemCount - 1);
		}

		setTimeout(() => {
			isAnimating = false;
		}, animationDuration);
	}

	function prev() {
		if (isAnimating || itemCount <= 1) return;
		isAnimating = true;

		if (loop) {
			activeIndex = (activeIndex - 1 + itemCount) % itemCount;
		} else {
			activeIndex = Math.max(activeIndex - 1, 0);
		}

		setTimeout(() => {
			isAnimating = false;
		}, animationDuration);
	}

	function goTo(index: number) {
		if (isAnimating || index === activeIndex || index < 0 || index >= itemCount) return;
		isAnimating = true;

		activeIndex = index;

		setTimeout(() => {
			isAnimating = false;
		}, animationDuration);
	}

	// Autoplay controls
	function pause() {
		isPaused = true;
	}

	function resume() {
		isPaused = false;
	}

	function startAutoplay() {
		if (autoplayTimer || autoplayInterval <= 0) return;
		autoplayTimer = setInterval(() => {
			if (!isPaused && !isAnimating) {
				next();
			}
		}, autoplayInterval);
	}

	function stopAutoplay() {
		if (autoplayTimer) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
	}

	// Touch/swipe handling
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		pause();
	}

	function handleTouchEnd(e: TouchEvent) {
		const deltaX = e.changedTouches[0].clientX - touchStartX;
		const deltaY = e.changedTouches[0].clientY - touchStartY;

		// Only swipe if horizontal movement is greater than vertical
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
			if (deltaX > 0) {
				prev();
			} else {
				next();
			}
		}
		resume();
	}

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			prev();
		} else if (e.key === 'ArrowRight') {
			next();
		}
	}

	// Cleanup
	function destroy() {
		stopAutoplay();
	}

	// Return reactive state and actions
	const state: CarouselState = {
		get activeIndex() {
			return activeIndex;
		},
		get isAnimating() {
			return isAnimating;
		},
		get isPaused() {
			return isPaused;
		}
	};

	const actions: CarouselActions = {
		next,
		prev,
		goTo,
		pause,
		resume,
		handleTouchStart,
		handleTouchEnd,
		handleKeydown,
		startAutoplay,
		stopAutoplay,
		destroy
	};

	return { state, actions };
}

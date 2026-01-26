/**
 * Hooks Barrel Export
 *
 * Reusable Svelte 5 hooks for common UI patterns.
 * These hooks encapsulate complex logic and state management.
 *
 * Available Hooks:
 * - useCarousel: Navigation, autoplay, touch/keyboard handling for carousels
 * - useScrollSpy: Track active sections during scroll
 *
 * Note: Components currently use inline implementations or actions.
 * These hooks are available for future refactoring or new features.
 */

export {
	useCarousel,
	type CarouselActions,
	type CarouselOptions,
	type CarouselState
} from './useCarousel.svelte';
export {
	useScrollSpy,
	type ScrollSpyActions,
	type ScrollSpyOptions,
	type ScrollSpySection,
	type ScrollSpyState
} from './useScrollSpy.svelte';

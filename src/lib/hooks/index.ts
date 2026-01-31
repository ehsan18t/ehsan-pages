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
 * @deprecated These hooks are currently unused in the codebase.
 * Navigation uses `navigation.svelte.ts` store instead of useScrollSpy.
 * Carousels use inline implementations.
 * Consider removing in future cleanup if not needed.
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

// Actions barrel export

// Portal - teleport elements to document.body (for modals, lightboxes)
export { portal } from './portal';

// Viewport animation pause/resume (performance optimization)
export { createViewportGsapController, viewportAnimation } from './viewportAnimation';
export type { ViewportAnimationOptions } from './viewportAnimation';

// Scroll reveal animation (recommended)
export { scrollReveal } from './scrollReveal';
export type { ScrollRevealOptions } from './scrollReveal';

// Scroll spy for navigation
export { scrollSpy } from './scrollSpy';
export type { ScrollSpyOptions } from './scrollSpy';

// Click outside detection
export { clickOutside } from './clickOutside';
export type { ClickOutsideCallback, ClickOutsideOptions } from './clickOutside';

// GSAP-based scroll animations (alternative)
export {
	gsapFadeIn,
	gsapScaleIn,
	gsapSlideLeft,
	gsapSlideRight,
	gsapSlideUp,
	gsapStaggerIn
} from './gsapScrollAnimations';
export type { GsapScrollOptions } from './gsapScrollAnimations';


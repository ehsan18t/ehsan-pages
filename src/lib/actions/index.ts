// Actions barrel export

// Scroll reveal animation (recommended)
export { initScrollAnimations, scrollReveal } from './scrollReveal';
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

// Legacy CSS-based animations (deprecated, use scrollReveal instead)
export { animateOnScroll, staggerChildren } from './animateOnScroll';
export type { AnimateOnScrollOptions, StaggerOptions } from './animateOnScroll';

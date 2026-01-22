// Actions barrel export

// Scroll reveal animation (recommended)
export { initScrollAnimations, scrollReveal } from './scrollReveal';
export type { ScrollRevealOptions } from './scrollReveal';

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

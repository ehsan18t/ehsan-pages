/**
 * Scroll Reveal Animation using IntersectionObserver + GSAP
 * 
 * Simple, reliable appear-on-scroll animation.
 * Sections start hidden and fade in when they enter the viewport.
 * Once revealed, they stay visible (no reverse).
 * 
 * Usage:
 *   <div use:scrollReveal>...</div>
 *   <div use:scrollReveal={{ y: 60, duration: 0.8 }}>...</div>
 */

import { browser } from '$app/environment';
import gsap from 'gsap';

export interface ScrollRevealOptions {
    /** Vertical offset to animate from (default: 50) */
    y?: number;
    /** Horizontal offset to animate from (default: 0) */
    x?: number;
    /** Animation duration in seconds (default: 0.7) */
    duration?: number;
    /** Delay before animation starts (default: 0) */
    delay?: number;
    /** Easing function (default: 'power3.out') */
    ease?: string;
    /** Threshold for triggering (0-1, default: 0.15 = 15% visible) */
    threshold?: number;
}

/**
 * Scroll reveal action - fades in element when it enters viewport
 */
export function scrollReveal(
    node: HTMLElement,
    options: ScrollRevealOptions = {}
): { destroy: () => void } {
    if (!browser) return { destroy: () => { } };

    const {
        y = 50,
        x = 0,
        duration = 0.7,
        delay = 0,
        ease = 'power3.out',
        threshold = 0.15
    } = options;

    // Set initial hidden state
    gsap.set(node, {
        opacity: 0,
        y,
        x
    });

    let hasAnimated = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;

                    // Animate to visible
                    gsap.to(node, {
                        opacity: 1,
                        y: 0,
                        x: 0,
                        duration,
                        delay,
                        ease
                    });

                    // Stop observing after animation
                    observer.unobserve(node);
                }
            });
        },
        {
            threshold,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in view
        }
    );

    observer.observe(node);

    return {
        destroy() {
            observer.disconnect();
        }
    };
}

/**
 * Initialize scroll animations - refreshes any pending observers
 */
export function initScrollAnimations(): void {
    // No-op for IntersectionObserver approach
}

export default scrollReveal;

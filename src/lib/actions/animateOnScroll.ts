/**
 * Svelte Action: animateOnScroll
 * Adds scroll-triggered animation classes to elements when they enter the viewport.
 *
 * Usage:
 *   <div use:animateOnScroll={{ animation: 'fade-up', delay: 200 }}>...</div>
 *   <div use:animateOnScroll={'fade-up'}>...</div>
 */

export interface AnimateOnScrollOptions {
    /** Animation class to apply (e.g., 'fade-up', 'slide-left') */
    animation?: string;
    /** Delay before animation starts (ms) */
    delay?: number;
    /** Duration of the animation (ms) */
    duration?: number;
    /** Threshold for intersection (0-1) */
    threshold?: number;
    /** Root margin for intersection observer */
    rootMargin?: string;
    /** Whether animation should replay when element leaves and re-enters */
    replay?: boolean;
    /** Whether to animate only once */
    once?: boolean;
    /** Easing function name */
    easing?: string;
}

export function animateOnScroll(
    node: HTMLElement,
    options: AnimateOnScrollOptions | string = {}
): { destroy: () => void; update: (newOptions: AnimateOnScrollOptions | string) => void } {
    // Normalize options
    let opts: AnimateOnScrollOptions =
        typeof options === 'string' ? { animation: options } : options;

    const {
        animation = 'fade-up',
        delay = 0,
        duration,
        threshold = 0.15,
        rootMargin = '0px 0px -10% 0px',
        replay = false,
        once = true,
        easing
    } = opts;

    let hasAnimated = false;

    // Apply initial hidden state
    node.style.opacity = '0';
    node.classList.add('animate-hidden');

    // Set CSS custom properties for delay/duration/easing
    if (delay) {
        node.style.setProperty('--animation-delay', `${delay}ms`);
    }
    if (duration) {
        node.style.setProperty('--animation-duration', `${duration}ms`);
    }
    if (easing) {
        node.style.setProperty('--animation-easing', easing);
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Element is in view
                    if (!hasAnimated || replay) {
                        // Add animation class after delay
                        setTimeout(() => {
                            node.style.opacity = '';
                            node.classList.remove('animate-hidden');
                            node.classList.add('animate-visible', animation);
                        }, delay);

                        if (once) {
                            hasAnimated = true;
                            observer.unobserve(node);
                        }
                    }
                } else if (replay && hasAnimated) {
                    // Reset for replay
                    node.style.opacity = '0';
                    node.classList.remove('animate-visible', animation);
                    node.classList.add('animate-hidden');
                }
            });
        },
        {
            threshold,
            rootMargin
        }
    );

    observer.observe(node);

    return {
        update(newOptions: AnimateOnScrollOptions | string) {
            opts = typeof newOptions === 'string' ? { animation: newOptions } : newOptions;
            // Could implement live update logic here if needed
        },
        destroy() {
            observer.disconnect();
        }
    };
}

/**
 * Svelte Action: staggerChildren
 * Applies staggered animation delays to child elements.
 *
 * Usage:
 *   <div use:staggerChildren={{ stagger: 100, animation: 'fade-up' }}>
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *   </div>
 */
export interface StaggerOptions extends AnimateOnScrollOptions {
    /** Delay between each child (ms) */
    stagger?: number;
    /** Selector for children to animate */
    selector?: string;
}

export function staggerChildren(
    node: HTMLElement,
    options: StaggerOptions = {}
): { destroy: () => void } {
    const {
        stagger = 100,
        selector = ':scope > *',
        animation = 'fade-up',
        threshold = 0.1,
        rootMargin = '0px 0px -5% 0px',
        once = true
    } = options;

    const children = node.querySelectorAll(selector);
    let hasAnimated = false;

    // Hide all children initially
    children.forEach((child) => {
        (child as HTMLElement).style.opacity = '0';
        child.classList.add('animate-hidden');
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated) {
                    // Animate children with stagger
                    children.forEach((child, index) => {
                        const el = child as HTMLElement;
                        setTimeout(() => {
                            el.style.opacity = '';
                            el.classList.remove('animate-hidden');
                            el.classList.add('animate-visible', animation);
                        }, index * stagger);
                    });

                    if (once) {
                        hasAnimated = true;
                        observer.unobserve(node);
                    }
                }
            });
        },
        {
            threshold,
            rootMargin
        }
    );

    observer.observe(node);

    return {
        destroy() {
            observer.disconnect();
        }
    };
}

export default animateOnScroll;

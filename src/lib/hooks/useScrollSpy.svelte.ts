/**
 * Scroll Spy Hook - Track active section based on scroll position
 *
 * This hook provides scroll tracking functionality including:
 * - Intersection Observer for section detection
 * - Active section tracking
 * - Scroll to section with offset support
 *
 * Used by: FloatingNav
 */

import { browser } from '$app/environment';

export interface ScrollSpySection {
    /** Section ID (without #) */
    id: string;
    /** Optional scroll offset from top */
    offset?: number;
}

export interface ScrollSpyOptions {
    /** Sections to track */
    sections: ScrollSpySection[];
    /** Root margin for intersection observer */
    rootMargin?: string;
    /** Threshold for intersection observer */
    threshold?: number;
}

export interface ScrollSpyState {
    /** Index of the currently active section */
    activeIndex: number;
    /** Whether the scroll position is near the bottom */
    isNearBottom: boolean;
}

export interface ScrollSpyActions {
    /** Scroll to a specific section by index */
    scrollToSection: (e: MouseEvent, index: number) => void;
    /** Initialize the scroll spy */
    init: () => void;
    /** Cleanup resources */
    destroy: () => void;
}

/**
 * Find the scrollable container for an element
 */
function getScrollContainer(el: HTMLElement | null): HTMLElement {
    let node = el?.parentElement;
    while (node) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
            return node;
        }
        node = node.parentElement;
    }
    return (document.scrollingElement as HTMLElement) || document.documentElement;
}

export function useScrollSpy(options: ScrollSpyOptions): {
    state: ScrollSpyState;
    actions: ScrollSpyActions;
} {
    const { sections, rootMargin = '-20% 0px -60% 0px', threshold = 0 } = options;

    // State using Svelte 5 runes
    let activeIndex = $state(0);
    let isNearBottom = $state(false);

    // Observer reference
    let observer: IntersectionObserver | null = null;

    // Scroll handler for bottom detection
    function handleScroll() {
        if (!browser) return;
        const scrollY = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        isNearBottom = scrollY + clientHeight >= scrollHeight - 30;
    }

    // Initialize intersection observer
    function init() {
        if (!browser) return;

        // Get section elements
        const sectionElements = sections
            .map((section) => document.getElementById(section.id))
            .filter(Boolean) as HTMLElement[];

        // Create observer
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = sections.findIndex((section) => section.id === entry.target.id);
                        if (idx >= 0) {
                            activeIndex = idx;
                        }
                    }
                });
            },
            { root: null, rootMargin, threshold }
        );

        // Observe sections
        sectionElements.forEach((section) => observer!.observe(section));

        // Add scroll listener for bottom detection
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Scroll to section
    function scrollToSection(e: MouseEvent, index: number) {
        e.preventDefault();

        const section = sections[index];
        if (!section) return;

        const target = document.getElementById(section.id);
        if (!target) return;

        const container = getScrollContainer(target);

        if (section.offset !== undefined) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const currentScrollTop = container.scrollTop;
            const relativeTop = targetRect.top - containerRect.top;
            const destination = currentScrollTop + relativeTop - section.offset;
            container.scrollTo({ top: destination, behavior: 'smooth' });
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Cleanup
    function destroy() {
        if (!browser) return;
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        window.removeEventListener('scroll', handleScroll);
    }

    // Return reactive state and actions
    const state: ScrollSpyState = {
        get activeIndex() {
            return activeIndex;
        },
        get isNearBottom() {
            return isNearBottom;
        }
    };

    const actions: ScrollSpyActions = {
        scrollToSection,
        init,
        destroy
    };

    return { state, actions };
}

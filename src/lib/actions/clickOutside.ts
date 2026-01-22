/**
 * Click Outside Action - Svelte action to detect clicks outside an element
 *
 * Usage:
 *   <div use:clickOutside={() => isOpen = false}>
 *   <div use:clickOutside={{ callback: () => isOpen = false, enabled: isOpen }}>
 */

import { browser } from '$app/environment';

export type ClickOutsideCallback = () => void;

export interface ClickOutsideOptions {
    /** Callback when click outside is detected */
    callback: ClickOutsideCallback;
    /** Whether the listener is enabled (default: true) */
    enabled?: boolean;
}

export function clickOutside(
    node: HTMLElement,
    options: ClickOutsideCallback | ClickOutsideOptions
): { update: (opts: ClickOutsideCallback | ClickOutsideOptions) => void; destroy: () => void } {
    if (!browser) return { update: () => { }, destroy: () => { } };

    let currentCallback: ClickOutsideCallback;
    let enabled = true;

    function parseOptions(opts: ClickOutsideCallback | ClickOutsideOptions) {
        if (typeof opts === 'function') {
            currentCallback = opts;
            enabled = true;
        } else {
            currentCallback = opts.callback;
            enabled = opts.enabled ?? true;
        }
    }

    function handleClick(event: MouseEvent) {
        if (!enabled) return;
        const target = event.target as Node;
        if (node && !node.contains(target) && !event.defaultPrevented) {
            currentCallback();
        }
    }

    parseOptions(options);
    document.addEventListener('click', handleClick, true);

    return {
        update(newOptions: ClickOutsideCallback | ClickOutsideOptions) {
            parseOptions(newOptions);
        },
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
}

export default clickOutside;

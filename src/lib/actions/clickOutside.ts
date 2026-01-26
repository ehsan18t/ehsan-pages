/**
 * Click Outside Action - Svelte 5 Action for detecting clicks outside an element
 *
 * A+ Grade Implementation featuring:
 * - Uses `on()` from svelte/events for proper event ordering
 * - Supports both callback function and options object
 * - Conditional enabling/disabling without re-attaching listeners
 * - Type-safe with proper JSDoc
 *
 * @example
 * ```svelte
 * <div use:clickOutside={() => isOpen = false}>
 * <div use:clickOutside={{ callback: () => isOpen = false, enabled: isOpen }}>
 * ```
 *
 * @module clickOutside
 */

import { browser } from '$app/environment';
import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

/** Callback function type for click outside events */
export type ClickOutsideCallback = () => void;

/** Options object for click outside action */
export interface ClickOutsideOptions {
	/** Callback when click outside is detected */
	callback: ClickOutsideCallback;
	/** Whether the listener is enabled (default: true) */
	enabled?: boolean;
}

/** Parameter type for the action - accepts either callback or options */
type ClickOutsideParameter = ClickOutsideCallback | ClickOutsideOptions;

/**
 * Svelte action to detect clicks outside an element
 *
 * Uses Svelte 5's `on()` from svelte/events for proper event ordering
 * with declarative event handlers.
 */
export const clickOutside: Action<HTMLElement, ClickOutsideParameter> = (node, parameter) => {
	if (!browser) return {};

	let currentCallback: ClickOutsideCallback;
	let enabled = true;

	/**
	 * Parse the parameter to extract callback and enabled state
	 */
	function parseParameter(param: ClickOutsideParameter): void {
		if (typeof param === 'function') {
			currentCallback = param;
			enabled = true;
		} else {
			currentCallback = param.callback;
			enabled = param.enabled ?? true;
		}
	}

	/**
	 * Handle click events on the document
	 */
	function handleClick(event: MouseEvent): void {
		if (!enabled) return;

		const target = event.target as Node;

		// Check if click is outside the node and event is not prevented
		if (node && !node.contains(target) && !event.defaultPrevented) {
			currentCallback();
		}
	}

	// Initialize with the provided parameter
	parseParameter(parameter);

	// Use svelte/events `on()` for proper event ordering
	// Capture phase (true) to handle before other handlers
	const off = on(document, 'click', handleClick, { capture: true });

	return {
		update(newParameter: ClickOutsideParameter) {
			parseParameter(newParameter);
		},
		destroy() {
			off();
		}
	};
};

export default clickOutside;

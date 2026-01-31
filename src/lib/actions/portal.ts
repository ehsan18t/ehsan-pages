/**
 * Portal Action - Teleports element to document.body
 *
 * Useful for modals, lightboxes, and overlays that need to escape
 * their parent stacking context.
 *
 * @example
 * ```svelte
 * <div use:portal>This will be teleported to document.body</div>
 * ```
 *
 * @module portal
 */

import { browser } from '$app/environment';
import type { Action } from 'svelte/action';

/**
 * Svelte action that teleports an element to document.body
 * Automatically cleans up when the element is destroyed
 */
export const portal: Action<HTMLElement> = (node) => {
	if (!browser) return;

	const target = document.body;
	target.appendChild(node);

	return {
		destroy() {
			// Only remove if still attached to target
			if (node.parentNode === target) {
				target.removeChild(node);
			}
		}
	};
};

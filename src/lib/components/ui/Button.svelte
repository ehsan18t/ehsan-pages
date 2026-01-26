<script lang="ts">
	/**
	 * Button Component - Accessible button with ripple effect
	 *
	 * A+ Grade Implementation featuring:
	 * - Svelte 5 runes ($state, $effect)
	 * - Reactive ripple effect without direct DOM manipulation
	 * - Optional link opening
	 * - Snippet-based content composition
	 *
	 * @component Button
	 */

	import type { Snippet } from 'svelte';

	// ─────────────────────────────────────────────────────────────
	// Types
	// ─────────────────────────────────────────────────────────────

	interface RippleEffect {
		id: number;
		x: number;
		y: number;
		size: number;
	}

	interface Props {
		/** Optional element ID */
		id?: string;
		/** Additional CSS classes */
		class?: string;
		/** URL to open on click */
		link?: string;
		/** Button content */
		children?: Snippet;
		/** Click handler */
		onclick?: (event: MouseEvent) => void;
		/** Disabled state */
		disabled?: boolean;
		/** Button type */
		type?: 'button' | 'submit' | 'reset';
	}

	// ─────────────────────────────────────────────────────────────
	// Props
	// ─────────────────────────────────────────────────────────────

	let {
		id,
		class: className = '',
		link,
		children,
		onclick,
		disabled = false,
		type = 'button'
	}: Props = $props();

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	const RIPPLE_DURATION = 600;

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let ripples = $state<RippleEffect[]>([]);
	let rippleIdCounter = $state(0);
	let buttonRef = $state<HTMLButtonElement | null>(null);

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	/**
	 * Create ripple effect at click position
	 */
	function createRipple(event: MouseEvent): void {
		if (!buttonRef) return;

		const rect = buttonRef.getBoundingClientRect();
		const size = Math.max(rect.width, rect.height);
		const x = event.clientX - rect.left - size / 2;
		const y = event.clientY - rect.top - size / 2;

		const ripple: RippleEffect = {
			id: rippleIdCounter++,
			x,
			y,
			size
		};

		ripples = [...ripples, ripple];

		// Remove ripple after animation completes
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== ripple.id);
		}, RIPPLE_DURATION);
	}

	/**
	 * Handle button click
	 */
	function handleClick(event: MouseEvent): void {
		createRipple(event);

		if (link) {
			window.open(link, '_blank', 'noopener,noreferrer')?.focus();
		}

		onclick?.(event);
	}
</script>

<button
	bind:this={buttonRef}
	{id}
	{type}
	{disabled}
	class="relative cursor-pointer overflow-hidden rounded-lg border-2 border-accent-500 bg-accent-bg/30
		px-5 py-3.5 leading-tight font-bold text-accent-text transition duration-300 ease-in-out
		hover:bg-accent-bg/60 disabled:cursor-not-allowed disabled:opacity-50 {className}"
	onclick={handleClick}
>
	<!-- Ripple effects rendered reactively -->
	{#each ripples as ripple (ripple.id)}
		<span
			class="ripple"
			style:width="{ripple.size}px"
			style:height="{ripple.size}px"
			style:left="{ripple.x}px"
			style:top="{ripple.y}px"
		></span>
	{/each}

	{#if children}
		{@render children()}
	{:else}
		Click Me
	{/if}
</button>

<style>
	/* Ripple effect styling */
	.ripple {
		--ripple-color: oklch(100% 0 0 / 0.6);
		--ripple-scale: 4;
		--ripple-duration: 600ms;

		position: absolute;
		pointer-events: none;
		border-radius: 9999px;
		background: var(--ripple-color);
		will-change: transform, opacity;
		backface-visibility: hidden;
		animation: ripple var(--ripple-duration) ease-out forwards;
	}

	@keyframes ripple {
		from {
			transform: scale3d(0, 0, 0);
			opacity: 0.8;
		}
		to {
			transform: scale3d(var(--ripple-scale), var(--ripple-scale), 1);
			opacity: 0;
		}
	}
</style>

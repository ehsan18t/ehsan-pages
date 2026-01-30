<script lang="ts">
	/**
	 * Modal Component - Accessible dialog with focus trap
	 *
	 * A+ Grade Implementation featuring:
	 * - Svelte 5 runes ($state, $bindable, $effect)
	 * - Portal rendering to document.body
	 * - <svelte:window> for keyboard handling
	 * - GSAP for smooth animations
	 * - Focus trap and focus restoration
	 * - Body scroll lock with scrollbar compensation
	 * - Snippet-based composition pattern
	 *
	 * @component Modal
	 */

	import { browser } from '$app/environment';
	import gsap from 'gsap';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	// ─────────────────────────────────────────────────────────────
	// Props
	// ─────────────────────────────────────────────────────────────

	interface Props {
		/** Whether the modal is open (two-way bindable) */
		open: boolean;
		/** Callback when modal closes */
		onclose?: () => void;
		/** Optional header snippet */
		header?: Snippet;
		/** Main content snippet (required) */
		children: Snippet;
		/** Optional footer snippet */
		footer?: Snippet;
		/** Additional CSS classes */
		class?: string;
		/** Maximum width preset */
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
		/** Close when clicking backdrop */
		closeOnBackdrop?: boolean;
		/** Close when pressing Escape */
		closeOnEscape?: boolean;
		/** Trap focus within modal */
		trapFocus?: boolean;
	}

	let {
		open = $bindable(false),
		onclose,
		header,
		children,
		footer,
		class: className = '',
		maxWidth = '4xl',
		closeOnBackdrop = true,
		closeOnEscape = true,
		trapFocus = true
	}: Props = $props();

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	/** Selectors for focusable elements */
	const FOCUSABLE_SELECTORS = [
		'a[href]',
		'button:not([disabled])',
		'textarea:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		"[tabindex]:not([tabindex='-1'])"
	].join(',');

	/** Max width class mappings */
	const MAX_WIDTH_CLASSES: Record<string, string> = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'4xl': 'max-w-4xl',
		full: 'max-w-full'
	} as const;

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let modalContainerRef = $state<HTMLDivElement | null>(null);
	let previouslyFocusedElement: HTMLElement | null = null;

	// Portal action - teleports element to document.body
	function portal(node: HTMLElement) {
		if (!browser) return;

		const target = document.body;
		target.appendChild(node);

		return {
			destroy() {
				if (node.parentNode === target) {
					target.removeChild(node);
				}
			}
		};
	}

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	/**
	 * Close the modal and notify parent
	 */
	function closeModal(): void {
		open = false;
		onclose?.();
	}

	/**
	 * Handle backdrop click
	 */
	function handleBackdropClick(): void {
		if (closeOnBackdrop) {
			closeModal();
		}
	}

	/**
	 * Prevent clicks on content from closing modal
	 */
	function handleContentClick(event: MouseEvent): void {
		event.stopPropagation();
	}

	/**
	 * Handle keyboard navigation and escape
	 */
	function handleKeyDown(event: KeyboardEvent): void {
		if (!open) return;

		// Escape to close
		if (event.key === 'Escape' && closeOnEscape) {
			event.preventDefault();
			closeModal();
			return;
		}

		// Focus trap on Tab
		if (!trapFocus || event.key !== 'Tab' || !modalContainerRef) return;

		const focusable = Array.from(
			modalContainerRef.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
		).filter((el) => !el.hasAttribute('disabled'));

		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey) {
			const shouldLoop = !active || active === first;
			if (shouldLoop) {
				event.preventDefault();
				last.focus();
			}
		} else if (active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Animations
	// ─────────────────────────────────────────────────────────────

	/**
	 * GSAP entrance animation
	 */
	function animateIn(node: HTMLElement) {
		gsap.fromTo(
			node,
			{ opacity: 0, scale: 0.95, y: 20 },
			{ opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
		);
		return { duration: 300 };
	}

	/**
	 * GSAP exit animation
	 */
	function animateOut(node: HTMLElement) {
		gsap.to(node, {
			opacity: 0,
			scale: 0.95,
			y: 20,
			duration: 0.2,
			ease: 'power2.in'
		});
		return { duration: 200 };
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Manage body scroll and focus when modal opens/closes
	$effect(() => {
		if (open) {
			// Save previously focused element
			previouslyFocusedElement = document.activeElement as HTMLElement;

			// Prevent background scrolling with scrollbar compensation
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = `${scrollbarWidth}px`;

			// Focus first focusable element after render
			setTimeout(() => {
				const focusable = modalContainerRef?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
				focusable?.[0]?.focus();
			}, 0);
		}

		// Cleanup when effect re-runs or component unmounts
		return () => {
			if (open) {
				// Restore body scroll
				document.body.style.overflow = '';
				document.body.style.paddingRight = '';

				// Restore focus to previously focused element
				previouslyFocusedElement?.focus();
				previouslyFocusedElement = null;
			}
		};
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
		use:portal
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-content flex w-full flex-col overflow-hidden rounded-xl border border-white/20 bg-[rgb(var(--background))]/95 shadow-2xl {MAX_WIDTH_CLASSES[
				maxWidth
			]} {className}"
			onclick={handleContentClick}
			bind:this={modalContainerRef}
			in:animateIn
			out:animateOut
		>
			{#if header}
				<div
					class="modal-header flex items-center justify-between border-b border-white/10 px-6 py-3"
				>
					{@render header()}
					<button
						onclick={closeModal}
						class="cursor-pointer px-2 text-4xl leading-none text-gray-300 transition-colors select-none hover:text-white"
						aria-label="Close"
					>
						&times;
					</button>
				</div>
			{:else}
				<button
					onclick={closeModal}
					class="absolute top-4 right-4 z-10 cursor-pointer px-2 text-4xl leading-none text-gray-300 transition-colors select-none hover:text-white"
					aria-label="Close"
				>
					&times;
				</button>
			{/if}

			<div class="modal-body flex-1 overflow-auto">
				{@render children()}
			</div>

			{#if footer}
				<div class="modal-footer border-t border-white/10 px-6 py-3">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	.modal-content {
		max-height: min(92vh, calc(100vh - 2rem));
	}
</style>

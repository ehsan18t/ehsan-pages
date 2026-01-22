<script lang="ts">
	import gsap from 'gsap';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		open: boolean;
		onclose?: () => void;
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
		class?: string;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
		closeOnBackdrop?: boolean;
		closeOnEscape?: boolean;
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

	let modalContainerRef = $state<HTMLDivElement | null>(null);
	let previouslyFocusedElement: HTMLElement | null = null;

	const FOCUSABLE_SELECTORS = [
		'a[href]',
		'button:not([disabled])',
		'textarea:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		"[tabindex]:not([tabindex='-1'])"
	].join(',');

	const maxWidthClasses: Record<string, string> = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'4xl': 'max-w-4xl',
		full: 'max-w-full'
	};

	function closeModal() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick() {
		if (closeOnBackdrop) {
			closeModal();
		}
	}

	function handleContentClick(event: MouseEvent) {
		event.stopPropagation();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!open) return;

		if (event.key === 'Escape' && closeOnEscape) {
			event.preventDefault();
			closeModal();
			return;
		}

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

	// Modal entrance animation using GSAP
	function animateIn(node: HTMLElement) {
		gsap.fromTo(
			node,
			{ opacity: 0, scale: 0.95, y: 20 },
			{ opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
		);
		return { duration: 300 };
	}

	// Modal exit animation using GSAP
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

	// Manage body scroll and focus when modal opens/closes
	$effect(() => {
		if (open) {
			// Save previously focused element
			previouslyFocusedElement = document.activeElement as HTMLElement;

			// Prevent background scrolling
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = `${scrollbarWidth}px`;

			// Focus first focusable element
			setTimeout(() => {
				const focusable = modalContainerRef?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
				focusable?.[0]?.focus();
			}, 0);
		}

		return () => {
			if (open) {
				// Restore body scroll
				document.body.style.overflow = '';
				document.body.style.paddingRight = '';

				// Restore focus
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
		class="fixed inset-0 z-999 flex items-center justify-center bg-black/30 px-4 py-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-content flex w-full flex-col overflow-hidden rounded-xl border border-white/20 bg-[rgb(var(--background))]/95 shadow-2xl {maxWidthClasses[
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
	.modal-content {
		max-height: min(92vh, calc(100vh - 2rem));
	}
</style>

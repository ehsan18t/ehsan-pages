<script lang="ts">
	import Button from './Button.svelte';
	import PDFViewer from './PDFViewer.svelte';

	interface Props {
		cvPDF: string;
	}

	let { cvPDF }: Props = $props();

	let isModalOpen = $state(false);
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

	function openModal() {
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
	}

	function handleBackdropClick() {
		closeModal();
	}

	function handleContentClick(event: MouseEvent) {
		event.stopPropagation();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isModalOpen) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeModal();
			return;
		}

		if (event.key !== 'Tab' || !modalContainerRef) return;

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

	// Manage body scroll and focus when modal opens/closes
	$effect(() => {
		if (isModalOpen) {
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
			if (isModalOpen) {
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

<div class="flex h-full w-full select-none items-center justify-center md:justify-start">
	<Button onclick={openModal} class="w-3xs font-bold">View CV</Button>
</div>

{#if isModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-4 py-4 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex h-[min(92vh,_calc(100vh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/20 bg-[rgb(var(--background))]/75 pb-3 shadow-2xl"
			onclick={handleContentClick}
			bind:this={modalContainerRef}
		>
			<!-- Modal Header -->
			<div
				class="flex select-none items-center justify-between border-b border-white/10 px-6 py-3"
			>
				<Button link={cvPDF}>Download CV</Button>
				<button
					onclick={closeModal}
					class="cursor-pointer select-none px-2 text-6xl leading-none text-gray-300 transition-colors hover:text-white"
					aria-label="Close"
				>
					&times;
				</button>
			</div>

			<!-- Scrollable PDF Content -->
			<div class="flex-1 overflow-hidden bg-[rgb(var(--background))] px-1 pb-4 md:px-2 lg:px-4">
				<PDFViewer {cvPDF} />
			</div>
		</div>
	</div>
{/if}

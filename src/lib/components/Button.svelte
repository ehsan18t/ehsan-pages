<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		class?: string;
		link?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { id, class: className, link, children, onclick }: Props = $props();

	function handleClick(event: MouseEvent) {
		const button = event.currentTarget as HTMLButtonElement;
		const circle = document.createElement('span');
		const diameter = Math.max(button.clientWidth, button.clientHeight);
		const radius = diameter / 2;

		circle.style.width = circle.style.height = `${diameter}px`;
		circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
		circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
		circle.classList.add('ripple');

		// Remove existing ripple if present
		const ripple = button.getElementsByClassName('ripple')[0];
		if (ripple) {
			ripple.remove();
		}

		// Append the new ripple effect
		button.appendChild(circle);

		if (link) {
			window.open(link, '_blank')?.focus();
		}

		onclick?.(event);
	}
</script>

<button {id} class="ripple-button {className}" onclick={handleClick}>
	{#if children}
		{@render children()}
	{:else}
		Click Me
	{/if}
</button>

<style>
	@reference "../../routes/layout.css";

	/* Styling for the button */
	.ripple-button {
		@apply relative cursor-pointer overflow-hidden rounded-lg border-0 px-5 py-3.5 font-bold leading-tight transition duration-300 ease-in-out;
		@apply border-2 border-accent-500 bg-accent-bg/30 text-accent-text hover:bg-accent-bg/60;
	}

	/* Styling for the ripple effect */
	:global(.ripple) {
		@apply pointer-events-none absolute rounded-full;

		--ripple-color: rgba(255, 255, 255, 0.6);
		--ripple-scale: 4;
		--ripple-duration: 600ms;

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

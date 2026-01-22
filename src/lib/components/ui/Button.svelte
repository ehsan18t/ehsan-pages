<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		class?: string;
		link?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { id, class: className = '', link, children, onclick }: Props = $props();

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

<button
	{id}
	class="relative cursor-pointer overflow-hidden rounded-lg border-2 border-accent-500 bg-accent-bg/30
		px-5 py-3.5 leading-tight font-bold text-accent-text transition duration-300 ease-in-out
		hover:bg-accent-bg/60 {className}"
	onclick={handleClick}
>
	{#if children}
		{@render children()}
	{:else}
		Click Me
	{/if}
</button>

<style>
	/* Ripple effect styling - must be global to target dynamically created elements */
	:global(.ripple) {
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

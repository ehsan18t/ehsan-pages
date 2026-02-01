<script lang="ts">
	/**
	 * TechIcon Component - Premium positioned tech icon with glass effect
	 *
	 * Features glass morphism container and gentle floating animation.
	 * Position using top/left/right/bottom percentages for responsive placement.
	 */
	import { viewportAnimation } from '$lib/actions';
	import Icon from '@iconify/svelte';

	interface Props {
		/** Iconify icon name (e.g., 'mdi:react', 'simple-icons:nextdotjs') */
		icon: string;
		/** Size in rem units (container size, icon will be 60% of this) */
		size?: number;
		/** Animation delay in seconds for staggered floating effect */
		delay?: number;
		/** Float animation duration in seconds */
		floatDuration?: number;
	}

	let { icon, size = 3, delay = 0, floatDuration = 6 }: Props = $props();
</script>

<div
	use:viewportAnimation={{ rootMargin: '100px' }}
	class="tech-icon-wrapper"
	style="
		--size: {size}rem;
		--delay: {delay}s;
		--float-duration: {floatDuration}s;
	"
>
	<!-- Outer glow -->
	<div class="icon-glow"></div>

	<!-- Glass container -->
	<div class="icon-container">
		<!-- Inner glow ring -->
		<div class="icon-ring"></div>

		<!-- Icon -->
		<Icon {icon} class="icon-inner" />
	</div>
</div>

<style lang="postcss">
	@reference "$routes/layout.css";

	.tech-icon-wrapper {
		width: var(--size);
		height: var(--size);
		animation: float var(--float-duration) ease-in-out infinite;
		animation-delay: var(--delay);
		will-change: transform;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	/* Outer glow effect */
	.icon-glow {
		@apply absolute rounded-full;
		inset: -25%;
		background: radial-gradient(circle, oklch(var(--accent-500) / 0.35) 0%, transparent 60%);
		filter: blur(12px);
		animation: pulse-glow 4s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	/* Glass morphism container */
	.icon-container {
		@apply relative flex size-full items-center justify-center rounded-xl;
		background: linear-gradient(
			135deg,
			oklch(var(--accent-900) / 0.5) 0%,
			oklch(var(--accent-950) / 0.25) 100%
		);
		border: 1px solid oklch(var(--accent-500) / 0.35);
		backdrop-filter: blur(10px);
		box-shadow:
			0 8px 32px oklch(var(--accent-900) / 0.4),
			inset 0 1px 0 oklch(var(--accent-300) / 0.15),
			0 0 30px oklch(var(--accent-500) / 0.2);
		transition: all 0.3s ease;
	}

	.tech-icon-wrapper:hover .icon-container {
		border-color: oklch(var(--accent-500) / 0.6);
		box-shadow:
			0 8px 32px oklch(var(--accent-900) / 0.5),
			inset 0 1px 0 oklch(var(--accent-300) / 0.2),
			0 0 40px oklch(var(--accent-500) / 0.35);
		transform: scale(1.05);
	}

	/* Subtle inner ring */
	.icon-ring {
		@apply pointer-events-none absolute rounded-lg;
		inset: 3px;
		border: 1px solid oklch(var(--accent-500) / 0.2);
	}

	/* Icon styling */
	.tech-icon-wrapper :global(.icon-inner) {
		@apply relative z-10 text-accent-text;
		width: 55%;
		height: 55%;
		filter: drop-shadow(0 0 8px oklch(var(--accent-500) / 0.6));
	}

	/* Floating animation */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0) rotate(0deg);
		}
		25% {
			transform: translateY(-8px) rotate(1deg);
		}
		50% {
			transform: translateY(-4px) rotate(0deg);
		}
		75% {
			transform: translateY(-12px) rotate(-1deg);
		}
	}

	/* Glow pulse animation */
	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 0.9;
			transform: scale(1.15);
		}
	}

	/* Reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.tech-icon-wrapper,
		.icon-glow {
			animation: none;
		}
	}
</style>

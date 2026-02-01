<script lang="ts">
	/**
	 * Profile Component - Premium animated profile with layered effects
	 * Features: Glow pulse, rotating gradient border, status indicator
	 */
	import { viewportAnimation } from '$lib/actions';
	import meImage from '$lib/assets/images/me.png';

	const altText = 'Ehsan Khan';
</script>

<div class="profile-wrapper">
	<!-- Outer glow ring -->
	<div class="glow-ring"></div>

	<!-- Main profile container -->
	<div class="profile-container" use:viewportAnimation={{ rootMargin: '100px' }}>
		<!-- Animated gradient border -->
		<div class="gradient-border"></div>

		<!-- Inner ring accent -->
		<div class="inner-ring"></div>

		<!-- Profile image -->
		<div class="image-wrapper">
			<img src={meImage} alt={altText} loading="eager" decoding="async" fetchpriority="high" />
		</div>

		<!-- Status indicator -->
		<div class="status-indicator">
			<span class="status-dot"></span>
			<span class="status-text">Available</span>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "$routes/layout.css";

	.profile-wrapper {
		@apply relative flex items-center justify-center p-4 select-none sm:p-6 md:p-8;
	}

	/* Outer glow effect */
	.glow-ring {
		@apply absolute size-50 animate-[pulseGlow_4s_ease-in-out_infinite] rounded-full blur-[20px] sm:size-65 md:size-85 lg:size-100;
		background: radial-gradient(circle, oklch(var(--accent-500) / 0.15) 0%, transparent 70%);
	}

	/* Main container */
	.profile-container {
		@apply relative flex size-40 items-center justify-center sm:size-47.5 md:size-60 lg:size-70;
	}

	/* Animated gradient border */
	.gradient-border {
		@apply absolute rounded-full will-change-transform;
		inset: -3px;
		background: conic-gradient(
			from 0deg,
			oklch(var(--accent-900)),
			oklch(var(--accent-500)),
			oklch(var(--accent-300)),
			oklch(var(--accent-500)),
			oklch(var(--accent-900))
		);
		animation: rotateBorder 6s linear infinite;
		-webkit-mask: radial-gradient(
			farthest-side,
			transparent calc(100% - 3px),
			black calc(100% - 3px)
		);
		mask: radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px));
	}

	@media (min-width: 640px) {
		.gradient-border {
			inset: -4px;
			-webkit-mask: radial-gradient(
				farthest-side,
				transparent calc(100% - 4px),
				black calc(100% - 4px)
			);
			mask: radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px));
		}
	}

	@media (min-width: 768px) {
		.gradient-border {
			inset: -6px;
			-webkit-mask: radial-gradient(
				farthest-side,
				transparent calc(100% - 5px),
				black calc(100% - 5px)
			);
			mask: radial-gradient(farthest-side, transparent calc(100% - 5px), black calc(100% - 5px));
		}
	}

	/* Inner ring accent */
	.inner-ring {
		@apply absolute rounded-full border border-[oklch(var(--accent-500)/0.3)];
		inset: 4px;
	}

	@media (min-width: 640px) {
		.inner-ring {
			inset: 6px;
		}
	}

	@media (min-width: 768px) {
		.inner-ring {
			inset: 8px;
		}
	}

	/* Image wrapper */
	.image-wrapper {
		@apply relative z-10 overflow-hidden rounded-full;
		width: calc(100% - 12px);
		height: calc(100% - 12px);
	}

	@media (min-width: 640px) {
		.image-wrapper {
			width: calc(100% - 18px);
			height: calc(100% - 18px);
		}
	}

	@media (min-width: 768px) {
		.image-wrapper {
			width: calc(100% - 24px);
			height: calc(100% - 24px);
		}
	}

	.image-wrapper img {
		@apply size-full bg-transparent object-cover;
	}

	/* Status indicator */
	.status-indicator {
		@apply absolute z-20 flex items-center gap-1 rounded-[20px] border border-[oklch(var(--accent-500)/0.5)] px-2 py-0.75 backdrop-blur-md sm:gap-1.5 sm:px-2.5 sm:py-1 md:gap-1.5 md:px-3.5 md:py-1.25;
		bottom: 10px;
		right: 0;
		background: rgb(var(--background) / 0.85);
		box-shadow:
			0 4px 16px rgb(0 0 0 / 0.25),
			inset 0 1px 0 rgb(255 255 255 / 0.1);
	}

	@media (min-width: 640px) {
		.status-indicator {
			bottom: 12px;
			right: 5px;
		}
	}

	@media (min-width: 768px) {
		.status-indicator {
			bottom: 15px;
			right: 5px;
		}
	}

	.status-dot {
		@apply size-1.5 animate-[statusPulse_2s_ease-in-out_infinite] rounded-full bg-green-500 sm:size-1.75 md:size-2;
	}

	.status-text {
		@apply text-[0.55rem] font-medium tracking-wide text-accent-text uppercase sm:text-[0.6rem] md:text-[0.7rem];
	}

	/* Keyframes */
	@keyframes rotateBorder {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulseGlow {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	}

	@keyframes statusPulse {
		0%,
		100% {
			opacity: 1;
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
		}
		50% {
			opacity: 0.8;
			box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.gradient-border,
		.glow-ring,
		.status-dot {
			animation: none;
		}
	}
</style>

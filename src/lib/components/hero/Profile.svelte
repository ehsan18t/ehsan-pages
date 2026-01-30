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

	<!-- Decorative elements -->
	<div class="orbit-dot dot-1"></div>
	<div class="orbit-dot dot-2"></div>
	<div class="orbit-dot dot-3"></div>
</div>

<style>
	.profile-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		user-select: none;
	}

	@media (min-width: 640px) {
		.profile-wrapper {
			padding: 1.5rem;
		}
	}

	@media (min-width: 768px) {
		.profile-wrapper {
			padding: 2rem;
		}
	}

	/* Outer glow effect */
	.glow-ring {
		position: absolute;
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: radial-gradient(circle, oklch(var(--accent-500) / 0.15) 0%, transparent 70%);
		filter: blur(20px);
		animation: pulseGlow 4s ease-in-out infinite;
	}

	@media (min-width: 640px) {
		.glow-ring {
			width: 260px;
			height: 260px;
		}
	}

	@media (min-width: 768px) {
		.glow-ring {
			width: 340px;
			height: 340px;
		}
	}

	@media (min-width: 1024px) {
		.glow-ring {
			width: 400px;
			height: 400px;
		}
	}

	/* Main container */
	.profile-container {
		position: relative;
		width: 160px;
		height: 160px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (min-width: 640px) {
		.profile-container {
			width: 190px;
			height: 190px;
		}
	}

	@media (min-width: 768px) {
		.profile-container {
			width: 240px;
			height: 240px;
		}
	}

	@media (min-width: 1024px) {
		.profile-container {
			width: 280px;
			height: 280px;
		}
	}

	/* Animated gradient border */
	.gradient-border {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		padding: 4px;
		background: conic-gradient(
			from 0deg,
			oklch(var(--accent-900)),
			oklch(var(--accent-500)),
			oklch(var(--accent-300)),
			oklch(var(--accent-500)),
			oklch(var(--accent-900))
		);
		animation: rotateBorder 6s linear infinite;
		will-change: transform;
	}

	.gradient-border::before {
		content: '';
		position: absolute;
		inset: 4px;
		border-radius: 50%;
		background: rgb(var(--background));
	}

	/* Inner ring accent */
	.inner-ring {
		position: absolute;
		inset: 8px;
		border-radius: 50%;
		border: 1px solid oklch(var(--accent-500) / 0.3);
	}

	/* Image wrapper */
	.image-wrapper {
		position: relative;
		width: calc(100% - 24px);
		height: calc(100% - 24px);
		border-radius: 50%;
		overflow: hidden;
		z-index: 10;
	}

	.image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: rgb(var(--background));
	}

	/* Status indicator */
	.status-indicator {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		background: rgb(var(--background) / 0.9);
		backdrop-filter: blur(8px);
		border: 1px solid oklch(var(--accent-500) / 0.3);
		border-radius: 20px;
		z-index: 20;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background: #22c55e;
		border-radius: 50%;
		animation: statusPulse 2s ease-in-out infinite;
	}

	.status-text {
		font-size: 0.7rem;
		font-weight: 500;
		color: oklch(var(--accent-text));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Orbit dots */
	.orbit-dot {
		position: absolute;
		width: 6px;
		height: 6px;
		background: oklch(var(--accent-500));
		border-radius: 50%;
		box-shadow: 0 0 10px oklch(var(--accent-500) / 0.5);
		animation: orbitFloat 20s linear infinite;
	}

	.dot-1 {
		top: 10%;
		left: 15%;
		animation-delay: 0s;
	}

	.dot-2 {
		top: 20%;
		right: 10%;
		animation-delay: -7s;
	}

	.dot-3 {
		bottom: 15%;
		right: 20%;
		animation-delay: -14s;
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

	@keyframes orbitFloat {
		0% {
			transform: translateY(0) scale(1);
			opacity: 0.6;
		}
		25% {
			transform: translateY(-10px) scale(1.1);
			opacity: 1;
		}
		50% {
			transform: translateY(0) scale(1);
			opacity: 0.6;
		}
		75% {
			transform: translateY(10px) scale(0.9);
			opacity: 0.4;
		}
		100% {
			transform: translateY(0) scale(1);
			opacity: 0.6;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.gradient-border,
		.glow-ring,
		.status-dot,
		.orbit-dot {
			animation: none;
		}
	}
</style>

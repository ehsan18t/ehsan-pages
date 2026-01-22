<script lang="ts">
	let isExiting = $state(false);
</script>

<div
	id="hero-loader"
	class="loader-container fixed inset-0 z-9999 m-4 box-border flex h-dvh w-dvw items-center justify-center overflow-hidden bg-background"
	class:exit={isExiting}
>
	<div class="z-2 flex flex-col items-center gap-8">
		<!-- Logo with E and K -->
		<div class="logo-container relative">
			<svg width="150" height="150" viewBox="0 0 150 150" class="logo-svg">
				<!-- Background circle -->
				<circle
					cx="75"
					cy="75"
					r="70"
					class="logo-circle"
					fill="none"
					stroke="var(--loader-gold)"
					stroke-width="2"
				></circle>

				<!-- E Letter -->
				<path
					class="letter letter-e"
					d="M 26.287 36.346 L 63.004 35.714 L 63.509 50.346 L 41.424 47.568 L 37.383 63.47 L 59.346 62.586 L 59.094 77.219 L 38.015 78.355 L 40.414 95.647 L 62.878 90.342 L 61.868 106.237 L 26.287 106.869 L 26.287 36.346 Z"
					fill="none"
					stroke="var(--loader-gold)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					transform="matrix(1.0000000000000002, 0, 0, 1.0000000000000002, 1.7763568394002505e-15, 3.552713678800501e-15)"
				></path>

				<!-- K Letter -->
				<path
					class="letter letter-k"
					d="M 73.441 48.13 L 91.725 51.068 L 88.253 79.245 L 105.998 51.068 L 122.179 51.068 L 96.703 83.648 L 123.381 111.691 L 105.998 120.505 L 88.119 92.996 L 91.725 120.505 L 77.447 120.505 L 73.441 48.13 Z"
					fill="none"
					stroke="var(--loader-gold)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					transform="matrix(1.0000000000000002, 0, 0, 1.0000000000000002, 1.7763568394002505e-15, 3.552713678800501e-15)"
				></path>
			</svg>
		</div>

		<!-- Name -->
		<div class="h-10 overflow-hidden md:h-8">
			<div
				class="name flex gap-2 text-[1.8rem] font-bold tracking-wider md:text-2xl"
				style="color: var(--loader-gold); filter: drop-shadow(0 0 2px var(--loader-gold-glow));"
			>
				<span class="name-char">E</span>
				<span class="name-char">H</span>
				<span class="name-char">S</span>
				<span class="name-char">A</span>
				<span class="name-char">N</span>
				<span class="name-char">&nbsp;</span>
				<span class="name-char">&nbsp;</span>
				<span class="name-char">K</span>
				<span class="name-char">H</span>
				<span class="name-char">A</span>
				<span class="name-char">N</span>
			</div>
		</div>
	</div>

	<!-- Background particles -->
	<div class="particles absolute inset-0">
		<div class="particle p1"></div>
		<div class="particle p2"></div>
		<div class="particle p3"></div>
		<div class="particle p4"></div>
		<div class="particle p5"></div>
		<div class="particle p6"></div>
	</div>
</div>

<style>
	@reference "../../../routes/layout.css";

	/* Animation variables using theme tokens */
	:root {
		--circle-dash: 440;
		--letter-dash: 370;
		--base-delay: 0.6s;
		--delay-increment: 0.05s;
	}

	/* Logo animations */
	.logo-svg {
		transform-origin: center;
		filter: drop-shadow(0 0 3px var(--loader-gold-glow));
		animation: logoReveal 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
		will-change: transform, opacity;
		backface-visibility: hidden;
	}

	.logo-circle {
		stroke-dasharray: var(--circle-dash);
		stroke-dashoffset: var(--circle-dash);
		animation: drawCircle 1s ease-out forwards;
	}

	.letter {
		stroke-dasharray: var(--letter-dash);
		stroke-dashoffset: var(--letter-dash);
		animation: drawLetter 1s ease-out forwards;
	}

	.letter-e {
		animation-delay: 0.2s;
	}

	.letter-k {
		animation-delay: 0.3s;
	}

	/* Name character animations */
	.name-char {
		@apply inline-block opacity-0;
		transform: translate3d(0, 20px, 0);
		animation: revealChar 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
		animation-delay: calc(var(--base-delay) + var(--char-index, 0) * var(--delay-increment));
		will-change: transform, opacity;
		backface-visibility: hidden;
	}

	.name-char:nth-child(1) {
		--char-index: 0;
	}
	.name-char:nth-child(2) {
		--char-index: 1;
	}
	.name-char:nth-child(3) {
		--char-index: 2;
	}
	.name-char:nth-child(4) {
		--char-index: 3;
	}
	.name-char:nth-child(5) {
		--char-index: 4;
	}
	.name-char:nth-child(6) {
		--char-index: 5;
	}
	.name-char:nth-child(7) {
		--char-index: 6;
	}
	.name-char:nth-child(8) {
		--char-index: 7;
	}
	.name-char:nth-child(9) {
		--char-index: 8;
	}
	.name-char:nth-child(10) {
		--char-index: 9;
	}
	.name-char:nth-child(11) {
		--char-index: 10;
	}

	/* Particle base styles */
	.particle {
		@apply absolute rounded-full opacity-0;
		background: radial-gradient(circle, var(--loader-gold-glow) 0%, transparent 70%);
		animation: floatParticle 1.8s ease-out;
		will-change: transform, opacity;
		backface-visibility: hidden;
	}

	.p1 {
		@apply top-[20%] left-[10%] size-37.5;
		animation-delay: 0.1s;
	}
	.p2 {
		@apply top-[60%] left-[15%] size-25;
		animation-delay: 0.3s;
	}
	.p3 {
		@apply top-[25%] right-[15%] size-30;
		animation-delay: 0.5s;
	}
	.p4 {
		@apply right-[20%] bottom-[20%] size-20;
		animation-delay: 0.2s;
	}
	.p5 {
		@apply bottom-[10%] left-[40%] size-45;
		animation-delay: 0.1s;
	}
	.p6 {
		@apply top-[10%] right-[35%] size-35;
		animation-delay: 0.4s;
	}

	/* Keyframes */
	@keyframes logoReveal {
		from {
			transform: scale3d(0.92, 0.92, 1);
			opacity: 0;
		}
		to {
			transform: scale3d(1, 1, 1);
			opacity: 1;
		}
	}

	@keyframes drawCircle {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes drawLetter {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes revealChar {
		0% {
			opacity: 0;
			transform: translate3d(0, 15px, 0);
		}
		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
	}

	@keyframes floatParticle {
		0% {
			transform: translate3d(0, 5px, 0) scale3d(0.95, 0.95, 1);
			opacity: 0;
		}
		30% {
			opacity: 0.2;
		}
		100% {
			transform: translate3d(0, -5px, 0) scale3d(1.05, 1.05, 1);
			opacity: 0;
		}
	}

	@keyframes hideChar {
		0% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
		100% {
			opacity: 0;
			transform: translate3d(0, 15px, 0);
		}
	}

	@keyframes reverseFloatParticle {
		0% {
			transform: translate3d(0, -5px, 0) scale3d(1.05, 1.05, 1);
			opacity: 0;
		}
		30% {
			opacity: 0.2;
		}
		100% {
			transform: translate3d(0, 5px, 0) scale3d(0.95, 0.95, 1);
			opacity: 0;
		}
	}

	@keyframes reverseDrawCircle {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: var(--circle-dash);
		}
	}

	@keyframes reverseDrawLetter {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: var(--letter-dash);
		}
	}

	/* Exit animations */
	.loader-container.exit .logo-circle {
		animation: reverseDrawCircle 0.8s ease-in forwards;
	}

	.loader-container.exit .letter {
		animation: reverseDrawLetter 0.6s ease-in forwards;
	}

	.loader-container.exit .name-char {
		animation: hideChar 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
	}

	.loader-container.exit .particle {
		animation: reverseFloatParticle 1s ease-in forwards;
	}

	/* Mobile particle scaling */
	@media (max-width: 768px) {
		.particle {
			transform: scale3d(0.8, 0.8, 1);
			max-width: 120px;
			max-height: 120px;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion) {
		.logo-svg,
		.logo-circle,
		.letter,
		.name-char,
		.particle {
			animation-duration: 0.1s !important;
		}

		.particles {
			display: none;
		}
	}
</style>

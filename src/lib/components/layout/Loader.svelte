<script lang="ts">
	// CSS-only animations for optimal performance
	// Exit animation triggered by .exit class added from +page.svelte
</script>

<!--
  LOADER COMPONENT
  ================
  
  Uses the site's accent color system (teal/cyan, not gold)
  Includes exit animation triggered by .exit class
  
  Architecture:
  - logo-area is fixed size container for orbital elements
  - All rings/particles orbit around logo center
  - Exit class reverses all animations
-->

<div id="hero-loader" class="loader">
	<!-- Background -->
	<div class="bg">
		<div class="grid-pattern"></div>
		<div class="center-glow"></div>
	</div>

	<!-- Centered content stack -->
	<div class="center-stack">
		<!-- Logo area - anchor for orbitals -->
		<div class="logo-area">
			<!-- Orbital rings -->
			<div class="r1 ring"></div>
			<div class="r2 ring"></div>
			<div class="r3 ring"></div>

			<!-- Orbiting particles -->
			<div class="particle p1"></div>
			<div class="particle p2"></div>

			<!-- Logo glow -->
			<div class="logo-glow"></div>

			<!-- SVG Logo -->
			<svg class="logo-svg" width="140" height="140" viewBox="0 0 150 150">
				<defs>
					<linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="oklch(var(--accent-text))" />
						<stop offset="50%" stop-color="oklch(var(--accent-300))" />
						<stop offset="100%" stop-color="oklch(var(--accent-text))" />
					</linearGradient>
					<filter id="svgGlow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="2" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<circle
					cx="75"
					cy="75"
					r="70"
					class="svg-circle"
					fill="none"
					stroke="url(#accentGrad)"
					stroke-width="2"
					filter="url(#svgGlow)"
				/>

				<path
					class="svg-letter svg-e"
					d="M 26.287 36.346 L 63.004 35.714 L 63.509 50.346 L 41.424 47.568 L 37.383 63.47 L 59.346 62.586 L 59.094 77.219 L 38.015 78.355 L 40.414 95.647 L 62.878 90.342 L 61.868 106.237 L 26.287 106.869 L 26.287 36.346 Z"
					fill="none"
					stroke="url(#accentGrad)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					filter="url(#svgGlow)"
				/>

				<path
					class="svg-letter svg-k"
					d="M 73.441 48.13 L 91.725 51.068 L 88.253 79.245 L 105.998 51.068 L 122.179 51.068 L 96.703 83.648 L 123.381 111.691 L 105.998 120.505 L 88.119 92.996 L 91.725 120.505 L 77.447 120.505 L 73.441 48.13 Z"
					fill="none"
					stroke="url(#accentGrad)"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
					filter="url(#svgGlow)"
				/>
			</svg>
		</div>

		<!-- Name text -->
		<div class="name-text">
			{#each 'EHSAN KHAN'.split('') as char, i (i)}
				<span class="char" style="--delay: {i}">{char === ' ' ? '\u00A0' : char}</span>
			{/each}
		</div>

		<!-- Progress bar -->
		<div class="progress-track">
			<div class="progress-fill"></div>
		</div>
	</div>

	<!-- Corner decorations -->
	<div class="corner tl"></div>
	<div class="corner tr"></div>
	<div class="corner bl"></div>
	<div class="corner br"></div>

	<!-- Scanlines -->
	<div class="scanlines"></div>
</div>

<style>
	@reference "$routes/layout.css";

	/* ========================================
	   VARIABLES - Using site's accent system
	   ======================================== */
	.loader {
		/* Accent colors from site theme (teal) */
		--accent-color: oklch(var(--accent-text));
		--accent-bright: oklch(var(--accent-300));
		--accent-dim: oklch(var(--accent-text) / 0.2);
		--accent-glow: oklch(var(--accent-text) / 0.08);

		/* Logo area sized to contain largest ring */
		--logo-area-size: 320px;
		--logo-size: 140px;

		/* Ring sizes */
		--ring1: 180px;
		--ring2: 240px;
		--ring3: 300px;

		/* Particle orbit radii */
		--orbit1: 90px;
		--orbit2: 120px;

		/* Animation timing */
		--draw-duration: 1s;
		--base-delay: 0.5s;
		--exit-duration: 0.6s;
	}

	/* ========================================
	   MAIN CONTAINER
	   ======================================== */
	.loader {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(var(--background));
		contain: strict;
		isolation: isolate;
	}

	/* ========================================
	   BACKGROUND
	   ======================================== */
	.bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.grid-pattern {
		position: absolute;
		inset: -100px;
		background-image:
			linear-gradient(var(--accent-dim) 1px, transparent 1px),
			linear-gradient(90deg, var(--accent-dim) 1px, transparent 1px);
		background-size: 50px 50px;
		opacity: 0;
		animation: fadeIn 0.8s ease-out 0.1s forwards;
	}

	.center-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 500px;
		height: 500px;
		transform: translate(-50%, -50%);
		background: radial-gradient(circle, var(--accent-glow) 0%, transparent 60%);
		animation: pulseGlow 3s ease-in-out infinite;
	}

	/* ========================================
	   CENTER STACK
	   ======================================== */
	.center-stack {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	/* ========================================
	   LOGO AREA - Orbital anchor
	   ======================================== */
	.logo-area {
		position: relative;
		width: var(--logo-area-size);
		height: var(--logo-area-size);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ========================================
	   ORBITAL RINGS
	   ======================================== */
	.ring {
		position: absolute;
		top: 50%;
		left: 50%;
		border-radius: 50%;
		border: 1px solid var(--accent-dim);
		opacity: 0;
	}

	.r1 {
		width: var(--ring1);
		height: var(--ring1);
		margin-top: calc(var(--ring1) / -2);
		margin-left: calc(var(--ring1) / -2);
		animation:
			fadeIn 0.4s ease-out 0.1s forwards,
			spinCW 20s linear infinite;
	}

	.r2 {
		width: var(--ring2);
		height: var(--ring2);
		margin-top: calc(var(--ring2) / -2);
		margin-left: calc(var(--ring2) / -2);
		animation:
			fadeIn 0.4s ease-out 0.2s forwards,
			spinCCW 28s linear infinite;
	}

	.r3 {
		width: var(--ring3);
		height: var(--ring3);
		margin-top: calc(var(--ring3) / -2);
		margin-left: calc(var(--ring3) / -2);
		border-style: dashed;
		animation:
			fadeIn 0.4s ease-out 0.3s forwards,
			spinCW 35s linear infinite;
	}

	/* ========================================
	   PARTICLES
	   ======================================== */
	.particle {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 6px;
		height: 6px;
		margin: -3px 0 0 -3px;
		background: var(--accent-color);
		border-radius: 50%;
		box-shadow:
			0 0 6px var(--accent-color),
			0 0 12px var(--accent-dim);
		opacity: 0;
	}

	.p1 {
		animation:
			fadeIn 0.3s ease-out 0.4s forwards,
			orbit1 10s linear 0.5s infinite;
	}

	.p2 {
		animation:
			fadeIn 0.3s ease-out 0.5s forwards,
			orbit1 10s linear 0.5s infinite;
		animation-delay:
			0.5s,
			-5s; /* Start opposite side of orbit */
	}

	/* ========================================
	   LOGO
	   ======================================== */
	.logo-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--logo-size);
		height: var(--logo-size);
		margin-top: calc(var(--logo-size) / -2);
		margin-left: calc(var(--logo-size) / -2);
		border-radius: 50%;
		background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
		filter: blur(15px);
		opacity: 0;
		animation: glowPulse 2s ease-in-out 0.3s infinite;
	}

	.logo-svg {
		position: relative;
		z-index: 5;
		opacity: 0;
		transform: scale(0.9);
		animation: logoAppear 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.1s forwards;
	}

	/* SVG path animations */
	.svg-circle {
		stroke-dasharray: 440;
		stroke-dashoffset: 440;
		animation: drawPath 0.7s ease-out 0.2s forwards;
	}

	.svg-letter {
		stroke-dasharray: 400;
		stroke-dashoffset: 400;
		animation: drawPath 0.6s ease-out forwards;
	}

	.svg-e {
		animation-delay: 0.3s;
	}

	.svg-k {
		animation-delay: 0.5s;
	}

	/* ========================================
	   NAME TEXT
	   ======================================== */
	.name-text {
		display: flex;
		justify-content: center;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--accent-color);
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.char {
		display: inline-block;
		opacity: 0;
		transform: translateY(15px);
		animation: charAppear 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
		animation-delay: calc(0.6s + var(--delay) * 0.04s);
	}

	/* ========================================
	   PROGRESS BAR
	   ======================================== */
	.progress-track {
		width: 160px;
		height: 2px;
		background: var(--accent-dim);
		border-radius: 2px;
		overflow: hidden;
		opacity: 0;
		animation: fadeIn 0.3s ease-out 0.8s forwards;
	}

	.progress-fill {
		width: 0%;
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--accent-color),
			var(--accent-bright),
			var(--accent-color)
		);
		border-radius: 2px;
		box-shadow: 0 0 8px var(--accent-color);
		animation: fillProgress 1s ease-out 0.9s forwards;
	}

	/* ========================================
	   CORNER DECORATIONS
	   ======================================== */
	.corner {
		position: absolute;
		width: 40px;
		height: 40px;
		opacity: 0;
		animation: fadeIn 0.5s ease-out forwards;
	}

	.corner::before,
	.corner::after {
		content: '';
		position: absolute;
		background: var(--accent-color);
	}

	.corner::before {
		width: 16px;
		height: 1px;
	}

	.corner::after {
		width: 1px;
		height: 16px;
	}

	.tl {
		top: 24px;
		left: 24px;
		animation-delay: 0.2s;
	}
	.tl::before,
	.tl::after {
		top: 0;
		left: 0;
	}

	.tr {
		top: 24px;
		right: 24px;
		animation-delay: 0.3s;
	}
	.tr::before {
		top: 0;
		right: 0;
	}
	.tr::after {
		top: 0;
		right: 0;
	}

	.bl {
		bottom: 24px;
		left: 24px;
		animation-delay: 0.4s;
	}
	.bl::before {
		bottom: 0;
		left: 0;
	}
	.bl::after {
		bottom: 0;
		left: 0;
	}

	.br {
		bottom: 24px;
		right: 24px;
		animation-delay: 0.5s;
	}
	.br::before {
		bottom: 0;
		right: 0;
	}
	.br::after {
		bottom: 0;
		right: 0;
	}

	/* ========================================
	   SCANLINES
	   ======================================== */
	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent 0px,
			transparent 2px,
			rgba(0, 0, 0, 0.015) 2px,
			rgba(0, 0, 0, 0.015) 4px
		);
		pointer-events: none;
	}

	/* ========================================
	   KEYFRAMES - ENTER ANIMATIONS
	   ======================================== */
	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}

	@keyframes pulseGlow {
		0%,
		100% {
			opacity: 0.5;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 0.7;
			transform: translate(-50%, -50%) scale(1.03);
		}
	}

	@keyframes spinCW {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes spinCCW {
		to {
			transform: rotate(-360deg);
		}
	}

	@keyframes orbit1 {
		from {
			transform: rotate(0deg) translateX(var(--orbit1)) rotate(0deg);
		}
		to {
			transform: rotate(360deg) translateX(var(--orbit1)) rotate(-360deg);
		}
	}

	@keyframes orbit2 {
		from {
			transform: rotate(180deg) translateX(var(--orbit2)) rotate(-180deg);
		}
		to {
			transform: rotate(-180deg) translateX(var(--orbit2)) rotate(180deg);
		}
	}

	@keyframes glowPulse {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.05);
		}
	}

	@keyframes logoAppear {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes drawPath {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes charAppear {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fillProgress {
		to {
			width: 100%;
		}
	}

	/* ========================================
	   EXIT ANIMATIONS
	   Based on original working pattern:
	   All elements reverse simultaneously (no staggered delays)
	   ======================================== */

	/* SVG circle undraws */
	:global(.loader.exit) .svg-circle {
		animation: reverseDrawCircle 0.8s ease-in forwards;
	}

	/* SVG letters undraw */
	:global(.loader.exit) .svg-letter {
		animation: reverseDrawLetter 0.6s ease-in forwards;
	}

	/* Logo scales back down */
	:global(.loader.exit) .logo-svg {
		animation: reverseLogo 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
	}

	/* Characters slide back down */
	:global(.loader.exit) .char {
		animation: hideChar 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
	}

	/* Progress bar shrinks - starts from current width (100%) */
	:global(.loader.exit) .progress-fill {
		width: 100%;
		animation: reverseProgress 0.5s ease-in forwards;
	}

	:global(.loader.exit) .progress-track {
		opacity: 1;
		animation: reverseFade 0.4s ease-in 0.4s forwards;
	}

	/* Rings fade */
	:global(.loader.exit) .ring {
		animation: reverseFade 0.5s ease-in forwards;
	}

	/* Particles fade */
	:global(.loader.exit) .particle {
		animation: reverseFade 0.4s ease-in forwards;
	}

	/* Logo glow fades */
	:global(.loader.exit) .logo-glow {
		animation: reverseFade 0.4s ease-in forwards;
	}

	/* Corners fade */
	:global(.loader.exit) .corner {
		animation: reverseFade 0.3s ease-in forwards;
	}

	/* Grid fades */
	:global(.loader.exit) .grid-pattern {
		animation: reverseFade 0.5s ease-in forwards;
	}

	/* Center glow fades */
	:global(.loader.exit) .center-glow {
		animation: reverseFade 0.5s ease-in forwards;
	}

	/* ========================================
	   EXIT KEYFRAMES
	   Mirroring original's approach
	   ======================================== */
	@keyframes reverseDrawCircle {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: 440;
		}
	}

	@keyframes reverseDrawLetter {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: 400;
		}
	}

	@keyframes reverseLogo {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.92);
		}
	}

	@keyframes hideChar {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(15px);
		}
	}

	@keyframes reverseProgress {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}

	@keyframes reverseFade {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	/* ========================================
	   MOBILE RESPONSIVE
	   ======================================== */
	@media (max-width: 640px) {
		.loader {
			--logo-area-size: 260px;
			--logo-size: 120px;
			--ring1: 150px;
			--ring2: 200px;
			--ring3: 250px;
			--orbit1: 75px;
			--orbit2: 100px;
		}

		.logo-svg {
			width: 120px;
			height: 120px;
		}

		.center-stack {
			gap: 20px;
		}

		.name-text {
			font-size: 1.15rem;
			gap: 4px;
			letter-spacing: 0.12em;
		}

		.progress-track {
			width: 140px;
		}

		.corner {
			width: 30px;
			height: 30px;
		}

		.corner::before {
			width: 12px;
		}

		.corner::after {
			height: 12px;
		}

		.tl,
		.tr {
			top: 16px;
		}
		.bl,
		.br {
			bottom: 16px;
		}
		.tl,
		.bl {
			left: 16px;
		}
		.tr,
		.br {
			right: 16px;
		}
	}

	/* ========================================
	   REDUCED MOTION
	   ======================================== */
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
		}
	}
</style>

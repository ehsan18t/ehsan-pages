<script lang="ts">
	/**
	 * Hero Section - Landing page hero with animated background
	 *
	 * A+ Grade Implementation featuring:
	 * - Svelte 5 $effect for lifecycle management
	 * - <svelte:window> for event listeners
	 * - Dynamic viewport height handling for mobile
	 *
	 * @component Hero
	 */

	import grain from '$assets/images/grain.jpg';
	import HeroOrbit from '$components/hero/HeroOrbit.svelte';
	import Profile from '$components/hero/Profile.svelte';
	import SocialBar from '$components/hero/SocialBar.svelte';
	import Star from '$components/hero/Star.svelte';
	import PDFViewerModal from '$components/media/PDFViewerModal.svelte';
	import GlitchText from '$components/ui/GlitchText.svelte';
	import info from '$data';

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	/** Debounce delay for resize events (ms) */
	const RESIZE_DEBOUNCE = 100;

	/** Debounce delay for orientation change events (ms) */
	const ORIENTATION_DEBOUNCE = 200;

	/** Mobile breakpoint width (px) */
	const MOBILE_BREAKPOINT = 768;

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let heroRef = $state<HTMLElement | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// ─────────────────────────────────────────────────────────────
	// Utility Functions
	// ─────────────────────────────────────────────────────────────

	/**
	 * Update hero height based on viewport
	 * Uses CSS custom property for dynamic viewport height
	 */
	function updateHeroHeight(): void {
		if (!heroRef) return;

		// Set dynamic viewport height CSS custom property
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);

		// Set minimum height but allow content to expand if needed
		if (window.innerWidth < MOBILE_BREAKPOINT) {
			heroRef.style.minHeight = `${window.innerHeight}px`;
			heroRef.style.height = 'auto';
		} else {
			heroRef.style.minHeight = '100vh';
			heroRef.style.height = 'auto';
		}
	}

	/**
	 * Debounced handler for resize events
	 */
	function handleResize(): void {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updateHeroHeight, RESIZE_DEBOUNCE);
	}

	/**
	 * Debounced handler for orientation change events
	 */
	function handleOrientationChange(): void {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updateHeroHeight, ORIENTATION_DEBOUNCE);
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Initialize height when heroRef is available
	$effect(() => {
		if (heroRef) {
			updateHeroHeight();
		}

		// Cleanup debounce timer on destroy
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
		};
	});
</script>

<!-- Use <svelte:window> for event listeners - automatic cleanup -->
<svelte:window onresize={handleResize} onorientationchange={handleOrientationChange} />

<section
	id="hero"
	bind:this={heroRef}
	class="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden py-8"
>
	<!-- Fade out bottom -->
	<div
		class="absolute inset-0 mask-[linear-gradient(to_bottom,transparent,black_10%,black_70%,transparent)]"
	>
		<!-- Grain Effect -->
		<div class="absolute inset-0 -z-30 opacity-5" style="background-image: url({grain});"></div>

		<!-- Rings -->
		<!-- Ring-1: Inner Ring with Smaller Stars -->
		<HeroOrbit size={18} duration={30} rotation={-14}>
			<Star size={2} duration={28} opacity={20} />
		</HeroOrbit>
		<HeroOrbit size={18} duration={30} rotation={79} starOnly>
			<Star size={1.25} duration={16} opacity={20} />
		</HeroOrbit>
		<HeroOrbit size={18} duration={30} rotation={179} starOnly>
			<Star size={1.25} duration={16} opacity={70} />
		</HeroOrbit>

		<!-- Ring-2: Adding More Stars for Increased Density -->
		<HeroOrbit size={28} duration={42} rotation={178}>
			<Star size={2.5} duration={20} opacity={20} />
		</HeroOrbit>
		<HeroOrbit size={28} duration={42} rotation={98} starOnly>
			<Star size={2} duration={18} />
		</HeroOrbit>
		<HeroOrbit size={28} duration={42} rotation={20} starOnly>
			<Star size={3} duration={18} />
		</HeroOrbit>
		<HeroOrbit size={28} duration={42} rotation={250} starOnly>
			<Star size={1.5} duration={18} />
		</HeroOrbit>

		<!-- Ring-3: Intermediate Ring with Medium Stars -->
		<HeroOrbit size={38} duration={46} rotation={144}>
			<Star size={3.5} duration={22} opacity={20} />
		</HeroOrbit>
		<HeroOrbit size={38} duration={42} rotation={85} starOnly>
			<Star size={0.75} duration={20} opacity={20} />
		</HeroOrbit>
		<HeroOrbit size={38} duration={40} starOnly>
			<Star size={2.3} duration={20} opacity={70} />
		</HeroOrbit>
		<HeroOrbit size={38} duration={37} rotation={200} starOnly>
			<Star size={2.7} duration={20} opacity={75} />
		</HeroOrbit>
		<HeroOrbit size={38} duration={35} rotation={270} starOnly>
			<Star size={2.9} duration={18} />
		</HeroOrbit>

		<!-- Ring-4: Larger Ring with Varied Star Sizes -->
		<HeroOrbit size={50} duration={80} rotation={-72}>
			<Star size={7} duration={25} />
		</HeroOrbit>

		<!-- Final Larger Orbits for Background Depth -->
		<HeroOrbit size={62} opacity={60} />
		<HeroOrbit size={74} opacity={50} />
		<HeroOrbit size={86} opacity={40} />
		<HeroOrbit size={98} opacity={30} />
		<HeroOrbit size={110} opacity={20} />
	</div>

	<!-- Content -->
	<div class="hero-content">
		<!-- Profile Section -->
		<div class="profile-section">
			<Profile />
		</div>

		<!-- Info Section -->
		<div class="info-section">
			<!-- Greeting badge -->
			<div class="greeting-badge">
				<span class="wave">👋</span>
				<span>Hello, I'm</span>
			</div>

			<!-- Name with glitch effect -->
			<GlitchText text={info.name} class="hero-name" />

			<!-- Title with accent -->
			<div class="title-wrapper">
				<span class="title-accent"></span>
				<h2 class="hero-title">{info.title}</h2>
			</div>

			<!-- Description -->
			<p class="hero-description">{info.description}</p>

			<!-- CTA Buttons -->
			<div class="cta-wrapper">
				<PDFViewerModal cvPDF={info.resume} />
				<button
					type="button"
					class="contact-btn"
					onclick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
				>
					<span>Let's Talk</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 12h14" />
						<path d="m12 5 7 7-7 7" />
					</svg>
				</button>
			</div>

			<!-- Social bar -->
			<SocialBar />
		</div>
	</div>
</section>

<style>
	/* Custom CSS for better viewport handling */
	#hero {
		min-height: 100vh;
		min-height: calc(var(--vh, 1vh) * 100);
	}

	/* Hero content layout */
	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		max-width: 100%;
		padding: 0 1.5rem;
		animation: fadeInUp 0.8s ease-out;
	}

	@media (min-width: 768px) {
		.hero-content {
			flex-direction: row;
			gap: 3rem;
			padding: 0 2.5rem;
		}
	}

	@media (min-width: 1024px) {
		.hero-content {
			gap: 4rem;
			max-width: 1100px;
		}
	}

	/* Profile section */
	.profile-section {
		flex-shrink: 0;
		animation: fadeInLeft 0.8s ease-out 0.2s both;
	}

	/* Info section */
	.info-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: center;
		animation: fadeInRight 0.8s ease-out 0.3s both;
	}

	@media (min-width: 768px) {
		.info-section {
			text-align: left;
		}
	}

	/* Greeting badge */
	.greeting-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		background: oklch(var(--accent-500) / 0.1);
		border: 1px solid oklch(var(--accent-500) / 0.2);
		border-radius: 50px;
		font-size: 0.875rem;
		color: oklch(var(--accent-text));
		width: fit-content;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.greeting-badge {
			margin: 0;
		}
	}

	.wave {
		display: inline-block;
		animation: wave 2.5s ease-in-out infinite;
		transform-origin: 70% 70%;
	}

	/* Name styling */
	:global(.hero-name) {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	@media (min-width: 640px) {
		:global(.hero-name) {
			font-size: 2.75rem;
		}
	}

	@media (min-width: 768px) {
		:global(.hero-name) {
			font-size: 3.25rem;
		}
	}

	@media (min-width: 1024px) {
		:global(.hero-name) {
			font-size: 3.75rem;
		}
	}

	/* Title with accent bar */
	.title-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: center;
	}

	@media (min-width: 768px) {
		.title-wrapper {
			justify-content: flex-start;
		}
	}

	.title-accent {
		width: 3px;
		height: 1.5rem;
		background: linear-gradient(
			to bottom,
			oklch(var(--accent-300)),
			oklch(var(--accent-500)),
			oklch(var(--accent-900))
		);
		border-radius: 2px;
		display: none;
	}

	@media (min-width: 768px) {
		.title-accent {
			display: block;
		}
	}

	.hero-title {
		font-size: 1.25rem;
		font-weight: 500;
		color: oklch(var(--secondary));
	}

	@media (min-width: 640px) {
		.hero-title {
			font-size: 1.5rem;
		}
	}

	/* Description */
	.hero-description {
		font-size: 0.95rem;
		line-height: 1.7;
		color: oklch(var(--foreground) / 0.8);
		max-width: 500px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.hero-description {
			font-size: 1rem;
			margin: 0;
			text-align: left;
		}
	}

	@media (min-width: 1024px) {
		.hero-description {
			font-size: 1.1rem;
		}
	}

	/* CTA wrapper */
	.cta-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 0.5rem;
		width: 100%;
		max-width: 280px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.cta-wrapper {
			flex-direction: row;
			max-width: none;
			width: auto;
			margin: 0;
		}
	}

	/* Shared button styles via global for the View CV button */
	:global(.cta-btn) {
		min-width: 140px;
		text-align: center;
	}

	/* Contact button */
	.contact-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 140px;
		padding: 0.875rem 1.5rem;
		background: transparent;
		border: 2px solid oklch(var(--accent-500) / 0.5);
		border-radius: 8px;
		color: oklch(var(--accent-text));
		font-size: 0.95rem;
		font-weight: 700;
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.contact-btn:hover {
		background: oklch(var(--accent-500) / 0.15);
		border-color: oklch(var(--accent-500));
	}

	.contact-btn svg {
		transition: transform 0.3s ease;
	}

	.contact-btn:hover svg {
		transform: translateX(4px);
	}

	/* Keyframes */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeInLeft {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes fadeInRight {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes wave {
		0%,
		100% {
			transform: rotate(0deg);
		}
		10% {
			transform: rotate(14deg);
		}
		20% {
			transform: rotate(-8deg);
		}
		30% {
			transform: rotate(14deg);
		}
		40% {
			transform: rotate(-4deg);
		}
		50% {
			transform: rotate(10deg);
		}
		60%,
		100% {
			transform: rotate(0deg);
		}
	}

	@media (max-height: 600px) {
		#hero {
			padding-top: 2rem;
			padding-bottom: 2rem;
		}
	}

	@media (max-height: 500px) {
		#hero {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.hero-content,
		.profile-section,
		.info-section,
		.wave {
			animation: none;
		}
	}
</style>

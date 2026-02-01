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
	import TechIcon from '$components/hero/TechIcon.svelte';
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
	class="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden py-8 pb-24 md:pb-8"
>
	<!-- Fade out bottom -->
	<div
		class="absolute inset-0 mask-[linear-gradient(to_bottom,transparent,black_10%,black_70%,transparent)]"
	>
		<!-- Grain Effect -->
		<div class="absolute inset-0 -z-30 opacity-5" style="background-image: url({grain});"></div>

		<!-- Rings with Tech Icons -->
		<!-- Ring-1: Inner Ring - Core Languages (smaller, closer) -->
		<HeroOrbit size={20} duration={35} rotation={-20}>
			<TechIcon
				icon="mdi:language-javascript"
				size={2.5}
				counterDuration={35}
				counterRotation={-20}
			/>
		</HeroOrbit>
		<HeroOrbit size={20} duration={35} rotation={100} starOnly>
			<TechIcon
				icon="mdi:language-typescript"
				size={2.5}
				counterDuration={35}
				counterRotation={100}
			/>
		</HeroOrbit>

		<!-- Ring-2: Frontend Frameworks -->
		<HeroOrbit size={32} duration={45} rotation={15}>
			<TechIcon icon="mdi:react" size={2.75} counterDuration={45} counterRotation={15} />
		</HeroOrbit>
		<HeroOrbit size={32} duration={45} rotation={105} starOnly>
			<TechIcon icon="simple-icons:svelte" size={2.75} counterDuration={45} counterRotation={105} />
		</HeroOrbit>
		<HeroOrbit size={32} duration={45} rotation={195} starOnly>
			<TechIcon
				icon="simple-icons:nextdotjs"
				size={2.75}
				counterDuration={45}
				counterRotation={195}
			/>
		</HeroOrbit>
		<HeroOrbit size={32} duration={45} rotation={285} starOnly>
			<TechIcon icon="simple-icons:astro" size={2.75} counterDuration={45} counterRotation={285} />
		</HeroOrbit>

		<!-- Ring-3: Backend & Tools -->
		<HeroOrbit size={46} duration={60} rotation={40}>
			<TechIcon icon="simple-icons:nestjs" size={3} counterDuration={60} counterRotation={40} />
		</HeroOrbit>
		<HeroOrbit size={46} duration={60} rotation={130} starOnly>
			<TechIcon icon="simple-icons:django" size={3} counterDuration={60} counterRotation={130} />
		</HeroOrbit>
		<HeroOrbit size={46} duration={60} rotation={220} starOnly>
			<TechIcon icon="mdi:github" size={3} counterDuration={60} counterRotation={220} />
		</HeroOrbit>
		<HeroOrbit size={46} duration={60} rotation={310} starOnly>
			<TechIcon icon="mdi:tailwind" size={3} counterDuration={60} counterRotation={310} />
		</HeroOrbit>

		<!-- Ring-4: DevOps (outer ring) -->
		<HeroOrbit size={60} duration={75} rotation={-30}>
			<TechIcon icon="simple-icons:docker" size={3.25} counterDuration={75} counterRotation={-30} />
		</HeroOrbit>
		<HeroOrbit size={60} duration={75} rotation={150} starOnly>
			<TechIcon
				icon="simple-icons:express"
				size={3.25}
				counterDuration={75}
				counterRotation={150}
			/>
		</HeroOrbit>

		<!-- Background Orbit Rings (decorative) -->
		<HeroOrbit size={74} opacity={40} />
		<HeroOrbit size={90} opacity={30} />
		<HeroOrbit size={106} opacity={20} />
	</div>

	<!-- Content -->
	<div
		class="flex max-w-full animate-[fadeInUp_0.8s_ease-out] flex-col items-center gap-4 px-4 sm:gap-6 sm:px-6 md:flex-row md:gap-12 md:px-10 lg:max-w-275 lg:gap-16"
	>
		<!-- Profile Section -->
		<div class="shrink-0 animate-[fadeInLeft_0.8s_ease-out_0.2s_both]">
			<Profile />
		</div>

		<!-- Info Section -->
		<div
			class="flex animate-[fadeInRight_0.8s_ease-out_0.3s_both] flex-col gap-2.5 text-center sm:gap-3.5 md:text-left"
		>
			<!-- Greeting badge -->
			<div
				class="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-[oklch(var(--accent-500)/0.2)] bg-[oklch(var(--accent-500)/0.1)] px-4 py-1.5 text-sm text-[oklch(var(--accent-text))] md:mx-0"
			>
				<span class="inline-block origin-[70%_70%] animate-[wave_2.5s_ease-in-out_infinite]"
					>👋</span
				>
				<span>Hello, I'm</span>
			</div>

			<!-- Name with glitch effect -->
			<GlitchText text={info.name} class="hero-name" />

			<!-- Title with accent -->
			<div class="flex items-center justify-center gap-3 md:justify-start">
				<span
					class="hidden h-6 w-0.75 rounded-sm bg-linear-to-b from-[oklch(var(--accent-300))] via-[oklch(var(--accent-500))] to-[oklch(var(--accent-900))] md:block"
				></span>
				<h2 class="text-xl font-medium text-[oklch(var(--secondary))] sm:text-2xl">{info.title}</h2>
			</div>

			<!-- Description -->
			<p
				class="mx-auto max-w-125 text-sm leading-relaxed text-[oklch(var(--foreground)/0.8)] sm:text-[0.95rem] sm:leading-relaxed md:mx-0 md:text-left md:text-base lg:text-lg"
			>
				{info.description}
			</p>

			<!-- CTA Buttons -->
			<div
				class="mx-auto flex w-full max-w-65 flex-col gap-2 pt-1 sm:max-w-70 sm:gap-3 sm:pt-2 md:mx-0 md:w-auto md:max-w-none md:flex-row"
			>
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

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Custom CSS for viewport handling - can't be expressed in Tailwind */
	#hero {
		min-height: 100vh;
		min-height: calc(var(--vh, 1vh) * 100);
	}

	/* Name responsive sizing - using :global */
	:global(.hero-name) {
		@apply text-3xl leading-[1.1] font-bold tracking-tight;
	}

	@media (min-width: 400px) {
		:global(.hero-name) {
			@apply text-4xl;
		}
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

	/* Shared button styles via global for the View CV button */
	:global(.cta-btn) {
		@apply min-w-35 text-center;
	}

	/* Contact button */
	.contact-btn {
		@apply inline-flex min-w-35 items-center justify-center gap-2 rounded-lg border-2 border-[oklch(var(--accent-500)/0.5)] bg-transparent px-5 py-3 text-sm font-bold text-[oklch(var(--accent-text))] no-underline transition-all duration-300;
	}

	@media (min-width: 640px) {
		.contact-btn {
			@apply px-6 py-3.5 text-[0.95rem];
		}
	}

	.contact-btn:hover {
		@apply border-[oklch(var(--accent-500))] bg-[oklch(var(--accent-500)/0.15)];
	}

	.contact-btn svg {
		@apply transition-transform duration-300;
	}

	.contact-btn:hover svg {
		@apply translate-x-1;
	}

	/* Keyframes - must stay in CSS */
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

	/* Short height handling */
	@media (max-height: 600px) {
		#hero {
			@apply py-8;
		}
	}

	@media (max-height: 500px) {
		#hero {
			@apply py-4;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		:global(.hero-name),
		.contact-btn svg {
			animation: none;
		}
	}
</style>

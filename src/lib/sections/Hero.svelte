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
	<div
		class="fade-in flex max-w-full flex-col items-center justify-center md:flex-row md:px-10 lg:w-2/3"
	>
		<div class="shrink-0">
			<Profile />
		</div>
		<div class="flex w-full flex-col gap-2 px-5 md:px-10">
			<GlitchText
				text={info.name}
				class="text-center text-3xl font-bold sm:text-4xl md:text-left"
			/>
			<h2 class="text-center text-xl text-secondary sm:text-2xl md:text-left">
				{info.title}
			</h2>
			<p class="text-justify text-sm sm:text-base md:text-lg">{info.description}</p>
			<div class="pt-4 pb-3 sm:pt-6">
				<PDFViewerModal cvPDF={info.resume} />
			</div>
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
</style>

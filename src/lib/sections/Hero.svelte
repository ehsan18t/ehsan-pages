<script lang="ts">
	import { browser } from '$app/environment';
	import grain from '$assets/images/grain.jpg';
	import GlitchText from '$components/GlitchText.svelte';
	import HeroOrbit from '$components/HeroOrbit.svelte';
	import PDFViewerModal from '$components/PDFViewerModal.svelte';
	import Profile from '$components/Profile.svelte';
	import SocialBar from '$components/SocialBar.svelte';
	import Star from '$components/Star.svelte';
	import info from '$data';
	import { onDestroy, onMount } from 'svelte';

	let heroRef = $state<HTMLElement | null>(null);

	// Debounce utility
	function debounce<T extends (...args: any[]) => void>(func: T, timeout: number = 100) {
		let timer: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), timeout);
		};
	}

	function setHeroHeight() {
		if (!heroRef) return;

		// Use dynamic viewport height for better mobile support
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);

		// Set minimum height but allow content to expand if needed
		if (window.innerWidth < 768) {
			heroRef.style.minHeight = `${window.innerHeight}px`;
			heroRef.style.height = 'auto';
		} else {
			heroRef.style.minHeight = '100vh';
			heroRef.style.height = 'auto';
		}
	}

	const debouncedSetHeight = debounce(setHeroHeight, 100);
	const debouncedOrientationSetHeight = debounce(setHeroHeight, 200);

	onMount(() => {
		setHeroHeight();
		window.addEventListener('resize', debouncedSetHeight);
		window.addEventListener('orientationchange', debouncedOrientationSetHeight);
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('resize', debouncedSetHeight);
		window.removeEventListener('orientationchange', debouncedOrientationSetHeight);
	});
</script>

<section
	id="hero"
	bind:this={heroRef}
	class="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden py-8"
>
	<!-- Fade out bottom -->
	<div
		class="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_70%,transparent)]"
	>
		<!-- Grain Effect -->
		<div class="absolute inset-0 -z-30 opacity-5" style="background-image: url({grain});"></div>

		<!-- Rings -->
		<!-- Ring-1: Inner Ring with Smaller Stars -->
		<HeroOrbit size={18} duration={30} rotation={-14}>
			{#snippet children()}
				<Star size={2} duration={28} opacity={20} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={18} duration={30} rotation={79} starOnly>
			{#snippet children()}
				<Star size={1.25} duration={16} opacity={20} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={18} duration={30} rotation={179} starOnly>
			{#snippet children()}
				<Star size={1.25} duration={16} opacity={70} />
			{/snippet}
		</HeroOrbit>

		<!-- Ring-2: Adding More Stars for Increased Density -->
		<HeroOrbit size={28} duration={42} rotation={178}>
			{#snippet children()}
				<Star size={2.5} duration={20} opacity={20} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={28} duration={42} rotation={98} starOnly>
			{#snippet children()}
				<Star size={2} duration={18} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={28} duration={42} rotation={20} starOnly>
			{#snippet children()}
				<Star size={3} duration={18} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={28} duration={42} rotation={250} starOnly>
			{#snippet children()}
				<Star size={1.5} duration={18} />
			{/snippet}
		</HeroOrbit>

		<!-- Ring-3: Intermediate Ring with Medium Stars -->
		<HeroOrbit size={38} duration={46} rotation={144}>
			{#snippet children()}
				<Star size={3.5} duration={22} opacity={20} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={38} duration={42} rotation={85} starOnly>
			{#snippet children()}
				<Star size={0.75} duration={20} opacity={20} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={38} duration={40} starOnly>
			{#snippet children()}
				<Star size={2.3} duration={20} opacity={70} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={38} duration={37} rotation={200} starOnly>
			{#snippet children()}
				<Star size={2.7} duration={20} opacity={75} />
			{/snippet}
		</HeroOrbit>
		<HeroOrbit size={38} duration={35} rotation={270} starOnly>
			{#snippet children()}
				<Star size={2.9} duration={18} />
			{/snippet}
		</HeroOrbit>

		<!-- Ring-4: Larger Ring with Varied Star Sizes -->
		<HeroOrbit size={50} duration={80} rotation={-72}>
			{#snippet children()}
				<Star size={7} duration={25} />
			{/snippet}
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
		<div class="flex-shrink-0">
			<Profile />
		</div>
		<div class="flex w-full flex-col gap-2 px-5 md:px-10">
			<GlitchText text={info.name} class="text-center text-3xl font-bold sm:text-4xl md:text-left" />
			<h2 class="text-secondary text-center text-xl sm:text-2xl md:text-left">
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

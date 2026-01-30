<script lang="ts">
	import background from '$assets/images/background.svg';
	import Loader from '$components/layout/Loader.svelte';
	import { scrollReveal } from '$lib/actions/scrollReveal';
	import Experience from '$lib/sections/Experience.svelte';
	import Footer from '$lib/sections/Footer.svelte';
	import Hero from '$lib/sections/Hero.svelte';
	import ProjectShowcase from '$lib/sections/ProjectShowcase.svelte';
	import Skills from '$lib/sections/Skills.svelte';
	import Testimonials from '$lib/sections/Testimonials.svelte';
	import { onMount } from 'svelte';

	let showLoader = $state(true);
	let mainVisible = $state(false);

	/** Duration of the longest exit animation (ms) */
	const EXIT_ANIMATION_DURATION = 800;
	/** Time to show loader before starting exit (ms) */
	const LOADER_DISPLAY_TIME = 2000;

	onMount(() => {
		const loaderElement = document.getElementById('hero-loader');

		const timeoutId = setTimeout(() => {
			if (loaderElement) {
				loaderElement.classList.add('exit');

				// Use a fixed timeout instead of waiting for animation events
				// This is more reliable and handles edge cases (reduced motion, missing elements)
				setTimeout(() => {
					showLoader = false;
					// Remove both the class and inline style
					document.body.classList.remove('is-loading');
					document.body.style.removeProperty('overflow');
					mainVisible = true;
				}, EXIT_ANIMATION_DURATION);
			}
		}, LOADER_DISPLAY_TIME);

		return () => {
			clearTimeout(timeoutId);
			document.body.classList.remove('is-loading');
			document.body.style.removeProperty('overflow');
		};
	});
</script>

<svelte:head>
	<title>Ehsan Khan | Full Stack Web Developer</title>
</svelte:head>

{#if showLoader}
	<Loader />
{/if}

<main
	id="main-content"
	class="transition-opacity duration-500 ease-out"
	style:opacity={mainVisible ? 1 : 0}
	style:pointer-events={mainVisible ? 'auto' : 'none'}
>
	<div class="relative">
		<!-- Hero section - always visible, no scroll animation needed -->
		<div class="relative z-10 bg-background">
			<Hero />
		</div>

		<img
			src={background}
			alt=""
			id="background"
			fetchpriority="high"
			aria-hidden="true"
			decoding="async"
		/>

		<!-- Skills section - fades in on scroll -->
		<div class="relative z-1 bg-linear-to-b from-background via-background/80 to-transparent">
			<div use:scrollReveal={{ y: 60, duration: 0.8 }}>
				<Skills />
			</div>
		</div>

		<!-- Experience section -->
		<div use:scrollReveal={{ y: 60, duration: 0.8 }}>
			<Experience />
		</div>

		<!-- Projects section -->
		<div use:scrollReveal={{ y: 60, duration: 0.8 }}>
			<ProjectShowcase />
		</div>

		<!-- Testimonials section -->
		<div use:scrollReveal={{ y: 60, duration: 0.8 }}>
			<Testimonials />
		</div>

		<!-- Footer section -->
		<div use:scrollReveal={{ y: 40, duration: 0.6 }}>
			<Footer />
		</div>
	</div>
</main>

<style>
	#background {
		user-select: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		filter: blur(100px);
	}
</style>

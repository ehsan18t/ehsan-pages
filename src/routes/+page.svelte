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

	onMount(() => {
		// Hide body overflow during loader
		document.body.style.overflow = 'hidden';

		const loaderElement = document.getElementById('hero-loader');

		const timeoutId = setTimeout(() => {
			if (loaderElement) {
				loaderElement.classList.add('exit');

				// Wait for exit animations
				Promise.all(
					Array.from(loaderElement.getElementsByClassName('logo-circle'))
						.concat(
							Array.from(loaderElement.getElementsByClassName('letter')),
							Array.from(loaderElement.getElementsByClassName('name-char')),
							Array.from(loaderElement.getElementsByClassName('particle'))
						)
						.map(
							(el) => new Promise((res) => el.addEventListener('animationend', res, { once: true }))
						)
				).then(() => {
					showLoader = false;
					document.body.style.removeProperty('overflow');
					mainVisible = true;
				});
			}
		}, 2000);

		return () => {
			clearTimeout(timeoutId);
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

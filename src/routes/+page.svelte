<script lang="ts">
	import background from '$assets/images/background.svg';
	import Loader from '$components/Loader.svelte';
	import { animateOnScroll } from '$lib/actions/animateOnScroll';
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

		setTimeout(() => {
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
						.map((el) => new Promise((res) => el.addEventListener('animationend', res, { once: true })))
				).then(() => {
					showLoader = false;
					document.body.style.overflow = 'auto';
					mainVisible = true;
				});
			}
		}, 2000);
	});
</script>

{#if showLoader}
	<Loader />
{/if}

<main
	id="main-content"
	class="transition-opacity duration-600 ease-in-out"
	style:opacity={mainVisible ? 1 : 0}
	style:pointer-events={mainVisible ? 'auto' : 'none'}
>
	<div class="relative">
		<div class="bg-background relative z-10">
			<Hero />
		</div>

		<img src={background} alt="" id="background" fetchpriority="high" />

		<div class="from-background via-background/80 relative z-1 bg-linear-to-b to-transparent">
			<div use:animateOnScroll={{ animation: 'slide-up', delay: 200 }}>
				<Skills />
			</div>
		</div>

		<div use:animateOnScroll={{ animation: 'slide-up', delay: 200 }}>
			<Experience />
		</div>

		<div use:animateOnScroll={{ animation: 'slide-up', delay: 200 }}>
			<ProjectShowcase />
		</div>

		<div use:animateOnScroll={{ animation: 'slide-up', delay: 200 }}>
			<Testimonials />
		</div>

		<div use:animateOnScroll={{ animation: 'slide-up', delay: 200 }}>
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

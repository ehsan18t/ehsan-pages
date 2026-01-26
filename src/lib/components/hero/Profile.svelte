<script lang="ts">
	import meImage from '$lib/assets/images/me.png';

	const altText = 'Ehsan Khan';
</script>

<div class="flex items-center justify-center p-5 select-none">
	<div
		class="relative flex h-52 w-52 items-center justify-center
			md:h-64 md:w-[16rem] lg:h-76 lg:w-76"
	>
		<!-- Animated gradient border -->
		<div
			class="absolute top-0 left-0 z-10 h-full w-full rounded-full p-5"
			style="
				animation: spin 5s linear infinite;
				background: conic-gradient(
					from 0deg,
					rgb(var(--background)),
					#1c2a71,
					#1c3871,
					oklch(var(--accent-900)),
					oklch(var(--accent-500)),
					oklch(var(--accent-300))
				);
				will-change: transform;
			"
		></div>

		<!-- Profile image -->
		<img
			src={meImage}
			alt={altText}
			loading="eager"
			decoding="async"
			fetchpriority="high"
			class="z-20 h-[calc(13rem-0.313rem)] w-[calc(13rem-0.313rem)] rounded-full
				bg-background object-cover
				md:h-[calc(16rem-0.4rem)] md:w-[calc(16rem-0.4rem)]
				lg:h-[calc(19rem-0.438rem)] lg:w-[calc(19rem-0.438rem)]"
		/>
	</div>
</div>

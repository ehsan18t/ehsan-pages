<script lang="ts">
	import meImage from '$lib/assets/images/me.png';

	const altText = 'Ehsan Khan';
</script>

<div class="flex select-none items-center justify-center p-5">
	<div
		class="relative flex h-[13rem] w-[13rem] items-center justify-center
			md:h-[16rem] md:w-[16rem] lg:h-[19rem] lg:w-[19rem]"
	>
		<!-- Animated gradient border -->
		<div
			class="animate-when-visible absolute left-0 top-0 z-10 h-full w-full animate-spin rounded-full p-5"
			style="
				animation-duration: 5000ms;
				background: conic-gradient(
					from 0deg,
					rgb(var(--background)),
					#1c2a71,
					#1c3871,
					oklch(var(--accent-900)),
					oklch(var(--accent-500)),
					oklch(var(--accent-300))
				);
			"
		></div>

		<!-- Profile image -->
		<img
			src={meImage}
			alt={altText}
			class="z-20 rounded-full bg-background object-cover
				h-[calc(13rem-0.313rem)] w-[calc(13rem-0.313rem)]
				md:h-[calc(16rem-0.4rem)] md:w-[calc(16rem-0.4rem)]
				lg:h-[calc(19rem-0.438rem)] lg:w-[calc(19rem-0.438rem)]"
		/>
	</div>
</div>

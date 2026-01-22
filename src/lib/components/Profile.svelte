<script lang="ts">
	import meImage from '$lib/assets/images/me.png';

	const altText = 'Ehsan Khan';
</script>

<div class="profile-picture-container">
	<div class="border-wrapper">
		<div class="gradient-border animate-when-visible"></div>
		<img src={meImage} alt={altText} class="profile-picture" />
	</div>
</div>

<style>
	@reference "../../routes/layout.css";

	.profile-picture-container {
		--sm-pp-size: 13rem; /* 208px */
		--md-pp-size: 16rem; /* 256px */
		--lg-pp-size: 19rem; /* 304px */

		--sm-pp-b-size: 0.313rem; /* 5px */
		--md-pp-b-size: 0.4rem; /* 6px */
		--lg-pp-b-size: 0.438rem; /* 7px */

		@apply flex select-none items-center justify-center p-5;
	}

	.border-wrapper {
		@apply relative flex items-center justify-center;
		@apply h-(--sm-pp-size) w-(--sm-pp-size) md:h-(--md-pp-size) md:w-(--md-pp-size) lg:h-(--lg-pp-size) lg:w-(--lg-pp-size);
	}

	.gradient-border {
		@apply animation-duration-5000 absolute left-0 top-0 z-10 h-full w-full animate-spin rounded-full p-5;
		background: conic-gradient(
			from 0deg,
			rgb(var(--background)),
			#1c2a71,
			#1c3871,
			oklch(var(--accent-900)),
			oklch(var(--accent-500)),
			oklch(var(--accent-300))
		);
	}

	.profile-picture {
		@apply z-20 rounded-full bg-background object-cover;
		@apply h-[calc(var(--sm-pp-size)-var(--sm-pp-b-size))] w-[calc(var(--sm-pp-size)-var(--sm-pp-b-size))] md:h-[calc(var(--md-pp-size)-var(--md-pp-b-size))] md:w-[calc(var(--md-pp-size)-var(--md-pp-b-size))] lg:h-[calc(var(--lg-pp-size)-var(--lg-pp-b-size))] lg:w-[calc(var(--lg-pp-size)-var(--lg-pp-b-size))];
	}
</style>

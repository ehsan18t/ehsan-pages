<script lang="ts">
	import type { Experience } from '$data';
	import gsap from 'gsap';

	interface Props {
		experience: Experience;
		position: { x: number; y: number };
		laneColor: string;
		onmouseenter?: () => void;
		onmouseleave?: () => void;
	}

	let { experience, position, laneColor, onmouseenter, onmouseleave }: Props = $props();

	let cardRef = $state<HTMLDivElement | null>(null);
	// Offset for viewport clamping
	let clampOffset = $state({ x: 0, y: 0 });
	let isPositioned = $state(false);

	// Derive final position from prop + clamping offset
	let clampedPosition = $derived({
		x: position.x + clampOffset.x,
		y: position.y + clampOffset.y
	});

	function clampToViewport() {
		if (!cardRef || typeof window === 'undefined') return;

		const padding = 16;
		const rect = cardRef.getBoundingClientRect();
		const transform = window.getComputedStyle(cardRef).transform;
		let scaleX = 1;
		let scaleY = 1;

		if (transform && transform !== 'none') {
			const matrix = new DOMMatrixReadOnly(transform);
			scaleX = matrix.a || 1;
			scaleY = matrix.d || 1;
		}

		const width = rect.width / scaleX;
		const height = rect.height / scaleY;
		const maxX = Math.max(padding, window.innerWidth - width - padding);
		const maxY = Math.max(padding, window.innerHeight - height - padding);

		const clampedX = Math.min(Math.max(position.x, padding), maxX);
		const clampedY = Math.min(Math.max(position.y, padding), maxY);

		// Store offset from original position
		clampOffset = { x: clampedX - position.x, y: clampedY - position.y };

		if (!isPositioned) {
			isPositioned = true;
		}
	}

	// Entrance animation
	function animateCard() {
		if (!cardRef) return;

		gsap.fromTo(
			cardRef,
			{
				opacity: 0,
				scale: 0.9,
				y: 20
			},
			{
				opacity: 1,
				scale: 1,
				y: 0,
				duration: 0.3,
				ease: 'power2.out'
			}
		);

		// Animate the diff items
		const diffItems = cardRef.querySelectorAll('.diff-line');
		gsap.fromTo(
			diffItems,
			{ opacity: 0, x: -20 },
			{
				opacity: 1,
				x: 0,
				duration: 0.3,
				stagger: 0.08,
				delay: 0.15,
				ease: 'power2.out'
			}
		);

		// Animate tech pills
		const techPills = cardRef.querySelectorAll('.card-tech-pill');
		gsap.fromTo(
			techPills,
			{ opacity: 0, scale: 0.8 },
			{
				opacity: 1,
				scale: 1,
				duration: 0.2,
				stagger: 0.04,
				delay: 0.2,
				ease: 'back.out(1.7)'
			}
		);

		// Animate description items
		const descItems = cardRef.querySelectorAll('.card-description-item');
		gsap.fromTo(
			descItems,
			{ opacity: 0, x: -10 },
			{
				opacity: 1,
				x: 0,
				duration: 0.25,
				stagger: 0.06,
				delay: 0.1,
				ease: 'power2.out'
			}
		);
	}

	// Re-clamp when card ref or position changes
	$effect(() => {
		// Track position changes
		void position.x;
		void position.y;
		if (cardRef) {
			clampToViewport();
			requestAnimationFrame(clampToViewport);
		}
	});

	$effect(() => {
		if (cardRef && isPositioned) {
			animateCard();
		}
	});
</script>

<div
	bind:this={cardRef}
	class="experience-card"
	style:--card-accent={laneColor}
	style:position="fixed"
	style:left="{clampedPosition.x}px"
	style:top="{clampedPosition.y}px"
	style:pointer-events="auto"
	style:z-index={9999}
	style:max-height="calc(100vh - 32px)"
	style:overflow-y="auto"
	style:visibility={isPositioned ? 'visible' : 'hidden'}
	style:opacity={isPositioned ? 1 : 0}
	{onmouseenter}
	{onmouseleave}
	role="tooltip"
	aria-labelledby="card-title"
>
	<!-- Card Header -->
	<div class="card-header">
		<div class="card-header-content">
			<span class="card-date-badge">
				{experience.startDate} — {experience.endDate}
			</span>
			<h3 id="card-title" class="card-title">
				{experience.role}
			</h3>
			{#if experience.companyUrl}
				<a
					href={experience.companyUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="card-company"
				>
					{experience.company}
					<svg class="external-icon" viewBox="0 0 24 24" width="14" height="14">
						<path
							fill="currentColor"
							d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm-2 16H5V7h7V5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-7h-2v7H7z"
						/>
					</svg>
				</a>
			{:else}
				<span class="card-company">{experience.company}</span>
			{/if}
		</div>
	</div>

	<!-- Description List -->
	<ul class="card-description-list">
		{#each experience.description as item, itemIndex (`desc-${itemIndex}`)}
			<li class="card-description-item">{item}</li>
		{/each}
	</ul>

	<!-- Tech Stack -->
	<div class="card-tech-stack">
		{#each experience.techStack as tech (tech)}
			<span class="card-tech-pill">{tech}</span>
		{/each}
	</div>

	<!-- Impact Metrics (Git Diff Style) -->
	<div class="card-diff">
		<div class="diff-header">
			<span class="diff-title">Impact</span>
			<span class="diff-file">metrics.md</span>
		</div>
		<div class="diff-content">
			{#each experience.impact as item, index (`impact-${index}`)}
				<div class="diff-line {item.type}">
					<span class="diff-line-number">{index + 1}</span>
					<span class="diff-symbol">
						{item.type === 'addition' ? '+' : item.type === 'deletion' ? '-' : '~'}
					</span>
					<span class="diff-label">{item.label}:</span>
					<span class="diff-value">{item.value}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Lane indicator -->
	<div class="card-lane-indicator">
		<span class="lane-dot" style:background-color={laneColor}></span>
		<span class="lane-text">{experience.lane}</span>
	</div>
</div>

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Experience Card */
	.experience-card {
		@apply z-9999 max-h-[calc(100vh-40px)] w-95 max-w-[calc(100vw-40px)] overflow-y-auto rounded-2xl border border-[rgba(var(--foreground),0.12)] p-6 backdrop-blur-[20px];
		background: color-mix(in oklch, rgb(var(--background)), black 35%);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(var(--foreground), 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.experience-card::before {
		@apply absolute inset-x-0 top-0 h-0.75 opacity-80;
		content: '';
		background: var(--card-accent);
	}

	/* Card Header */
	.card-header {
		@apply mb-4 flex items-start justify-between;
	}

	.card-header-content {
		@apply flex-1;
	}

	.card-date-badge {
		@apply m-0 inline-block rounded border-0 bg-transparent p-0 font-doto font-bold text-(--card-accent);
	}

	.card-title {
		@apply m-0 mb-1 text-xl leading-tight font-bold text-foreground;
	}

	.card-company {
		@apply inline-flex items-center gap-1.5 text-sm text-foreground-muted no-underline transition-colors duration-200;
	}

	a.card-company:hover {
		color: var(--card-accent);
	}

	.external-icon {
		@apply opacity-70;
	}

	/* Description List */
	.card-description-list {
		@apply m-0 mb-4 list-none p-0;
	}

	.card-description-item {
		@apply relative mb-2 pl-4 text-[0.8125rem] leading-relaxed text-foreground-muted last:mb-0;
	}

	.card-description-item::before {
		@apply absolute left-0 text-xs opacity-70;
		content: '▸';
		color: var(--card-accent);
	}

	/* Tech Stack */
	.card-tech-stack {
		@apply mb-5 flex flex-wrap gap-2;
	}

	.card-tech-pill {
		@apply rounded-full border border-accent-500/30 bg-accent-900/20 px-2.5 py-1 text-[0.7rem] font-medium text-accent-300 transition-all duration-200;
	}

	.card-tech-pill:hover {
		@apply border-accent-500/50 bg-accent-900/35;
	}

	/* Diff Section */
	.card-diff {
		@apply mb-4 overflow-hidden rounded-lg border border-[rgba(var(--foreground),0.1)];
		background: color-mix(in oklch, rgb(var(--background)), black 50%);
	}

	.diff-header {
		@apply flex items-center justify-between border-b border-[rgba(var(--foreground),0.1)] bg-[rgba(var(--foreground),0.05)] px-3 py-2;
	}

	.diff-title {
		@apply text-xs font-semibold text-foreground;
	}

	.diff-file {
		@apply font-mono text-[0.7rem] text-foreground-muted;
	}

	.diff-content {
		@apply py-2;
	}

	.diff-line {
		@apply flex items-center px-3 py-1 font-mono text-[0.8rem] transition-colors duration-200;
	}

	.diff-line:hover {
		@apply bg-[rgba(var(--foreground),0.05)];
	}

	.diff-line-number {
		@apply w-5 text-[0.7rem] text-foreground-muted opacity-50;
	}

	.diff-symbol {
		@apply w-5 text-center font-bold;
	}

	.diff-line.addition .diff-symbol {
		@apply text-green-400;
	}
	.diff-line.deletion .diff-symbol {
		@apply text-red-400;
	}
	.diff-line.modification .diff-symbol {
		@apply text-amber-400;
	}

	.diff-line.addition {
		@apply bg-green-400/8;
	}
	.diff-line.deletion {
		@apply bg-red-400/8;
	}
	.diff-line.modification {
		@apply bg-amber-400/8;
	}

	.diff-label {
		@apply mr-2 text-foreground-muted;
	}

	.diff-value {
		@apply ml-auto font-semibold text-foreground;
	}

	/* Lane Indicator */
	.card-lane-indicator {
		@apply flex items-center gap-2 text-xs text-foreground-muted capitalize;
	}

	.lane-dot {
		@apply size-2 rounded-full;
	}

	/* Responsive */
	@media (min-width: 768px) and (max-width: 1023px) {
		.experience-card {
			@apply w-85 p-5;
		}
	}

	@media (min-width: 1024px) {
		.experience-card {
			@apply w-100;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.experience-card {
			@apply transition-none;
			animation: none;
		}
	}
</style>

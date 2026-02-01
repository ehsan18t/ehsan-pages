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
			<div class="card-date-badge">
				{experience.startDate} — {experience.endDate}
			</div>
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

<style>
	/* Experience Card */
	.experience-card {
		width: 380px;
		max-width: calc(100vw - 40px);
		max-height: calc(100vh - 40px);
		overflow-y: auto;
		background: color-mix(in oklch, rgb(var(--background)), black 35%);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(var(--foreground), 0.12);
		border-radius: 16px;
		padding: 1.5rem;
		z-index: 9999;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(var(--foreground), 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.experience-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--card-accent);
		opacity: 0.8;
	}

	/* Card Header */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.card-header-content {
		flex: 1;
	}

	.card-date-badge {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--card-accent);
		background: color-mix(in oklch, var(--card-accent), transparent 85%);
		padding: 0.25rem 0.625rem;
		border-radius: 4px;
		margin-bottom: 0.5rem;
		letter-spacing: 0.5px;
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgb(var(--foreground));
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
	}

	.card-company {
		font-size: 0.875rem;
		color: rgb(var(--foreground-muted));
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		transition: color 0.2s ease;
	}

	a.card-company:hover {
		color: var(--card-accent);
	}

	.external-icon {
		opacity: 0.7;
	}

	/* Description List */
	.card-description-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}

	.card-description-item {
		position: relative;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: rgb(var(--foreground-muted));
		padding-left: 1rem;
		margin-bottom: 0.5rem;
	}

	.card-description-item:last-child {
		margin-bottom: 0;
	}

	.card-description-item::before {
		content: '▸';
		position: absolute;
		left: 0;
		color: var(--card-accent);
		opacity: 0.7;
		font-size: 0.75rem;
	}

	/* Tech Stack */
	.card-tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.card-tech-pill {
		font-size: 0.7rem;
		font-weight: 500;
		color: oklch(var(--accent-300));
		background: oklch(var(--accent-900) / 0.2);
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		border: 1px solid oklch(var(--accent-500) / 0.3);
		transition: all 0.2s ease;
	}

	.card-tech-pill:hover {
		background: oklch(var(--accent-900) / 0.35);
		border-color: oklch(var(--accent-500) / 0.5);
	}

	/* Diff Section */
	.card-diff {
		background: color-mix(in oklch, rgb(var(--background)), black 50%);
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid rgba(var(--foreground), 0.1);
		margin-bottom: 1rem;
	}

	.diff-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: rgba(var(--foreground), 0.05);
		border-bottom: 1px solid rgba(var(--foreground), 0.1);
	}

	.diff-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(var(--foreground));
	}

	.diff-file {
		font-size: 0.7rem;
		font-family: monospace;
		color: rgb(var(--foreground-muted));
	}

	.diff-content {
		padding: 0.5rem 0;
	}

	.diff-line {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		font-family: monospace;
		font-size: 0.8rem;
		transition: background 0.2s ease;
	}

	.diff-line:hover {
		background: rgba(var(--foreground), 0.05);
	}

	.diff-line-number {
		width: 20px;
		color: rgb(var(--foreground-muted));
		opacity: 0.5;
		font-size: 0.7rem;
	}

	.diff-symbol {
		width: 20px;
		font-weight: 700;
		text-align: center;
	}

	.diff-line.addition .diff-symbol {
		color: #4ade80;
	}
	.diff-line.deletion .diff-symbol {
		color: #f87171;
	}
	.diff-line.modification .diff-symbol {
		color: #fbbf24;
	}

	.diff-line.addition {
		background: rgba(74, 222, 128, 0.08);
	}
	.diff-line.deletion {
		background: rgba(248, 113, 113, 0.08);
	}
	.diff-line.modification {
		background: rgba(251, 191, 36, 0.08);
	}

	.diff-label {
		color: rgb(var(--foreground-muted));
		margin-right: 0.5rem;
	}

	.diff-value {
		color: rgb(var(--foreground));
		font-weight: 600;
		margin-left: auto;
	}

	/* Lane Indicator */
	.card-lane-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: rgb(var(--foreground-muted));
		text-transform: capitalize;
	}

	.lane-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	/* Responsive */
	@media (min-width: 768px) and (max-width: 1023px) {
		.experience-card {
			width: 340px;
			padding: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		.experience-card {
			width: 400px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.experience-card {
			transition: none;
			animation: none;
		}
	}
</style>

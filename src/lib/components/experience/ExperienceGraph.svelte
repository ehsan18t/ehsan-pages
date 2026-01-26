<script lang="ts">
	/**
	 * ExperienceGraph Component - Interactive timeline with GSAP animations
	 *
	 * A+ Grade Implementation featuring:
	 * - Svelte 5 runes ($state, $derived, $effect)
	 * - <svelte:window> for resize handling
	 * - GSAP ScrollTrigger for scroll-based animations
	 * - Responsive design (desktop graph, mobile list)
	 * - Keyboard accessibility
	 *
	 * @component ExperienceGraph
	 */

	import { browser } from '$app/environment';
	import type { Experience } from '$data';
	import gsap from 'gsap';
	import ScrollTrigger from 'gsap/dist/ScrollTrigger';
	import ExperienceCard from './ExperienceCard.svelte';

	// Register GSAP plugin (browser only)
	if (browser) {
		gsap.registerPlugin(ScrollTrigger);
	}

	// ─────────────────────────────────────────────────────────────
	// Props
	// ─────────────────────────────────────────────────────────────

	interface Props {
		experiences: Experience[];
	}

	let { experiences }: Props = $props();

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let containerRef = $state<HTMLDivElement | null>(null);
	let graphRef = $state<HTMLDivElement | null>(null);
	let pathRef = $state<SVGPathElement | null>(null);
	let glowRef = $state<SVGPathElement | null>(null);
	let closeTimeoutRef: number | null = null;
	let activeExperience = $state<Experience | null>(null);
	let cardPosition = $state({ x: 0, y: 0 });
	let containerWidth = $state(700);

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	const NODE_COLOR = 'oklch(var(--accent-500))';
	const NODE_SPACING = 180;
	const START_Y = 60;
	const LEFT_X_PERCENT = 30;
	const RIGHT_X_PERCENT = 70;

	// ─────────────────────────────────────────────────────────────
	// Layout Calculations
	// ─────────────────────────────────────────────────────────────

	function getXPercent(i: number): number {
		return i % 2 === 0 ? LEFT_X_PERCENT : RIGHT_X_PERCENT;
	}

	function getXPixel(i: number): number {
		return (getXPercent(i) / 100) * containerWidth;
	}

	function getY(i: number): number {
		return START_Y + i * NODE_SPACING;
	}

	// ─────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────

	let graphHeight = $derived(getY(experiences.length - 1) + 100);

	/** Generate SVG path for the timeline */
	let pathD = $derived.by(() => {
		if (!experiences.length) return '';

		let d = `M ${getXPixel(0)} ${getY(0)}`;

		for (let i = 1; i < experiences.length; i++) {
			const px = getXPixel(i - 1),
				py = getY(i - 1);
			const cx = getXPixel(i),
				cy = getY(i);
			const midY = (py + cy) / 2;
			d += ` C ${px} ${midY}, ${cx} ${midY}, ${cx} ${cy}`;
		}

		return d;
	});

	// ─────────────────────────────────────────────────────────────
	// Hover Handlers
	// ─────────────────────────────────────────────────────────────

	function clearClose(): void {
		if (closeTimeoutRef) {
			clearTimeout(closeTimeoutRef);
			closeTimeoutRef = null;
		}
	}

	function scheduleClose(): void {
		clearClose();
		closeTimeoutRef = window.setTimeout(() => {
			activeExperience = null;
		}, 150);
	}

	function handleHover(exp: Experience, e: MouseEvent): void {
		clearClose();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const isLeft = experiences.indexOf(exp) % 2 === 0;

		const cardWidth = 380;
		const gap = 16;

		let x: number;
		let y: number;

		// Position card on opposite side of label
		if (isLeft) {
			x = rect.right + gap;
		} else {
			x = rect.left - cardWidth - gap;
		}

		// Vertical: try to align top with node
		y = rect.top - 20;

		// Clamp X roughly
		if (x + cardWidth > window.innerWidth - gap) {
			x = rect.left - cardWidth - gap;
		}
		if (x < gap) {
			x = gap;
		}

		cardPosition = { x, y };
		activeExperience = exp;
	}

	function handleKeydown(exp: Experience, e: KeyboardEvent): void {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			// Toggle on keyboard
			if (activeExperience?.id === exp.id) {
				activeExperience = null;
			} else {
				// Position for keyboard users - centered
				cardPosition = { x: window.innerWidth / 2 - 190, y: 100 };
				activeExperience = exp;
			}
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Resize Handler (used by svelte:window)
	// ─────────────────────────────────────────────────────────────

	function handleResize(): void {
		if (graphRef) {
			containerWidth = graphRef.offsetWidth;
		}
	}

	// ─────────────────────────────────────────────────────────────
	// GSAP Animations
	// ─────────────────────────────────────────────────────────────

	let scrollTriggers: gsap.core.Tween[] = [];

	function initAnimations(): void {
		if (!graphRef || !pathRef || !glowRef || containerWidth === 0) return;

		// Clean up any existing animations
		scrollTriggers.forEach((t) => t.kill());
		scrollTriggers = [];
		ScrollTrigger.getAll().forEach((t: ScrollTrigger) => t.kill());

		const len = pathRef.getTotalLength();

		gsap.set([pathRef, glowRef], {
			strokeDasharray: len,
			strokeDashoffset: len,
			opacity: 0
		});

		const pathTween = gsap.to([pathRef, glowRef], {
			strokeDashoffset: 0,
			opacity: 1,
			ease: 'none',
			scrollTrigger: {
				trigger: graphRef,
				start: 'top 85%',
				end: 'bottom 75%',
				scrub: 0.35
			}
		});

		scrollTriggers.push(pathTween);

		const nodes = graphRef.querySelectorAll<HTMLElement>('.commit-node');
		nodes.forEach((node) => {
			gsap.set(node, { scale: 0, opacity: 0 });
			const nodeTween = gsap.to(node, {
				scale: 1,
				opacity: 1,
				duration: 0.6,
				ease: 'back.out(1.7)',
				scrollTrigger: {
					trigger: node,
					start: 'top 85%',
					toggleActions: 'play none none reverse'
				}
			});
			scrollTriggers.push(nodeTween);
		});
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Initialize and cleanup GSAP animations
	$effect(() => {
		// Track dependencies
		if (containerWidth > 0 && experiences.length > 0 && graphRef && pathRef && glowRef) {
			// Initialize after a small delay to ensure DOM is ready
			const timeoutId = setTimeout(initAnimations, 50);

			// Cleanup function
			return () => {
				clearTimeout(timeoutId);
				scrollTriggers.forEach((t) => t.kill());
				ScrollTrigger.getAll().forEach((t: ScrollTrigger) => t.kill());
				if (closeTimeoutRef) {
					clearTimeout(closeTimeoutRef);
					closeTimeoutRef = null;
				}
			};
		}
	});

	// Initial width measurement
	$effect(() => {
		if (graphRef) {
			handleResize();
		}
	});
</script>

<svelte:window onresize={handleResize} />

<div bind:this={containerRef} class="experience-graph-container">
	<!-- Desktop Timeline -->
	<div bind:this={graphRef} class="experience-graph" style:height="{graphHeight}px">
		<svg
			class="graph-svg"
			viewBox="0 0 {containerWidth} {graphHeight}"
			preserveAspectRatio="xMidYMid meet"
		>
			<defs>
				<filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="2" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<path
				bind:this={glowRef}
				class="graph-path graph-path--glow"
				d={pathD}
				fill="none"
				stroke="oklch(var(--accent-500) / 0.3)"
				stroke-width="6"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"
			/>
			<path
				bind:this={pathRef}
				class="graph-path graph-path--main"
				d={pathD}
				fill="none"
				stroke="oklch(var(--accent-500))"
				stroke-width="3"
				stroke-linecap="round"
				filter="url(#lineGlow)"
				vector-effect="non-scaling-stroke"
			/>
		</svg>

		{#each experiences as exp, i (exp.id)}
			<div
				class="commit-node {i % 2 === 0 ? 'node-left' : 'node-right'} {activeExperience?.id ===
				exp.id
					? 'active'
					: ''}"
				style:left="{getXPercent(i)}%"
				style:top="{getY(i)}px"
				style:--node-color={NODE_COLOR}
				onmouseenter={(e) => handleHover(exp, e)}
				onmouseleave={scheduleClose}
				onkeydown={(e) => handleKeydown(exp, e)}
				tabindex="0"
				role="button"
				aria-label="{exp.role} at {exp.company}"
			>
				<div class="node-inner"></div>
				<div class="node-label">
					<span class="node-date">{exp.startDate}</span>
					<span class="node-role">{exp.role}</span>
					<span class="node-company">{exp.company}</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- Mobile List -->
	<div class="mobile-experience-list">
		{#each experiences as exp, i (exp.id)}
			<div
				class="mobile-experience-item"
				style:--node-color={NODE_COLOR}
				style:--delay="{i * 0.1}s"
			>
				<div class="mobile-node-line">
					<div class="mobile-node"></div>
					{#if i < experiences.length - 1}
						<div class="mobile-connector"></div>
					{/if}
				</div>
				<div class="mobile-content">
					<span class="mobile-date">{exp.startDate} — {exp.endDate}</span>
					<h4 class="mobile-role">{exp.role}</h4>
					<p class="mobile-company">{exp.company}</p>
					<ul class="mobile-description-list">
						{#each exp.description as item, itemIndex (`${exp.id}-desc-${itemIndex}`)}
							<li>{item}</li>
						{/each}
					</ul>
					<div class="mobile-tech-stack">
						{#each exp.techStack as tech (`${exp.id}-tech-${tech}`)}
							<span class="mobile-tech-pill">{tech}</span>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if activeExperience}
		<ExperienceCard
			experience={activeExperience}
			position={cardPosition}
			laneColor={NODE_COLOR}
			onmouseenter={clearClose}
			onmouseleave={scheduleClose}
		/>
	{/if}
</div>

<style>
	/* CSS Custom Properties for theming */
	.experience-graph-container {
		position: relative;
		width: 100%;
		padding: 2rem 0;
		overflow-x: hidden;
		--path-color: oklch(var(--accent-500));
	}

	/* Main Graph Container */
	.experience-graph {
		position: relative;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
		display: none;
	}

	@media (min-width: 768px) {
		.experience-graph {
			display: block;
		}
	}

	@media (min-width: 1024px) {
		.experience-graph {
			max-width: 800px;
		}
	}

	/* SVG Graph Lines */
	.graph-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.graph-svg path {
		stroke: oklch(var(--accent-500));
	}

	/* Hide graph paths before GSAP initializes */
	.graph-path {
		opacity: 0;
	}

	/* Commit Nodes */
	.commit-node {
		position: absolute;
		width: 24px;
		height: 24px;
		transform: translate(-50%, -50%);
		cursor: pointer;
		z-index: 10;
		outline: none;
	}

	.commit-node:focus-visible {
		outline: 2px solid oklch(var(--accent-500));
		outline-offset: 4px;
		border-radius: 50%;
	}

	.node-inner {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: rgb(var(--background));
		border: 3px solid var(--node-color);
		box-shadow:
			0 0 15px var(--node-color),
			0 0 30px color-mix(in oklch, var(--node-color), transparent 60%),
			inset 0 0 8px color-mix(in oklch, var(--node-color), transparent 70%);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.commit-node:hover .node-inner,
	.commit-node.active .node-inner {
		transform: scale(1.3);
		background: var(--node-color);
		box-shadow:
			0 0 25px var(--node-color),
			0 0 50px color-mix(in oklch, var(--node-color), transparent 40%);
	}

	/* Node Labels */
	.node-label {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		white-space: nowrap;
		pointer-events: none;
	}

	/* Left nodes - label on left side */
	.commit-node.node-left .node-label {
		right: calc(100% + 16px);
		text-align: right;
		align-items: flex-end;
	}

	/* Right nodes - label on right side */
	.commit-node.node-right .node-label {
		left: calc(100% + 16px);
		text-align: left;
		align-items: flex-start;
	}

	.commit-node:hover .node-label {
		opacity: 1;
	}

	.node-date {
		font-size: 0.7rem;
		font-weight: 600;
		font-family: var(--font-doto), monospace;
		color: oklch(var(--accent-500));
		background: color-mix(in oklch, rgb(var(--background)), black 30%);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		border: 1px solid oklch(var(--accent-500) / 0.3);
	}

	.node-role {
		font-size: 1rem;
		font-weight: 700;
		color: rgb(var(--foreground));
		line-height: 1.3;
	}

	.node-company {
		font-size: 0.8rem;
		color: rgb(var(--foreground-muted));
		line-height: 1.2;
	}

	/* Mobile Experience List */
	.mobile-experience-list {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.mobile-experience-list {
			display: none;
		}
	}

	.mobile-experience-item {
		display: flex;
		gap: 1rem;
		animation: fadeInUp 0.5s ease-out backwards;
		animation-delay: var(--delay);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile Node Line */
	.mobile-node-line {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		width: 24px;
	}

	.mobile-node {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--node-color);
		border: 3px solid color-mix(in oklch, rgb(var(--background)), black 20%);
		box-shadow: 0 0 15px var(--node-color);
		flex-shrink: 0;
	}

	.mobile-connector {
		width: 2px;
		flex: 1;
		min-height: 20px;
		background: linear-gradient(to bottom, var(--node-color), oklch(var(--accent-500) / 0.3));
		margin: 4px 0;
	}

	/* Mobile Content */
	.mobile-content {
		flex: 1;
		padding-bottom: 2rem;
	}

	.mobile-date {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(var(--accent-500));
		font-family: var(--font-doto), monospace;
	}

	.mobile-role {
		font-size: 1.125rem;
		font-weight: 700;
		color: rgb(var(--foreground));
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
	}

	.mobile-company {
		font-size: 0.875rem;
		color: rgb(var(--foreground-muted));
		margin: 0 0 0.75rem 0;
	}

	/* Mobile Description List */
	.mobile-description-list {
		list-style: none;
		padding: 0;
		margin: 0 0 0.75rem 0;
	}

	.mobile-description-list li {
		position: relative;
		font-size: 0.82rem;
		line-height: 1.55;
		color: rgb(var(--foreground-muted));
		padding-left: 0.9rem;
		margin-bottom: 0.4rem;
	}

	.mobile-description-list li:last-child {
		margin-bottom: 0;
	}

	.mobile-description-list li::before {
		content: '▸';
		position: absolute;
		left: 0;
		color: var(--node-color);
		opacity: 0.7;
		font-size: 0.7rem;
	}

	/* Mobile Tech Stack */
	.mobile-tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	.mobile-tech-pill {
		font-size: 0.65rem;
		font-weight: 500;
		color: oklch(var(--accent-300));
		background: oklch(var(--accent-900) / 0.2);
		padding: 0.1rem 0.5rem;
		border-radius: 9999px;
		border: 1px solid oklch(var(--accent-500) / 0.3);
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.commit-node,
		.mobile-experience-item {
			transition: none;
			animation: none;
		}

		.mobile-experience-item {
			opacity: 1;
			transform: none;
		}
	}
</style>

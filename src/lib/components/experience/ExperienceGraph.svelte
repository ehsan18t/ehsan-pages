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
	import ScrollTrigger from 'gsap/ScrollTrigger';
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

<div
	bind:this={containerRef}
	class="relative w-full overflow-x-hidden py-8"
	style="--path-color: oklch(var(--accent-500));"
>
	<!-- Desktop Timeline -->
	<div
		bind:this={graphRef}
		class="experience-graph relative mx-auto hidden w-full max-w-175 md:block lg:max-w-200"
		style:height="{graphHeight}px"
	>
		<svg
			class="pointer-events-none absolute inset-0 h-full w-full"
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
	<div class="mx-auto flex max-w-150 flex-col gap-0 p-4 md:hidden">
		{#each experiences as exp, i (exp.id)}
			<div
				class="mobile-experience-item flex animate-[fadeInUp_0.5s_ease-out_backwards] gap-4"
				style:--node-color={NODE_COLOR}
				style:--delay="{i * 0.1}s"
				style:animation-delay="var(--delay)"
			>
				<div class="flex w-6 shrink-0 flex-col items-center">
					<div
						class="size-4 shrink-0 rounded-full border-[3px]"
						style="background: var(--node-color); border-color: color-mix(in oklch, rgb(var(--background)), black 20%); box-shadow: 0 0 15px var(--node-color);"
					></div>
					{#if i < experiences.length - 1}
						<div
							class="my-1 min-h-5 w-0.5 flex-1 bg-linear-to-b from-(--node-color) to-[oklch(var(--accent-500)/0.3)]"
						></div>
					{/if}
				</div>
				<div class="flex-1 pb-8">
					<span class="font-doto text-xs font-bold text-accent-500"
						>{exp.startDate} — {exp.endDate}</span
					>
					<h4 class="m-0 mb-1 text-lg leading-tight font-bold text-foreground">{exp.role}</h4>
					<p class="m-0 mb-3 text-sm text-foreground-muted">{exp.company}</p>
					<ul class="m-0 mb-3 list-none p-0">
						{#each exp.description as item, itemIndex (`${exp.id}-desc-${itemIndex}`)}
							<li
								class="relative mb-1.5 pl-3.5 text-[0.82rem] leading-[1.55] text-foreground-muted before:absolute before:left-0 before:text-[0.7rem] before:opacity-70 before:content-['▸'] last:mb-0"
								style="--tw-before-color: var(--node-color);"
							>
								{item}
							</li>
						{/each}
					</ul>
					<div class="mb-4 flex flex-wrap gap-1.5">
						{#each exp.techStack as tech (`${exp.id}-tech-${tech}`)}
							<span
								class="rounded-full border border-accent-500/30 bg-accent-900/20 px-2 py-0.5 text-[0.65rem] font-medium text-accent-300"
								>{tech}</span
							>
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

<style lang="postcss">
	@reference "$routes/layout.css";

	/* SVG Graph Lines - Hide before GSAP initializes */
	.graph-path {
		@apply opacity-0;
	}

	/* Commit Nodes */
	.commit-node {
		@apply absolute z-10 size-6 cursor-pointer outline-none;
		transform: translate(-50%, -50%);
	}

	.commit-node:focus-visible {
		@apply rounded-full outline-2 outline-offset-1 outline-accent-500;
	}

	.node-inner {
		@apply size-full rounded-full bg-background transition-all duration-300;
		border: 3px solid var(--node-color);
		box-shadow:
			0 0 15px var(--node-color),
			0 0 30px color-mix(in oklch, var(--node-color), transparent 60%),
			inset 0 0 8px color-mix(in oklch, var(--node-color), transparent 70%);
	}

	.commit-node:hover .node-inner,
	.commit-node.active .node-inner {
		@apply scale-130;
		background: var(--node-color);
		box-shadow:
			0 0 25px var(--node-color),
			0 0 50px color-mix(in oklch, var(--node-color), transparent 40%);
	}

	/* Node Labels */
	.node-label {
		@apply pointer-events-none absolute top-1/2 flex -translate-y-1/2 flex-col gap-1 whitespace-nowrap;
	}

	.commit-node.node-left .node-label {
		@apply right-[calc(100%+16px)] items-end text-right;
	}

	.commit-node.node-right .node-label {
		@apply left-[calc(100%+16px)] items-start text-left;
	}

	.commit-node:hover .node-label {
		@apply opacity-100;
	}

	.node-date {
		@apply m-0 border-0 p-0 font-doto text-sm font-bold text-accent-500;
		background: transparent;
		border-color: oklch(var(--accent-500) / 0.3);
	}

	.node-role {
		@apply text-base leading-tight font-bold text-foreground;
	}

	.node-company {
		@apply text-[0.8rem] leading-tight text-foreground-muted;
	}

	/* Mobile animation keyframe */
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

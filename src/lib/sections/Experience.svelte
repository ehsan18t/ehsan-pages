<script lang="ts">
	import ExperienceGraph from '$components/experience/ExperienceGraph.svelte';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import { experiences } from '$data';
</script>

<section id="experience" class="scroll-mt-20 py-20 md:py-28">
	<div class="container mx-auto px-4">
		<SectionTitle
			p1="My"
			p2="Journey"
			subtitle="A visual timeline of my professional path. Hover on commits to explore each role."
		/>

		<ExperienceGraph {experiences} />
	</div>
</section>

<style>
	/* ====================================
	   Experience Section - Serpentine Timeline
	   ==================================== */

	/* CSS Custom Properties for theming */
	:global(.experience-graph-container) {
		position: relative;
		width: 100%;
		padding: 2rem 0;
		overflow-x: hidden;
		--path-color: oklch(var(--accent-500));
	}

	/* ====================================
	   Main Graph Container
	   ==================================== */
	:global(.experience-graph) {
		position: relative;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
		display: none;
	}

	@media (min-width: 768px) {
		:global(.experience-graph) {
			display: block;
		}
	}

	@media (min-width: 1024px) {
		:global(.experience-graph) {
			max-width: 800px;
		}
	}

	/* SVG Graph Lines */
	:global(.graph-svg) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	:global(.graph-svg path) {
		stroke: oklch(var(--accent-500));
	}

	/* Hide graph paths before GSAP initializes */
	:global(.graph-path) {
		opacity: 0;
	}

	/* ====================================
	   Commit Nodes - Serpentine Layout
	   ==================================== */
	:global(.commit-node) {
		position: absolute;
		width: 24px;
		height: 24px;
		transform: translate(-50%, -50%);
		cursor: pointer;
		z-index: 10;
		outline: none;
	}

	:global(.commit-node:focus-visible) {
		outline: 2px solid oklch(var(--accent-500));
		outline-offset: 4px;
		border-radius: 50%;
	}

	:global(.node-inner) {
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

	:global(.commit-node:hover .node-inner),
	:global(.commit-node.active .node-inner) {
		transform: scale(1.3);
		background: var(--node-color);
		box-shadow:
			0 0 25px var(--node-color),
			0 0 50px color-mix(in oklch, var(--node-color), transparent 40%);
	}

	/* Node Labels - Inline next to nodes */
	:global(.node-label) {
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
	:global(.commit-node.node-left .node-label) {
		right: calc(100% + 16px);
		text-align: right;
		align-items: flex-end;
	}

	/* Right nodes - label on right side */
	:global(.commit-node.node-right .node-label) {
		left: calc(100% + 16px);
		text-align: left;
		align-items: flex-start;
	}

	:global(.node-date) {
		font-size: 0.7rem;
		font-weight: 600;
		font-family: var(--font-doto), monospace;
		color: oklch(var(--accent-500));
		background: color-mix(in oklch, rgb(var(--background)), black 30%);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		border: 1px solid oklch(var(--accent-500) / 0.3);
	}

	:global(.node-role) {
		font-size: 1rem;
		font-weight: 700;
		color: rgb(var(--foreground));
		line-height: 1.3;
	}

	:global(.node-company) {
		font-size: 0.8rem;
		color: rgb(var(--foreground-muted));
		line-height: 1.2;
	}

	/* ====================================
	   Experience Card (Desktop Modal)
	   ==================================== */
	:global(.experience-card) {
		position: absolute;
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

	:global(.experience-card::before) {
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
	:global(.card-header) {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	:global(.card-header-content) {
		flex: 1;
	}

	:global(.card-date-badge) {
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

	:global(.card-title) {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgb(var(--foreground));
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
	}

	:global(.card-company) {
		font-size: 0.875rem;
		color: rgb(var(--foreground-muted));
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		transition: color 0.2s ease;
	}

	:global(a.card-company:hover) {
		color: var(--card-accent);
	}

	/* Description List */
	:global(.card-description-list) {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
	}

	:global(.card-description-item) {
		position: relative;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: rgb(var(--foreground-muted));
		padding-left: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.card-description-item:last-child) {
		margin-bottom: 0;
	}

	:global(.card-description-item::before) {
		content: '▸';
		position: absolute;
		left: 0;
		color: var(--card-accent);
		opacity: 0.7;
		font-size: 0.75rem;
	}

	/* Tech Stack */
	:global(.card-tech-stack) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	:global(.card-tech-pill) {
		font-size: 0.7rem;
		font-weight: 500;
		color: oklch(var(--accent-300));
		background: oklch(var(--accent-900) / 0.2);
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		border: 1px solid oklch(var(--accent-500) / 0.3);
		transition: all 0.2s ease;
	}

	:global(.card-tech-pill:hover) {
		background: oklch(var(--accent-900) / 0.35);
		border-color: oklch(var(--accent-500) / 0.5);
	}

	/* Diff Section */
	:global(.card-diff) {
		background: color-mix(in oklch, rgb(var(--background)), black 50%);
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid rgba(var(--foreground), 0.1);
		margin-bottom: 1rem;
	}

	:global(.diff-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: rgba(var(--foreground), 0.05);
		border-bottom: 1px solid rgba(var(--foreground), 0.1);
	}

	:global(.diff-title) {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(var(--foreground));
	}

	:global(.diff-file) {
		font-size: 0.7rem;
		font-family: monospace;
		color: rgb(var(--foreground-muted));
	}

	:global(.diff-content) {
		padding: 0.5rem 0;
	}

	:global(.diff-line) {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		font-family: monospace;
		font-size: 0.8rem;
		transition: background 0.2s ease;
	}

	:global(.diff-line:hover) {
		background: rgba(var(--foreground), 0.05);
	}

	:global(.diff-line-number) {
		width: 20px;
		color: rgb(var(--foreground-muted));
		opacity: 0.5;
		font-size: 0.7rem;
	}

	:global(.diff-symbol) {
		width: 20px;
		font-weight: 700;
		text-align: center;
	}

	:global(.diff-line.addition .diff-symbol) {
		color: #4ade80;
	}
	:global(.diff-line.deletion .diff-symbol) {
		color: #f87171;
	}
	:global(.diff-line.modification .diff-symbol) {
		color: #fbbf24;
	}

	:global(.diff-line.addition) {
		background: rgba(74, 222, 128, 0.08);
	}
	:global(.diff-line.deletion) {
		background: rgba(248, 113, 113, 0.08);
	}
	:global(.diff-line.modification) {
		background: rgba(251, 191, 36, 0.08);
	}

	:global(.diff-label) {
		color: rgb(var(--foreground-muted));
		margin-right: 0.5rem;
	}

	:global(.diff-value) {
		color: rgb(var(--foreground));
		font-weight: 600;
		margin-left: auto;
	}

	/* Lane Indicator */
	:global(.card-lane-indicator) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: rgb(var(--foreground-muted));
		text-transform: capitalize;
	}

	:global(.card-lane-indicator .lane-dot) {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	/* ====================================
	   Mobile Experience List
	   ==================================== */
	:global(.mobile-experience-list) {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		:global(.mobile-experience-list) {
			display: none;
		}
	}

	:global(.mobile-experience-item) {
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
	:global(.mobile-node-line) {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		width: 24px;
	}

	:global(.mobile-node) {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--node-color);
		border: 3px solid color-mix(in oklch, rgb(var(--background)), black 20%);
		box-shadow: 0 0 15px var(--node-color);
		flex-shrink: 0;
	}

	:global(.mobile-connector) {
		width: 2px;
		flex: 1;
		min-height: 20px;
		background: linear-gradient(to bottom, var(--node-color), oklch(var(--accent-500) / 0.3));
		margin: 4px 0;
	}

	/* Mobile Content */
	:global(.mobile-content) {
		flex: 1;
		padding-bottom: 2rem;
	}

	:global(.mobile-header) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}

	:global(.mobile-date) {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(var(--accent-500));
		font-family: var(--font-doto), monospace;
	}

	:global(.mobile-role) {
		font-size: 1.125rem;
		font-weight: 700;
		color: rgb(var(--foreground));
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
	}

	:global(.mobile-company) {
		font-size: 0.875rem;
		color: rgb(var(--foreground-muted));
		margin: 0 0 0.75rem 0;
	}

	/* Mobile Description List */
	:global(.mobile-description-list) {
		list-style: none;
		padding: 0;
		margin: 0 0 0.75rem 0;
	}

	:global(.mobile-description-list li) {
		position: relative;
		font-size: 0.82rem;
		line-height: 1.55;
		color: rgb(var(--foreground-muted));
		padding-left: 0.9rem;
		margin-bottom: 0.4rem;
	}

	:global(.mobile-description-list li:last-child) {
		margin-bottom: 0;
	}

	:global(.mobile-description-list li::before) {
		content: '▸';
		position: absolute;
		left: 0;
		color: var(--node-color);
		opacity: 0.7;
		font-size: 0.7rem;
	}

	/* Mobile Tech Stack */
	:global(.mobile-tech-stack) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	:global(.mobile-tech-pill) {
		font-size: 0.65rem;
		font-weight: 500;
		color: oklch(var(--accent-300));
		background: oklch(var(--accent-900) / 0.2);
		padding: 0.1rem 0.5rem;
		border-radius: 9999px;
		border: 1px solid oklch(var(--accent-500) / 0.3);
	}

	/* ====================================
	   Responsive Adjustments
	   ==================================== */
	@media (min-width: 768px) and (max-width: 1023px) {
		:global(.experience-card) {
			width: 340px;
			padding: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		:global(.experience-card) {
			width: 400px;
		}
	}

	/* ====================================
	   Reduced Motion
	   ==================================== */
	@media (prefers-reduced-motion: reduce) {
		:global(.commit-node),
		:global(.experience-card),
		:global(.mobile-experience-item) {
			transition: none;
			animation: none;
		}

		:global(.mobile-experience-item) {
			opacity: 1;
			transform: none;
		}
	}
</style>

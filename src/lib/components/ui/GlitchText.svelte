<script lang="ts">
	interface Props {
		text: string;
		class?: string;
	}

	let { text, class: className }: Props = $props();
</script>

<div class="stack {className}" style="--stacks: 3;">
	<span style="--index: 0;">{text}</span>
	<span style="--index: 1;">{text}</span>
	<span style="--index: 2;">{text}</span>
</div>

<style>
	.right {
		text-align: right;
		width: 100%;
	}

	.stack {
		display: grid;
		grid-template-columns: 1fr;
		--stacks: 3;
		--glitch-duration: 2s;
		--stack-animation-duration: 340ms;
		--stack-delay-increment: 120ms;
		--glitch-translate-odd: 8px;
		--glitch-translate-even: -8px;
		--glitch-color-1: red;
		--glitch-color-2: blue;
		position: relative;
		z-index: 1;
		transform-style: preserve-3d;
	}

	.stack span {
		font-weight: bold;
		grid-row-start: 1;
		grid-column-start: 1;
		--stack-height: calc(100% / var(--stacks) - 1px);
		--inverse-index: calc(calc(var(--stacks) - 1) - var(--index));
		--clip-top: calc(var(--stack-height) * var(--index));
		--clip-bottom: calc(var(--stack-height) * var(--inverse-index));
		clip-path: inset(var(--clip-top) 0 var(--clip-bottom) 0);
		animation:
			stack var(--stack-animation-duration) cubic-bezier(0.46, 0.29, 0, 1.24) 1 backwards
				calc(var(--index) * var(--stack-delay-increment)),
			glitch var(--glitch-duration) ease infinite calc(var(--glitch-duration) / 2) alternate-reverse;
		will-change: transform, opacity;
		backface-visibility: hidden;
		transform: translateZ(0);
		user-select: none;
	}

	.stack span:last-child {
		user-select: auto;
	}

	.stack span:nth-child(odd) {
		--glitch-translate: var(--glitch-translate-odd);
	}
	.stack span:nth-child(even) {
		--glitch-translate: var(--glitch-translate-even);
	}

	@keyframes stack {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateZ(0);
			text-shadow:
				-2px 3px 0 var(--glitch-color-1),
				2px -3px 0 var(--glitch-color-2);
		}
		60% {
			opacity: 0.5;
			transform: translateX(50%) translateZ(0);
		}
		80% {
			transform: translateZ(0);
			opacity: 1;
			text-shadow:
				2px -3px 0 var(--glitch-color-1),
				-2px 3px 0 var(--glitch-color-2);
		}
		100% {
			transform: translateZ(0);
			text-shadow: none;
		}
	}

	@keyframes glitch {
		0% {
			text-shadow:
				-2px 3px 0 var(--glitch-color-1),
				2px -3px 0 var(--glitch-color-2);
			transform: translate(var(--glitch-translate)) translateZ(0);
		}
		2% {
			text-shadow:
				2px -3px 0 var(--glitch-color-1),
				-2px 3px 0 var(--glitch-color-2);
		}
		4%,
		100% {
			text-shadow: none;
			transform: translateZ(0);
		}
	}

	/* Accessibility - respect user's reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.stack span {
			animation: none;
			opacity: 1;
			clip-path: none;
			text-shadow: none;
			transform: none;
		}
	}
</style>

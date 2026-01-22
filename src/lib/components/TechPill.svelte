<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		name: string;
		class?: string;
		showIcon?: boolean;
		size?: 'xs' | 'sm' | 'md';
		as?: 'span' | 'a' | 'button';
		href?: string;
		title?: string;
		variant?: 'ghost' | 'solid' | 'outline';
		onclick?: () => void;
		children?: Snippet;
	}

	let {
		name,
		class: className,
		showIcon = true,
		size = 'sm',
		as = 'span',
		href,
		title,
		variant = 'ghost',
		onclick,
		children
	}: Props = $props();

	// Normalize slug (handles: "C++", "c#", "Next.js", "Tailwind CSS" etc.)
	const normalizeSlug = (n: string) =>
		String(n)
			.trim()
			.toLowerCase()
			// common aliases / tokens
			.replace(/\s*\+\s*/g, 'plus') // "c++" => "cplusplus"
			.replace(/#/g, 'sharp') // "c#" => "csharp"
			.replace(/\.js\b/g, 'js') // "next.js" -> "nextjs"
			.replace(/\s+/g, '') // remove spaces for your mapping keys (matches original)
			.replace(/[^a-z0-9]/g, '');

	const techSlug = $derived(normalizeSlug(name));

	// Original mapping (kept and slightly expanded for aliases)
	const techIcons: Record<string, string> = {
		html: 'mdi:language-html5',
		css: 'mdi:language-css3',
		javascript: 'mdi:language-javascript',
		typescript: 'mdi:language-typescript',
		react: 'mdi:react',
		nextjs: 'simple-icons:nextdotjs',
		svelte: 'simple-icons:svelte',
		sveltekit: 'simple-icons:svelte',
		redux: 'simple-icons:redux',
		tailwindcss: 'mdi:tailwind',
		astro: 'simple-icons:astro',
		tauri: 'simple-icons:tauri',
		django: 'simple-icons:django',
		php: 'mdi:language-php',
		sql: 'mdi:database',
		sqlite: 'simple-icons:sqlite',
		postgresql: 'simple-icons:postgresql',
		firebase: 'mdi:firebase',
		python: 'mdi:language-python',
		java: 'mdi:language-java',
		rust: 'simple-icons:rust',
		cplusplus: 'mdi:language-cpp',
		c: 'mdi:language-c',
		csharp: 'mdi:microsoft-dot-net',
		git: 'mdi:git',
		github: 'mdi:github',
		linux: 'mdi:linux',
		bash: 'mdi:console',
		batch: 'mdi:microsoft-windows',
		figma: 'mdi:figma',
		vim: 'simple-icons:vim',
		githubactions: 'mdi:github-actions',
		jira: 'mdi:jira',
		scrum: 'mdi:chart-timeline',
		latex: 'simple-icons:latex',
		markdown: 'mdi:language-markdown-outline',
		google: 'mdi:google',
		vercel: 'simple-icons:vercel',
		stripeapi: 'simple-icons:stripe',
		stripe: 'simple-icons:stripe',
		jwt: 'simple-icons:jsonwebtokens',
		restapi: 'mdi:api',
		serveraction: 'mdi:server',
		cloudflare: 'simple-icons:cloudflare',
		cloudinary: 'simple-icons:cloudinary',
		payloadcms: 'simple-icons:payloadcms',
		aiml: 'mdi:brain'
	};

	const iconName = $derived(techIcons[techSlug] || 'mdi:code-tags');
	const computedTitle = $derived(title || name);
	const isLink = $derived(as === 'a' && href);
</script>

{#if isLink}
	<a
		class="tech-pill size-{size} variant-{variant} {className}"
		data-tech={techSlug}
		data-size={size}
		aria-label={name}
		title={computedTitle}
		{href}
		rel="noopener noreferrer"
		target="_blank"
	>
		{#if showIcon}
			<Icon icon={iconName} class="tech-icon" />
		{/if}
		<span class="tech-name">{name}</span>
	</a>
{:else if as === 'button'}
	<button
		class="tech-pill size-{size} variant-{variant} {className}"
		data-tech={techSlug}
		data-size={size}
		aria-label={name}
		title={computedTitle}
		{onclick}
	>
		{#if showIcon}
			<Icon icon={iconName} class="tech-icon" />
		{/if}
		<span class="tech-name">{name}</span>
	</button>
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<span
		class="tech-pill size-{size} variant-{variant} {className}"
		data-tech={techSlug}
		data-size={size}
		aria-label={name}
		title={computedTitle}
		role={onclick ? 'button' : undefined}
		tabindex={onclick ? 0 : undefined}
		onclick={onclick}
		onkeydown={(e) => {
			if (onclick && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				onclick();
			}
		}}
	>
		{#if showIcon}
			<Icon icon={iconName} class="tech-icon" />
		{/if}
		<span class="tech-name">{name}</span>
	</span>
{/if}

<style>
	/* === Base (Refreshed Design) === */
	.tech-pill {
		--pill-color: oklch(80% 0.1 200); /* Default color */
		--pill-bg: color-mix(in oklch, var(--pill-color), transparent 88%);
		--pill-bg-hover: color-mix(in oklch, var(--pill-color), transparent 82%);
		--pill-border: color-mix(in oklch, var(--pill-color), transparent 80%);
		--pill-border-hover: color-mix(in oklch, var(--pill-color), transparent 65%);
		--pill-text: var(--pill-color);
		--pill-shadow: 0 1px 2px color-mix(in oklch, black, transparent 92%);
		--pill-shadow-hover: 0 4px 10px color-mix(in oklch, var(--pill-color), transparent 85%);

		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		border-radius: 9999px;
		border: 1px solid var(--pill-border);
		background: var(--pill-bg);
		color: var(--pill-text);
		box-shadow: var(--pill-shadow);
		line-height: 1.15;
		font-weight: 500;
		text-decoration: none;
		position: relative;
		white-space: nowrap;
		backdrop-filter: blur(10px);
		transition:
			background 0.25s ease,
			border-color 0.25s ease,
			box-shadow 0.25s ease,
			transform 0.25s ease;
		padding: 0.38rem 0.7rem;
		font-size: 0.72rem;
		user-select: none;
		cursor: pointer;
	}

	.tech-pill:hover,
	.tech-pill:focus-visible {
		background: var(--pill-bg-hover);
		border-color: var(--pill-border-hover);
		box-shadow: var(--pill-shadow-hover);
		transform: translateY(-2px) scale(1.02);
	}

	.tech-pill:active {
		transform: translateY(0) scale(1);
		transition-duration: 0.1s;
	}

	:global(.tech-icon) {
		width: 0.95rem;
		height: 0.95rem;
		opacity: 0.85;
		transition: opacity 0.3s ease;
		flex: 0 0 auto;
	}
	.tech-pill:hover :global(.tech-icon) {
		opacity: 1;
	}

	.tech-name {
		display: inline-block;
	}

	/* Size variants */
	.size-xs {
		padding: 0.28rem 0.55rem;
		font-size: 0.625rem;
	}
	.size-sm {
		padding: 0.38rem 0.7rem;
		font-size: 0.72rem;
	}
	.size-md {
		padding: 0.5rem 0.9rem;
		font-size: 0.8rem;
	}

	/* Variant support */
	.variant-ghost {
		background: transparent;
		backdrop-filter: none;
	}
	.variant-solid {
		--pill-bg: color-mix(in oklch, var(--pill-color), transparent 80%);
		--pill-bg-hover: color-mix(in oklch, var(--pill-color), transparent 70%);
		--pill-shadow-hover: 0 6px 12px color-mix(in oklch, var(--pill-color), transparent 80%);
	}
	.variant-outline {
		background: transparent;
		border-width: 1.5px;
	}

	/* Focus accessibility */
	.tech-pill:focus-visible {
		outline: 2px solid color-mix(in oklch, var(--pill-color), transparent 40%);
		outline-offset: 2px;
	}

	/* High contrast mode */
	@media (forced-colors: active) {
		.tech-pill {
			forced-color-adjust: auto;
			background: Canvas;
			color: ButtonText;
			border-color: ButtonText;
			border-radius: 4px;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tech-pill,
		.tech-pill:hover,
		.tech-pill:active {
			transition: none;
			transform: none;
		}
	}

	/* === Per-tech theming === */
	.tech-pill[data-tech='html'] {
		--pill-color: #e44d26;
	}
	.tech-pill[data-tech='css'] {
		--pill-color: #5d79f1;
	}
	.tech-pill[data-tech='javascript'] {
		--pill-color: #f7df1e;
	}
	.tech-pill[data-tech='typescript'] {
		--pill-color: #5a9ee0;
	}
	.tech-pill[data-tech='react'] {
		--pill-color: #61dafb;
	}
	.tech-pill[data-tech='nextjs'] {
		--pill-color: oklch(95% 0 0);
	}
	.tech-pill[data-tech='astro'] {
		--pill-color: #ff5d01;
	}
	.tech-pill[data-tech='tailwindcss'] {
		--pill-color: #06b6d4;
	}
	.tech-pill[data-tech='php'] {
		--pill-color: #9a9dc7;
	}
	.tech-pill[data-tech='redux'] {
		--pill-color: #9d78d9;
	}
	.tech-pill[data-tech='sql'] {
		--pill-color: #4a9eff;
	}
	.tech-pill[data-tech='jwt'] {
		--pill-color: oklch(85% 0 0);
	}
	.tech-pill[data-tech='restapi'] {
		--pill-color: #25d366;
	}
	.tech-pill[data-tech='serveraction'] {
		--pill-color: #8b5cf6;
	}
	.tech-pill[data-tech='django'] {
		--pill-color: #44b78b;
	}
	.tech-pill[data-tech='postgresql'] {
		--pill-color: #6b8df3;
	}
	.tech-pill[data-tech='svelte'] {
		--pill-color: #ff3e00;
	}
	.tech-pill[data-tech='sveltekit'] {
		--pill-color: #ff3e00;
	}
	.tech-pill[data-tech='firebase'] {
		--pill-color: #ffca28;
	}
	.tech-pill[data-tech='python'] {
		--pill-color: #3776ab;
	}
	.tech-pill[data-tech='java'] {
		--pill-color: #ed8b00;
	}
	.tech-pill[data-tech='cplusplus'] {
		--pill-color: #00599c;
	}
	.tech-pill[data-tech='c'] {
		--pill-color: #a8b9cc;
	}
	.tech-pill[data-tech='csharp'] {
		--pill-color: #9b4f96;
	}
	.tech-pill[data-tech='git'] {
		--pill-color: #f05032;
	}
	.tech-pill[data-tech='github'] {
		--pill-color: oklch(95% 0 0);
	}
	.tech-pill[data-tech='linux'] {
		--pill-color: #fcc100;
	}
	.tech-pill[data-tech='figma'] {
		--pill-color: #f24e1e;
	}
	.tech-pill[data-tech='vim'] {
		--pill-color: #019733;
	}
	.tech-pill[data-tech='jira'] {
		--pill-color: #2684ff;
	}
	.tech-pill[data-tech='vercel'] {
		--pill-color: oklch(95% 0 0);
	}
	.tech-pill[data-tech='stripe'] {
		--pill-color: #635bff;
	}
	.tech-pill[data-tech='stripeapi'] {
		--pill-color: #635bff;
	}
	.tech-pill[data-tech='tauri'] {
		--pill-color: #24c8b1;
	}
	.tech-pill[data-tech='rust'] {
		--pill-color: #dea584;
	}
	.tech-pill[data-tech='sqlite'] {
		--pill-color: #559ed5;
	}
	.tech-pill[data-tech='cloudflare'] {
		--pill-color: #f38020;
	}
	.tech-pill[data-tech='cloudinary'] {
		--pill-color: #3448c5;
	}
	.tech-pill[data-tech='payloadcms'] {
		--pill-color: oklch(95% 0 0);
	}
	.tech-pill[data-tech='aiml'] {
		--pill-color: #8b5cf6;
	}
	.tech-pill[data-tech='gsap'] {
		--pill-color: #88ce02;
	}
</style>

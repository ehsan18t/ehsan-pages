<script lang="ts">
	import info from '$data';
	import Icon from '@iconify/svelte';

	const { socials } = info;

	type SocialKeys = keyof typeof socials;

	// Map social keys to iconify icons
	const iconMap: Record<SocialKeys, string> = {
		gmail: 'mdi:email',
		telegram: 'mdi:telegram',
		discord: 'mdi:discord',
		linkedin: 'mdi:linkedin',
		github: 'mdi:github'
	};

	// Labels for accessibility
	const labelMap: Record<SocialKeys, string> = {
		gmail: 'Email',
		telegram: 'Telegram',
		discord: 'Discord',
		linkedin: 'LinkedIn',
		github: 'GitHub'
	};
</script>

<div class="social-bar">
	<span class="divider"></span>
	<div class="social-links">
		{#each Object.keys(socials) as key, index (key)}
			{@const url = socials[key as SocialKeys]}
			<a
				target="_blank"
				href={url}
				rel="noopener noreferrer"
				class="social-link"
				aria-label={labelMap[key as SocialKeys]}
				style="animation-delay: {0.4 + index * 0.1}s"
			>
				<Icon icon={iconMap[key as SocialKeys]} width={20} height={20} />
				<span class="tooltip">{labelMap[key as SocialKeys]}</span>
			</a>
		{/each}
	</div>
</div>

<style lang="postcss">
	@reference "$routes/layout.css";

	.social-bar {
		@apply flex items-center justify-center gap-3 pt-1 sm:gap-4 sm:pt-2 md:justify-start;
	}

	.divider {
		@apply hidden h-px w-8 md:block;
		background: linear-gradient(to right, transparent, oklch(var(--accent-500) / 0.5));
	}

	.social-links {
		@apply flex gap-1.5 sm:gap-2;
	}

	.social-link {
		@apply relative flex size-9 animate-[fadeInUp_0.5s_ease-out_both] items-center justify-center rounded-lg border border-[oklch(var(--accent-500)/0.1)] bg-[oklch(var(--accent-500)/0.05)] text-[oklch(var(--foreground)/0.7)] transition-all duration-300 sm:size-10 sm:rounded-[10px];
	}

	.social-link:hover {
		@apply -translate-y-0.75 border-[oklch(var(--accent-500)/0.4)] bg-[oklch(var(--accent-500)/0.15)] text-accent-text;
	}

	/* Tooltip */
	.tooltip {
		@apply pointer-events-none invisible absolute left-1/2 -translate-x-1/2 scale-[0.8] rounded-md border border-[oklch(var(--accent-500)/0.3)] bg-accent-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-accent-text opacity-0 transition-all duration-200;
		bottom: calc(100% + 8px);
	}

	.tooltip::after {
		@apply absolute top-full left-1/2 -translate-x-1/2;
		content: '';
		border: 5px solid transparent;
		border-top-color: oklch(var(--accent-900));
	}

	.social-link:hover .tooltip {
		@apply visible scale-100 opacity-100;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.social-link {
			animation: none;
		}
		.social-link:hover {
			@apply translate-y-0;
		}
	}
</style>

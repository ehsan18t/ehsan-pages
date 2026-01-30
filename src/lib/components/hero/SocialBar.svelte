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

<style>
	.social-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding-top: 0.5rem;
	}

	@media (min-width: 768px) {
		.social-bar {
			justify-content: flex-start;
		}
	}

	.divider {
		display: none;
		width: 2rem;
		height: 1px;
		background: linear-gradient(to right, transparent, oklch(var(--accent-500) / 0.5));
	}

	@media (min-width: 768px) {
		.divider {
			display: block;
		}
	}

	.social-links {
		display: flex;
		gap: 0.5rem;
	}

	.social-link {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: oklch(var(--accent-500) / 0.05);
		border: 1px solid oklch(var(--accent-500) / 0.1);
		color: oklch(var(--foreground) / 0.7);
		transition: all 0.3s ease;
		animation: fadeInUp 0.5s ease-out both;
	}

	.social-link:hover {
		background: oklch(var(--accent-500) / 0.15);
		border-color: oklch(var(--accent-500) / 0.4);
		color: oklch(var(--accent-text));
		transform: translateY(-3px);
	}

	/* Tooltip */
	.tooltip {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%) scale(0.8);
		padding: 0.35rem 0.65rem;
		background: oklch(var(--accent-900));
		border: 1px solid oklch(var(--accent-500) / 0.3);
		border-radius: 6px;
		font-size: 0.75rem;
		color: oklch(var(--accent-text));
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transition: all 0.2s ease;
		pointer-events: none;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: oklch(var(--accent-900));
	}

	.social-link:hover .tooltip {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) scale(1);
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
			transform: none;
		}
	}
</style>

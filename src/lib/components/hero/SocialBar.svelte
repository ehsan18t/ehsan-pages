<script lang="ts">
	import info from '$data';
	import Icon from '@iconify/svelte';

	const iconClass =
		'p-1 select-none hover:ring-4 hover:text-white md:bg-transparent rounded-full ring-2 transition ease-in-out duration-200';
	const { socials } = info;

	type SocialKeys = keyof typeof socials;

	const size = 40;
	const colors: Record<SocialKeys, string> = {
		gmail: 'text-rose-400 ring-rose-400 hover:bg-rose-600',
		telegram: 'text-sky-400 ring-sky-400 hover:bg-sky-600',
		discord: 'text-indigo-400 ring-indigo-400 hover:bg-indigo-600',
		linkedin: 'text-blue-400 ring-blue-400 hover:bg-blue-600',
		github: 'text-gray-400 ring-gray-400 hover:bg-gray-700'
	};

	// Map social keys to iconify icons
	const iconMap: Record<SocialKeys, string> = {
		gmail: 'mdi:email',
		telegram: 'mdi:telegram',
		discord: 'mdi:discord',
		linkedin: 'mdi:linkedin',
		github: 'mdi:github'
	};
</script>

<div class="appear z-10 flex items-center justify-center md:justify-start">
	<div class="flex gap-3">
		{#each Object.keys(socials) as key (key)}
			{@const url = socials[key as SocialKeys]}
			<a target="_blank" href={url} rel="noopener noreferrer">
				<Icon
					icon={iconMap[key as SocialKeys]}
					width={size}
					height={size}
					class="{iconClass} {colors[key as SocialKeys]}"
				/>
			</a>
		{/each}
	</div>
</div>

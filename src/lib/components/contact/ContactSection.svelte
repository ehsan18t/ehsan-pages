<script lang="ts">
	/**
	 * ContactSection Component - Wrapper for contact methods
	 *
	 * Provides a toggle between Terminal (for power users) and
	 * SimpleMailbox (for users who prefer traditional forms).
	 *
	 * Features:
	 * - Mode toggle with smooth transitions
	 * - Persists preference in localStorage
	 * - Mobile defaults to Mailbox (more familiar)
	 * - Desktop defaults to Terminal (power users)
	 * - Animated mode switch
	 */

	import { browser } from '$app/environment';
	import { Terminal, SimpleMailbox } from '$components/contact';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';

	// ─────────────────────────────────────────────────────────────
	// Types & Constants
	// ─────────────────────────────────────────────────────────────

	type ContactMode = 'terminal' | 'mailbox';
	const STORAGE_KEY = 'contact-mode-preference';

	// ─────────────────────────────────────────────────────────────
	// State
	// ─────────────────────────────────────────────────────────────

	let mode = $state<ContactMode>('terminal');
	let isInitialized = $state(false);

	// ─────────────────────────────────────────────────────────────
	// Initialize mode from localStorage or viewport
	// ─────────────────────────────────────────────────────────────

	$effect(() => {
		if (!browser || isInitialized) return;

		// Check localStorage first
		const saved = localStorage.getItem(STORAGE_KEY) as ContactMode | null;
		if (saved && (saved === 'terminal' || saved === 'mailbox')) {
			mode = saved;
		} else {
			// Default based on viewport: mobile users get mailbox
			const isMobile = window.innerWidth < 768;
			mode = isMobile ? 'mailbox' : 'terminal';
		}

		isInitialized = true;
	});

	// ─────────────────────────────────────────────────────────────
	// Mode Toggle
	// ─────────────────────────────────────────────────────────────

	function setMode(newMode: ContactMode): void {
		mode = newMode;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, newMode);
		}
	}

	function toggleMode(): void {
		setMode(mode === 'terminal' ? 'mailbox' : 'terminal');
	}
</script>

<section
	id="contact"
	class="contact-section relative min-h-screen w-full py-20"
	aria-labelledby="contact-heading"
>
	<!-- Background gradient -->
	<div
		class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[rgba(88,166,255,0.03)] to-transparent"
	></div>

	<div class="relative z-10 container mx-auto px-4">
		<!-- Section Header -->
		<div class="mb-12 text-center">
			<h2
				id="contact-heading"
				class="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl"
			>
				Get In Touch
			</h2>
			<p class="mx-auto max-w-lg text-lg text-gray-400">
				Have a project in mind or just want to say hello? I'd love to hear from you.
			</p>
		</div>

		<!-- Mode Toggle -->
		<div class="mb-8 flex justify-center">
			<div
				class="inline-flex items-center gap-1 rounded-xl border border-gray-700/50 bg-gray-900/50 p-1 backdrop-blur-sm"
			>
				<button
					type="button"
					class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all {mode ===
					'terminal'
						? 'bg-blue-500/20 text-blue-400'
						: 'text-gray-400 hover:text-gray-300'}"
					onclick={() => setMode('terminal')}
					aria-pressed={mode === 'terminal'}
				>
					<Icon icon="mdi:console" width={16} height={16} />
					<span class="max-sm:hidden">Terminal</span>
				</button>

				<button
					type="button"
					class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all {mode ===
					'mailbox'
						? 'bg-blue-500/20 text-blue-400'
						: 'text-gray-400 hover:text-gray-300'}"
					onclick={() => setMode('mailbox')}
					aria-pressed={mode === 'mailbox'}
				>
					<Icon icon="mdi:email-outline" width={16} height={16} />
					<span class="max-sm:hidden">Form</span>
				</button>
			</div>
		</div>

		<!-- Mode hint -->
		<p class="mb-6 text-center text-sm text-gray-500">
			{#if mode === 'terminal'}
				<span class="flex items-center justify-center gap-1.5">
					<Icon icon="mdi:information-outline" width={14} height={14} />
					Power user? Use terminal commands. Prefer forms?
					<button
						type="button"
						class="text-blue-400 underline underline-offset-2 hover:text-blue-300"
						onclick={toggleMode}
					>
						Switch to form
					</button>
				</span>
			{:else}
				<span class="flex items-center justify-center gap-1.5">
					<Icon icon="mdi:information-outline" width={14} height={14} />
					Want a more interactive experience?
					<button
						type="button"
						class="text-blue-400 underline underline-offset-2 hover:text-blue-300"
						onclick={toggleMode}
					>
						Try the terminal
					</button>
				</span>
			{/if}
		</p>

		<!-- Contact Component Container -->
		<div class="flex justify-center">
			{#if isInitialized}
				{#key mode}
					<div
						class="w-full"
						in:fly={{ y: 20, duration: 300, delay: 150 }}
						out:fly={{ y: -20, duration: 200 }}
					>
						{#if mode === 'terminal'}
							<Terminal />
						{:else}
							<SimpleMailbox />
						{/if}
					</div>
				{/key}
			{:else}
				<!-- Loading placeholder -->
				<div
					class="animate-pulse mx-8 h-[500px] w-full max-w-220 rounded-xl border border-gray-700/50 bg-gray-900/50"
				></div>
			{/if}
		</div>
	</div>
</section>

<style lang="postcss">
	@reference '$routes/layout.css';
</style>

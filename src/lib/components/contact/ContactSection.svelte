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
	import { SimpleMailbox, Terminal } from '$components/contact';
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

<div class="contact-wrapper w-full">
	<!-- Mode Toggle -->
	<div class="mb-6 flex justify-center">
		<div
			class="inline-flex items-center gap-1 rounded-xl border border-accent-500/20 bg-surface-1 p-1 backdrop-blur-sm"
		>
			<button
				type="button"
				class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4 {mode ===
				'terminal'
					? 'bg-accent-bg/30 text-accent-text'
					: 'text-foreground-muted hover:text-foreground'}"
				onclick={() => setMode('terminal')}
				aria-pressed={mode === 'terminal'}
			>
				<Icon icon="mdi:console" width={16} height={16} />
				<span>Terminal</span>
			</button>

			<button
				type="button"
				class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4 {mode ===
				'mailbox'
					? 'bg-accent-bg/30 text-accent-text'
					: 'text-foreground-muted hover:text-foreground'}"
				onclick={() => setMode('mailbox')}
				aria-pressed={mode === 'mailbox'}
			>
				<Icon icon="mdi:email-outline" width={16} height={16} />
				<span>Form</span>
			</button>
		</div>
	</div>

	<!-- Mode hint - simplified for mobile -->
	<p class="mb-6 text-center text-sm text-foreground-muted">
		{#if mode === 'terminal'}
			<span class="flex flex-wrap items-center justify-center gap-1.5">
				<span class="max-sm:hidden">Power user? Use terminal commands.</span>
				<span class="sm:hidden">Prefer a simple form?</span>
				<button
					type="button"
					class="text-accent-text underline underline-offset-2 hover:text-accent-500"
					onclick={toggleMode}
				>
					Switch to form
				</button>
			</span>
		{:else}
			<span class="flex flex-wrap items-center justify-center gap-1.5">
				<span class="max-sm:hidden">Want a more interactive experience?</span>
				<span class="sm:hidden">Like terminals?</span>
				<button
					type="button"
					class="text-accent-text underline underline-offset-2 hover:text-accent-500"
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
				class="animate-pulse mx-4 h-125 w-full max-w-220 rounded-xl border border-gray-700/50 bg-gray-900/50 sm:mx-8"
			></div>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference '$routes/layout.css';
</style>

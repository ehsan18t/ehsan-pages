<script lang="ts">
	/**
	 * Terminal Component - Interactive contact terminal
	 *
	 * Features:
	 * - Svelte 5 runes ($state, $effect)
	 * - Command history navigation (↑/↓)
	 * - Tab autocomplete with visual suggestions
	 * - Ctrl+C / Ctrl+L shortcuts
	 * - Blinking cursor
	 * - ASCII art welcome banner
	 * - Mobile-friendly design with quick action buttons
	 * - Social links with hover effects
	 * - Fuzzy command matching for error recovery
	 * - Enhanced accessibility (ARIA, screen reader support)
	 */

	import { browser } from '$app/environment';
	import { description, name, title } from '$data';
	import {
		EMAIL_REGEX,
		findMatchingCommand,
		generateWhoamiBox,
		getEmailAddress,
		getTerminalSocialLinks,
		HELP_TEXT,
		SEND_USAGE_TEXT,
		sendEmail,
		WELCOME_ASCII,
		type TerminalCommand,
		type TerminalCommandEntry,
		type TerminalSocialLink
	} from '$data/terminalCommands';
	import Icon from '@iconify/svelte';
	import { fly } from 'svelte/transition';

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let history = $state<TerminalCommandEntry[]>([]);
	let input = $state('');
	let isProcessing = $state(false);
	let commandBuffer = $state<string[]>([]);
	let bufferIndex = $state(-1);
	let entryIdCounter = $state(0);
	let showCursor = $state(true);
	let hasInitialized = $state(false);
	let autocompleteHint = $state('');
	let showQuickActions = $state(true);
	let lastAnnouncement = $state('');

	let terminalRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);

	// Quick action buttons for discoverability
	const quickActions = [
		{ label: '📧 Send Message', command: 'send ', icon: 'mdi:email-fast-outline' },
		{ label: '🔗 Social Links', command: 'social', icon: 'mdi:share-variant' },
		{ label: '👤 About Me', command: 'whoami', icon: 'mdi:account-circle' },
		{ label: '❓ Help', command: 'help', icon: 'mdi:help-circle' }
	];

	// ─────────────────────────────────────────────────────────────
	// Helpers
	// ─────────────────────────────────────────────────────────────

	function nextId(): number {
		return entryIdCounter++;
	}

	function focusInput(): void {
		inputRef?.focus();
	}

	function scrollToBottom(): void {
		if (terminalRef) {
			requestAnimationFrame(() => {
				if (terminalRef) {
					terminalRef.scrollTop = terminalRef.scrollHeight;
				}
			});
		}
	}

	function addToBuffer(cmd: string): void {
		if (cmd.trim() && commandBuffer[0] !== cmd) {
			commandBuffer = [cmd, ...commandBuffer.slice(0, 49)];
		}
		bufferIndex = -1;
	}

	function handleLinkClick(e: MouseEvent, url: string): void {
		e.stopPropagation();
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	function announce(message: string): void {
		lastAnnouncement = message;
	}

	function handleQuickAction(command: string): void {
		input = command;
		focusInput();
		if (!command.endsWith(' ')) {
			// Execute immediately if command is complete
			executeCommand(command);
			input = '';
		}
		// Hide quick actions after first use
		showQuickActions = false;
	}

	// Fuzzy command matching for typo suggestions
	function findSimilarCommand(input: string): string | null {
		const cmdName = input.toLowerCase().split(/\s+/)[0];
		const commandNames = commands.map((c) => c.name);

		// Check for close matches using simple Levenshtein-like logic
		for (const name of commandNames) {
			// Check if starts with same letters
			if (name.startsWith(cmdName.slice(0, 2)) && Math.abs(name.length - cmdName.length) <= 2) {
				return name;
			}
			// Check for character transposition
			if (cmdName.length >= 3) {
				const sorted1 = cmdName.split('').sort().join('');
				const sorted2 = name.split('').sort().join('');
				if (sorted1 === sorted2) return name;
			}
		}
		return null;
	}

	// Update autocomplete hint based on input
	function updateAutocompleteHint(): void {
		if (!input.trim()) {
			autocompleteHint = '';
			return;
		}
		const match = findMatchingCommand(input, commands);
		if (match && match.name !== input.toLowerCase()) {
			autocompleteHint = match.name.slice(input.length);
		} else {
			autocompleteHint = '';
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Commands
	// ─────────────────────────────────────────────────────────────

	const commands: TerminalCommand[] = [
		{
			name: 'help',
			description: 'Show available commands',
			handler: () => [{ id: nextId(), type: 'output', content: HELP_TEXT }]
		},
		{
			name: 'whoami',
			description: 'About me',
			handler: () => [
				{
					id: nextId(),
					type: 'output',
					content: generateWhoamiBox(name, title, description)
				}
			]
		},
		{
			name: 'social',
			description: 'Show social links',
			handler: () => [
				{
					id: nextId(),
					type: 'links',
					content: JSON.stringify(getTerminalSocialLinks())
				}
			]
		},
		{
			name: 'send',
			description: 'Send a message',
			handler: async (args) => {
				if (args.length < 2) {
					return [{ id: nextId(), type: 'error', content: SEND_USAGE_TEXT }];
				}

				const email = args[0];
				const message = args.slice(1).join(' ');

				if (!EMAIL_REGEX.test(email)) {
					return [
						{
							id: nextId(),
							type: 'error',
							content: `Invalid email format: ${email}\n\nPlease provide a valid email address.`
						}
					];
				}

				if (message.length < 10) {
					return [
						{
							id: nextId(),
							type: 'error',
							content: 'Message too short. Please write at least 10 characters.'
						}
					];
				}

				isProcessing = true;

				try {
					const result = await sendEmail(email, message);

					if (result.success) {
						return [
							{
								id: nextId(),
								type: 'success',
								content: `✓ Message sent successfully!\n\nThank you for reaching out. I'll get back to you at ${email} as soon as possible.`
							}
						];
					} else {
						throw new Error(result.error || 'Failed to send message');
					}
				} catch (error) {
					return [
						{
							id: nextId(),
							type: 'error',
							content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or email me directly at ${getEmailAddress()}`
						}
					];
				} finally {
					isProcessing = false;
				}
			}
		},
		{
			name: 'clear',
			description: 'Clear terminal',
			handler: () => {
				history = [];
				return [];
			}
		}
	];

	// ─────────────────────────────────────────────────────────────
	// Command Execution
	// ─────────────────────────────────────────────────────────────

	async function executeCommand(cmdInput: string): Promise<void> {
		const trimmed = cmdInput.trim();
		if (!trimmed) return;

		addToBuffer(trimmed);

		// Add command to history
		history = [
			...history,
			{
				id: nextId(),
				type: 'command',
				content: trimmed
			}
		];

		const [cmdName, ...args] = trimmed.split(/\s+/);
		const command = commands.find((c) => c.name === cmdName.toLowerCase());

		if (command) {
			const results = await command.handler(args);
			if (results.length > 0) {
				history = [...history, ...results];
				announce(`Command ${cmdName} executed`);
			}
		} else {
			// Try to suggest a similar command
			const suggestion = findSimilarCommand(trimmed);
			let errorContent = `Command not found: ${cmdName}\n\nType 'help' to see available commands.`;

			if (suggestion) {
				errorContent = `Command not found: ${cmdName}\n\nDid you mean '${suggestion}'? Type 'help' for available commands.`;
			}

			history = [
				...history,
				{
					id: nextId(),
					type: 'error',
					content: errorContent
				}
			];
			announce(`Error: Command ${cmdName} not found`);
		}

		scrollToBottom();
	}

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	function handleKeyDown(e: KeyboardEvent): void {
		// Prevent terminal scrolling on spacebar
		if (e.key === ' ' && e.target === inputRef) {
			e.stopPropagation();
		}

		if (e.key === 'Enter' && input.trim() && !isProcessing) {
			e.preventDefault();
			const cmd = input;
			input = '';
			autocompleteHint = '';
			showQuickActions = false;
			executeCommand(cmd);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (commandBuffer.length > 0 && bufferIndex < commandBuffer.length - 1) {
				bufferIndex++;
				input = commandBuffer[bufferIndex];
				announce(`History: ${input}`);
				// Move cursor to end
				setTimeout(() => {
					if (inputRef) {
						inputRef.selectionStart = inputRef.value.length;
						inputRef.selectionEnd = inputRef.value.length;
					}
				}, 0);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (bufferIndex > 0) {
				bufferIndex--;
				input = commandBuffer[bufferIndex];
				announce(`History: ${input}`);
			} else if (bufferIndex === 0) {
				bufferIndex = -1;
				input = '';
				announce('End of history');
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const match = findMatchingCommand(input, commands);
			if (match) {
				input = match.name + ' ';
				autocompleteHint = '';
				announce(`Autocompleted to ${match.name}`);
			}
		} else if (e.key === 'c' && e.ctrlKey) {
			e.preventDefault();
			if (isProcessing) {
				isProcessing = false;
				history = [...history, { id: nextId(), type: 'error', content: '^C' }];
				announce('Operation cancelled');
			} else {
				input = '';
				autocompleteHint = '';
			}
		} else if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			history = [];
			announce('Terminal cleared');
		}
	}

	function handleInput(): void {
		updateAutocompleteHint();
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Welcome message on mount
	$effect(() => {
		if (browser && !hasInitialized) {
			hasInitialized = true;
			history = [
				{
					id: nextId(),
					type: 'ascii',
					content: WELCOME_ASCII
				},
				{
					id: nextId(),
					type: 'output',
					content: `Welcome! I'm ${name.split(' ')[0]}'s interactive contact terminal.

New here? Use the quick action buttons below, or type commands:

• send <email> <message> — Send me a message
• social — View my social links
• whoami — Learn more about me
• help — See all commands

💡 Tip: Press Tab to autocomplete commands!`
				}
			];
		}
	});

	// Blinking cursor effect
	$effect(() => {
		if (!browser) return;
		const interval = setInterval(() => {
			showCursor = !showCursor;
		}, 530);
		return () => clearInterval(interval);
	});

	// Auto-scroll on history change
	$effect(() => {
		void history.length;
		scrollToBottom();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="terminal w-full overflow-hidden rounded-xl border border-(--t-border) bg-(--t-bg) font-mono shadow-[0_16px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset] max-sm:rounded-lg max-sm:border-x-0"
	onclick={focusInput}
>
	<!-- Window Header -->
	<header
		class="flex items-center justify-between border-b border-(--t-border) bg-linear-to-b from-[#2d333b] to-[#22272e] px-4 py-3.5"
	>
		<div class="flex gap-2">
			<span class="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
			></span>
			<span class="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
			></span>
			<span class="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
			></span>
		</div>
		<div class="flex items-center gap-2 text-[0.8125rem] text-(--t-muted)">
			<Icon icon="mdi:console" width={14} height={14} />
			<span>ehsan@portfolio: ~/contact</span>
		</div>
		<div class="text-(--t-muted) opacity-50">
			<Icon icon="mdi:plus" width={16} height={16} />
		</div>
	</header>

	<!-- Terminal Content -->
	<div
		bind:this={terminalRef}
		class="terminal-content scrollbar-thin scrollbar-color-[var(--t-border)_transparent] h-144 overflow-y-auto px-4 py-4 text-sm leading-[1.7] text-(--t-text) sm:px-6 sm:py-5"
		role="log"
		aria-live="polite"
	>
		{#each history as entry (entry.id)}
			{#if entry.type === 'command'}
				<div class="prompt-line mb-1.5 flex flex-wrap items-start gap-2.5">
					<span class="prompt flex shrink-0 font-medium">
						<span class="text-(--t-green)">ehsan</span><span class="text-(--t-muted)">@</span><span
							class="text-(--t-purple)">portfolio</span
						><span class="text-(--t-muted)">:</span><span class="text-(--t-cyan)">~/contact</span
						><span class="ml-1.5 text-(--t-accent)">$</span>
					</span>
					<span class="text-(--t-text)">{entry.content}</span>
				</div>
			{:else if entry.type === 'ascii'}
				<pre
					class="ascii-art mb-2 overflow-x-auto text-[0.4375rem] leading-[1.15] font-bold text-(--t-accent) sm:text-[0.5625rem] md:text-[0.6875rem]">{entry.content}</pre>
			{:else if entry.type === 'output'}
				<div
					class="output my-2.5 mb-5 rounded-lg border-l-[3px] border-(--t-accent) bg-(--t-bg-light) p-4 px-5 leading-[1.6] wrap-break-word whitespace-pre-wrap"
				>
					{entry.content}
				</div>
			{:else if entry.type === 'error'}
				<div
					class="output my-2.5 mb-5 rounded-lg border-l-[3px] border-(--t-red) bg-[rgba(248,81,73,0.1)] p-4 px-5 leading-[1.6] wrap-break-word whitespace-pre-wrap text-[#ffa198]"
				>
					{entry.content}
				</div>
			{:else if entry.type === 'success'}
				<div
					class="output my-2.5 mb-5 rounded-lg border-l-[3px] border-(--t-green) bg-[rgba(63,185,80,0.1)] p-4 px-5 leading-[1.6] wrap-break-word whitespace-pre-wrap text-[#7ee787]"
				>
					{entry.content}
				</div>
			{:else if entry.type === 'links'}
				{@const links = JSON.parse(entry.content) as TerminalSocialLink[]}
				<div class="my-3 mb-5 flex flex-col gap-2.5">
					{#each links as link (link.platform)}
						<button
							class="social-link flex cursor-pointer items-center gap-3.5 rounded-[10px] border border-(--t-border) bg-(--t-bg-light) px-4.5 py-3.5 text-left text-sm text-(--t-text) transition-all duration-200 hover:translate-x-1.5 hover:border-(--t-accent) hover:bg-[rgba(88,166,255,0.1)]"
							onclick={(e) => handleLinkClick(e, link.url)}
							type="button"
						>
							<Icon icon={link.icon} width={20} height={20} />
							<span class="min-w-20 font-semibold">{link.platform}</span>
							<span
								class="flex-1 overflow-hidden text-[0.8125rem] text-ellipsis whitespace-nowrap text-(--t-muted) max-sm:hidden"
								>{link.url.replace('mailto:', '').replace('https://', '')}</span
							>
							<Icon
								icon="mdi:open-in-new"
								width={14}
								height={14}
								class="link-icon shrink-0 opacity-0 transition-opacity duration-200"
							/>
						</button>
					{/each}
				</div>
			{/if}
		{/each}

		<!-- Active Input Line -->
		<div class="prompt-line active mt-4 flex flex-wrap items-start gap-2.5">
			{#if isProcessing}
				<div class="processing animate-pulse flex items-center gap-3 text-(--t-yellow)">
					<span
						class="animate-spin size-3.5 rounded-full border-2 border-(--t-border) border-t-(--t-yellow)"
					></span>
					<span>Sending message...</span>
					<button
						type="button"
						class="ml-2 text-xs text-(--t-red) hover:underline"
						onclick={() => {
							isProcessing = false;
							history = [...history, { id: nextId(), type: 'error', content: '^C Cancelled' }];
						}}
					>
						Cancel
					</button>
				</div>
			{:else}
				<span class="prompt flex shrink-0 font-medium">
					<span class="text-(--t-green)">ehsan</span><span class="text-(--t-muted)">@</span><span
						class="text-(--t-purple)">portfolio</span
					><span class="text-(--t-muted)">:</span><span class="text-(--t-cyan)">~/contact</span
					><span class="ml-1.5 text-(--t-accent)">$</span>
				</span>
				<div class="relative flex min-w-0 flex-1 items-center">
					<input
						bind:this={inputRef}
						bind:value={input}
						onkeydown={handleKeyDown}
						oninput={handleInput}
						type="text"
						class="font-inherit relative z-10 w-full border-none bg-transparent p-0 text-(--t-text) caret-(--t-accent) outline-none"
						spellcheck="false"
						autocomplete="off"
						autocapitalize="off"
						aria-label="Terminal command input"
						aria-describedby="terminal-hint"
					/>
					<!-- Autocomplete hint overlay -->
					{#if autocompleteHint}
						<span
							class="pointer-events-none absolute left-0 flex text-(--t-muted) opacity-50"
							aria-hidden="true"
						>
							<span class="invisible">{input}</span><span class="text-(--t-accent)"
								>{autocompleteHint}</span
							>
						</span>
					{/if}
					<span
						class="cursor pointer-events-none absolute left-0 z-0 h-[1.25em] w-2 bg-(--t-accent) opacity-0"
						class:visible={showCursor && !input}
					></span>
				</div>
			{/if}
		</div>

		<!-- Quick Action Buttons (shown for new users) -->
		{#if showQuickActions && !isProcessing}
			<div
				class="quick-actions mt-6 flex flex-wrap gap-2"
				transition:fly={{ y: 10, duration: 200 }}
			>
				<span class="mb-2 w-full text-xs text-(--t-muted)">Quick actions:</span>
				{#each quickActions as action (action.command)}
					<button
						type="button"
						class="quick-action-btn flex items-center gap-2 rounded-lg border border-(--t-border) bg-(--t-bg-light) px-3 py-2 text-xs text-(--t-text) transition-all duration-200 hover:border-(--t-accent) hover:bg-[rgba(88,166,255,0.1)]"
						onclick={() => handleQuickAction(action.command)}
					>
						<Icon icon={action.icon} width={14} height={14} class="text-(--t-accent)" />
						{action.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Screen reader announcements -->
	<div id="terminal-hint" class="sr-only" aria-live="polite">
		{lastAnnouncement}
	</div>

	<!-- Footer Hints -->
	<footer
		class="flex justify-center gap-6 border-t border-(--t-border) bg-(--t-bg-light) px-4 py-2.5"
	>
		<span class="flex items-center gap-1.5 text-[0.6875rem] text-(--t-muted)"
			><kbd
				class="font-inherit rounded border border-(--t-border) bg-(--t-bg) px-1.5 py-0.5 text-[0.625rem]"
				>↑↓</kbd
			> History</span
		>
		<span class="flex items-center gap-1.5 text-[0.6875rem] text-(--t-muted)"
			><kbd
				class="font-inherit rounded border border-(--t-border) bg-(--t-bg) px-1.5 py-0.5 text-[0.625rem]"
				>Tab</kbd
			> Complete</span
		>
		<span class="flex items-center gap-1.5 text-[0.6875rem] text-(--t-muted)"
			><kbd
				class="font-inherit rounded border border-(--t-border) bg-(--t-bg) px-1.5 py-0.5 text-[0.625rem]"
				>Ctrl+L</kbd
			> Clear</span
		>
	</footer>
</div>

<style lang="postcss">
	@reference '$routes/layout.css';

	/* Terminal CSS custom properties - using site theme */
	.terminal {
		--t-bg: rgb(var(--background));
		--t-bg-light: var(--surface-1);
		--t-border: var(--border-default);
		--t-text: rgb(var(--foreground));
		--t-muted: rgb(var(--foreground-muted));
		--t-accent: oklch(var(--accent-500));
		--t-accent-light: oklch(var(--accent-text));
		--t-green: oklch(0.75 0.16 150);
		--t-red: oklch(0.65 0.22 25);
		--t-yellow: oklch(0.75 0.14 80);
		--t-purple: oklch(0.72 0.18 300);
		--t-cyan: oklch(var(--accent-500));
		font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
	}

	/* Screen reader only */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Custom scrollbar */
	.terminal-content::-webkit-scrollbar {
		@apply w-2;
	}
	.terminal-content::-webkit-scrollbar-track {
		@apply bg-transparent;
	}
	.terminal-content::-webkit-scrollbar-thumb {
		@apply rounded bg-(--t-border);
	}

	/* Cursor visibility */
	.cursor.visible {
		@apply opacity-80;
	}

	/* Social link hover state */
	.social-link:hover :global(.link-icon) {
		@apply opacity-70;
	}

	.social-link:active {
		@apply translate-x-1.5 scale-[0.99];
	}

	/* Quick action buttons */
	.quick-action-btn:active {
		@apply scale-[0.97];
	}

	/* Responsive */
	@media (max-width: 640px) {
		.terminal {
			@apply mx-4 rounded-[10px];
		}

		.terminal-content {
			@apply h-112 p-4 text-[0.8125rem];
		}

		.prompt-line {
			@apply flex-col gap-1;
		}

		.prompt-line.active {
			@apply flex-row flex-nowrap gap-2;
		}

		.output {
			@apply px-4 py-3 text-[0.8125rem];
		}

		footer {
			@apply gap-3 px-3 py-2;
		}

		footer span {
			@apply text-[0.625rem];
		}

		.social-link {
			@apply px-4 py-3;
		}

		.quick-actions {
			@apply gap-1.5;
		}

		.quick-action-btn {
			@apply px-2 py-1.5 text-[0.6875rem];
		}
	}
</style>

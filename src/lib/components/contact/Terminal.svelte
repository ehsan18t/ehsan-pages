<script lang="ts">
	/**
	 * Terminal Component - Interactive contact terminal
	 *
	 * Features:
	 * - Svelte 5 runes ($state, $effect)
	 * - Command history navigation (↑/↓)
	 * - Tab autocomplete
	 * - Ctrl+C / Ctrl+L shortcuts
	 * - Blinking cursor
	 * - ASCII art welcome banner
	 * - Mobile-friendly design
	 * - Social links with hover effects
	 */

	import { browser } from '$app/environment';
	import { description, name, title } from '$data';
	import {
		EMAIL_ADDRESS,
		EMAIL_REGEX,
		findMatchingCommand,
		generateWhoamiBox,
		HELP_TEXT,
		SEND_USAGE_TEXT,
		sendEmail,
		TERMINAL_SOCIAL_LINKS,
		WELCOME_ASCII,
		type TerminalCommand,
		type TerminalCommandEntry,
		type TerminalSocialLink
	} from '$data/terminalCommands';
	import Icon from '@iconify/svelte';

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

	let terminalRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);

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
					content: JSON.stringify(TERMINAL_SOCIAL_LINKS)
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
							content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or email me directly at ${EMAIL_ADDRESS}`
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
			}
		} else {
			history = [
				...history,
				{
					id: nextId(),
					type: 'error',
					content: `Command not found: ${cmdName}

Type 'help' to see available commands.`
				}
			];
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
			executeCommand(cmd);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (commandBuffer.length > 0 && bufferIndex < commandBuffer.length - 1) {
				bufferIndex++;
				input = commandBuffer[bufferIndex];
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
			} else if (bufferIndex === 0) {
				bufferIndex = -1;
				input = '';
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const match = findMatchingCommand(input, commands);
			if (match) {
				input = match.name + ' ';
			}
		} else if (e.key === 'c' && e.ctrlKey) {
			e.preventDefault();
			if (isProcessing) {
				isProcessing = false;
				history = [...history, { id: nextId(), type: 'error', content: '^C' }];
			} else {
				input = '';
			}
		} else if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			history = [];
		}
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

Type 'help' for available commands, or try:
  • send <email> <message>  — Send me a message
  • social                  — View my social links
  • whoami                  — Learn more about me`
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
<div class="terminal" onclick={focusInput}>
	<!-- Window Header -->
	<header class="terminal-header">
		<div class="window-controls">
			<span class="control close"></span>
			<span class="control minimize"></span>
			<span class="control maximize"></span>
		</div>
		<div class="window-title">
			<Icon icon="mdi:console" width={14} height={14} />
			<span>ehsan@portfolio: ~/contact</span>
		</div>
		<div class="window-actions">
			<Icon icon="mdi:plus" width={16} height={16} />
		</div>
	</header>

	<!-- Terminal Content -->
	<div bind:this={terminalRef} class="terminal-content" role="log" aria-live="polite">
		{#each history as entry (entry.id)}
			{#if entry.type === 'command'}
				<div class="prompt-line">
					<span class="prompt">
						<span class="prompt-user">ehsan</span><span class="prompt-at">@</span><span
							class="prompt-host">portfolio</span
						><span class="prompt-colon">:</span><span class="prompt-path">~/contact</span><span
							class="prompt-symbol">$</span
						>
					</span>
					<span class="prompt-command">{entry.content}</span>
				</div>
			{:else if entry.type === 'ascii'}
				<pre class="ascii-art">{entry.content}</pre>
			{:else if entry.type === 'output'}
				<div class="output">{entry.content}</div>
			{:else if entry.type === 'error'}
				<div class="output error">{entry.content}</div>
			{:else if entry.type === 'success'}
				<div class="output success">{entry.content}</div>
			{:else if entry.type === 'links'}
				{@const links = JSON.parse(entry.content) as TerminalSocialLink[]}
				<div class="social-links">
					{#each links as link (link.platform)}
						<button class="social-link" onclick={(e) => handleLinkClick(e, link.url)} type="button">
							<Icon icon={link.icon} width={20} height={20} />
							<span class="link-platform">{link.platform}</span>
							<span class="link-url">{link.url.replace('mailto:', '').replace('https://', '')}</span
							>
							<Icon icon="mdi:open-in-new" width={14} height={14} class="link-icon" />
						</button>
					{/each}
				</div>
			{/if}
		{/each}

		<!-- Active Input Line -->
		<div class="prompt-line active">
			{#if isProcessing}
				<div class="processing">
					<span class="spinner"></span>
					<span>Sending message...</span>
				</div>
			{:else}
				<span class="prompt">
					<span class="prompt-user">ehsan</span><span class="prompt-at">@</span><span
						class="prompt-host">portfolio</span
					><span class="prompt-colon">:</span><span class="prompt-path">~/contact</span><span
						class="prompt-symbol">$</span
					>
				</span>
				<div class="input-wrapper">
					<input
						bind:this={inputRef}
						bind:value={input}
						onkeydown={handleKeyDown}
						type="text"
						class="terminal-input"
						spellcheck="false"
						autocomplete="off"
						autocapitalize="off"
						aria-label="Terminal command input"
					/>
					<span class="cursor" class:visible={showCursor && !input}></span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer Hints -->
	<footer class="terminal-footer">
		<span class="hint"><kbd>↑↓</kbd> History</span>
		<span class="hint"><kbd>Tab</kbd> Complete</span>
		<span class="hint"><kbd>Ctrl+L</kbd> Clear</span>
	</footer>
</div>

<style lang="postcss">
	.terminal {
		--t-bg: #0d1117;
		--t-bg-light: #161b22;
		--t-border: #30363d;
		--t-text: #e6edf3;
		--t-muted: #8b949e;
		--t-accent: #58a6ff;
		--t-green: #3fb950;
		--t-red: #f85149;
		--t-yellow: #d29922;
		--t-purple: #a371f7;
		--t-cyan: #39c5cf;

		max-width: 52rem;
		margin: 2rem auto;
		border-radius: 12px;
		overflow: hidden;
		background: var(--t-bg);
		border: 1px solid var(--t-border);
		box-shadow:
			0 16px 70px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
	}

	/* Header */
	.terminal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		background: linear-gradient(180deg, #2d333b 0%, #22272e 100%);
		border-bottom: 1px solid var(--t-border);
	}

	.window-controls {
		display: flex;
		gap: 8px;
	}

	.control {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		transition: filter 0.15s;
	}

	.control.close {
		background: #ff5f57;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
	}
	.control.minimize {
		background: #febc2e;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
	}
	.control.maximize {
		background: #28c840;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
	}

	.window-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--t-muted);
	}

	.window-actions {
		color: var(--t-muted);
		opacity: 0.5;
	}

	/* Content */
	.terminal-content {
		height: 28rem;
		padding: 1.25rem 1.5rem;
		overflow-y: auto;
		font-size: 0.875rem;
		line-height: 1.7;
		color: var(--t-text);
		scrollbar-width: thin;
		scrollbar-color: var(--t-border) transparent;
	}

	.terminal-content::-webkit-scrollbar {
		width: 8px;
	}
	.terminal-content::-webkit-scrollbar-track {
		background: transparent;
	}
	.terminal-content::-webkit-scrollbar-thumb {
		background: var(--t-border);
		border-radius: 4px;
	}

	/* Prompt */
	.prompt-line {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.625rem;
		margin-bottom: 0.375rem;
	}

	.prompt-line.active {
		margin-top: 1rem;
		margin-bottom: 0;
	}

	.prompt {
		display: flex;
		flex-shrink: 0;
		font-weight: 500;
	}

	.prompt-user {
		color: var(--t-green);
	}
	.prompt-at,
	.prompt-colon {
		color: var(--t-muted);
	}
	.prompt-host {
		color: var(--t-purple);
	}
	.prompt-path {
		color: var(--t-cyan);
	}
	.prompt-symbol {
		color: var(--t-accent);
		margin-left: 0.375rem;
	}

	.prompt-command {
		color: var(--t-text);
	}

	/* Input */
	.input-wrapper {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.terminal-input {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		color: var(--t-text);
		font: inherit;
		caret-color: var(--t-accent);
		padding: 0;
	}

	.cursor {
		position: absolute;
		left: 0;
		width: 8px;
		height: 1.25em;
		background: var(--t-accent);
		opacity: 0;
		pointer-events: none;
	}

	.cursor.visible {
		opacity: 0.8;
	}

	/* Output */
	.output {
		margin: 0.625rem 0 1.25rem;
		padding: 1rem 1.25rem;
		background: var(--t-bg-light);
		border-radius: 8px;
		border-left: 3px solid var(--t-accent);
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.6;
	}

	.output.error {
		border-left-color: var(--t-red);
		color: #ffa198;
		background: rgba(248, 81, 73, 0.1);
	}

	.output.success {
		border-left-color: var(--t-green);
		color: #7ee787;
		background: rgba(63, 185, 80, 0.1);
	}

	/* ASCII Art */
	.ascii-art {
		margin: 0 0 0.5rem;
		font-size: 0.4375rem;
		line-height: 1.15;
		color: var(--t-accent);
		overflow-x: auto;
		font-weight: bold;
	}

	@media (min-width: 480px) {
		.ascii-art {
			font-size: 0.5625rem;
		}
	}

	@media (min-width: 640px) {
		.ascii-art {
			font-size: 0.6875rem;
		}
	}

	/* Social Links */
	.social-links {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		margin: 0.75rem 0 1.25rem;
	}

	.social-link {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1.125rem;
		background: var(--t-bg-light);
		border: 1px solid var(--t-border);
		border-radius: 10px;
		color: var(--t-text);
		font: inherit;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.social-link:hover {
		background: rgba(88, 166, 255, 0.1);
		border-color: var(--t-accent);
		transform: translateX(6px);
	}

	.social-link:active {
		transform: translateX(6px) scale(0.99);
	}

	.link-platform {
		font-weight: 600;
		min-width: 5rem;
	}

	.link-url {
		flex: 1;
		color: var(--t-muted);
		font-size: 0.8125rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.link-icon) {
		opacity: 0;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.social-link:hover :global(.link-icon) {
		opacity: 0.7;
	}

	/* Processing */
	.processing {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--t-yellow);
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--t-border);
		border-top-color: var(--t-yellow);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Footer */
	.terminal-footer {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		padding: 0.625rem 1rem;
		background: var(--t-bg-light);
		border-top: 1px solid var(--t-border);
	}

	.hint {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.6875rem;
		color: var(--t-muted);
	}

	.hint kbd {
		padding: 0.125rem 0.375rem;
		background: var(--t-bg);
		border: 1px solid var(--t-border);
		border-radius: 4px;
		font-family: inherit;
		font-size: 0.625rem;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.terminal {
			margin: 1rem;
			border-radius: 10px;
		}

		.terminal-content {
			height: 22rem;
			padding: 1rem;
			font-size: 0.8125rem;
		}

		.prompt-line {
			flex-direction: column;
			gap: 0.25rem;
		}

		.prompt-line.active {
			flex-direction: row;
			flex-wrap: nowrap;
			gap: 0.5rem;
		}

		.output {
			padding: 0.75rem 1rem;
			font-size: 0.8125rem;
		}

		.terminal-footer {
			gap: 0.75rem;
			padding: 0.5rem 0.75rem;
		}

		.hint {
			font-size: 0.625rem;
		}

		.link-url {
			display: none;
		}

		.social-link {
			padding: 0.75rem 1rem;
		}
	}
</style>

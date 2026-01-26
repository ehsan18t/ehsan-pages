<script lang="ts">
	import {
		createTerminalCommands,
		findMatchingCommand,
		type Command,
		type CommandEntry
	} from '$data';
	import { onMount } from 'svelte';

	let commandHistory = $state<CommandEntry[]>([]);
	let currentInput = $state('');
	let isLoading = $state(false);
	let commandBuffer = $state<string[]>([]);
	let bufferPosition = $state(-1);

	let terminalRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let promptRef = $state<HTMLDivElement | null>(null);

	// Create commands with context
	const COMMANDS: Command[] = createTerminalCommands();

	// Command context for handlers
	function getCommandContext() {
		return {
			setLoading: (loading: boolean) => {
				isLoading = loading;
			},
			clearHistory: () => {
				commandHistory = [];
			},
			commands: COMMANDS
		};
	}

	function focusInput() {
		inputRef?.focus();
	}

	function adjustInputPosition() {
		if (promptRef && inputRef) {
			const promptWidth = promptRef.offsetWidth;
			inputRef.style.paddingLeft = `${promptWidth + 8}px`;
		}
	}

	function addToCommandBuffer(command: string) {
		if (command.trim() && (commandBuffer.length === 0 || commandBuffer[0] !== command)) {
			commandBuffer = [command, ...commandBuffer.slice(0, 19)];
		}
		bufferPosition = -1;
	}

	async function executeCommand(commandInput: string, addToBuffer = true) {
		if (addToBuffer) {
			addToCommandBuffer(commandInput);
		}

		const newEntry: CommandEntry = {
			type: 'command',
			content: commandInput
		};

		commandHistory = [...commandHistory, newEntry];

		const parts = commandInput.trim().split(' ');
		const cmd = parts[0].toLowerCase();
		const args = parts.slice(1);

		const command = COMMANDS.find((c) => c.name === cmd);
		if (command) {
			const result = await command.handler(args, getCommandContext());
			if (result) {
				commandHistory = [...commandHistory, result];
			}
		} else {
			commandHistory = [
				...commandHistory,
				{
					type: 'error',
					content: `Command not found: ${cmd}\n            
Type 'help' to see available commands.`
				}
			];
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		// Prevent terminal scrolling on spacebar
		if (e.key === ' ' && e.target === inputRef) {
			e.stopPropagation();
		}

		if (e.key === 'Enter' && currentInput.trim()) {
			e.preventDefault();
			executeCommand(currentInput.trim(), true);
			currentInput = '';
		} else if (e.key === 'ArrowUp' && !e.ctrlKey) {
			e.preventDefault();
			if (commandBuffer.length > 0) {
				const newPosition = Math.min(bufferPosition + 1, commandBuffer.length - 1);
				bufferPosition = newPosition;
				currentInput = commandBuffer[newPosition];

				setTimeout(() => {
					if (inputRef) {
						inputRef.selectionStart = inputRef.value.length;
						inputRef.selectionEnd = inputRef.value.length;
					}
				}, 0);
			}
		} else if (e.key === 'ArrowDown' && !e.ctrlKey) {
			e.preventDefault();
			if (bufferPosition > 0) {
				const newPosition = bufferPosition - 1;
				bufferPosition = newPosition;
				currentInput = commandBuffer[newPosition];
			} else if (bufferPosition === 0) {
				bufferPosition = -1;
				currentInput = '';
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const input = currentInput.toLowerCase();
			if (!input) return;

			const matchingCommand = findMatchingCommand(input, COMMANDS);
			if (matchingCommand) {
				currentInput = matchingCommand.name + ' ';
			} else if (input === 'man ') {
				currentInput = 'man send';
			}
		} else if (e.key === 'c' && e.ctrlKey) {
			e.preventDefault();
			if (isLoading) {
				isLoading = false;
				commandHistory = [
					...commandHistory,
					{
						type: 'error',
						content: 'Operation canceled by user.'
					}
				];
			} else {
				currentInput = '';
			}
		} else if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			commandHistory = [];
		}
	}

	// Auto-scroll to bottom when history changes
	$effect(() => {
		if (terminalRef) {
			terminalRef.scrollTop = terminalRef.scrollHeight;
		}
	});

	// Adjust input position when input or loading changes
	$effect(() => {
		// Track dependencies
		void currentInput;
		void isLoading;
		adjustInputPosition();
	});

	onMount(() => {
		// Run default 'man send' command on mount
		executeCommand('man send', false);
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="terminal-container mx-auto my-8 max-w-170 overflow-hidden rounded-lg border border-terminal-border bg-linear-to-b from-terminal-bg to-terminal-bg-dark font-mono text-xs text-terminal-text shadow-terminal"
	onclick={focusInput}
	onkeydown={(e) => e.key === 'Enter' && focusInput()}
	aria-label="Interactive terminal"
	role="application"
	tabindex="0"
>
	<!-- Terminal Header -->
	<div
		class="flex items-center justify-between border-b border-terminal-header-border bg-linear-to-r from-terminal-header to-terminal-header-dark px-4 py-2.5"
	>
		<div class="flex items-center gap-2">
			<div
				class="size-3 rounded-full border border-[#ec4c48] bg-[#ff5f57] shadow-[inset_0_0_1px_rgba(255,255,255,0.2)]"
			></div>
			<div
				class="size-3 rounded-full border border-[#e1aa25] bg-[#febc2e] shadow-[inset_0_0_1px_rgba(255,255,255,0.2)]"
			></div>
			<div
				class="size-3 rounded-full border border-[#1db334] bg-[#28c840] shadow-[inset_0_0_1px_rgba(255,255,255,0.2)]"
			></div>
		</div>
		<div class="flex-1 text-center text-xs font-medium text-terminal-title drop-shadow-sm">
			user@mac: ~/contact
		</div>
		<div class="text-xs text-terminal-menu">⌘</div>
	</div>

	<!-- Terminal Content -->
	<div bind:this={terminalRef} class="terminal-content" aria-live="polite">
		{#each commandHistory as entry, index (index)}
			<div>
				{#if entry.type === 'command'}
					<div class="mb-2 flex flex-wrap items-center gap-1">
						<span class="flex">
							<span class="text-terminal-prompt-user">user</span>
							<span class="text-terminal-prompt-sep">@</span>
							<span class="text-terminal-prompt-host">mac</span>
							<span class="text-terminal-prompt-sep">:</span>
						</span>
						<span class="flex">
							<span class="text-terminal-prompt-path">~/contact</span>
							<span class="text-terminal-prompt-sep">$</span>
						</span>
						<span class="command-input ml-1">{entry.content}</span>
					</div>
				{:else if entry.type === 'error'}
					<div
						class="terminal-message border-l-2 border-terminal-error bg-terminal-error/8 text-terminal-error"
					>
						<div class="whitespace-pre-line">{entry.content}</div>
					</div>
				{:else if entry.type === 'success'}
					<div
						class="terminal-message border-l-2 border-terminal-success bg-terminal-success/8 text-terminal-success"
					>
						<div>{entry.content}</div>
					</div>
				{:else if entry.type === 'info'}
					<div
						class="terminal-message border-l-2 border-terminal-info bg-terminal-info/8 text-terminal-info"
					>
						<div class="whitespace-pre-line">{entry.content}</div>
					</div>
				{:else if entry.type === 'manual'}
					<div
						class="terminal-message border-l-2 border-terminal-warning bg-terminal-warning/8 text-terminal-warning"
					>
						<div class="whitespace-pre-line">{entry.content}</div>
					</div>
				{/if}
			</div>
		{/each}

		<!-- Active prompt line -->
		<div class="active-prompt-line {isLoading ? 'loading' : ''}">
			{#if isLoading}
				<div class="flex items-center text-terminal-loading">
					<div
						class="loading-spinner animate-spin mr-2 size-3.5 rounded-full border-2 border-transparent border-t-terminal-loading"
					></div>
					<span class="animate-pulse">Processing command...</span>
				</div>
			{:else}
				<div class="prompt-container" bind:this={promptRef}>
					<span class="flex">
						<span class="text-terminal-prompt-user">user</span>
						<span class="text-terminal-prompt-sep">@</span>
						<span class="text-terminal-prompt-host">mac</span>
						<span class="text-terminal-prompt-sep">:</span>
					</span>
					<span class="flex">
						<span class="text-terminal-prompt-path">~/contact</span>
						<span class="text-terminal-prompt-sep">$</span>
					</span>
				</div>
				<input
					bind:this={inputRef}
					type="text"
					class="terminal-input"
					bind:value={currentInput}
					onkeydown={handleKeyDown}
					aria-label="Terminal input"
				/>
			{/if}
		</div>
	</div>

	<!-- Terminal hint -->
	<div
		class="hidden border-t border-terminal-hint-border bg-terminal-hint-bg px-4 py-2 text-center text-[0.7rem] text-terminal-hint md:block"
	>
		Click to focus • Use ↑↓ to navigate history • Tab to autocomplete • Type 'help' for commands
	</div>
</div>

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Terminal Content with custom scrollbar */
	.terminal-content {
		@apply relative h-116.25 overflow-y-auto px-5 py-4 text-[0.85rem] leading-relaxed;
		background-color: var(--terminal-bg);
		color: var(--terminal-text);
		scrollbar-width: thin;
		scrollbar-color: var(--terminal-scrollbar) var(--terminal-bg);
	}

	.terminal-content::-webkit-scrollbar {
		width: 8px;
	}

	.terminal-content::-webkit-scrollbar-track {
		background: var(--terminal-bg);
		border-radius: 4px;
	}

	.terminal-content::-webkit-scrollbar-thumb {
		background-color: var(--terminal-scrollbar);
		border-radius: 4px;
		border: 2px solid var(--terminal-bg);
	}

	/* Active prompt line positioning */
	.active-prompt-line {
		@apply relative mt-2 flex min-h-6 w-full;
	}

	.active-prompt-line.loading {
		@apply mt-4;
	}

	.prompt-container {
		@apply absolute top-0 left-0 z-10 flex items-center;
	}

	/* Terminal input styling */
	.terminal-input {
		@apply mb-2.5 w-full border-none bg-transparent pl-2 outline-none;
		font: inherit;
		color: var(--terminal-text);
		caret-color: var(--terminal-info);
	}

	.terminal-input::selection {
		background-color: rgba(150, 170, 220, 0.4);
	}

	/* Message base styling */
	.terminal-message {
		@apply my-1 mb-4 rounded px-2 py-1 whitespace-pre-line;
	}

	/* Command input typing animation */
	.command-input {
		@apply relative;
		animation: typing 0.4s ease-out;
	}

	@keyframes typing {
		from {
			opacity: 0.5;
		}
		to {
			opacity: 1;
		}
	}
</style>

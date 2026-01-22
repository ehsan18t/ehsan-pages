<script lang="ts">
	import { onMount } from 'svelte';

	// Terminal directory display
	interface DirectoryProps {
		user: string;
		host: string;
		path: string;
	}

	interface CommandEntry {
		type: 'command' | 'error' | 'success' | 'info' | 'manual';
		content: string;
	}

	interface Command {
		name: string;
		description: string;
		usage: string;
		handler: (args: string[]) => Promise<CommandEntry | null> | CommandEntry | null;
	}

	let commandHistory = $state<CommandEntry[]>([]);
	let currentInput = $state('');
	let isLoading = $state(false);
	let commandBuffer = $state<string[]>([]);
	let bufferPosition = $state(-1);

	let terminalRef = $state<HTMLDivElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let promptRef = $state<HTMLDivElement | null>(null);

	// Command definitions
	const COMMANDS: Command[] = [
		{
			name: 'send',
			description: 'Sends a quick email to Ehsan',
			usage: 'send <email> <message>',
			handler: async (args) => {
				if (args.length < 2) {
					return {
						type: 'error',
						content:
							"Error: 'send' command requires both email and message arguments.\nUsage: send <email> <message>"
					};
				}

				const email = args[0];
				const message = args.slice(1).join(' ').trim();

				if (!message) {
					return {
						type: 'error',
						content: 'Error: Message cannot be empty.'
					};
				}

				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(email)) {
					return {
						type: 'error',
						content: `Error: Invalid email format '${email}'`
					};
				}

				isLoading = true;
				try {
					const response = await fetch('/api/send-email', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							to: 'ehsan18t@gmail.com',
							subject: `Contact Form: ${email}`,
							html: `
                <h1>New contact form submission</h1>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
              `,
							text: `New contact form submission\nFrom: ${email}\nMessage: ${message}`
						})
					});

					await response.json();

					isLoading = false;
					return {
						type: 'success',
						content: `Message sent successfully to Ehsan`
					};
				} catch (error) {
					isLoading = false;
					return {
						type: 'error',
						content: `Error sending message: ${error instanceof Error ? error.message : 'Network error'}`
					};
				}
			}
		},
		{
			name: 'man',
			description: 'Display manual for a command',
			usage: 'man <command>',
			handler: (args) => {
				const commandName = args[0]?.toLowerCase();

				if (!commandName) {
					return {
						type: 'error',
						content: "What manual page do you want?\nFor example: 'man send'"
					};
				}

				const command = COMMANDS.find((cmd) => cmd.name === commandName);

				if (!command) {
					return {
						type: 'error',
						content: `No manual entry for '${commandName}'\n\nSupported commands: ${COMMANDS.map((c) => c.name).join(', ')}`
					};
				}

				return {
					type: 'manual',
					content: `COMMAND: ${command.name}
USAGE: ${command.usage}
DESCRIPTION: 
  ${command.description}
  
${
	command.name === 'send'
		? `PARAMETERS:
  <email>    - Your email address (required)
  <message>  - The message content (required)
  
EXAMPLES:
  send user@example.com Hello, I'd like to hire you for a project.
  send contact@domain.com I'd like to discuss a project opportunity.`
		: ''
}`
				};
			}
		},
		{
			name: 'clear',
			description: 'Clears the terminal screen',
			usage: 'clear',
			handler: () => {
				commandHistory = [];
				return null;
			}
		},
		{
			name: 'help',
			description: 'Displays available commands and basic usage information',
			usage: 'help',
			handler: () => {
				return {
					type: 'info',
					content: `Available commands:\n\n${COMMANDS.map((cmd) => `${cmd.name.padEnd(10)} - ${cmd.description}`).join('\n')}\n\nType 'man <command>' for more detailed information about a command.`
				};
			}
		}
	];

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
			const result = await command.handler(args);
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

			const matchingCommand = COMMANDS.find((cmd) => cmd.name.startsWith(input));
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
		currentInput;
		isLoading;
		adjustInputPosition();
	});

	onMount(() => {
		// Run default 'man send' command on mount
		executeCommand('man send', false);
	});
</script>

<div
	class="terminal-container mx-auto max-w-[680px] overflow-hidden rounded-lg"
	onclick={focusInput}
	onkeydown={(e) => e.key === 'Enter' && focusInput()}
	aria-label="Interactive terminal"
	role="region"
	tabindex="0"
>
	<!-- Terminal Header -->
	<div class="terminal-header">
		<div class="flex items-center">
			<div class="terminal-btn terminal-close"></div>
			<div class="terminal-btn terminal-minimize"></div>
			<div class="terminal-btn terminal-maximize"></div>
		</div>
		<div class="terminal-title">user@mac: ~/contact</div>
		<div class="terminal-menu">⌘</div>
	</div>

	<!-- Terminal Content -->
	<div bind:this={terminalRef} class="terminal-content" aria-live="polite">
		{#each commandHistory as entry, index (index)}
			<div>
				{#if entry.type === 'command'}
					<div class="prompt-line mb-2 flex items-center gap-1">
						<span class="flex">
							<span class="text-emerald-400">user</span>
							<span class="text-gray-400">@</span>
							<span class="text-sky-400">mac</span>
							<span class="text-gray-400">:</span>
						</span>
						<span class="flex">
							<span class="text-fuchsia-400">~/contact</span>
							<span class="text-gray-400">$</span>
						</span>
						<span class="command-input ml-1">{entry.content}</span>
					</div>
				{:else if entry.type === 'error'}
					<div class="terminal-message error-message">
						<div class="whitespace-pre-line">{entry.content}</div>
					</div>
				{:else if entry.type === 'success'}
					<div class="terminal-message success-message">
						<div>{entry.content}</div>
					</div>
				{:else if entry.type === 'info'}
					<div class="terminal-message info-message">
						<div class="whitespace-pre-line">{entry.content}</div>
					</div>
				{:else if entry.type === 'manual'}
					<div class="terminal-message manual-message">
						<div class="whitespace-pre-line">{entry.content}</div>
					</div>
				{/if}
			</div>
		{/each}

		<!-- Active prompt line -->
		<div class="active-prompt-line {isLoading ? 'loading' : ''}">
			{#if isLoading}
				<div class="loading-line">
					<div class="loading-spinner"></div>
					<span class="loading-text">Processing command...</span>
				</div>
			{:else}
				<div class="prompt-container" bind:this={promptRef}>
					<span class="flex">
						<span class="text-emerald-400">user</span>
						<span class="text-gray-400">@</span>
						<span class="text-sky-400">mac</span>
						<span class="text-gray-400">:</span>
					</span>
					<span class="flex">
						<span class="text-fuchsia-400">~/contact</span>
						<span class="text-gray-400">$</span>
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
	<div class="terminal-hint hidden md:block">
		Click to focus • Use ↑↓ to navigate history • Tab to autocomplete • Type 'help' for commands
	</div>
</div>

<style>
	/* Modern Terminal Styling */
	.terminal-container {
		background: linear-gradient(to bottom, #1a1b26, #16161e);
		border: 1px solid rgba(82, 82, 119, 0.3);
		box-shadow:
			0 20px 40px -15px rgba(0, 0, 0, 0.5),
			0 0 50px -5px rgba(50, 50, 80, 0.15) inset;
		color: #c9d1d9;
		margin: 2rem auto;
		font-family:
			'JetBrains Mono',
			'Fira Code',
			'Menlo',
			'Monaco',
			'Consolas',
			monospace;
		font-size: 0.75rem;
	}

	/* Terminal Header */
	.terminal-header {
		background: linear-gradient(to right, #24283b, #1e2030);
		padding: 0.6rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(100, 100, 150, 0.2);
	}

	.terminal-title {
		color: #a9b1d6;
		font-size: 0.75rem;
		font-weight: 500;
		text-align: center;
		flex: 1;
		text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
	}

	.terminal-menu {
		color: #787c99;
		font-size: 0.75rem;
	}

	.terminal-btn {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-right: 8px;
		position: relative;
	}

	.terminal-close {
		background-color: #ff5f57;
		border: 1px solid #ec4c48;
		box-shadow: 0 0 1px rgba(255, 255, 255, 0.2) inset;
	}

	.terminal-minimize {
		background-color: #febc2e;
		border: 1px solid #e1aa25;
		box-shadow: 0 0 1px rgba(255, 255, 255, 0.2) inset;
	}

	.terminal-maximize {
		background-color: #28c840;
		border: 1px solid #1db334;
		box-shadow: 0 0 1px rgba(255, 255, 255, 0.2) inset;
	}

	/* Terminal Content */
	.terminal-content {
		background-color: #1a1b26;
		padding: 1rem 1.2rem;
		height: 465px;
		overflow-y: auto;
		line-height: 1.5;
		font-size: 0.85rem;
		position: relative;
		color: #c0caf5;
		scrollbar-width: thin;
		scrollbar-color: #414868 #1a1b26;
	}

	.terminal-content::-webkit-scrollbar {
		width: 8px;
	}

	.terminal-content::-webkit-scrollbar-track {
		background: #1a1b26;
		border-radius: 4px;
	}

	.terminal-content::-webkit-scrollbar-thumb {
		background-color: #414868;
		border-radius: 4px;
		border: 2px solid #1a1b26;
	}

	/* Terminal prompt line */
	.prompt-line {
		margin-bottom: 0.5rem;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	/* Active prompt line with input */
	.active-prompt-line {
		position: relative;
		min-height: 1.5rem;
		margin-top: 0.5rem;
		display: flex;
		width: 100%;
	}

	.active-prompt-line.loading {
		margin-top: 1rem;
	}

	.prompt-container {
		display: flex;
		align-items: center;
		position: absolute;
		left: 0;
		top: 0;
		z-index: 2;
	}

	/* Visible Terminal Input */
	.terminal-input {
		background: transparent;
		border: none;
		color: #c0caf5;
		font-family: inherit;
		font-size: inherit;
		width: 100%;
		padding: 0 0 0 8px;
		outline: none;
		caret-color: #7aa2f7;
		margin-bottom: 10px;
	}

	.terminal-input::selection {
		background-color: rgba(150, 170, 220, 0.4);
	}

	/* Loading animation */
	.loading-line {
		display: flex;
		align-items: center;
		color: #bb9af7;
	}

	.loading-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid transparent;
		border-top-color: #bb9af7;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 8px;
	}

	.loading-text {
		animation: pulse 1.5s ease-in-out infinite;
	}

	/* Message types */
	.terminal-message {
		padding: 0.25rem 0.5rem;
		margin: 0.25rem 0 1rem 0;
		border-radius: 4px;
		white-space: pre-line;
	}

	.error-message {
		color: #f7768e;
		background-color: rgba(247, 118, 142, 0.08);
		border-left: 2px solid #f7768e;
	}

	.success-message {
		color: #9ece6a;
		background-color: rgba(158, 206, 106, 0.08);
		border-left: 2px solid #9ece6a;
	}

	.info-message {
		color: #7aa2f7;
		background-color: rgba(122, 162, 247, 0.08);
		border-left: 2px solid #7aa2f7;
	}

	.manual-message {
		color: #e0af68;
		background-color: rgba(224, 175, 104, 0.08);
		border-left: 2px solid #e0af68;
	}

	/* Terminal hints bar */
	.terminal-hint {
		background-color: #1e2030;
		color: #565f89;
		font-size: 0.7rem;
		padding: 0.5rem 1rem;
		text-align: center;
		border-top: 1px solid rgba(100, 100, 150, 0.15);
	}

	/* Command input animation */
	.command-input {
		position: relative;
		animation: typing 0.4s ease-out;
	}

	/* Animations */
	@keyframes typing {
		from {
			opacity: 0.5;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 1;
		}
	}
</style>

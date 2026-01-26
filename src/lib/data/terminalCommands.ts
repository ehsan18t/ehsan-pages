/**
 * Terminal Commands - Command definitions for the contact terminal
 *
 * This file contains all terminal command definitions.
 * Business logic (API calls, validation) is separated from the Terminal UI component.
 */

export interface CommandEntry {
	type: 'command' | 'error' | 'success' | 'info' | 'manual';
	content: string;
}

export interface Command {
	name: string;
	description: string;
	usage: string;
	handler: (
		args: string[],
		context: CommandContext
	) => Promise<CommandEntry | null> | CommandEntry | null;
}

export interface CommandContext {
	/** Callback to set loading state */
	setLoading: (loading: boolean) => void;
	/** Callback to clear command history */
	clearHistory: () => void;
	/** Reference to all commands for help/man */
	commands: Command[];
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Send email via API
 */
async function sendEmail(
	email: string,
	message: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('/api/send-email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
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
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Network error'
		};
	}
}

/**
 * Create the send command handler
 */
function createSendHandler(): Command['handler'] {
	return async (args, context) => {
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

		if (!EMAIL_REGEX.test(email)) {
			return {
				type: 'error',
				content: `Error: Invalid email format '${email}'`
			};
		}

		context.setLoading(true);
		const result = await sendEmail(email, message);
		context.setLoading(false);

		if (result.success) {
			return {
				type: 'success',
				content: 'Message sent successfully to Ehsan'
			};
		} else {
			return {
				type: 'error',
				content: `Error sending message: ${result.error}`
			};
		}
	};
}

/**
 * Create the man command handler
 */
function createManHandler(): Command['handler'] {
	return (args, context) => {
		const commandName = args[0]?.toLowerCase();

		if (!commandName) {
			return {
				type: 'error',
				content: "What manual page do you want?\nFor example: 'man send'"
			};
		}

		const command = context.commands.find((cmd) => cmd.name === commandName);

		if (!command) {
			return {
				type: 'error',
				content: `No manual entry for '${commandName}'\n\nSupported commands: ${context.commands.map((c) => c.name).join(', ')}`
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
	};
}

/**
 * Create the clear command handler
 */
function createClearHandler(): Command['handler'] {
	return (_args, context) => {
		context.clearHistory();
		return null;
	};
}

/**
 * Create the help command handler
 */
function createHelpHandler(): Command['handler'] {
	return (_args, context) => {
		return {
			type: 'info',
			content: `Available commands:\n\n${context.commands.map((cmd) => `${cmd.name.padEnd(10)} - ${cmd.description}`).join('\n')}\n\nType 'man <command>' for more detailed information about a command.`
		};
	};
}

/**
 * Create all terminal commands
 */
export function createTerminalCommands(): Command[] {
	const commands: Command[] = [
		{
			name: 'send',
			description: 'Sends a quick email to Ehsan',
			usage: 'send <email> <message>',
			handler: createSendHandler()
		},
		{
			name: 'man',
			description: 'Display manual for a command',
			usage: 'man <command>',
			handler: createManHandler()
		},
		{
			name: 'clear',
			description: 'Clears the terminal screen',
			usage: 'clear',
			handler: createClearHandler()
		},
		{
			name: 'help',
			description: 'Displays available commands and basic usage information',
			usage: 'help',
			handler: createHelpHandler()
		}
	];

	return commands;
}

/**
 * Find matching command for autocomplete
 */
export function findMatchingCommand(input: string, commands: Command[]): Command | undefined {
	return commands.find((cmd) => cmd.name.startsWith(input.toLowerCase()));
}

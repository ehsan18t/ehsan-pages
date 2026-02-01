/**
 * Terminal Data - Types, constants, and utilities for the contact terminal
 *
 * This file contains shared types, constants, and helper functions
 * used by the Terminal component. Command handlers remain in the
 * component since they require access to component state.
 */

import { socials } from './index';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

/**
 * Entry in the terminal history
 */
export interface TerminalCommandEntry {
	id: number;
	type: 'command' | 'output' | 'error' | 'success' | 'ascii' | 'links';
	content: string;
}

/**
 * Terminal command definition
 */
export interface TerminalCommand {
	name: string;
	description: string;
	handler: (args: string[]) => Promise<TerminalCommandEntry[]> | TerminalCommandEntry[];
}

/**
 * Social link for terminal display
 */
export interface TerminalSocialLink {
	platform: string;
	url: string;
	icon: string;
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ASCII art banner for terminal welcome screen
 */
export const WELCOME_ASCII = `
 ██████╗ ██████╗ ███╗   ██╗████████╗ █████╗  ██████╗████████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║   ██║   ███████║██║        ██║   
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██║██║        ██║   
╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╗   ██║   
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝`;

/**
 * Social links displayed in terminal
 */
export const TERMINAL_SOCIAL_LINKS: TerminalSocialLink[] = [
	{ platform: 'GitHub', url: socials.github, icon: 'mdi:github' },
	{ platform: 'LinkedIn', url: socials.linkedin, icon: 'mdi:linkedin' },
	{ platform: 'Email', url: socials.gmail, icon: 'mdi:email' },
	{ platform: 'Telegram', url: socials.telegram, icon: 'mdi:telegram' },
	{ platform: 'Discord', url: socials.discord, icon: 'mdi:discord' }
];

/**
 * Email address extracted from mailto URL
 */
export const EMAIL_ADDRESS = socials.gmail.replace('mailto:', '');

// ═══════════════════════════════════════════════════════════════
// Help Text
// ═══════════════════════════════════════════════════════════════

/**
 * Help command output text
 */
export const HELP_TEXT = `Available commands:

  help      Show this help message
  send      Send me a message
            Usage: send <email> <message>
  social    Show my social links
  whoami    Learn more about me
  clear     Clear the terminal

Keyboard shortcuts:
  ↑/↓       Navigate command history
  Tab       Autocomplete commands
  Ctrl+L    Clear terminal
  Ctrl+C    Cancel operation`;

/**
 * Send command usage error text
 */
export const SEND_USAGE_TEXT = `Usage: send <your-email> <message>

Example:
  send john@example.com Hi! I'd love to discuss a project.`;

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Find matching command for autocomplete
 */
export function findMatchingCommand<T extends { name: string }>(
	input: string,
	commands: T[]
): T | undefined {
	return commands.find((cmd) => cmd.name.startsWith(input.toLowerCase()));
}

/**
 * Generate the "whoami" command output box
 */
export function generateWhoamiBox(
	userName: string,
	userTitle: string,
	userDescription: string
): string {
	return `┌────────────────────────────────────────────────────────┐
│  ${userName.toUpperCase().padEnd(52)}│
│  ${userTitle.padEnd(52)}│
├────────────────────────────────────────────────────────┤
│                                                        │
│  ${userDescription.slice(0, 52).padEnd(52)}│
│  ${userDescription.slice(52, 104).padEnd(52)}│
│  ${userDescription.slice(104, 156).padEnd(52)}│
│                                                        │
│  🛠️  Stack: Next.js, Astro, SvelteKit, Django          │
│  🎨 Design: Clean UI, smooth animations, great UX      │
│  📍 Location: Open to remote opportunities             │
│                                                        │
└────────────────────────────────────────────────────────┘

Type 'send <your-email> <message>' to get in touch!`;
}

/**
 * Send email via API endpoint
 */
export async function sendEmail(
	email: string,
	message: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('/api/send-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				subject: `Portfolio Contact: ${email}`,
				html: `
					<h2>New Contact Form Message</h2>
					<p><strong>From:</strong> ${email}</p>
					<p><strong>Message:</strong></p>
					<blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
						${message}
					</blockquote>
				`,
				text: `From: ${email}\n\nMessage:\n${message}`
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.message || `HTTP Error ${response.status}`
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Network error'
		};
	}
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email);
}

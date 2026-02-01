<script lang="ts">
	/**
	 * SimpleMailbox Component - Traditional contact form
	 *
	 * A user-friendly alternative to the Terminal for users who
	 * prefer conventional form interfaces.
	 *
	 * Features:
	 * - Real-time validation with inline errors
	 * - Character count for message field
	 * - Accessible form controls with ARIA
	 * - Progressive enhancement (works without JS)
	 * - Matching terminal aesthetic
	 * - Loading states and success feedback
	 */

	import { browser } from '$app/environment';
	import { name } from '$data';
	import { getTerminalSocialLinks, sendEmail } from '$data/terminalCommands';
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';

	// ─────────────────────────────────────────────────────────────
	// Types
	// ─────────────────────────────────────────────────────────────

	type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

	interface FormErrors {
		name?: string;
		email?: string;
		message?: string;
	}

	// ─────────────────────────────────────────────────────────────
	// State
	// ─────────────────────────────────────────────────────────────

	let formData = $state({
		name: '',
		email: '',
		message: ''
	});

	let errors = $state<FormErrors>({});
	let touched = $state<Record<string, boolean>>({});
	let status = $state<FormStatus>('idle');
	let errorMessage = $state('');

	// Validation constants
	const MIN_MESSAGE_LENGTH = 10;
	const MAX_MESSAGE_LENGTH = 2000;
	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// ─────────────────────────────────────────────────────────────
	// Computed
	// ─────────────────────────────────────────────────────────────

	let messageLength = $derived(formData.message.length);
	let messageLengthStatus = $derived.by(() => {
		if (messageLength < MIN_MESSAGE_LENGTH) return 'short' as const;
		if (messageLength > MAX_MESSAGE_LENGTH) return 'error' as const;
		if (messageLength > MAX_MESSAGE_LENGTH - 100) return 'warning' as const;
		return 'ok' as const;
	});

	// ─────────────────────────────────────────────────────────────
	// Validation
	// ─────────────────────────────────────────────────────────────

	function validateField(field: keyof typeof formData): string | undefined {
		const value = formData[field].trim();

		switch (field) {
			case 'name':
				if (!value) return 'Name is required';
				if (value.length < 2) return 'Name must be at least 2 characters';
				return undefined;

			case 'email':
				if (!value) return 'Email is required';
				if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
				return undefined;

			case 'message':
				if (!value) return 'Message is required';
				if (value.length < MIN_MESSAGE_LENGTH)
					return `Message must be at least ${MIN_MESSAGE_LENGTH} characters`;
				if (value.length > MAX_MESSAGE_LENGTH)
					return `Message must be less than ${MAX_MESSAGE_LENGTH} characters`;
				return undefined;
		}
	}

	function validateAll(): boolean {
		errors = {
			name: validateField('name'),
			email: validateField('email'),
			message: validateField('message')
		};
		return !errors.name && !errors.email && !errors.message;
	}

	function handleBlur(field: keyof typeof formData): void {
		touched[field] = true;
		errors[field] = validateField(field);
	}

	function handleInput(field: keyof typeof formData): void {
		// Only validate on input if already touched
		if (touched[field]) {
			errors[field] = validateField(field);
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Form Submission
	// ─────────────────────────────────────────────────────────────

	async function handleSubmit(e: Event): Promise<void> {
		e.preventDefault();

		// Mark all fields as touched
		touched = { name: true, email: true, message: true };

		if (!validateAll()) {
			// Focus first error field
			const firstError = Object.keys(errors).find(
				(key) => errors[key as keyof FormErrors]
			) as keyof typeof formData;
			if (firstError && browser) {
				document.getElementById(`mailbox-${firstError}`)?.focus();
			}
			return;
		}

		status = 'submitting';
		errorMessage = '';

		try {
			const result = await sendEmail(
				formData.email,
				`From: ${formData.name}\n\n${formData.message}`
			);

			if (result.success) {
				status = 'success';
				// Reset form after success
				formData = { name: '', email: '', message: '' };
				touched = {};
				errors = {};
			} else {
				throw new Error(result.error || 'Failed to send message');
			}
		} catch (error) {
			status = 'error';
			errorMessage = error instanceof Error ? error.message : 'Something went wrong';
		}
	}

	function resetForm(): void {
		status = 'idle';
		errorMessage = '';
	}
</script>

<div
	class="mailbox w-full overflow-hidden rounded-xl border border-(--m-border) bg-(--m-bg) shadow-[0_16px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset] max-sm:rounded-lg max-sm:border-x-0"
>
	<!-- Header -->
	<header
		class="flex items-center justify-between border-b border-(--m-border) bg-(--m-bg-light) px-4 py-3.5"
	>
		<div class="flex gap-2">
			<span class="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
			></span>
			<span class="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
			></span>
			<span class="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
			></span>
		</div>
		<div class="flex items-center gap-2 text-[0.8125rem] text-(--m-muted)">
			<Icon icon="mdi:email-outline" width={14} height={14} />
			<span>Contact {name.split(' ')[0]}</span>
		</div>
		<div class="text-(--m-muted) opacity-50">
			<Icon icon="mdi:dots-horizontal" width={16} height={16} />
		</div>
	</header>

	<!-- Content -->
	<div class="p-6 sm:p-8">
		{#if status === 'success'}
			<!-- Success State -->
			<div
				class="flex flex-col items-center justify-center gap-4 py-12 text-center"
				transition:fade={{ duration: 200 }}
			>
				<div
					class="flex size-16 items-center justify-center rounded-full bg-(--m-green)/20 text-(--m-green)"
				>
					<Icon icon="mdi:check-circle" width={40} height={40} />
				</div>
				<h3 class="text-xl font-semibold text-(--m-text)">Message Sent!</h3>
				<p class="max-w-sm text-(--m-muted)">
					Thank you for reaching out. I'll get back to you as soon as possible.
				</p>
				<button
					type="button"
					class="mt-4 rounded-lg bg-(--m-accent) px-6 py-2.5 font-medium text-white transition-all hover:brightness-110"
					onclick={resetForm}
				>
					Send Another Message
				</button>
			</div>
		{:else}
			<!-- Form -->
			<form onsubmit={handleSubmit} novalidate>
				<div class="mb-6">
					<h2 class="text-lg font-semibold text-(--m-text)">Get in Touch</h2>
					<p class="mt-1 text-sm text-(--m-muted)">
						Fill out the form below and I'll respond as soon as possible.
					</p>
				</div>

				<!-- Name Field -->
				<div class="mb-5">
					<label for="mailbox-name" class="mb-2 block text-sm font-medium text-(--m-text)">
						Name <span class="text-(--m-red)">*</span>
					</label>
					<input
						type="text"
						id="mailbox-name"
						bind:value={formData.name}
						onblur={() => handleBlur('name')}
						oninput={() => handleInput('name')}
						class="w-full rounded-lg border bg-(--m-bg-light) px-4 py-3 text-(--m-text) transition-colors placeholder:text-(--m-muted) focus:border-(--m-accent) focus:ring-1 focus:ring-(--m-accent) focus:outline-none"
						class:border-red-500={touched.name && errors.name}
						class:border-(--m-border)={!touched.name || !errors.name}
						placeholder="John Doe"
						autocomplete="name"
						aria-describedby={errors.name ? 'name-error' : undefined}
						aria-invalid={touched.name && !!errors.name}
					/>
					{#if touched.name && errors.name}
						<p
							id="name-error"
							class="mt-1.5 flex items-center gap-1 text-sm text-(--m-red)"
							role="alert"
							transition:fly={{ y: -5, duration: 150 }}
						>
							<Icon icon="mdi:alert-circle" width={14} height={14} />
							{errors.name}
						</p>
					{/if}
				</div>

				<!-- Email Field -->
				<div class="mb-5">
					<label for="mailbox-email" class="mb-2 block text-sm font-medium text-(--m-text)">
						Email <span class="text-(--m-red)">*</span>
					</label>
					<input
						type="email"
						id="mailbox-email"
						bind:value={formData.email}
						onblur={() => handleBlur('email')}
						oninput={() => handleInput('email')}
						class="w-full rounded-lg border bg-(--m-bg-light) px-4 py-3 text-(--m-text) transition-colors placeholder:text-(--m-muted) focus:border-(--m-accent) focus:ring-1 focus:ring-(--m-accent) focus:outline-none"
						class:border-red-500={touched.email && errors.email}
						class:border-(--m-border)={!touched.email || !errors.email}
						placeholder="john@example.com"
						autocomplete="email"
						aria-describedby={errors.email ? 'email-error' : undefined}
						aria-invalid={touched.email && !!errors.email}
					/>
					{#if touched.email && errors.email}
						<p
							id="email-error"
							class="mt-1.5 flex items-center gap-1 text-sm text-(--m-red)"
							role="alert"
							transition:fly={{ y: -5, duration: 150 }}
						>
							<Icon icon="mdi:alert-circle" width={14} height={14} />
							{errors.email}
						</p>
					{/if}
				</div>

				<!-- Message Field -->
				<div class="mb-6">
					<div class="mb-2 flex items-center justify-between">
						<label for="mailbox-message" class="text-sm font-medium text-(--m-text)">
							Message <span class="text-(--m-red)">*</span>
						</label>
						<span
							class="text-xs transition-colors"
							class:text-(--m-muted)={messageLengthStatus === 'ok' ||
								messageLengthStatus === 'short'}
							class:text-(--m-yellow)={messageLengthStatus === 'warning'}
							class:text-(--m-red)={messageLengthStatus === 'error'}
						>
							{messageLength}/{MAX_MESSAGE_LENGTH}
						</span>
					</div>
					<textarea
						id="mailbox-message"
						bind:value={formData.message}
						onblur={() => handleBlur('message')}
						oninput={() => handleInput('message')}
						rows={5}
						class="w-full resize-none rounded-lg border bg-(--m-bg-light) px-4 py-3 text-(--m-text) transition-colors placeholder:text-(--m-muted) focus:border-(--m-accent) focus:ring-1 focus:ring-(--m-accent) focus:outline-none"
						class:border-red-500={touched.message && errors.message}
						class:border-(--m-border)={!touched.message || !errors.message}
						placeholder="Hi! I'd like to discuss..."
						aria-describedby={errors.message ? 'message-error' : 'message-hint'}
						aria-invalid={touched.message && !!errors.message}
					></textarea>
					{#if touched.message && errors.message}
						<p
							id="message-error"
							class="mt-1.5 flex items-center gap-1 text-sm text-(--m-red)"
							role="alert"
							transition:fly={{ y: -5, duration: 150 }}
						>
							<Icon icon="mdi:alert-circle" width={14} height={14} />
							{errors.message}
						</p>
					{:else}
						<p id="message-hint" class="mt-1.5 text-xs text-(--m-muted)">
							Minimum {MIN_MESSAGE_LENGTH} characters
						</p>
					{/if}
				</div>

				<!-- Error Message -->
				{#if status === 'error' && errorMessage}
					<div
						class="mb-5 flex items-start gap-3 rounded-lg border border-(--m-red)/30 bg-(--m-red)/10 p-4"
						role="alert"
						transition:fly={{ y: -5, duration: 150 }}
					>
						<Icon icon="mdi:alert-circle" width={20} height={20} class="mt-0.5 text-(--m-red)" />
						<div>
							<p class="font-medium text-(--m-red)">Failed to send message</p>
							<p class="mt-1 text-sm text-(--m-muted)">{errorMessage}</p>
						</div>
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={status === 'submitting'}
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500/50 px-6 py-3.5 font-medium text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if status === 'submitting'}
						<span class="animate-spin size-5 rounded-full border-2 border-white/30 border-t-white"
						></span>
						Sending...
					{:else}
						<Icon icon="mdi:send" width={18} height={18} />
						Send Message
					{/if}
				</button>
			</form>

			<!-- Social Links -->
			<div class="mt-8 border-t border-(--m-border) pt-6">
				<p class="mb-4 text-center text-sm text-(--m-muted)">Or connect with me on</p>
				<div class="flex flex-wrap justify-center gap-3">
					{#each getTerminalSocialLinks() as link (link.platform)}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 rounded-lg border border-(--m-border) bg-(--m-bg-light) px-4 py-2.5 text-sm text-(--m-text) transition-all hover:border-(--m-accent) hover:bg-(--m-accent)/10"
						>
							<Icon icon={link.icon} width={18} height={18} />
							<span class="max-sm:hidden">{link.platform}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference '$routes/layout.css';

	/* Mailbox CSS custom properties - using site theme */
	.mailbox {
		--m-bg: rgb(var(--background));
		--m-bg-light: var(--surface-1);
		--m-border: var(--border-default);
		--m-text: rgb(var(--foreground));
		--m-muted: rgb(var(--foreground-muted));
		--m-accent: oklch(var(--accent-500));
		--m-accent-light: oklch(var(--accent-text));
		--m-green: oklch(0.75 0.16 150);
		--m-red: oklch(0.65 0.22 25);
		--m-yellow: oklch(0.75 0.14 80);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.mailbox {
			@apply rounded-[10px];
		}
	}
</style>

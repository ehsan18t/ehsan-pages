<script lang="ts">
	/**
	 * Skills Section - Code editor-style skill showcase
	 *
	 * Features:
	 * - Mobile-first responsive design with collapsible sidebar
	 * - Real code snippets for each skill
	 * - Shiki-powered syntax highlighting
	 * - Smooth animations and transitions
	 */

	import { browser } from '$app/environment';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import {
		formatCode,
		getLang,
		getLanguageNameFromExtension,
		getSkillCounts,
		getWelcomeCode,
		skillGroups,
		type ActiveSkill
	} from '$data';
	import Icon from '@iconify/svelte';
	import { codeToHtml } from 'shiki';
	import { SvelteMap } from 'svelte/reactivity';

	// ─────────────────────────────────────────────────────────────
	// Constants
	// ─────────────────────────────────────────────────────────────

	const { fileCount } = getSkillCounts();
	const MOBILE_BREAKPOINT = 768;

	// ─────────────────────────────────────────────────────────────
	// Local State
	// ─────────────────────────────────────────────────────────────

	let expandedFolders = $state<string[]>([skillGroups[0].category]);
	let activeSkill = $state<ActiveSkill | null>(null);
	let sidebarOpen = $state(true);
	let isMobile = $state(false);
	let highlightedCode = $state<string>('');

	// ─────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────

	let tabName = $derived(
		activeSkill
			? `${activeSkill.name.toLowerCase().replace(/\s+/g, '-')}${activeSkill.extension || '.txt'}`
			: 'welcome.md'
	);

	let fileTypeDisplay = $derived(getLanguageNameFromExtension(activeSkill?.extension));

	let codeContent = $derived(activeSkill ? formatCode(activeSkill) : getWelcomeCode());

	let lineCount = $derived(codeContent.split('\n').length);

	// ─────────────────────────────────────────────────────────────
	// Helper Functions
	// ─────────────────────────────────────────────────────────────

	/** Cache for highlighted code to avoid re-rendering */
	const highlightCache = new SvelteMap<string, string>();

	async function highlightWithShiki(code: string, ext: string | undefined): Promise<string> {
		const cacheKey = `${ext || 'txt'}:${code}`;

		// Return cached result if available
		if (highlightCache.has(cacheKey)) {
			return highlightCache.get(cacheKey)!;
		}

		const lang = getLang(ext);
		try {
			const html = await codeToHtml(code, {
				lang,
				theme: 'github-dark'
			});
			// Cache the result
			highlightCache.set(cacheKey, html);
			return html;
		} catch {
			// Fallback: escape HTML and return plain
			const fallback = `<pre class="shiki"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
			highlightCache.set(cacheKey, fallback);
			return fallback;
		}
	}

	// ─────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────

	// Initialize mobile state on mount
	$effect(() => {
		if (!browser) return;
		// Initial check
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		if (isMobile) {
			sidebarOpen = false;
		}
	});

	// Syntax highlighting with Shiki
	$effect(() => {
		const code = codeContent;
		const ext = activeSkill?.extension;

		highlightWithShiki(code, ext).then((html) => {
			highlightedCode = html;
		});
	});

	// ─────────────────────────────────────────────────────────────
	// Event Handlers
	// ─────────────────────────────────────────────────────────────

	function toggleFolder(category: string): void {
		if (expandedFolders.includes(category)) {
			expandedFolders = expandedFolders.filter((c) => c !== category);
		} else {
			expandedFolders = [...expandedFolders, category];
		}
	}

	function collapseAllFolders(): void {
		expandedFolders = [];
	}

	function openSkill(skill: (typeof skillGroups)[0]['skills'][0], categoryColor: string): void {
		activeSkill = {
			...skill,
			categoryColor
		};
		if (isMobile) {
			sidebarOpen = false;
		}
	}

	function closeTab(): void {
		activeSkill = null;
	}

	function toggleSidebar(): void {
		sidebarOpen = !sidebarOpen;
	}

	// Handle window resize for mobile detection
	function handleResize(): void {
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		if (isMobile) {
			sidebarOpen = false;
		}
	}
</script>

<!-- Window resize handler for mobile detection -->
<svelte:window onresize={handleResize} />

<section id="skills" class="py-20 md:py-28">
	<div class="container mx-auto px-4">
		<SectionTitle
			p1="My"
			p2="Toolkit"
			subtitle="An interactive overview of the technologies I use. Click on a file to learn more."
		/>

		<!-- Code Editor Structure -->
		<div class="editor-wrapper">
			<!-- Mobile overlay when sidebar is open -->
			{#if isMobile && sidebarOpen}
				<button
					class="sidebar-overlay"
					onclick={() => (sidebarOpen = false)}
					aria-label="Close sidebar"
				></button>
			{/if}

			<!-- Sidebar (File Tree) -->
			<aside class="sidebar" class:open={sidebarOpen} class:mobile={isMobile}>
				<div class="sidebar-header">
					<span>Explorer</span>
					<div class="sidebar-actions">
						<button title="Collapse All" class="sidebar-btn" onclick={collapseAllFolders}>
							<Icon icon="mdi:chevron-double-up" width={14} height={14} />
						</button>
						{#if isMobile}
							<button
								title="Close Sidebar"
								class="sidebar-btn"
								onclick={() => (sidebarOpen = false)}
							>
								<Icon icon="mdi:close" width={14} height={14} />
							</button>
						{/if}
					</div>
				</div>

				<div class="file-tree">
					{#each skillGroups as group (group.category)}
						{@const isExpanded = expandedFolders.includes(group.category)}
						<div class="folder-item">
							<button class="folder-header" onclick={() => toggleFolder(group.category)}>
								<span class="folder-arrow" class:expanded={isExpanded}>
									<Icon icon="mdi:chevron-right" width={16} height={16} />
								</span>
								<Icon icon={group.icon} width={16} height={16} class="folder-icon" />
								<span class="folder-name">{group.category}</span>
								<span class="folder-count">{group.skills.length}</span>
							</button>

							{#if isExpanded}
								<ul class="skill-list">
									{#each group.skills as skill (skill.name)}
										<li>
											<button
												class="file-item"
												class:active={activeSkill?.name === skill.name}
												onclick={() => openSkill(skill, group.color)}
											>
												<Icon
													icon={skill.icon}
													width={16}
													height={16}
													style="color: {group.color};"
												/>
												<span class="file-name">{skill.name}</span>
												{#if skill.extension}
													<span class="file-ext">{skill.extension}</span>
												{/if}
											</button>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</div>
			</aside>

			<!-- Main Content -->
			<main class="main-content">
				<!-- Tab Bar -->
				<div class="tab-bar">
					{#if isMobile}
						<button
							class="menu-btn"
							class:hint={!activeSkill}
							onclick={toggleSidebar}
							aria-label="Toggle sidebar"
							title="Browse skills"
						>
							<Icon icon="mdi:menu" width={18} height={18} />
							{#if !activeSkill}
								<span class="menu-hint">Skills</span>
							{/if}
						</button>
					{/if}

					<div class="tab active">
						{#if activeSkill}
							<Icon
								icon={activeSkill.icon}
								width={14}
								height={14}
								style="color: {activeSkill.categoryColor};"
							/>
						{:else}
							<Icon icon="mdi:file-document-outline" width={14} height={14} />
						{/if}
						<span class="tab-name">{tabName}</span>
						{#if activeSkill}
							<button class="tab-close" onclick={closeTab} aria-label="Close tab">
								<Icon icon="mdi:close" width={12} height={12} />
							</button>
						{/if}
					</div>
				</div>

				<!-- Editor Pane -->
				<div class="editor-pane">
					<!-- Line numbers -->
					<div class="line-numbers" aria-hidden="true">
						{#each Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i) as line (line)}
							<span>{line + 1}</span>
						{/each}
					</div>

					<!-- Code content - Shiki output -->
					<div class="code-content">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output is trusted -->
						{@html highlightedCode}
					</div>
				</div>

				<!-- Status Bar -->
				<footer class="status-bar">
					<div class="status-left">
						<span class="status-item">
							<Icon icon="mdi:source-branch" width={14} height={14} />
							main
						</span>
						<span class="status-item hidden sm:flex">
							<Icon icon="mdi:file-multiple" width={14} height={14} />
							{fileCount} files
						</span>
					</div>
					<div class="status-right">
						<span class="status-item">{fileTypeDisplay}</span>
						<span class="status-item hidden sm:flex">Ln {lineCount}</span>
						<span class="status-item">UTF-8</span>
					</div>
				</footer>
			</main>
		</div>
	</div>
</section>

<style>
	.editor-wrapper {
		position: relative;
		display: flex;
		max-width: 64rem;
		margin: 0 auto;
		height: min(70vh, 550px);
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid oklch(var(--accent-500) / 0.2);
		background: var(--surface-2);
		box-shadow:
			0 16px 70px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset,
			0 0 40px oklch(var(--accent-500) / 0.05);
	}

	/* Sidebar Overlay for Mobile */
	.sidebar-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
		border: none;
		cursor: pointer;
		border-radius: 0.5rem;
	}

	/* Sidebar */
	.sidebar {
		width: 240px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: var(--surface-1);
		border-right: 1px solid oklch(var(--foreground) / 0.1);
		overflow: hidden;
		transition:
			transform 0.3s ease,
			width 0.3s ease;
	}

	.sidebar.mobile {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 260px;
		max-width: 80%;
		z-index: 50;
		transform: translateX(-100%);
		border-radius: 0.5rem 0 0 0.5rem;
	}

	.sidebar.mobile.open {
		transform: translateX(0);
	}

	@media (max-width: 767px) {
		.sidebar:not(.mobile) {
			display: none;
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(var(--foreground) / 0.6);
		border-bottom: 1px solid oklch(var(--foreground) / 0.05);
	}

	.sidebar-actions {
		display: flex;
		gap: 0.25rem;
	}

	.sidebar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: oklch(var(--foreground) / 0.6);
		cursor: pointer;
		transition: all 0.2s;
	}

	.sidebar-btn:hover {
		background: oklch(var(--accent-500) / 0.15);
		color: oklch(var(--accent-text));
	}

	.file-tree {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		scrollbar-width: thin;
		scrollbar-color: oklch(var(--foreground) / 0.2) transparent;
	}

	.folder-item {
		margin-bottom: 0.25rem;
	}

	.folder-header {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		color: oklch(var(--foreground) / 0.9);
		font-size: 0.8125rem;
		transition: background 0.15s;
		text-align: left;
	}

	.folder-header:hover {
		background: oklch(var(--accent-500) / 0.1);
	}

	.folder-arrow {
		display: flex;
		align-items: center;
		transition: transform 0.2s;
		color: oklch(var(--foreground) / 0.5);
	}

	.folder-arrow.expanded {
		transform: rotate(90deg);
	}

	:global(.folder-icon) {
		margin: 0 0.375rem;
		color: oklch(var(--accent-300));
	}

	.folder-name {
		flex: 1;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.folder-count {
		font-size: 0.7rem;
		color: oklch(var(--foreground) / 0.4);
		margin-left: 0.5rem;
	}

	.skill-list {
		list-style: none;
		margin: 0;
		padding: 0.25rem 0 0.25rem 1.25rem;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.3rem 0.5rem;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		color: oklch(var(--foreground) / 0.7);
		font-size: 0.8125rem;
		transition: all 0.15s;
		text-align: left;
	}

	.file-item:hover {
		background: oklch(var(--accent-500) / 0.1);
		color: oklch(var(--foreground));
	}

	.file-item.active {
		background: oklch(var(--accent-500) / 0.15);
		color: oklch(var(--accent-text));
	}

	.file-name {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-ext {
		font-size: 0.7rem;
		color: oklch(var(--foreground) / 0.4);
	}

	/* Main Content */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}

	/* Tab Bar */
	.tab-bar {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		background: var(--surface-1);
		border-bottom: 1px solid oklch(var(--foreground) / 0.1);
	}

	.menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		min-width: 40px;
		padding: 0 0.75rem;
		height: 36px;
		background: transparent;
		border: none;
		border-right: 1px solid oklch(var(--foreground) / 0.1);
		color: oklch(var(--foreground) / 0.7);
		cursor: pointer;
		transition: all 0.2s;
	}

	.menu-btn:hover {
		background: oklch(var(--accent-500) / 0.1);
		color: oklch(var(--accent-text));
	}

	.menu-btn.hint {
		background: oklch(var(--accent-500) / 0.15);
		color: oklch(var(--accent-text));
		animation: pulse-hint 2s ease-in-out infinite;
	}

	.menu-hint {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	@keyframes pulse-hint {
		0%,
		100% {
			background: oklch(var(--accent-500) / 0.15);
		}
		50% {
			background: oklch(var(--accent-500) / 0.3);
		}
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
		color: oklch(var(--foreground) / 0.6);
		border-right: 1px solid oklch(var(--foreground) / 0.1);
		background: transparent;
	}

	.tab.active {
		background: var(--surface-3);
		color: oklch(var(--foreground));
		border-bottom: 1px solid oklch(var(--accent-500));
		margin-bottom: -1px;
	}

	.tab-name {
		max-width: 150px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tab-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: oklch(var(--foreground) / 0.4);
		cursor: pointer;
		opacity: 0;
		transition: all 0.15s;
	}

	.tab:hover .tab-close {
		opacity: 1;
	}

	.tab-close:hover {
		background: oklch(var(--foreground) / 0.1);
		color: oklch(var(--foreground));
	}

	/* Editor Pane */
	.editor-pane {
		flex: 1;
		display: flex;
		overflow: auto;
		min-height: 0;
		background: color-mix(in oklch, rgb(var(--background)), black 25%);
	}

	.line-numbers {
		display: flex;
		flex-direction: column;
		padding: 1rem 0;
		min-width: 3rem;
		text-align: right;
		font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: oklch(var(--foreground) / 0.3);
		background: color-mix(in oklch, rgb(var(--background)), black 30%);
		border-right: 1px solid oklch(var(--foreground) / 0.05);
		user-select: none;
	}

	.line-numbers span {
		padding-right: 1rem;
	}

	.code-content {
		flex: 1;
		padding: 0;
		overflow: visible;
	}

	/* Shiki output styling */
	.code-content :global(pre.shiki) {
		margin: 0;
		padding: 1rem 1.5rem;
		background: transparent !important;
		font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.code-content :global(pre.shiki code) {
		background: transparent;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	/* Status Bar */
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(var(--foreground) / 0.6);
		background: color-mix(in oklch, rgb(var(--background)), black 45%);
		border-top: 1px solid oklch(var(--foreground) / 0.1);
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	/* Responsive */
	@media (max-width: 639px) {
		.editor-wrapper {
			height: 450px;
		}

		.line-numbers {
			min-width: 2.5rem;
			font-size: 0.75rem;
		}

		.line-numbers span {
			padding-right: 0.75rem;
		}

		.code-content :global(pre.shiki) {
			padding: 1rem;
			font-size: 0.75rem;
		}

		.status-bar {
			flex-wrap: wrap;
			gap: 0.5rem;
		}
	}
</style>

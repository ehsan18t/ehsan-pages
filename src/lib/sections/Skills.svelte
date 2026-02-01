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

		<!-- Zed-style Code Editor -->
		<div class="editor-container">
			<div class="editor-wrapper">
				<!-- Window Title Bar (minimal) -->
				<div class="window-titlebar">
					<div class="traffic-lights">
						<span class="traffic-light close"></span>
						<span class="traffic-light minimize"></span>
						<span class="traffic-light maximize"></span>
					</div>
					<span class="window-title">skills — Ehsan's Toolkit</span>
					<div class="window-spacer"></div>
				</div>

				<!-- Editor Content Area -->
				<div class="editor-content">
					<!-- Mobile overlay when sidebar is open -->
					{#if isMobile && sidebarOpen}
						<button
							class="sidebar-overlay"
							onclick={() => (sidebarOpen = false)}
							aria-label="Close sidebar"
						></button>
					{/if}

					<!-- Sidebar (Project Panel - Zed style) -->
					<aside class="sidebar" class:open={sidebarOpen} class:mobile={isMobile}>
						<div class="sidebar-header">
							<span class="project-name">
								<Icon icon="ph:caret-down" width={10} height={10} />
								skills
							</span>
							<div class="sidebar-actions">
								<button title="Collapse All" class="sidebar-btn" onclick={collapseAllFolders}>
									<Icon icon="ph:caret-double-up" width={12} height={12} />
								</button>
								{#if isMobile}
									<button title="Close" class="sidebar-btn" onclick={() => (sidebarOpen = false)}>
										<Icon icon="ph:x" width={12} height={12} />
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
											<Icon icon="ph:caret-right" width={10} height={10} />
										</span>
										<Icon
											icon={isExpanded ? 'ph:folder-open-fill' : 'ph:folder-fill'}
											width={15}
											height={15}
											class="folder-icon"
										/>
										<span class="folder-name">{group.category}</span>
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
															width={14}
															height={14}
															style="color: {group.color};"
														/>
														<span class="file-name">{skill.name}{skill.extension || ''}</span>
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
						<!-- Tab Bar (Zed style) -->
						<div class="tab-bar">
							{#if isMobile}
								<button
									class="menu-btn"
									class:hint={!activeSkill}
									onclick={toggleSidebar}
									aria-label="Toggle sidebar"
									title="Browse skills"
								>
									<Icon icon="ph:sidebar" width={14} height={14} />
									{#if !activeSkill}
										<span class="menu-hint">Browse</span>
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
									<Icon icon="ph:file-text" width={14} height={14} />
								{/if}
								<span class="tab-name">{tabName}</span>
								{#if activeSkill}
									<button class="tab-close" onclick={closeTab} aria-label="Close tab">
										<Icon icon="ph:x" width={9} height={9} />
									</button>
								{/if}
							</div>
						</div>

						<!-- Editor Pane -->
						<div class="editor-pane">
							<!-- Line numbers (Zed style - cleaner) -->
							<div class="line-numbers" aria-hidden="true">
								{#each Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i) as line (line)}
									<span>{line + 1}</span>
								{/each}
							</div>

							<!-- Code content - Shiki output -->
							<div class="code-content">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output is trusted -->
								{@html highlightedCode}
							</div>
						</div>

						<!-- Status Bar (subtle, minimal) -->
						<footer class="status-bar">
							<div class="status-left">
								<span class="status-item branch">
									<Icon icon="ph:git-branch" width={12} height={12} />
									main
								</span>
							</div>
							<div class="status-right">
								<span class="status-item">{fileTypeDisplay}</span>
								<span class="status-item">{lineCount}L</span>
							</div>
						</footer>
					</main>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* ═══════════════════════════════════════════════════════════════
	   ZED-INSPIRED EDITOR THEME (Enhanced)
	   ═══════════════════════════════════════════════════════════════
	   Based on Zed One Dark with site's teal accent (--accent-hue: 185)
	   Enhanced with better gradients, shadows, and visual hierarchy
	   ═══════════════════════════════════════════════════════════════ */

	/* ═══════════════════════════════════════════════════════════════
	   EDITOR CONTAINER
	   ═══════════════════════════════════════════════════════════════ */
	.editor-container {
		max-width: 72rem;
		margin: 0 auto;
		position: relative;
	}

	/* Subtle glow behind editor */
	.editor-container::before {
		content: '';
		position: absolute;
		inset: -30px;
		background: radial-gradient(
			ellipse 60% 50% at 50% 50%,
			oklch(var(--accent-500) / 0.08) 0%,
			transparent 70%
		);
		z-index: -1;
		filter: blur(40px);
		pointer-events: none;
	}

	.editor-wrapper {
		display: flex;
		flex-direction: column;
		height: min(72vh, 600px);
		border-radius: 12px;
		overflow: hidden;
		background: oklch(0.28 0.025 var(--accent-hue));
		box-shadow:
			0 0 0 1px oklch(var(--foreground) / 0.15),
			0 8px 30px -4px rgba(0, 0, 0, 0.4),
			0 20px 60px -10px rgba(0, 0, 0, 0.5);
	}

	/* ═══════════════════════════════════════════════════════════════
	   WINDOW TITLE BAR
	   ═══════════════════════════════════════════════════════════════ */
	.window-titlebar {
		display: flex;
		align-items: center;
		padding: 0 16px;
		height: 40px;
		background: oklch(0.28 0.025 var(--accent-hue));
		border-bottom: 1px solid oklch(var(--foreground) / 0.08);
	}

	.traffic-lights {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.traffic-light {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.traffic-light.close {
		background: #ff5f57;
	}

	.traffic-light.minimize {
		background: #febc2e;
	}

	.traffic-light.maximize {
		background: #28c840;
	}

	.editor-wrapper:hover .traffic-light.close {
		filter: brightness(1.1);
	}

	.editor-wrapper:hover .traffic-light.minimize {
		filter: brightness(1.1);
	}

	.editor-wrapper:hover .traffic-light.maximize {
		filter: brightness(1.1);
	}

	.window-title {
		flex: 1;
		text-align: center;
		font-size: 13px;
		color: oklch(var(--foreground) / 0.7);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.window-spacer {
		width: 52px;
	}

	/* ═══════════════════════════════════════════════════════════════
	   EDITOR CONTENT
	   ═══════════════════════════════════════════════════════════════ */
	.editor-content {
		display: flex;
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	/* ═══════════════════════════════════════════════════════════════
	   SIDEBAR OVERLAY
	   ═══════════════════════════════════════════════════════════════ */
	.sidebar-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 40;
		border: none;
		cursor: pointer;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ═══════════════════════════════════════════════════════════════
	   SIDEBAR (Project Panel)
	   ═══════════════════════════════════════════════════════════════ */
	.sidebar {
		width: 200px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: oklch(0.18 0.02 var(--accent-hue));
		border-right: 1px solid oklch(var(--foreground) / 0.12);
		overflow: hidden;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar.mobile {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 240px;
		max-width: 85%;
		z-index: 50;
		transform: translateX(-100%);
		border-radius: 0 14px 14px 0;
		box-shadow: 8px 0 32px rgba(0, 0, 0, 0.3);
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
		padding: 8px 10px 6px;
		border-bottom: 1px solid oklch(var(--foreground) / 0.06);
	}

	.project-name {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 600;
		color: oklch(var(--foreground) / 0.85);
		letter-spacing: -0.01em;
	}

	.project-name :global(svg) {
		color: oklch(var(--foreground) / 0.6);
	}

	.sidebar-actions {
		display: flex;
		gap: 2px;
	}

	.sidebar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: oklch(var(--foreground) / 0.4);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.sidebar-btn:hover {
		background: oklch(var(--foreground) / 0.1);
		color: oklch(var(--foreground) / 0.9);
	}

	.file-tree {
		flex: 1;
		overflow-y: auto;
		padding: 4px 6px 12px;
	}

	.file-tree::-webkit-scrollbar {
		width: 8px;
	}

	.file-tree::-webkit-scrollbar-track {
		background: transparent;
	}

	.file-tree::-webkit-scrollbar-thumb {
		background: oklch(var(--foreground) / 0.12);
		border-radius: 4px;
		border: 2px solid transparent;
		background-clip: padding-box;
	}

	.file-tree::-webkit-scrollbar-thumb:hover {
		background: oklch(var(--foreground) / 0.2);
		background-clip: padding-box;
	}

	.folder-item {
		margin-bottom: 1px;
	}

	.folder-header {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 4px 8px;
		border: none;
		background: transparent;
		border-radius: 5px;
		cursor: pointer;
		color: oklch(var(--foreground) / 0.85);
		font-size: 13px;
		transition: all 0.15s ease;
		text-align: left;
	}

	.folder-header:hover {
		background: oklch(var(--foreground) / 0.06);
	}

	.folder-arrow {
		display: flex;
		align-items: center;
		margin-right: 4px;
		transition: transform 0.2s ease;
		color: oklch(var(--foreground) / 0.35);
	}

	.folder-arrow.expanded {
		transform: rotate(90deg);
	}

	:global(.folder-icon) {
		margin-right: 7px;
		color: oklch(var(--accent-text));
	}

	.folder-name {
		flex: 1;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		letter-spacing: -0.01em;
	}

	.skill-list {
		list-style: none;
		margin: 0;
		padding: 2px 0 2px 16px;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 7px;
		width: 100%;
		padding: 4px 8px;
		border: none;
		background: transparent;
		border-radius: 5px;
		cursor: pointer;
		color: oklch(var(--foreground) / 0.6);
		font-size: 13px;
		transition: all 0.12s ease;
		text-align: left;
	}

	.file-item:hover {
		background: oklch(var(--foreground) / 0.06);
		color: oklch(var(--foreground) / 0.9);
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
		letter-spacing: -0.01em;
	}

	/* ═══════════════════════════════════════════════════════════════
	   MAIN CONTENT
	   ═══════════════════════════════════════════════════════════════ */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		background: oklch(0.18 0.02 var(--accent-hue));
	}

	/* ═══════════════════════════════════════════════════════════════
	   TAB BAR
	   ═══════════════════════════════════════════════════════════════ */
	.tab-bar {
		display: flex;
		align-items: flex-end;
		flex-shrink: 0;
		height: 44px;
		background: oklch(0.18 0.02 var(--accent-hue));
		border-bottom: 1px solid oklch(var(--foreground) / 0.1);
		padding: 0 12px;
		gap: 2px;
	}

	.menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 0 12px;
		height: 34px;
		margin-bottom: 0;
		background: transparent;
		border: none;
		border-radius: 6px 6px 0 0;
		color: oklch(var(--foreground) / 0.6);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.menu-btn:hover {
		background: oklch(var(--foreground) / 0.08);
		color: oklch(var(--foreground) / 0.9);
	}

	.menu-btn.hint {
		background: oklch(var(--accent-500) / 0.25);
		color: oklch(var(--accent-text));
		animation: pulse-hint 2s ease-in-out infinite;
	}

	.menu-hint {
		font-size: 12px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	@keyframes pulse-hint {
		0%,
		100% {
			box-shadow: 0 0 0 0 oklch(var(--accent-500) / 0.4);
		}
		50% {
			box-shadow: 0 0 0 5px oklch(var(--accent-500) / 0);
		}
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 14px;
		height: 36px;
		font-size: 13px;
		color: oklch(var(--foreground) / 0.6);
		background: transparent;
		border: none;
		border-radius: 6px 6px 0 0;
		margin-bottom: 0;
		transition: all 0.15s ease;
	}

	.tab.active {
		background: oklch(0.12 0.015 var(--accent-hue));
		color: oklch(var(--foreground));
		border-bottom: 2px solid oklch(0.12 0.015 var(--accent-hue));
		margin-bottom: -1px;
	}

	.tab:not(.active):hover {
		background: oklch(0.22 0.02 var(--accent-hue));
		color: oklch(var(--foreground) / 0.9);
	}

	.tab-name {
		max-width: 160px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.tab-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: oklch(var(--foreground) / 0.35);
		cursor: pointer;
		opacity: 0;
		transition: all 0.12s ease;
	}

	.tab:hover .tab-close {
		opacity: 1;
	}

	.tab-close:hover {
		background: oklch(var(--foreground) / 0.12);
		color: oklch(var(--foreground) / 0.8);
	}

	/* ═══════════════════════════════════════════════════════════════
	   EDITOR PANE
	   ═══════════════════════════════════════════════════════════════ */
	.editor-pane {
		flex: 1;
		display: flex;
		overflow: auto;
		min-height: 0;
		background: oklch(0.12 0.015 var(--accent-hue));
		border-top: none;
	}

	.line-numbers {
		display: flex;
		flex-direction: column;
		padding: 20px 0;
		min-width: 52px;
		text-align: right;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
		font-size: 13px;
		line-height: 1.6;
		color: oklch(var(--foreground) / 0.35);
		background: oklch(0.12 0.015 var(--accent-hue));
		user-select: none;
	}

	.line-numbers span {
		padding-right: 14px;
		transition: color 0.1s ease;
	}

	.line-numbers span:hover {
		color: oklch(var(--foreground) / 0.5);
	}

	.code-content {
		flex: 1;
		padding: 0;
		overflow: visible;
	}

	/* Shiki output styling */
	.code-content :global(pre.shiki) {
		margin: 0;
		padding: 20px 22px;
		background: transparent !important;
		font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
		font-size: 13px;
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

	/* ═══════════════════════════════════════════════════════════════
	   STATUS BAR
	   ═══════════════════════════════════════════════════════════════ */
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		height: 26px;
		padding: 0 14px;
		font-size: 11px;
		color: oklch(var(--foreground) / 0.6);
		background: oklch(0.28 0.025 var(--accent-hue));
		border-top: 1px solid oklch(var(--foreground) / 0.08);
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 2px 0;
		transition: color 0.1s ease;
	}

	.status-item:hover {
		color: oklch(var(--foreground) / 0.75);
	}

	.status-item.branch {
		color: oklch(var(--accent-text) / 0.7);
	}

	.status-item.branch:hover {
		color: oklch(var(--accent-text));
	}

	/* ═══════════════════════════════════════════════════════════════
	   RESPONSIVE
	   ═══════════════════════════════════════════════════════════════ */
	@media (max-width: 639px) {
		.editor-container::before {
			inset: -15px;
			filter: blur(25px);
		}

		.editor-wrapper {
			height: 480px;
			border-radius: 10px;
		}

		.window-titlebar {
			height: 36px;
			padding: 0 12px;
		}

		.window-title {
			font-size: 12px;
		}

		.traffic-light {
			width: 10px;
			height: 10px;
		}

		.tab-bar {
			height: 34px;
		}

		.tab {
			height: 26px;
			padding: 0 10px;
			font-size: 12px;
		}

		.line-numbers {
			min-width: 36px;
			font-size: 12px;
			padding: 16px 0;
		}

		.line-numbers span {
			padding-right: 10px;
		}

		.code-content :global(pre.shiki) {
			padding: 16px 16px;
			font-size: 12px;
		}

		.status-bar {
			height: 22px;
			font-size: 10px;
			padding: 0 10px;
		}

		.status-right {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.editor-wrapper {
			height: 420px;
		}

		.window-title {
			display: none;
		}
	}
</style>

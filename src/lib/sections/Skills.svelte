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

		<!-- Code Editor Structure -->
		<div class="editor-container">
			<div class="editor-wrapper">
				<!-- Window Title Bar -->
				<div class="window-titlebar">
					<div class="traffic-lights">
						<span class="traffic-light close"></span>
						<span class="traffic-light minimize"></span>
						<span class="traffic-light maximize"></span>
					</div>
					<div class="window-title">skills — Ehsan's Toolkit</div>
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

					<!-- Activity Bar (VS Code-style) - Desktop only -->
					<div class="activity-bar">
						<div class="activity-icon active" title="Explorer">
							<Icon icon="codicon:files" width={24} height={24} />
						</div>
						<div class="activity-icon" title="Search">
							<Icon icon="codicon:search" width={24} height={24} />
						</div>
						<div class="activity-icon" title="Source Control">
							<Icon icon="codicon:source-control" width={24} height={24} />
						</div>
						<div class="activity-icon" title="Extensions">
							<Icon icon="codicon:extensions" width={24} height={24} />
						</div>
						<div class="activity-spacer"></div>
						<div class="activity-icon" title="Settings">
							<Icon icon="codicon:settings-gear" width={24} height={24} />
						</div>
					</div>

					<!-- Sidebar (File Tree) -->
					<aside class="sidebar" class:open={sidebarOpen} class:mobile={isMobile}>
						<div class="sidebar-header">
							<span>EXPLORER</span>
							<div class="sidebar-actions">
								<button title="Collapse All" class="sidebar-btn" onclick={collapseAllFolders}>
									<Icon icon="codicon:collapse-all" width={16} height={16} />
								</button>
								{#if isMobile}
									<button title="Close" class="sidebar-btn" onclick={() => (sidebarOpen = false)}>
										<Icon icon="codicon:close" width={16} height={16} />
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
											<Icon icon="codicon:chevron-right" width={16} height={16} />
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
									<Icon icon="codicon:menu" width={18} height={18} />
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
									<Icon icon="codicon:markdown" width={14} height={14} />
								{/if}
								<span class="tab-name">{tabName}</span>
								{#if activeSkill}
									<button class="tab-close" onclick={closeTab} aria-label="Close tab">
										<Icon icon="codicon:close" width={14} height={14} />
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
								<span class="status-item remote">
									<Icon icon="codicon:remote" width={14} height={14} />
								</span>
								<span class="status-item">
									<Icon icon="codicon:source-control" width={14} height={14} />
									main
								</span>
							</div>
							<div class="status-right">
								<span class="status-item">{fileTypeDisplay}</span>
								<span class="status-item">Ln {lineCount}, Col 1</span>
								<span class="status-item">UTF-8</span>
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
	   VS Code Dark Theme Colors (authentic)
	   ═══════════════════════════════════════════════════════════════
	   Title Bar: #3c3c3c
	   Activity Bar: #333333
	   Side Bar: #252526
	   Editor: #1e1e1e
	   Tab Bar: #2d2d2d
	   Tab Active: #1e1e1e
	   Status Bar: #007acc
	   Border: #3c3c3c
	   Foreground: #cccccc
	   ═══════════════════════════════════════════════════════════════ */

	/* ═══════════════════════════════════════════════════════════════
	   EDITOR CONTAINER
	   ═══════════════════════════════════════════════════════════════ */
	.editor-container {
		max-width: 72rem;
		margin: 0 auto;
	}

	.editor-wrapper {
		display: flex;
		flex-direction: column;
		height: min(70vh, 580px);
		border-radius: 8px;
		overflow: hidden;
		background: #1e1e1e;
		box-shadow:
			0 25px 60px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	/* ═══════════════════════════════════════════════════════════════
	   WINDOW TITLE BAR
	   ═══════════════════════════════════════════════════════════════ */
	.window-titlebar {
		display: flex;
		align-items: center;
		padding: 0 12px;
		height: 30px;
		background: #3c3c3c;
		border-bottom: 1px solid #252526;
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
	}

	.traffic-light.close {
		background: #ff5f57;
	}

	.traffic-light.minimize {
		background: #ffbd2e;
	}

	.traffic-light.maximize {
		background: #28c840;
	}

	.window-title {
		flex: 1;
		text-align: center;
		font-size: 12px;
		color: #cccccc;
		font-weight: 400;
	}

	.window-spacer {
		width: 52px; /* Balance with traffic lights */
	}

	@media (max-width: 639px) {
		.window-title {
			font-size: 11px;
		}
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
	   ACTIVITY BAR
	   ═══════════════════════════════════════════════════════════════ */
	.activity-bar {
		display: flex;
		flex-direction: column;
		width: 48px;
		background: #333333;
		flex-shrink: 0;
	}

	@media (max-width: 767px) {
		.activity-bar {
			display: none;
		}
	}

	.activity-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 48px;
		color: rgba(255, 255, 255, 0.4);
		cursor: default;
		position: relative;
	}

	.activity-icon.active {
		color: #ffffff;
	}

	.activity-icon.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: #ffffff;
	}

	.activity-spacer {
		flex: 1;
	}

	/* ═══════════════════════════════════════════════════════════════
	   SIDEBAR OVERLAY
	   ═══════════════════════════════════════════════════════════════ */
	.sidebar-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
		border: none;
		cursor: pointer;
	}

	/* ═══════════════════════════════════════════════════════════════
	   SIDEBAR
	   ═══════════════════════════════════════════════════════════════ */
	.sidebar {
		width: 220px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: #252526;
		border-right: 1px solid #3c3c3c;
		overflow: hidden;
		transition: transform 0.3s ease;
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
		padding: 10px 20px 10px 12px;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: #bbbbbb;
	}

	.sidebar-actions {
		display: flex;
		gap: 4px;
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
		color: #bbbbbb;
		cursor: pointer;
		transition: background 0.15s;
	}

	.sidebar-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.file-tree {
		flex: 1;
		overflow-y: auto;
		padding: 0 8px 8px;
	}

	.file-tree::-webkit-scrollbar {
		width: 10px;
	}

	.file-tree::-webkit-scrollbar-track {
		background: transparent;
	}

	.file-tree::-webkit-scrollbar-thumb {
		background: rgba(121, 121, 121, 0.4);
		border-radius: 5px;
		border: 2px solid #252526;
	}

	.folder-item {
		margin-bottom: 2px;
	}

	.folder-header {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 4px 6px;
		border: none;
		background: transparent;
		border-radius: 0;
		cursor: pointer;
		color: #cccccc;
		font-size: 13px;
		transition: background 0.1s;
		text-align: left;
	}

	.folder-header:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.folder-arrow {
		display: flex;
		align-items: center;
		transition: transform 0.15s;
		color: #cccccc;
	}

	.folder-arrow.expanded {
		transform: rotate(90deg);
	}

	:global(.folder-icon) {
		margin: 0 6px;
		color: #dcb67a;
	}

	.folder-name {
		flex: 1;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.folder-count {
		font-size: 11px;
		color: #858585;
		margin-left: 8px;
	}

	.skill-list {
		list-style: none;
		margin: 0;
		padding: 0 0 0 16px;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 3px 6px;
		border: none;
		background: transparent;
		border-radius: 0;
		cursor: pointer;
		color: #cccccc;
		font-size: 13px;
		transition: background 0.1s;
		text-align: left;
	}

	.file-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.file-item.active {
		background: #37373d;
		color: #ffffff;
	}

	.file-name {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-ext {
		font-size: 11px;
		color: #858585;
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
		background: #1e1e1e;
	}

	/* ═══════════════════════════════════════════════════════════════
	   TAB BAR
	   ═══════════════════════════════════════════════════════════════ */
	.tab-bar {
		display: flex;
		align-items: stretch;
		flex-shrink: 0;
		height: 35px;
		background: #252526;
	}

	.menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 0 12px;
		background: transparent;
		border: none;
		border-right: 1px solid #3c3c3c;
		color: #cccccc;
		cursor: pointer;
		transition: background 0.15s;
	}

	.menu-btn:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.menu-btn.hint {
		background: rgba(0, 122, 204, 0.3);
		color: #ffffff;
		animation: pulse-hint 2s ease-in-out infinite;
	}

	.menu-hint {
		font-size: 12px;
		font-weight: 500;
	}

	@keyframes pulse-hint {
		0%,
		100% {
			background: rgba(0, 122, 204, 0.3);
		}
		50% {
			background: rgba(0, 122, 204, 0.5);
		}
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 12px;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.5);
		background: #2d2d2d;
		border-right: 1px solid #252526;
	}

	.tab.active {
		background: #1e1e1e;
		color: #ffffff;
		border-top: 1px solid #007acc;
		margin-top: -1px;
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
		width: 20px;
		height: 20px;
		border-radius: 4px;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		opacity: 0;
		transition: all 0.15s;
	}

	.tab:hover .tab-close {
		opacity: 1;
	}

	.tab-close:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}

	/* ═══════════════════════════════════════════════════════════════
	   EDITOR PANE
	   ═══════════════════════════════════════════════════════════════ */
	.editor-pane {
		flex: 1;
		display: flex;
		overflow: auto;
		min-height: 0;
		background: #1e1e1e;
	}

	.line-numbers {
		display: flex;
		flex-direction: column;
		padding: 16px 0;
		min-width: 50px;
		text-align: right;
		font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
		font-size: 13px;
		line-height: 1.5;
		color: #858585;
		background: #1e1e1e;
		border-right: 1px solid #3c3c3c;
		user-select: none;
	}

	.line-numbers span {
		padding-right: 16px;
	}

	.code-content {
		flex: 1;
		padding: 0;
		overflow: visible;
	}

	/* Shiki output styling */
	.code-content :global(pre.shiki) {
		margin: 0;
		padding: 16px 20px;
		background: transparent !important;
		font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
		font-size: 13px;
		line-height: 1.5;
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
		height: 22px;
		padding: 0 10px;
		font-size: 12px;
		color: #ffffff;
		background: #007acc;
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		height: 100%;
		transition: background 0.15s;
	}

	.status-item:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.status-item.remote {
		background: #16825d;
		padding: 0 8px;
		margin-right: 4px;
	}

	/* ═══════════════════════════════════════════════════════════════
	   RESPONSIVE
	   ═══════════════════════════════════════════════════════════════ */
	@media (max-width: 639px) {
		.editor-wrapper {
			height: 450px;
			border-radius: 6px;
		}

		.window-titlebar {
			height: 28px;
			padding: 0 10px;
		}

		.traffic-light {
			width: 10px;
			height: 10px;
		}

		.line-numbers {
			min-width: 40px;
			font-size: 12px;
			padding: 12px 0;
		}

		.line-numbers span {
			padding-right: 10px;
		}

		.code-content :global(pre.shiki) {
			padding: 12px 14px;
			font-size: 12px;
		}

		.status-bar {
			height: 20px;
			font-size: 11px;
		}

		.status-right {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.editor-wrapper {
			height: 400px;
		}
	}
</style>

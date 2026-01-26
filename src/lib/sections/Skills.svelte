<script lang="ts">
	import { browser } from '$app/environment';
	import SectionTitle from '$components/ui/SectionTitle.svelte';
	import {
		getLanguageNameFromExtension,
		getSkillCounts,
		skillGroups,
		type SkillWithCategory
	} from '$data';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	// Build skills map with category metadata
	const skillsMap = new SvelteMap<string, SkillWithCategory>();
	skillGroups.forEach((group) => {
		group.skills.forEach((skill) => {
			skillsMap.set(skill.name, {
				...skill,
				categoryColor: group.color,
				categoryIcon: group.icon
			});
		});
	});

	const { fileCount, folderCount } = getSkillCounts();

	// State
	let expandedFolders = new SvelteSet([skillGroups[0].category]);
	let activeSkill = $state<SkillWithCategory | null>(null);
	let sidebarVisible = $state(true);
	let lineInfo = $state({ line: 1, col: 1 });

	function toggleFolder(category: string) {
		if (expandedFolders.has(category)) {
			expandedFolders.delete(category);
		} else {
			expandedFolders.add(category);
		}
	}

	function collapseAllFolders() {
		expandedFolders.clear();
	}

	function openSkill(skillName: string) {
		const skill = skillsMap.get(skillName);
		if (!skill) return;

		activeSkill = skill;
		lineInfo = {
			line: Math.floor(Math.random() * 20) + 1,
			col: Math.floor(Math.random() * 40) + 1
		};
	}

	function closeTab() {
		activeSkill = null;
		lineInfo = { line: 1, col: 1 };
	}

	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}

	// Keyboard shortcut
	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey && e.key === 'b') {
			e.preventDefault();
			toggleSidebar();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('keydown', handleKeydown);
	});

	// Derived values
	let tabName = $derived(
		activeSkill ? `${activeSkill.name}${activeSkill.extension || ''}` : 'welcome.txt'
	);
	let fileTypeDisplay = $derived(getLanguageNameFromExtension(activeSkill?.extension));
</script>

<section id="skills" class="py-20 md:py-28">
	<div class="container mx-auto px-4">
		<SectionTitle
			p1="My"
			p2="Toolkit"
			subtitle="An interactive overview of the technologies I use. Click on a file to learn more."
		/>

		<!-- Code Editor Structure -->
		<div
			class="code-editor mx-auto flex min-h-[60vh] max-w-5xl overflow-hidden rounded-lg border border-[rgba(var(--foreground)/0.1)] bg-[color-mix(in_oklch,rgb(var(--background)),black_25%)] text-sm shadow-2xl"
		>
			<!-- Sidebar (File Tree) -->
			{#if sidebarVisible}
				<aside
					class="sidebar w-48 overflow-y-auto border-r border-[rgba(var(--foreground)/0.1)] bg-[color-mix(in_oklch,rgb(var(--background)),black_40%)] p-2 md:w-64"
				>
					<div
						class="sidebar-header mb-2 flex items-center justify-between px-1 text-xs text-foreground-muted uppercase"
					>
						<span>Explorer</span>
						<button
							title="Collapse All"
							class="collapse-all-btn rounded p-1 hover:bg-accent-300/10"
							onclick={collapseAllFolders}
						>
							<Icon icon="mdi:chevron-double-up" class="h-3 w-3" />
						</button>
					</div>
					<ul class="file-tree space-y-0.5">
						{#each skillGroups as group (group.category)}
							{@const isExpanded = expandedFolders.has(group.category)}
							<li class="folder-item" data-expanded={isExpanded}>
								<button
									class="folder-header flex w-full cursor-pointer items-center rounded p-1 hover:bg-accent-300/10"
									style="--folder-color: {group.color}"
									onclick={() => toggleFolder(group.category)}
								>
									<span
										class="folder-arrow transition-transform duration-200"
										class:rotate-90={isExpanded}
									>
										<Icon icon="mdi:chevron-right" class="h-4 w-4" />
									</span>
									<Icon icon={group.icon} class="mx-1 h-4 w-4 shrink-0" />
									<span class="truncate text-xs font-medium">{group.category}</span>
									<span class="ml-auto text-xs opacity-60">{group.skills.length}</span>
								</button>
								<ul
									class="skill-list overflow-hidden pl-4 transition-all duration-300 ease-in-out"
									class:max-h-0={!isExpanded}
									class:max-h-[500px]={isExpanded}
								>
									{#each group.skills as skill (skill.name)}
										<li
											class="file-item cursor-pointer rounded p-1 text-foreground-muted hover:bg-accent-500/10 hover:text-foreground"
											class:active={activeSkill?.name === skill.name}
										>
											<button
												class="flex w-full items-center text-left"
												onclick={() => openSkill(skill.name)}
											>
												<Icon
													icon={skill.icon}
													class="mr-2 h-4 w-4 shrink-0 opacity-80"
													style="color: {group.color};"
												/>
												<span class="truncate text-xs">{skill.name}</span>
												{#if skill.extension}
													<span class="ml-1 text-xs opacity-60">{skill.extension}</span>
												{/if}
											</button>
										</li>
									{/each}
								</ul>
							</li>
						{/each}
					</ul>
				</aside>
			{/if}

			<!-- Main Content -->
			<main class="main-content flex min-w-0 flex-1 flex-col">
				<!-- Tab Bar -->
				<div
					class="tab-bar flex border-b border-[rgba(var(--foreground)/0.1)] bg-[color-mix(in_oklch,rgb(var(--background)),black_40%)]"
				>
					<div
						class="tab active flex max-w-62.5 items-center gap-2 border-r border-[rgba(var(--foreground)/0.1)] px-4 py-2 text-xs"
					>
						{#if activeSkill}
							<Icon
								icon={activeSkill.icon}
								class="tab-icon h-4 w-4 opacity-80"
								style="color: {activeSkill.categoryColor};"
							/>
						{/if}
						<span class="tab-name truncate">{tabName}</span>
						{#if activeSkill}
							<button
								class="tab-close ml-2 opacity-0 transition-opacity hover:opacity-100"
								onclick={closeTab}
							>
								<Icon icon="mdi:close" class="h-3 w-3" />
							</button>
						{/if}
					</div>
					<div class="flex-1"></div>
				</div>

				<!-- Editor Pane -->
				<div
					class="editor-pane flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-foreground-muted md:p-6 md:text-sm"
				>
					{#if activeSkill}
						<!-- Skill content -->
						<div class="skill-content">
							<h3 class="mb-4 text-lg font-semibold text-foreground md:text-xl">
								{activeSkill.name}
							</h3>
							<div class="whitespace-pre-wrap">{activeSkill.description}</div>
						</div>
					{:else}
						<!-- Welcome message -->
						<div class="welcome-message">
							<p class="text-accent-300">/**</p>
							<p>* Welcome to my Skills Explorer</p>
							<p>* -------------------------</p>
							<p>* Browse my tech stack and expertise in the file explorer.</p>
							<p>* Click on any file to view details about that skill.</p>
							<p class="text-accent-300">*/</p>
							<br />
							<p>// Keyboard shortcuts:</p>
							<p>// - <span class="kbd">Ctrl+B</span> Toggle sidebar</p>
						</div>
					{/if}
				</div>

				<!-- Status Bar -->
				<footer
					class="status-bar flex justify-between border-t border-[rgba(var(--foreground)/0.1)] bg-[color-mix(in_oklch,rgb(var(--background)),black_50%)] px-3 py-1 text-xs text-foreground-muted"
				>
					<div class="flex gap-4">
						<span>{fileCount} Files, {folderCount} Folders</span>
						<span class="hidden md:block">{fileTypeDisplay}</span>
					</div>
					<div class="flex gap-4">
						<span>Ln {lineInfo.line}, Col {lineInfo.col}</span>
					</div>
				</footer>
			</main>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "$routes/layout.css";

	/* Custom scrollbar for sidebar */
	.sidebar {
		scrollbar-width: thin;
		scrollbar-color: rgba(var(--foreground), 0.2) transparent;
	}
	.sidebar::-webkit-scrollbar {
		width: 5px;
	}
	.sidebar::-webkit-scrollbar-track {
		background: transparent;
	}
	.sidebar::-webkit-scrollbar-thumb {
		background-color: rgba(var(--foreground), 0.2);
		border-radius: 3px;
	}

	/* Active states */
	.file-item.active {
		@apply bg-accent-500/15 text-accent-500 select-none;
	}

	.tab.active {
		@apply relative top-px border-b-transparent text-foreground select-none;
		background-color: rgba(var(--background), 0.9);
	}

	/* Keyboard shortcut styling */
	.kbd {
		@apply inline-block rounded border border-foreground/20 px-1 text-xs text-accent-500;
	}

	/* Cursor animation */
	.editor-pane::after {
		content: '';
		@apply absolute inline-block h-4 w-0.5 bg-accent-500;
		animation: blink 1s step-end infinite;
		margin-left: 2px;
		vertical-align: text-bottom;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* Folder arrow rotation */
	.rotate-90 {
		transform: rotate(90deg);
	}
</style>

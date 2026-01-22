<script lang="ts">
	import { browser } from '$app/environment';
	import SectionTitle from '$components/SectionTitle.svelte';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	interface Skill {
		name: string;
		icon: string;
		description: string;
		extension?: string;
	}

	interface SkillWithCategory extends Skill {
		categoryColor: string;
		categoryIcon: string;
	}

	interface SkillGroup {
		category: string;
		color: string;
		icon: string;
		skills: Skill[];
	}

	const skillGroups: SkillGroup[] = [
		{
			category: 'Web Frontend',
			color: 'oklch(var(--accent-300))',
			icon: 'mdi:folder-text-outline',
			skills: [
				{
					name: 'HTML',
					icon: 'mdi:language-html5',
					description:
						"Crafting semantic, accessible, and structured web content. Fluent in HTML5 elements and avoiding `div` soup (mostly!).",
					extension: '.html'
				},
				{
					name: 'CSS',
					icon: 'mdi:language-css3',
					description:
						'Styling the web with modern CSS, including Flexbox, Grid, custom properties, and animations. Occasionally wrestling the cascade and celebrating centered divs.',
					extension: '.css'
				},
				{
					name: 'JavaScript',
					icon: 'mdi:language-javascript',
					description:
						"Bringing websites to life with ES6+ features, asynchronous operations (Promises, async/await), and effective DOM manipulation. Still pondering 'this' sometimes.",
					extension: '.js'
				},
				{
					name: 'TypeScript',
					icon: 'mdi:language-typescript',
					description:
						'Adding static typing to JavaScript for safer, more maintainable codebases. Catching errors at compile time, not Friday 5 PM.',
					extension: '.ts'
				},
				{
					name: 'React',
					icon: 'mdi:react',
					description:
						'Building component-based UIs with React, utilizing Hooks (useState, useEffect, useContext) and Context API for state management in small to medium apps. Love the declarative approach!',
					extension: '.jsx'
				},
				{
					name: 'NextJS',
					icon: 'simple-icons:nextdotjs',
					description:
						'Leveraging the power of React with Next.js for features like SSR, SSG, API routes, and optimized performance. Making React apps even *Reactier*.',
					extension: '.tsx'
				},
				{
					name: 'Svelte',
					icon: 'simple-icons:svelte',
					description:
						'Exploring Svelte/SvelteKit for building cybernetically enhanced web apps. Less code, less virtual DOM, more magic (compiler magic, that is).',
					extension: '.svelte'
				},
				{
					name: 'Redux',
					icon: 'simple-icons:redux',
					description:
						'Taming complex application state with Redux, primarily using Redux Toolkit for a more streamlined and less boilerplate-heavy experience.',
					extension: '.ts'
				},
				{
					name: 'TailwindCSS',
					icon: 'mdi:tailwind',
					description:
						"Rapidly building modern UIs with Tailwind's utility-first approach. My class lists might be long, but my CSS files are short!",
					extension: '.css'
				},
				{
					name: 'Astro',
					icon: 'simple-icons:astro',
					description:
						'Building faster, content-focused websites by shipping less JavaScript. Loving the Island Architecture and performance focus!',
					extension: '.astro'
				}
			]
		},
		{
			category: 'Backend & Data',
			color: 'oklch(var(--accent-300))',
			icon: 'mdi:folder-cog-outline',
			skills: [
				{
					name: 'Django',
					icon: 'simple-icons:django',
					description:
						"Developing robust backend systems and APIs with Python using Django's 'batteries-included' philosophy. The admin panel is a lifesaver!"
				},
				{
					name: 'SQL',
					icon: 'mdi:database-search',
					description:
						'Querying and managing relational databases. Crafting `SELECT` statements and trying *very* hard to remember all the `JOIN` types.'
				},
				{
					name: 'Firebase',
					icon: 'mdi:firebase',
					description:
						'Utilizing Firebase (Firestore, Auth, Hosting) for rapid development of backend features and real-time data synchronization. Backend-as-a-Service power!'
				}
			]
		},
		{
			category: 'Core Languages',
			color: 'oklch(var(--accent-300))',
			icon: 'mdi:code-block-tags',
			skills: [
				{
					name: 'C/C++',
					icon: 'mdi:language-cpp',
					description:
						'Foundational knowledge of C/C++ from academic work, understanding memory management (and the fear of segfaults).',
					extension: '.cpp'
				},
				{
					name: 'Java',
					icon: 'mdi:language-java',
					description:
						'Solid understanding of Java and OOP principles. Familiar with its ecosystem and verbosity (sometimes you need a `AbstractSingletonProxyFactoryBean`!).',
					extension: '.java'
				},
				{
					name: 'Python',
					icon: 'mdi:language-python',
					description:
						"Versatile language for scripting, backend (Django), and general programming. Appreciating the readability, dreading the accidental indentation error.",
					extension: '.py'
				},
				{
					name: 'PHP',
					icon: 'mdi:language-php',
					description:
						"Experience with PHP for server-side logic, building and maintaining web applications. Echo 'Hello, World!';",
					extension: '.php'
				}
			]
		},
		{
			category: 'Tools & Systems',
			color: 'oklch(var(--accent-300))',
			icon: 'mdi:folder-wrench-outline',
			skills: [
				{
					name: 'Git',
					icon: 'mdi:git',
					description:
						'Managing code history like a pro (or at least like someone who knows how to `git blame`). Branching, merging, and occasionally resolving merge conflicts with deep breaths.'
				},
				{
					name: 'GitHub',
					icon: 'mdi:github',
					description:
						'Collaborating on projects, managing repositories, and leveraging the GitHub ecosystem (Issues, PRs, Actions). My contribution graph is... a work in progress.'
				},
				{
					name: 'Linux',
					icon: 'mdi:linux',
					description:
						'Navigating the Linux environment comfortably using the command line. `sudo make me a sandwich`.'
				},
				{
					name: 'Bash',
					icon: 'mdi:bash',
					description:
						'Writing shell scripts for automating tasks and making the terminal do my bidding. Sometimes cryptic, always powerful.',
					extension: '.sh'
				},
				{
					name: 'Batch',
					icon: 'mdi:microsoft-windows',
					description:
						"Basic Windows Batch scripting knowledge for when PowerShell feels like overkill (or isn't available). `@echo off` is my friend.",
					extension: '.bat'
				},
				{
					name: 'Figma',
					icon: 'mdi:vector-bezier',
					description:
						'Translating beautiful Figma designs into functional code. Inspecting properties, exporting assets, and appreciating Auto Layout.'
				},
				{
					name: 'Vim',
					icon: 'simple-icons:vim',
					description:
						"Efficient text editing using Vim's modal interface. Still figuring out how to exit sometimes... just kidding (mostly). `:wq`"
				}
			]
		},
		{
			category: 'Workflow & Process',
			color: 'oklch(var(--accent-300))',
			icon: 'mdi:folder-sync-outline',
			skills: [
				{
					name: 'GitHub Actions',
					icon: 'simple-icons:githubactions',
					description:
						'Automating build, test, and deployment workflows with GitHub Actions. Making YAML less scary, one workflow at a time.',
					extension: '.yml'
				},
				{
					name: 'Jira',
					icon: 'mdi:jira',
					description:
						"Navigating Jira boards, tracking issues, and participating in Agile workflows. Moving tickets from 'To Do' to 'Done' is satisfying."
				},
				{
					name: 'Scrum',
					icon: 'mdi:account-group-outline',
					description:
						'Experience working in Scrum teams: daily stand-ups, sprint planning, retrospectives. Understanding story points is an ongoing journey.'
				},
				{
					name: 'LaTeX',
					icon: 'mdi:alpha-l-box-outline',
					description:
						'Creating high-quality typeset documents, especially for academic or formal reports. The results are beautiful, even if the syntax feels like coding plain text.',
					extension: '.tex'
				},
				{
					name: 'Markdown',
					icon: 'mdi:language-markdown-outline',
					description:
						'Writing clean and readable documentation, READMEs, and notes using Markdown. Simple, effective, and essential.',
					extension: '.md'
				},
				{
					name: 'Googling',
					icon: 'mdi:google',
					description:
						'Highly proficient in finding solutions, documentation, and cat memes online. Arguably the most critical skill for any developer. Stack Overflow is my co-pilot.'
				}
			]
		}
	];

	// Build skills map
	const skillsMap = new Map<string, SkillWithCategory>();
	skillGroups.forEach((group) => {
		group.skills.forEach((skill) => {
			skillsMap.set(skill.name, {
				...skill,
				categoryColor: group.color,
				categoryIcon: group.icon
			});
		});
	});

	const fileCount = skillsMap.size;
	const folderCount = skillGroups.length;

	// State
	let expandedFolders = $state<Set<string>>(new Set([skillGroups[0].category]));
	let activeSkill = $state<SkillWithCategory | null>(null);
	let sidebarVisible = $state(true);
	let lineInfo = $state({ line: 1, col: 1 });

	// Language name mapping
	function getLanguageNameFromExtension(extension?: string): string {
		if (!extension) return 'Plain Text';
		const map: Record<string, string> = {
			'.html': 'HTML',
			'.css': 'CSS',
			'.js': 'JavaScript',
			'.jsx': 'React JSX',
			'.ts': 'TypeScript',
			'.tsx': 'React TSX',
			'.py': 'Python',
			'.java': 'Java',
			'.cpp': 'C++',
			'.php': 'PHP',
			'.md': 'Markdown',
			'.astro': 'Astro',
			'.svelte': 'Svelte',
			'.sh': 'Shell Script',
			'.bat': 'Batch File',
			'.yml': 'YAML',
			'.yaml': 'YAML',
			'.tex': 'LaTeX',
			'.sql': 'SQL'
		};
		return map[extension.toLowerCase()] || extension.toUpperCase().substring(1) || 'Unknown';
	}

	function toggleFolder(category: string) {
		if (expandedFolders.has(category)) {
			expandedFolders.delete(category);
		} else {
			expandedFolders.add(category);
		}
		expandedFolders = new Set(expandedFolders); // Trigger reactivity
	}

	function collapseAllFolders() {
		expandedFolders = new Set();
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
						class="sidebar-header text-foreground-muted mb-2 flex items-center justify-between px-1 text-xs uppercase"
					>
						<span>Explorer</span>
						<button
							title="Collapse All"
							class="collapse-all-btn hover:bg-accent-300/10 rounded p-1"
							onclick={collapseAllFolders}
						>
							<Icon icon="mdi:chevron-double-up" class="h-3 w-3" />
						</button>
					</div>
					<ul class="file-tree space-y-0.5">
						{#each skillGroups as group}
							{@const isExpanded = expandedFolders.has(group.category)}
							<li class="folder-item" data-expanded={isExpanded}>
								<button
									class="folder-header hover:bg-accent-300/10 flex w-full cursor-pointer items-center rounded p-1"
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
									{#each group.skills as skill}
										<li
											class="file-item hover:bg-accent-500/10 text-foreground-muted hover:text-foreground cursor-pointer rounded p-1"
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
					class="editor-pane text-foreground-muted flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed md:p-6 md:text-sm"
				>
					{#if activeSkill}
						<!-- Skill content -->
						<div class="skill-content">
							<h3 class="text-foreground mb-4 text-lg font-semibold md:text-xl">
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
					class="status-bar text-foreground-muted flex justify-between border-t border-[rgba(var(--foreground)/0.1)] bg-[color-mix(in_oklch,rgb(var(--background)),black_50%)] px-3 py-1 text-xs"
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

<style>
	.code-editor {
		font-family: var(--font-Inter);
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(var(--foreground), 0.05);
	}

	.editor-pane {
		font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
		position: relative;
		counter-reset: line;
	}

	/* File Tree Styling */
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

	.folder-header {
		user-select: none;
	}

	.folder-item[data-expanded='true'] .folder-header {
		color: var(--folder-color, oklch(var(--accent-300)));
		background-color: rgba(var(--foreground), 0.05);
	}

	/* Active states */
	.file-item.active {
		background-color: rgba(var(--accent-500), 0.15);
		color: oklch(var(--accent-500));
		user-select: none;
	}

	.tab.active {
		background-color: rgba(var(--background), 0.9);
		color: rgb(var(--foreground));
		border-bottom-color: transparent;
		position: relative;
		top: 1px;
		user-select: none;
	}

	/* Keyboard shortcut styling */
	.kbd {
		display: inline-block;
		border: 1px solid rgba(var(--foreground), 0.2);
		border-radius: 3px;
		padding: 0px 4px;
		margin: 0 2px;
		font-size: 0.8em;
		color: oklch(var(--accent-500));
	}

	/* Cursor animation */
	.editor-pane::after {
		content: '';
		position: absolute;
		display: inline-block;
		width: 2px;
		height: 16px;
		background-color: oklch(var(--accent-500));
		animation: blink 1s step-end infinite;
		margin-left: 2px;
		vertical-align: text-bottom;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* Transitions for skill content */
	.skill-content {
		transition: opacity 0.2s ease;
	}

	/* Folder arrow rotation */
	.rotate-90 {
		transform: rotate(90deg);
	}
</style>

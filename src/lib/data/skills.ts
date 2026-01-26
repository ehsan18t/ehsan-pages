/**
 * Skills Data - Skill definitions and categories
 *
 * This file contains all skill/technology data used by the Skills component.
 * Keeping data separate from presentation allows for:
 * - Easier maintenance and updates
 * - Reusability across different views
 * - Better testability
 */

export interface Skill {
	name: string;
	icon: string;
	description: string;
	extension?: string;
}

export interface SkillWithCategory extends Skill {
	categoryColor: string;
	categoryIcon: string;
}

export interface SkillGroup {
	category: string;
	color: string;
	icon: string;
	skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
	{
		category: 'Web Frontend',
		color: 'oklch(var(--accent-300))',
		icon: 'mdi:folder-text-outline',
		skills: [
			{
				name: 'HTML',
				icon: 'mdi:language-html5',
				description:
					'Crafting semantic, accessible, and structured web content. Fluent in HTML5 elements and avoiding `div` soup (mostly!).',
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
					'Versatile language for scripting, backend (Django), and general programming. Appreciating the readability, dreading the accidental indentation error.',
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

/**
 * Language extension to display name mapping
 */
export const extensionLanguageMap: Record<string, string> = {
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

/**
 * Get language display name from file extension
 */
export function getLanguageNameFromExtension(extension?: string): string {
	if (!extension) return 'Plain Text';
	return (
		extensionLanguageMap[extension.toLowerCase()] ||
		extension.toUpperCase().substring(1) ||
		'Unknown'
	);
}

/**
 * Build skills map with category metadata
 */
export function buildSkillsMap(): Map<string, SkillWithCategory> {
	const map = new Map<string, SkillWithCategory>();
	skillGroups.forEach((group) => {
		group.skills.forEach((skill) => {
			map.set(skill.name, {
				...skill,
				categoryColor: group.color,
				categoryIcon: group.icon
			});
		});
	});
	return map;
}

/**
 * Get total skill and folder counts
 */
export function getSkillCounts(): { fileCount: number; folderCount: number } {
	const fileCount = skillGroups.reduce((acc, group) => acc + group.skills.length, 0);
	const folderCount = skillGroups.length;
	return { fileCount, folderCount };
}

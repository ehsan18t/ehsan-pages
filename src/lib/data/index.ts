export interface Experience {
	id: string;
	role: string;
	company: string;
	companyUrl?: string;
	startDate: string;
	endDate: string;
	description: string[];
	techStack: string[];
	lane: 'frontend' | 'backend' | 'fullstack';
	impact: {
		label: string;
		value: string;
		type: 'addition' | 'deletion' | 'modification';
	}[];
	isMergeCommit?: boolean;
}

export interface Testimonial {
	id: number;
	content: string;
	name: string;
	role: string;
	image?: string;
}

export interface Project {
	title: string;
	shortDescription: string;
	imageUrls: string[];
	techStack: string[];
	repoUrl?: string;
	liveUrl?: string;
	imageLayout: 'cover' | 'contain';
}

export interface NavItem {
	href: string;
	icon: string;
	label: string;
	section: string;
	offset: number;
}

const info = {
	name: 'Ehsan Khan',
	title: 'Web Developer',
	description: `A passionate web developer, competitive programmer and quick learner. Love to code and learn new things. I excel at Next.js, Astro, SvelteKit, Express.js, Django and more.`,
	socials: {
		github: 'https://github.com/ehsan18t',
		linkedin: 'https://www.linkedin.com/in/ehsan18t',
		gmail: 'mailto:ehsan18t@gmail.com',
		telegram: 'https://t.me/ehsan18t',
		discord: 'https://discord.com/users/xcarl3t'
	},
	image: '/me.png',
	resume: '/resume/Ehsan_Khan__FullStack.pdf',
	experiences: [
		{
			id: 'exp-1',
			role: 'Assistant Software Engineer',
			company: 'ECB Technologies',
			companyUrl: 'https://ecb-site.vercel.app',
			startDate: 'Nov 2025',
			endDate: 'Present',
			description: [
				'Building an MIS system to streamline internal processes.',
				'Built scalable backend modules including Notification System for automated SMS/Email alerts.',
				'Rebuilt company website using Next.js with high SEO/Performance scores, GSAP animations, and optimized caching.'
			],
			techStack: ['Next.js', 'Django', 'GSAP', 'TailwindCSS', 'PostgreSQL', 'TypeScript'],
			lane: 'fullstack',
			impact: [
				{ label: 'SEO Score', value: '98+', type: 'addition' },
				{ label: 'Performance', value: '95+', type: 'modification' },
				{ label: 'Notifications', value: 'SMS+Email', type: 'addition' }
			],
			isMergeCommit: true
		},
		{
			id: 'exp-2',
			role: 'Full Stack Developer',
			company: 'BSIL',
			companyUrl: 'https://bdsil.org',
			startDate: 'Feb 2025',
			endDate: 'Nov 2025',
			description: [
				"Developed BSIL's main website, blog, and journal.",
				'Rebuilt agency site from Astro to Next.js + Payload CMS for dynamic content management.',
				'Implemented ISR and Cloudflare caching, reducing load times by 60%+.',
				'Achieved perfect Lighthouse scores across all metrics.'
			],
			techStack: [
				'Next.js',
				'Payload CMS',
				'Cloudflare',
				'Cloudinary',
				'TypeScript',
				'TailwindCSS'
			],
			lane: 'fullstack',
			impact: [
				{ label: 'Load time', value: '-60%', type: 'deletion' },
				{ label: 'Lighthouse', value: '100', type: 'modification' },
				{ label: 'Sites deployed', value: '+3', type: 'addition' }
			],
			isMergeCommit: true
		},
		{
			id: 'exp-3',
			role: 'Full Stack Developer',
			company: 'Cazzert',
			companyUrl: 'https://cazzert.com',
			startDate: 'Nov 2024',
			endDate: 'Jan 2025',
			description: [
				'Designed and built scalable e-commerce platform with product catalog, authentication, cart, and order management.',
				'Developed RESTful APIs and optimized database schema for performance.',
				'Implemented custom CMS for warehouse management and role-based access control.'
			],
			techStack: ['Astro', 'React', 'TypeScript', 'TailwindCSS', 'PostgreSQL'],
			lane: 'fullstack',
			impact: [
				{ label: 'Features', value: '+85', type: 'addition' },
				{ label: 'API endpoints', value: '+40', type: 'addition' },
				{ label: 'Page load', value: '-48%', type: 'deletion' }
			],
			isMergeCommit: true
		},
		{
			id: 'exp-4',
			role: 'Software Developer',
			company: 'Swapnil Gold Testing',
			startDate: 'Apr 2024',
			endDate: 'Oct 2024',
			description: [
				'Built offline desktop app using Tauri + React for generating and managing digital gold test certificates.',
				'Integrated AI-based background removal and image editing tools, improving workflow efficiency.',
				'Delivered reliable, user-friendly interface for daily certificate generation.'
			],
			techStack: ['Tauri', 'Rust', 'React', 'TypeScript', 'SQLite', 'AI/ML'],
			lane: 'fullstack',
			impact: [
				{ label: 'Processing', value: '-70%', type: 'deletion' },
				{ label: 'Offline AI', value: '+1', type: 'addition' },
				{ label: 'Daily certs', value: '50+', type: 'modification' }
			],
			isMergeCommit: true
		},
		{
			id: 'exp-5',
			role: 'Full Stack Developer',
			company: 'Freelance',
			startDate: '2022',
			endDate: 'Nov 2025',
			description: [
				'Delivered 15+ production-grade apps for agencies and businesses using React, Next.js, Django, and Astro.',
				'Collaborated with international clients to define requirements and optimize delivery.',
				'Integrated CI/CD, GitHub Actions, and Docker for automated deployments.'
			],
			techStack: ['React', 'Next.js', 'Django', 'Docker', 'GitHub Actions', 'PostgreSQL'],
			lane: 'fullstack',
			impact: [
				{ label: 'Projects', value: '15+', type: 'addition' },
				{ label: 'Performance', value: '90+', type: 'modification' },
				{ label: 'Client rating', value: '100%', type: 'addition' }
			],
			isMergeCommit: true
		},
		{
			id: 'exp-6',
			role: 'Web Developer',
			company: 'Erasmus Scholar Portfolio',
			startDate: 'Apr 2022',
			endDate: 'May 2022',
			description: [
				'Developed personal academic portfolio website for an Erasmus Mundus Scholar using React, TailwindCSS, and Firebase.',
				'Focused on performance, accessibility, and responsive design.',
				"Contributed to client's successful scholarship application."
			],
			techStack: ['React', 'TailwindCSS', 'Firebase', 'TypeScript'],
			lane: 'frontend',
			impact: [
				{ label: 'Scholarship', value: 'Success', type: 'addition' },
				{ label: 'Mobile score', value: '98', type: 'modification' },
				{ label: 'Load time', value: '<1.5s', type: 'modification' }
			]
		}
	] as Experience[],
	testimonials: [
		{
			id: 4,
			content:
				'Working with Ehsan has been an excellent experience. I asked him to build a desktop app for my gold testing business, and he delivered far beyond my expectations. Not only does the app generate professional certificate cards and manage my database smoothly, but he also patiently handled all the changes I requested—even when it meant rewriting major parts of the app. On top of that, he integrated an offline AI-powered background remover for images, which was a game-changer for my workflow. His dedication, technical skill, and willingness to go the extra mile convinced me to immediately hire him again for another project. Truly outstanding work!',
			name: 'Swapnil',
			role: 'Owner, Swapnil Gold Testing'
		},
		{
			id: 1,
			content:
				"As a client, I can't speak highly enough of Ehsan Khan and his programming expertise. He delivered exceptional work on my project, bringing innovative ideas that elevated every outcome. His reliability and clear communication made the process seamless. I wholeheartedly recommend his services.",
			name: 'Rahat Ahsan',
			role: 'QA tester, Chain Optimizer',
			image: '/images/testimonials/rahat.jpg'
		},
		{
			id: 2,
			content:
				"I've relied on their expertise for resolving complex programming and coding issues, and I'm consistently impressed by the level of professionalism and technical skill they bring. Whether it's tackling difficult bugs or guiding me through intricate code challenges, their solutions are always efficient and easy to understand. Their clear communication and proactive approach have not only helped me solve immediate problems but have also boosted my overall coding skills. I highly recommend their services to anyone in need of reliable and expert programming support.",
			name: 'AJ Asif',
			role: 'Shift supervisor, Costa Beans',
			image: '/images/testimonials/asif.jpg'
		},
		{
			id: 3,
			content:
				"Ehsan is a passionate, dynamic and diverse developer. Working with Ehsan was a game-changer for us. He built our entire web application from scratch, implementing complex features like real-time data visualization and authentication that worked flawlessly. His problem-solving skills saved us countless hours. He was always available to discuss ideas and provided valuable insights that improved our project significantly. Ehsan's dedication and expertise were instrumental in the success of our application, and I can't recommend him highly enough.",
			name: 'Fardin Ahmed',
			role: 'Software Engineer, Munchies',
			image: '/images/testimonials/fardin.jpg'
		}
	] as Testimonial[],
	projects: [
		{
			title: 'Resume AI',
			shortDescription:
				'An AI based CV screening application designed to simplify the recruitment process for HR professionals and enhance candidate experience. The system integrates Gemini 1.5 Pro for automated profile generation and CV summarization, offering significant improvements in efficiency and decision-making.',
			imageUrls: [
				'/images/projects/resume-ai/cover.png',
				'/images/projects/resume-ai/1.png',
				'/images/projects/resume-ai/2.png',
				'/images/projects/resume-ai/3.png',
				'/images/projects/resume-ai/4.png'
			],
			techStack: [
				'NextJS',
				'Redux',
				'TailwindCSS',
				'TypeScript',
				'Django',
				'JWT',
				'PostgreSQL',
				'REST API'
			],
			repoUrl: 'https://github.com/ehsan18t/resume-ai',
			imageLayout: 'cover'
		},
		{
			title: 'Cazzert - E-Commerce',
			shortDescription:
				'A fully responsive e-commerce site with vercel backend and custom CMS to control everything. Full warehouse managements, order tracking and everything built from scratch.',
			imageUrls: [
				'/images/projects/cazzert/cover.png',
				'/images/projects/cazzert/1.png',
				'/images/projects/cazzert/2.png',
				'/images/projects/cazzert/3.png',
				'/images/projects/cazzert/4.png',
				'/images/projects/cazzert/5.png',
				'/images/projects/cazzert/6.png',
				'/images/projects/cazzert/7.png',
				'/images/projects/cazzert/8.png',
				'/images/projects/cazzert/9.png',
				'/images/projects/cazzert/10.png',
				'/images/projects/cazzert/11.png',
				'/images/projects/cazzert/12.png',
				'/images/projects/cazzert/13.png'
			],
			techStack: [
				'Astro',
				'React',
				'Server Action',
				'JWT',
				'TypeScript',
				'REST API',
				'TailwindCSS',
				'PostgreSQL'
			],
			liveUrl: 'https://cazzert.vercel.app/',
			imageLayout: 'cover'
		},
		{
			title: 'BSIL - Agency',
			shortDescription:
				'A fully responsive agency site with vercel backend and custom CMS to control everything. Everything in the site can be managed from admin panel.',
			imageUrls: [
				'/images/projects/bsil/1.png',
				'/images/projects/bsil/2.png',
				'/images/projects/bsil/3.png',
				'/images/projects/bsil/4.png',
				'/images/projects/bsil/5.png',
				'/images/projects/bsil/6.png',
				'/images/projects/bsil/7.png'
			],
			techStack: [
				'Astro',
				'React',
				'Server Action',
				'JWT',
				'TypeScript',
				'REST API',
				'TailwindCSS',
				'PostgreSQL'
			],
			liveUrl: 'https://bsil-site.vercel.app/',
			imageLayout: 'cover'
		},
		{
			title: 'Course Assistant',
			shortDescription:
				'An allrounder helper for undergraduate student which solves real-life problems. It helps to track academic progress, share contents and group study etc. One of the highlight feature is, it can automatically create chat group with students of same section of same trimester.',
			imageUrls: ['/no image.svg'],
			techStack: ['HTML', 'CSS', 'TailwindCSS', 'JavaScript', 'PHP', 'Django', 'SQL'],
			repoUrl: 'https://github.com/ehsan18t/CourseAssistant',
			imageLayout: 'cover'
		},
		{
			title: 'Certificate Generator',
			shortDescription:
				'A gold test certificate generator desktop app for a client. It has fully offline AI Image BG removal capabilities. This app is for generating gold test certificates and manage the database.',
			imageUrls: [
				'/images/projects/card-gen/cover.png',
				'/images/projects/card-gen/1.png',
				'/images/projects/card-gen/2.png',
				'/images/projects/card-gen/3.png',
				'/images/projects/card-gen/4.png',
				'/images/projects/card-gen/5.png',
				'/images/projects/card-gen/6.png',
				'/images/projects/card-gen/7.png',
				'/images/projects/card-gen/8.png',
				'/images/projects/card-gen/9.png',
				'/images/projects/card-gen/10.png'
			],
			techStack: ['Tauri', 'Rust', 'React', 'TypeScript', 'TailwindCSS', 'SQLite'],
			imageLayout: 'cover'
		},
		{
			title: 'Portfolio',
			shortDescription:
				'A portfolio site for a ERASMUS MUNDUS SCHOLAR client. It has a custom CMS to manage content/info.',
			imageUrls: [
				'/images/projects/portfolio/1.png',
				'/images/projects/portfolio/2.png',
				'/images/projects/portfolio/3.png'
			],
			techStack: ['React', 'Firebase', 'TypeScript', 'TailwindCSS'],
			liveUrl: 'https://fahimabrarabid.com/',
			imageLayout: 'cover'
		}
	] as Project[],
	navItems: [
		{
			href: '#hero',
			icon: 'mdi:home',
			label: 'Home',
			section: 'hero',
			offset: 0
		},
		{
			href: '#skills',
			icon: 'mdi:lightning-bolt',
			label: 'Skills',
			section: 'skills',
			offset: -50
		},
		{
			href: '#experience',
			icon: 'mdi:source-branch',
			label: 'Experience',
			section: 'experience',
			offset: -50
		},
		{
			href: '#projects',
			icon: 'mdi:folder-multiple',
			label: 'Projects',
			section: 'projects',
			offset: -50
		},
		{
			href: '#testimonials',
			icon: 'mdi:account-heart',
			label: 'Testimonials',
			section: 'testimonials',
			offset: 50
		},
		{
			href: '#contact',
			icon: 'mdi:email',
			label: 'Contact',
			section: 'contact',
			offset: 0
		}
	] as NavItem[]
};

// Named exports for convenience
export const {
	name,
	title,
	description,
	socials,
	resume,
	experiences,
	testimonials,
	projects,
	navItems
} = info;

export default info;

// Re-export data modules
export * from './skills';
export * from './terminalCommands';


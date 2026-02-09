/** Work experience entry displayed on the Experience timeline */
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

/** Client testimonial displayed in the Testimonials carousel */
export interface Testimonial {
    id: number;
    content: string;
    name: string;
    role: string;
    image?: string;
}

/** Project card displayed in the Project Showcase section */
export interface Project {
    title: string;
    shortDescription: string;
    imageUrls: string[];
    techStack: string[];
    repoUrl?: string;
    liveUrl?: string;
    imageLayout: 'cover' | 'contain';
}

/** Navigation item for FloatingNav / MobileNav */
export interface NavItem {
    href: string;
    icon: string;
    label: string;
    section: string;
    offset: number;
}

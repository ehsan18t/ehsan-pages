const info = {
  name: "Ehsan Khan",
  title: "Web Developer",
  description: `A passionate web developer, competitive programmer and quick learner. Love to code and learn new things. I excel at Django, React, NextJS, Astro, TailwindCSS, TypeScript, MySQL.`,
  socials: {
    github: "https://github.com/ehsan18t",
    linkedin: "https://www.linkedin.com/in/ehsan18t",
    gmail: "mailto:ehsan18t@gmail.com",
    telegram: "https://t.me/ehsan18t",
    discord: "https://discord.com/users/xcarl3t",
  },
  image: "/me.png",
  resume: "/CV.pdf",
  testimonials: [
    {
      id: 4,
      content:
        "Working with Ehsan has been an excellent experience. I asked him to build a desktop app for my gold testing business, and he delivered far beyond my expectations. Not only does the app generate professional certificate cards and manage my database smoothly, but he also patiently handled all the changes I requested—even when it meant rewriting major parts of the app. On top of that, he integrated an offline AI-powered background remover for images, which was a game-changer for my workflow. His dedication, technical skill, and willingness to go the extra mile convinced me to immediately hire him again for another project. Truly outstanding work!",
      name: "Swapnil",
      role: "Owner, Swapnil Gold Testing",
    },
    {
      id: 1,
      content:
        "As a client, I can’t speak highly enough of Ehsan Khan and his programming expertise. He delivered exceptional work on my project, bringing innovative ideas that elevated every outcome. His reliability and clear communication made the process seamless. I wholeheartedly recommend his services.",
      name: "Rahat Ahsan",
      role: "QA tester, Chain Optimizer",
      image: "/images/testimonials/rahat.jpg",
    },
    {
      id: 2,
      content:
        "I’ve relied on their expertise for resolving complex programming and coding issues, and I’m consistently impressed by the level of professionalism and technical skill they bring. Whether it's tackling difficult bugs or guiding me through intricate code challenges, their solutions are always efficient and easy to understand. Their clear communication and proactive approach have not only helped me solve immediate problems but have also boosted my overall coding skills. I highly recommend their services to anyone in need of reliable and expert programming support.",
      name: "AJ Asif",
      role: "Shift supervisor, Costa Beans",
      image: "/images/testimonials/asif.jpg",
    },
    {
      id: 3,
      content:
        "Ehsan is a passionate, dynamic and diverse developer. Working with Ehsan was a game-changer for us. He built our entire web application from scratch, implementing complex features like real-time data visualization and authentication that worked flawlessly. His problem-solving skills saved us countless hours. He was always available to discuss ideas and provided valuable insights that improved our project significantly. Ehsan's dedication and expertise were instrumental in the success of our application, and I can't recommend him highly enough.",
      name: "Fardin Ahmed",
      role: "Software Engineer, Munchies",
      image: "/images/testimonials/fardin.jpg",
    },
  ],
  projects: [
    {
      title: "Resume AI",
      shortDescription:
        "An AI based CV screening application designed to simplify the recruitment process for HR professionals and enhance candidate experience. The system integrates Gemini 1.5 Pro for automated profile generation and CV summarization, offering significant improvements in efficiency and decision-making.",
      imageUrls: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1031&q=80",
      ],
      techStack: [
        "NextJS",
        "Redux",
        "TailwindCSS",
        "TypeScript",
        "Django",
        "JWT",
        "PostgreSQL",
        "REST API",
      ],
      repoUrl: "https://github.com/ehsan18t/resume-ai",
      imageLayout: "cover",
    },
    {
      title: "Cazzert - E-Commerce",
      shortDescription:
        "A fully responsive e-commerce site with vercel backend and custom CMS to control everything. Full warehouse managements, order tracking and everything built from scratch.",
      imageUrls: [
        "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1585194166760-6090e40f094e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      ],
      techStack: [
        "Astro",
        "React",
        "Server Action",
        "JWT",
        "TypeScript",
        "REST API",
        "TailwindCSS",
        "PostgreSQL",
      ],
      liveUrl: "https://cazzert.vercel.app/",
      imageLayout: "cover",
    },
    {
      title: "BSIL - Agency",
      shortDescription:
        "A fully responsive agency site with vercel backend and custom CMS to control everything. Everything in the site can be managed from admin panel.",
      imageUrls: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80",
      ],
      techStack: [
        "Astro",
        "React",
        "Server Action",
        "JWT",
        "TypeScript",
        "REST API",
        "TailwindCSS",
        "PostgreSQL",
      ],
      liveUrl: "https://bsil-site.vercel.app/",
      imageLayout: "cover",
    },
    {
      title: "Course Assistant",
      shortDescription:
        "An allrounder helper for undergraduate student which solves real-life problems. It helps to track academic progress, share contents and group study etc. One of the highlight feature is, it can automatically create chat group with students of same section of same trimester.",
      imageUrls: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1031&q=80",
      ],
      techStack: [
        "HTML",
        "CSS",
        "TailwindCSS",
        "JavaScript",
        "PHP",
        "Django",
        "SQL",
      ],
      repoUrl: "https://github.com/ehsan18t/CourseAssistant",
      imageLayout: "cover",
    },
  ],
};

export default info;

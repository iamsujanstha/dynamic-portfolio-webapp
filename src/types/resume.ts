export interface ResumeContact {
  phone: string;
  location: string;
  email: string;
  // Display labels for the link items
  portfolioLabel: string;
  githubLabel: string;
  linkedinLabel: string;
  // Actual URLs (used for hyperlinks in the PDF)
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  startDate: string;
  endDate: string;
  role: string;
  bullets: string[];
  techStack: string;
}

export interface ResumeEducation {
  id: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  degree: string;
}

export interface ResumeSkillGroup {
  id: string;
  category: string;
  skills: string;
}

export interface ResumeData {
  name: string;
  summary: string;
  contact: ResumeContact;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skillGroups: ResumeSkillGroup[];
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  name: 'SUJAN SHRESTHA',
  summary:
    'An experienced Frontend Engineer with a strong passion for learning, researching and building web applications that provides a great user experience.',
  contact: {
    phone: '+977 9806545497',
    location: 'Tanahun, Gandaki',
    email: 'tlsujank.co@gmail.com',
    portfolioLabel: 'Portfolio',
    githubLabel: 'GitHub',
    linkedinLabel: 'LinkedIn',
    portfolioUrl: 'https://sujankshrestha.com.np',
    githubUrl: 'https://github.com/iamsujanstha',
    linkedinUrl: 'https://linkedin.com/in/tlsujank',
  },
  experience: [
    {
      id: '1',
      company: 'Infodevelopers Pvt. Ltd.',
      startDate: '09/2023',
      endDate: 'Present',
      role: 'Senior Software Engineer',
      bullets: [
        'Enhanced accessibility and cross-device usability by upgrading legacy systems with responsive design, keyboard navigation, and WCAG compliance, reducing accessibility-related support tickets by 35% and enabling clients to serve a broader audience.',
        'Reduced LCP from 2.78s to 1.95s and CLS from 0.21 to 0.09, improving Core Web Vitals scores, resulting in a 22% increase in organic search traffic and higher user engagement.',
        'Led and delivered 5+ concurrent projects end-to-end, aligning engineering efforts with business objectives, ensuring 100% on-time delivery, and strengthening client relationships through reliable, scalable solutions.',
        'Optimized React application performance by reducing initial bundle size 30-40% through manual chunking (Vite/Rollup) for vendor/app separation, tree-shaking-friendly import with local re-exports barrels (MUI) and regularly auditing bundles using Rollup Visualizer and Webpack Bundle Analyzer.',
        'Implemented authentication and authorization flows (JWT, OAuth2) with NestJS, improving security and scalability of multi-user applications.',
        'Designed and implemented cursor-based pagination in GraphQL APIs, improving scalability for millions of records and eliminating performance bottlenecks of traditional offset pagination.',
      ],
      techStack: 'React, TypeScript, Tailwind, React Query, GraphQL, Storybook, Redux, Cypress, Jest, Material UI',
    },
    {
      id: '2',
      company: 'Aerion Technologies',
      startDate: '04/2019',
      endDate: '09/2023',
      role: 'Frontend Developer',
      bullets: [
        'Managed multiple projects end-to-end, collaborating with cross-functional teams (design, backend, product) to align engineering work with business goals and ensure 100% on-time delivery of high-quality solutions.',
        'Developed and integrated backend features using NestJS, enhancing full-stack functionality, improving API performance by 20%, and ensuring reliable data flow for frontend consumption.',
        'Refined UI/UX with designers, translating Figma designs into responsive, accessible interfaces, resulting in a 15% increase in user satisfaction scores.',
        'Adopted and implemented a monorepo architecture (NX), enabling shared UI components and services across the web app and CMS, reducing code duplication by 30% and improving maintainability.',
        'Utilized server-side rendering (SSR) and API routes in Next.js, implementing efficient data fetching, caching, and error handling, which improved page load times by 25% and enhanced overall user experience.',
        'Built reusable Web Components using Lit, enabling framework-agnostic UI elements that reduced duplication by 20% and improved maintainability.',
        'Integrated third-party APIs (Zendesk, Recommbee) to extend product functionality, streamline customer support, and enhance personalization, contributing to higher user engagement and retention.',
        'Contributed to Agile development, participating in sprint planning and stand-ups to ensure timely feature delivery.',
      ],
      techStack: 'React, SCSS, Styled Components, Redux-toolkit, Storybook, Nest, Rest API, Next',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Anna University',
      location: 'Chennai, India',
      startDate: '2014',
      endDate: '2018',
      degree: 'Bachelor of Engineering in Computer',
    },
  ],
  skillGroups: [
    { id: '1', category: 'Frontend', skills: 'React, Next, TypeScript, Redux, Tailwind, Material UI, Storybook, Jest, RTL' },
    { id: '2', category: 'Backend', skills: 'Node.js, NestJS, REST APIs, GraphQL, MongoDB' },
    { id: '3', category: 'Tools & Technologies', skills: 'Docker, Git, CI/CD, Monorepo (NX), Rollup, Webpack' },
    { id: '4', category: 'Others', skills: 'Web Accessibility (WCAG), DSA, Agile/Scrum' },
  ],
};

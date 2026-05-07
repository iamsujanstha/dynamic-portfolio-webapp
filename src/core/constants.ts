/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Skill, Experience, Education } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'AI ARCHITECT',
    description: 'An advanced AI-powered architectural visualization tool that generates optimized floor plans and photorealistic renders from simple text descriptions.',
    tags: ['AI', 'Next.js', 'Stable Diffusion', 'Three.js'],
    category: 'ai',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1632&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/iamsujanstha',
  },
  {
    id: '2',
    title: 'Random Team Generator',
    description: 'A smart team generator web app that lets users create random or balanced teams from a custom list of names. Features intelligent balancing based on skill or performance ratings.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI'],
    category: 'web',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop',
    link: 'https://vite-team-generate.netlify.app/',
    github: 'https://github.com/iamsujanstha/Smart-App',
  },
  {
    id: '3',
    title: 'OpenLayers Map',
    description: 'An interactive map application using OpenLayers that allows users to view, manage, and interact with geospatial data visually with advanced layer management.',
    tags: ['React', 'OpenLayers', 'Styled Components'],
    category: 'web',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1450&auto=format&fit=crop',
    link: 'https://github.com/iamsujanstha/openlayers-map',
    github: 'https://github.com/iamsujanstha/openlayers-map',
  },
  {
    id: '4',
    title: 'Giphy Search',
    description: 'A fun web app that allows users to search for trending and random GIFs using the Giphy API. Includes infinite scroll and search filtering.',
    tags: ['React', 'SCSS', 'Axios', 'Giphy API'],
    category: 'web',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop',
    link: 'https://giphy-app-search.netlify.app',
    github: 'https://github.com/iamsujanstha/giphy-search',
  },
  {
    id: '5',
    title: 'Portfolio Architecture',
    description: 'A personal portfolio website built with React and Framer Motion to showcase web development projects and skills with a focus on motion design.',
    tags: ['React', 'Framer Motion', 'Tailwind CSS', 'Vite'],
    category: 'design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    link: '/',
    github: 'https://github.com/iamsujanstha/Personal-website',
  }
];

export const SKILLS: Skill[] = [
  { name: 'JavaScript / TypeScript', icon: 'Code2', category: 'frontend' },
  { name: 'React / Next.js', icon: 'Atom', category: 'frontend' },
  { name: 'Node.js / NestJS', icon: 'Server', category: 'backend' },
  { name: 'Tailwind CSS', icon: 'Wind', category: 'frontend' },
  { name: 'GraphQL / SQL', icon: 'Database', category: 'backend' },
  { name: 'Docker / CI/CD', icon: 'Package', category: 'tools' },
  { name: 'Jest / Cypress', icon: 'CheckCircle2', category: 'tools' },
  { name: 'Redux / Saga / Toolkit', icon: 'Zap', category: 'frontend' },
  { name: 'Storybook', icon: 'LayoutTemplate', category: 'tools' },
  { name: 'Web Accessibility (WCAG)', icon: 'Accessibility', category: 'tools' },
  { name: 'Java / Python', icon: 'Terminal', category: 'backend' }
];

export const EDUCATION: Education[] = [
  {
    id: '1',
    degree: 'Bachelor of Engineering in Computer',
    institution: 'Anna University, Chennai, India',
    period: '2014 - 2018'
  },
  {
    id: '2',
    degree: 'Computer Science (+2)',
    institution: 'Shree Jain Vidyalaya, Kolkata, India',
    period: '2012 - 2014'
  }
];

export const EXPERIENCE: Experience[] = [
  {
    id: '1',
    role: 'Senior Frontend Engineer (Onsite)',
    company: 'Info Developers Pvt. Ltd.',
    period: '09/2023 - Present',
    description: [
      'Developed a high-performance local LLM orchestration system using Ollama and FastAPI, enabling secure offline AI inference with real-time streaming capabilities.',
      'Architected sophisticated RAG (Retrieval-Augmented Generation) and AI memory layers using Qdrant and pgvector to provide intelligent document grounding and cross-session context.',
      'Worked with clients to update legacy systems by adding responsive design, keyboard navigation, and accessibility features (WCAG), improving usability and ensuring multi-device compatibility.',
      'Optimized Core Web Vitals, reducing LCP from 2.78s to 1.95s and CLS from 0.21 to 0.09 by resolving layout shifts, using CSS aspect ratios, and minimizing reflows.',
      'Managed several projects at the same time from start to finish, worked closely with different teams, made sure the work matched business goals, and delivered reliable, high-quality solutions.',
      'Implemented a monorepo with NX to streamline development, allowing easy sharing of UI components and services between the web app and CMS.',
      'Designed boilerplate code for new projects, integrated Storybook for UI components, facilitating development by providing clear visual examples.',
      'Developed reusable Web Components with Lit, simplifying development, reducing code duplication, and speeding up feature delivery.'
    ]
  },
  {
    id: '2',
    role: 'Frontend Developer (Remote)',
    company: 'Aerion Technologies',
    period: '04/2019 - 09/2023',
    description: [
      'Managed multiple projects from start to finish, collaborating with cross-functional teams to align with business goals and deliver high-quality solutions.',
      'Developed and integrated backend features using NestJS, contributing to full-stack project functionality and improving data handling.',
      'Collaborated with designers to iterate on designs, refining UI/UX elements and ensuring their compatibility with front-end implementation.',
      'Set up a monorepo with NX to streamline development, allowing easy sharing of UI components and services between the web app and CMS.',
      'Assisted in building and deploying backend services with NestJS, gaining experience in server-side development, authentication, and API management.',
      'Used Redux Saga for managing asynchronous actions, including API calls and data synchronization, improving performance.',
      'Integrated third-party APIs, including Zendesk script and Recommbee products, to provide additional functionalities.',
      'Contributed to Agile development, participating in sprint planning and stand-ups to ensure timely feature delivery.'
    ]
  }
];

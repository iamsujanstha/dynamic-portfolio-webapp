import dbConnect from './mongodb';
import Page from '../../models/Page';
import Section, { SectionType } from '../../models/Section';
import Project from '../../models/Project';
import Navigation from '../../models/Navigation';
import Settings from '../../models/Settings';

export async function seedDatabase() {
  await dbConnect();

  // 1. Clear existing data (Be careful in production!)
  await Promise.all([
    Page.deleteMany({}),
    Section.deleteMany({}),
    Project.deleteMany({}),
    Navigation.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  // 2. Create Sections
  const heroSection = await Section.create({
    type: SectionType.HERO,
    status: 'published',
    title: 'Senior Frontend Engineer',
    subtitle: 'Architecture-focused developer crafting high-performance digital experiences where Precision meets Performance.',
    order: 0,
  });

  const skillsSection = await Section.create({
    type: SectionType.SKILLS_CLOUD,
    status: 'published',
    title: 'Expertise',
    content: {
      skills: [
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
        { name: 'Python / FastAPI', icon: 'Terminal', category: 'backend' }
      ],
    },
    order: 1,
  });

  const projectSection = await Section.create({
    type: SectionType.PROJECTS_GRID,
    status: 'published',
    title: 'Selected Works',
    order: 2,
  });

  const experienceSection = await Section.create({
    type: SectionType.EXPERIENCE_TIMELINE,
    status: 'published',
    title: 'CURRICULUM',
    content: {
      experiences: [
        {
          id: '1',
          role: 'Senior Frontend Engineer (Onsite)',
          company: 'Info Developers Pvt. Ltd.',
          period: '09/2023 - Present',
          description: [
            "Developed a high-performance local LLM orchestration system using Ollama and FastAPI, enabling secure offline AI inference with real-time streaming capabilities.",
            "Architected sophisticated RAG (Retrieval-Augmented Generation) and AI memory layers using Qdrant and pgvector to provide intelligent document grounding and cross-session context.",
            "Worked with clients to update legacy systems by adding responsive design, keyboard navigation, and accessibility features (WCAG), improving usability and ensuring multi-device compatibility.",
            "Optimized Core Web Vitals, reducing LCP from 2.78s to 1.95s and CLS from 0.21 to 0.09 by resolving layout shifts, using CSS aspect ratios, and minimizing reflows.",
            "Managed several projects at the same time from start to finish, worked closely with different teams, made sure the work matched business goals, and delivered reliable, high-quality solutions.",
            "Implemented a monorepo with NX to streamline development, allowing easy sharing of UI components and services between the web app and CMS.",
            "Designed boilerplate code for new projects, integrated Storybook for UI components, facilitating development by providing clear visual examples.",
            "Developed reusable Web Components with Lit, simplifying development, reducing code duplication, and speeding up feature delivery."
          ]
        },
        {
          id: '2',
          role: 'Frontend Developer (Remote)',
          company: 'Aerion Technologies',
          period: '04/2019 - 09/2023',
          description: [
            "Managed multiple projects from start to finish, collaborating with cross-functional teams to align with business goals and deliver high-quality solutions.",
            "Developed and integrated backend features using NestJS, contributing to full-stack project functionality and improving data handling.",
            "Collaborated with designers to iterate on designs, refining UI/UX elements and ensuring their compatibility with front-end implementation.",
            "Set up a monorepo with NX to streamline development, allowing easy sharing of UI components and services between the web app and CMS.",
            "Assisted in building and deploying backend services with NestJS, gaining experience in server-side development, authentication, and API management.",
            "Used Redux Saga for managing asynchronous actions, including API calls and data synchronization, improving performance.",
            "Integrated third-party APIs, including Zendesk script and Recommbee products, to provide additional functionalities.",
            "Contributed to Agile development, participating in sprint planning and stand-ups to ensure timely feature delivery."
          ]
        }
      ],
      education: [
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
      ]
    },
    order: 3,
  });

  // 3. Create Home Page
  const homePage = await Page.create({
    title: 'Home',
    slug: 'index',
    status: 'published',
    sections: [heroSection._id, skillsSection._id, projectSection._id, experienceSection._id],
    metadata: {
      title: 'Sujan Shrestha | Senior Frontend Engineer',
      description: 'Portfolio of Sujan Shrestha - Senior Frontend Engineer specializing in React, TypeScript, and high-performance web applications.',
    },
  });

  // 4. Create a Sample Project
  await Project.create({
    title: 'AI ARCHITECT',
    slug: 'ai-architect',
    description: 'An advanced AI-powered architectural visualization tool that generates optimized floor plans and photorealistic renders from simple text descriptions.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1632&auto=format&fit=crop',
    tags: ['Ollama', 'FastAPI', 'React', 'Qdrant'],
    featured: true,
  },
    {
      title: 'Random Team Generator',
      slug: 'random-team-generator',
      description: 'A smart team generator web app that lets users create random or balanced teams from a custom list of names. Features intelligent balancing based on skill or performance ratings.',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop',
      tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI'],
      featured: true,
    },
    {
      title: 'OpenLayers Map',
      slug: 'openlayers-map',
      description: 'An interactive map application using OpenLayers that allows users to view, manage, and interact with geospatial data visually with advanced layer management.',
      thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1450&auto=format&fit=crop',
      tags: ['React', 'OpenLayers', 'Styled Components'],
      featured: true,
    },
    {
      title: 'Giphy Search',
      slug: 'giphy-search',
      description: 'A fun web app that allows users to search for trending and random GIFs using the Giphy API. Includes infinite scroll and search filtering.',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop',
      tags: ['React', 'SCSS', 'Axios', 'Giphy API'],
      featured: true,
    },
    {
      title: 'Portfolio Architecture',
      slug: 'portfolio-architecture',
      description: 'A personal portfolio website built with React and Framer Motion to showcase web development projects and skills with a focus on motion design.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      tags: ['React', 'Framer Motion', 'Tailwind CSS', 'Vite'],
      featured: true,
    }
  );

  // 5. Create Navigation
  await Navigation.create({
    key: 'header',
    items: [
      { label: 'Home', href: '/', order: 0 },
      { label: 'Projects', href: '/projects', order: 1 },
      { label: 'Resume (PDF)', href: '/resume.pdf', isExternal: true, order: 2 },
    ],
  });

  // 6. Global Settings
  await Settings.create({
    siteName: 'Sujan.dev',
    socialLinks: {
      github: 'https://github.com/sujan',
      linkedin: 'https://linkedin.com/in/sujan',
    },
    contactEmail: 'hello@sujan.dev',
  });

  return { success: true, message: 'Database seeded successfully!' };
}

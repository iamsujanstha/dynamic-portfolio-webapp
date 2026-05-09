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
        { name: 'JavaScript / TypeScript', icon: 'Code2' },
        { name: 'React / Next.js', icon: 'Blocks' },
        { name: 'Node.js / NestJS', icon: 'Server' },
        { name: 'Tailwind CSS', icon: 'Palette' },
        { name: 'GraphQL', icon: 'Database' },
        { name: 'Docker / CI/CD', icon: 'Container' },
        { name: 'Jest', icon: 'TestTube' },
        { name: 'Redux Saga', icon: 'Workflow' },
        { name: 'NX Monorepo', icon: 'Layers' },
        { name: 'WCAG Accessibility', icon: 'Eye' }
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
          id: 1,
          role: "Senior Frontend Engineer",
          company: "Sopact",
          period: "August 2022 - Present",
          description: [
            "Designed and developed scalable enterprise web applications using React, Next.js, and TypeScript, improving overall application performance by 40%.",
            "Architected and implemented a micro-frontend structure using NX monorepo, increasing team development velocity by 30%.",
            "Integrated WCAG 2.1 AA accessibility standards across all platforms."
          ]
        },
        {
          id: 2,
          role: "Frontend Developer",
          company: "Pruvit",
          period: "April 2020 - July 2022",
          description: [
            "Built interactive, high-performance E-commerce interfaces with React and Redux Saga.",
            "Collaborated with UI/UX designers to translate Figma designs into pixel-perfect, responsive web components.",
            "Reduced bundle size by 25% through code splitting and lazy loading."
          ]
        }
      ],
      education: [
        {
          id: 1,
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          period: "2016 - 2020"
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
    tags: ['AI', 'Next.js', 'Stable Diffusion', 'Three.js'],
    featured: true,
  });

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

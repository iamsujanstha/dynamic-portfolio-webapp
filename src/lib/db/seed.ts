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
      skills: ['JavaScript / TypeScript', 'React / Next.js', 'Node.js / NestJS', 'Tailwind CSS', 'GraphQL', 'Docker / CI/CD', 'Jest', 'Redux Saga', 'NX Monorepo', 'WCAG Accessibility'],
    },
    order: 1,
  });

  const projectSection = await Section.create({
    type: SectionType.PROJECTS_GRID,
    status: 'published',
    title: 'Selected Works',
    order: 2,
  });

  // 3. Create Home Page
  const homePage = await Page.create({
    title: 'Home',
    slug: 'index',
    status: 'published',
    sections: [heroSection._id, skillsSection._id, projectSection._id],
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

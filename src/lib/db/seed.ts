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
    title: 'Staff Software Engineer at Google',
    subtitle: 'Building scalable systems and crafting delightful digital experiences.',
    order: 0,
  });

  const skillsSection = await Section.create({
    type: SectionType.SKILLS_CLOUD,
    status: 'published',
    title: 'Core Expertise',
    content: {
      skills: ['TypeScript', 'Next.js', 'MongoDB', 'Cloud Infrastructure', 'System Design'],
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
      title: 'Portfolio | Sujan Shrestha',
      description: 'Senior Staff Engineer Portfolio',
    },
  });

  // 4. Create a Sample Project
  await Project.create({
    title: 'Dynamic Portfolio Platform',
    slug: 'portfolio-platform',
    description: 'A production-grade headless CMS built with Next.js and MongoDB.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    tags: ['Next.js', 'Mongoose', 'Tailwind'],
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

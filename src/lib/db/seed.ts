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
    title: 'EXPERIENCE',
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
  await Project.create([
    {
      title: 'Giphy Search',
      slug: 'giphy-search',
      description: 'A fun web app that allows users to search for trending and random GIFs using the Giphy API. Includes infinite scroll and search filtering.',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop',
      tags: ['React', 'SCSS', 'Axios', 'Giphy API'],
      featured: true,
    },
    {
      title: 'Dynamic Portfolio',
      slug: 'portfolio-architecture',
      description: 'A dyanmic portfolio website that has cms to manage the content of the page.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      tags: ['Next JS', 'Taiwind CSS', 'MongoDB', 'Framer Motion'],
      featured: true,
      links: {
        github: 'https://github.com/iamsujanstha/portfolio-website',
        live: 'https://sujankshrestha.com.np'
      }
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
      title: 'AI Architect',
      slug: 'ai-architect',
      description: 'An advanced AI-powered architectural visualization tool that generates optimized floor plans and photorealistic renders from simple text descriptions.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1632&auto=format&fit=crop',
      tags: ['Ollama', 'FastAPI', 'React', 'Qdrant'],
      featured: true,
      links: {
        github: '',
        live: ''
      }
    },
    {
      title: 'HyperCurl',
      slug: 'hypercurl',
      description: 'An advanced, real-time API performance, resilience, and security test-suite platform. Engineered using a high-throughput multi-threaded client model in React 18, Vite, and Express, designed with a focus on visual feedback, aesthetic typography, and responsive controls.',
      thumbnail: 'sujankshrestha.com.np',
      tags: ['React', 'Curl', 'Express'],
      links: {
        github: 'https://github.com/iamsujanstha/hypercurl',
        live: 'https://sujankshrestha.com.np'
      },
      featured: false,
    }
  ]);

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
    siteName: 'dynamic-portfolio',
    skills: [
      'JavaScript / TypeScript',
      'React / Next.js',
      'Node.js / NestJS',
      'Tailwind CSS',
      'GraphQL / SQL',
      'Docker / CI/CD',
      'Jest / Cypress',
      'Redux / Saga / Toolkit',
      'Storybook',
      'Web Accessibility (WCAG)',
      'Python / FastAPI'
    ],
    socialLinks: {
      github: 'https://github.com/iamsujanstha',
      linkedin: 'https://linkedin.com/in/sujan',
      twitter: '',
    },
    contactEmail: 'tlsujank.co@gmail.com',
    maintenanceMode: false,
    primaryColor: '#2563eb',
    profilePicture: 'https://ofxcobx7gdxssrn7.public.blob.vercel-storage.com/profile-PwGmcND0dDfBzcBzJXh6NxFX4YKXtj.jpg',
    contactNumber: '9806545497',
    location: 'Tanahun, Gandaki, Nepal',
    resumeUrl: 'https://ofxcobx7gdxssrn7.public.blob.vercel-storage.com/resume/active-resume-VO0Cud8amhvlVRNDfajgxDkbMRA742.pdf',
    resumeData: {
      name: 'SUJAN SHRESTHA',
      summary: 'An experienced Frontend Engineer with a strong passion for learning, researching and building web applications that provides a great user experience.',
      contact: {
        phone: '+977 9806545497',
        location: 'Tanahun, Gandaki',
        email: 'tlsujank.co@gmail.com',
        portfolioLabel: 'Portfolio',
        githubLabel: 'GitHub',
        linkedinLabel: 'LinkedIn',
        portfolioUrl: 'https://sujankshrestha.com.np',
        githubUrl: 'https://github.com/iamsujanstha',
        linkedinUrl: 'https://linkedin.com/in/tlsujank'
      },
      experience: [
        {
          id: '1',
          company: 'Infodevelopers Pvt. Ltd.',
          startDate: '09/2023',
          endDate: 'Present',
          role: 'Senior Software Engineer',
          bullets: [
            'Modernized a legacy application by introducing modular architecture and reusable domain-driven components following SOLID principles, reducing technical debt, accelerating feature delivery, and improving long-term maintainability.',
            'Enhanced accessibility and cross-device usability by upgrading legacy systems with responsive design, keyboard navigation, and WCAG compliance, reducing accessibility-related support tickets by 35% and enabling clients to serve a broader audience.',
            'Redesigned file-management workflows using NestJS, Amazon S3 pre-signed URLs, and event-driven AWS Lambda processing, reducing backend bandwidth consumption, simplifying storage operations, and improving scalability for high-volume uploads.',
            'Improved Core Web Vitals by reducing Largest Contentful Paint (LCP) from 2.78s to 1.95s and Cumulative Layout Shift (CLS) from 0.21 to 0.09, contributing to improved search visibility and user engagement.',
            'Improved release reliability by enhancing CI/CD pipelines and deployment workflows, reducing manual deployment effort and enabling faster, more predictable software releases.',
            'Migrated GraphQL queries from inline .gql usage to .graphql file-based structure, introducing cursor pagination and persisted queries, improving API performance, maintainability, and query consistency.'
          ],
          techStack: 'React, GraphQL, Redux, Material UI, Nextjs, Nest, MongoDB, Apollo client, AWS-S3, Lambda'
        },
        {
          id: '2',
          company: 'Aerion Technologies',
          startDate: '04/2019',
          endDate: '09/2023',
          role: 'Software Developer',
          bullets: [
            'Delivered multiple client projects end-to-end, working closely with cross-functional teams to transform business requirements into maintainable and scalable software solutions.',
            'Explored and implemented authentication strategies using NestJS, including JWT-based authentication and TOTP-based two-factor authentication, improving application security for sensitive user actions and strengthening overall access control design.',
            'Built server-side rendered applications using Next.js, evaluating different rendering, caching, and data-fetching approaches to improve performance and reduce page load times by ~25%.',
            'Researched and integrated third-party services such as Zendesk and Recommbee by analysing API documentation and adapting integration strategies to improve support workflows and user personalisation.',
            'Worked closely with designers to translate Figma designs into responsive and accessible interfaces, iterating based on feedback to improve usability and user experience.',
            'Designed and implemented backend services using NestJS, building REST APIs, validation layers, and core business workflows to support frontend applications and ensure reliable and consistent data flow.'
          ],
          techStack: 'React, SCSS, Styled Components, Redux-toolkit, Storybook, Rest API, Express JS, VueJS'
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Anna University',
          location: 'Chennai, India',
          startDate: '2014',
          endDate: '2018',
          degree: 'Bachelor of Engineering in Computer'
        }
      ],
      skillGroups: [
        {
          id: '1',
          category: 'Frontend',
          skills: 'React, Next, TypeScript, Redux, Tailwind, Material UI, Storybook, SCSS'
        },
        {
          id: '2',
          category: 'Backend',
          skills: 'Node.js, NestJS, REST APIs, GraphQL, MongoDB'
        },
        {
          id: '3',
          category: 'DevOps/Tools',
          skills: 'Docker, Git, CI/CD, AWS-S3, EC2, Terraform, K8S'
        },
        {
          id: '4',
          category: 'Practices',
          skills: 'Web Accessibility (WCAG), DSA, Agile/Scrum, System Design fundamentals, Webpack, Rollup'
        }
      ]
    },
    resumeStyle: {
      pageSize: 'A4',
      font: 'Carlito',
      nameFont: 'RobotoSerif',
      baseFontSize: 10.5,
      lineHeight: 1.3,
      bodyLetterSpacing: 0,
      bulletTextSpace: 14,
      marginH: 30,
      marginTop: 20,
      marginBottom: 24,
      bulletGap: 2,
      sectionGap: 5.5,
      entryGap: 7,
      contactItemGap: 8,
      contactBulletGap: 3,
      ruleWidth: 1.5,
      ruleColor: '#000000',
      nameFontSize: 18,
      nameLetterSpacing: 1,
      nameStyle: 'normal',
      linkColor: '#1155CC',
      bulletChar: 'filled-circle'
    }
  });

  return { success: true, message: 'Database seeded successfully!' };
}

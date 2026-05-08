import React from 'react';
import { SectionType, ISection } from '@/models/Section';

// Lazy load or import components
const HeroSection = ({ data }: { data: any }) => (
  <section className="py-24 px-6 text-center bg-zinc-950">
    <h1 className="text-5xl font-bold mb-4">{data.title}</h1>
    <p className="text-xl text-zinc-400">{data.subtitle}</p>
  </section>
);

const ProjectsSection = ({ data }: { data: any }) => (
  <section className="py-20 bg-zinc-900">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-12">{data.title}</h2>
      {/* Grid rendering projects would go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <p className="text-zinc-500 italic">Project data fetched via ProjectService...</p>
      </div>
    </div>
  </section>
);

const SkillsSection = ({ data }: { data: any }) => (
  <section className="py-16">
    <h2 className="text-3xl font-bold text-center mb-8">{data.title}</h2>
    <div className="flex flex-wrap justify-center gap-4">
      {data.content?.skills?.map((skill: string) => (
        <span key={skill} className="px-4 py-2 bg-zinc-800 rounded-full border border-zinc-700">
          {skill}
        </span>
      ))}
    </div>
  </section>
);

// Map MongoDB Types to React Components
const SectionComponents: Record<SectionType, React.FC<{ data: ISection }>> = {
  [SectionType.HERO]: ({ data }) => <HeroSection data={data} />,
  [SectionType.PROJECTS_GRID]: ({ data }) => <ProjectsSection data={data} />,
  [SectionType.SKILLS_CLOUD]: ({ data }) => <SkillsSection data={data} />,
  // Remaining sections...
  [SectionType.EXPERIENCE_TIMELINE]: ({ data }) => <div>Experience Timeline</div>,
  [SectionType.CONTACT_FORM]: ({ data }) => <div>Contact Form</div>,
  [SectionType.CUSTOM_MARKDOWN]: ({ data }) => <div>Markdown Content</div>,
};

export const DynamicSectionRenderer = ({ sections }: { sections: ISection[] }) => {
  return (
    <>
      {sections.map((section) => {
        const Component = SectionComponents[section.type];
        if (!Component) return null;
        return <Component key={section._id as string} data={section} />;
      })}
    </>
  );
};

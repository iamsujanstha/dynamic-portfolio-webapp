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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(data.content?.projects || []).map((project: any) => (
          <article key={project.slug || project.title} className="rounded-xl border border-zinc-800 bg-black/40 p-6">
            {project.thumbnail && (
              <img src={project.thumbnail} alt="" className="mb-5 aspect-video w-full rounded-lg object-cover" />
            )}
            <h3 className="text-xl font-bold">{project.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{project.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(project.tags || []).map((tag: string) => (
                <span key={tag} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">{tag}</span>
              ))}
            </div>
          </article>
        ))}
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

const ExperienceSection = ({ data }: { data: any }) => (
  <section className="py-20 bg-black">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-12">{data.title}</h2>
      <div className="space-y-10">
        {(data.content?.experience || []).map((item: any) => (
          <article key={`${item.company}-${item.role}`} className="border-l border-zinc-800 pl-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">{item.role}</h3>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">{item.company}</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{item.period}</span>
            </div>
            <ul className="mt-5 space-y-3">
              {(item.description || []).map((line: string) => (
                <li key={line} className="text-sm leading-6 text-zinc-400">{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);

// Map MongoDB Types to React Components
const SectionComponents: Record<SectionType, React.FC<{ data: ISection }>> = {
  [SectionType.HERO]: ({ data }) => <HeroSection data={data} />,
  [SectionType.PROJECTS_GRID]: ({ data }) => <ProjectsSection data={data} />,
  [SectionType.SKILLS_CLOUD]: ({ data }) => <SkillsSection data={data} />,
  // Remaining sections...
  [SectionType.EXPERIENCE_TIMELINE]: ({ data }) => <ExperienceSection data={data} />,
  [SectionType.CONTACT_FORM]: ({ data }) => <div>Contact Form</div>,
  [SectionType.CUSTOM_MARKDOWN]: ({ data }) => <div>Markdown Content</div>,
};

export const DynamicSectionRenderer = ({ sections }: { sections: ISection[] }) => {
  return (
    <>
      {sections.map((section) => {
        const Component = SectionComponents[section.type];
        if (!Component) return null;
        return <Component key={section._id?.toString() || Math.random().toString()} data={section} />;
      })}
    </>
  );
};

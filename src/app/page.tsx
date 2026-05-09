import nextDynamic from 'next/dynamic';
import { PageService } from '@/services/pageService';
import { ProjectService } from '@/services/projectService';

const App = nextDynamic(() => import('../App'), { ssr: false });

export const dynamic = 'force-dynamic';

export interface CMSData {
  hero: any | null;
  skills: any | null;
  projects: any[] | null;
}

export default async function HomePage() {
  const pageData = await PageService.getPageBySlug('index').catch(() => null);
  const projects = await ProjectService.getAllProjects().catch(() => []);

  let heroData = null;
  let skillsData = null;

  if (pageData?.sections) {
    for (const section of pageData.sections) {
      if (section.type === 'HERO') heroData = section;
      if (section.type === 'SKILLS_CLOUD') skillsData = section;
    }
  }

  const cmsData: CMSData = {
    hero: heroData ? JSON.parse(JSON.stringify(heroData)) : null,
    skills: skillsData ? JSON.parse(JSON.stringify(skillsData)) : null,
    projects: projects.length ? JSON.parse(JSON.stringify(projects)) : null,
  };

  return <App cmsData={cmsData} />;
}

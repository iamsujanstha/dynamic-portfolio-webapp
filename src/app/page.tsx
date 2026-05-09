import nextDynamic from 'next/dynamic';
import { PageService } from '@/services/pageService';
import { ProjectService } from '@/services/projectService';

const App = nextDynamic(() => import('../App'), { ssr: true });

export const dynamic = 'force-dynamic';

import { SettingService } from '@/services/settingService';

export interface CMSData {
  hero: any | null;
  skills: any | null;
  projects: any[] | null;
  experience: any | null;
  settings: any | null;
}

export default async function HomePage() {
  const pageData = await PageService.getPageBySlug('index').catch(() => null);
  const projects = await ProjectService.getAllProjects().catch(() => []);
  const settings = await SettingService.getGlobalSettings().catch(() => null);

  let heroData = null;
  let skillsData = null;
  let experienceData = null;

  if (pageData?.sections) {
    for (const section of pageData.sections) {
      if (section.type === 'HERO') heroData = section;
      if (section.type === 'SKILLS_CLOUD') skillsData = section;
      if (section.type === 'EXPERIENCE_TIMELINE') experienceData = section;
    }
  }

  const cmsData: CMSData = {
    hero: heroData ? JSON.parse(JSON.stringify(heroData)) : null,
    skills: skillsData ? JSON.parse(JSON.stringify(skillsData)) : null,
    projects: projects.length ? JSON.parse(JSON.stringify(projects)) : null,
    experience: experienceData ? JSON.parse(JSON.stringify(experienceData)) : null,
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
  };

  return <App cmsData={cmsData} />;
}

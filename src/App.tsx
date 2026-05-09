'use client';
import { useState, useEffect } from 'react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar, Footer } from './layouts';
import { HeroSection as Hero } from './features/hero';
import { ProjectsSection as Projects } from './features/projects';
import { SkillsSection as Skills } from './features/skills';
import { ExperienceSection as Experience } from './features/experience';
import { ContactSection as Contact } from './features/contact';
import { CustomCursor } from './components/ui/CustomCursor';
import { AIAssistant } from './components/AIAssistant';
import { SEO } from './components/common';
import { motion, useScroll, useSpring } from 'motion/react';
import { CMSData } from './app/page';
import { useSimulation } from './hooks/useSimulation';
import { SimKey } from './services/simulationService';

export default function App({ cmsData }: { cmsData?: CMSData }) {
  const [effectiveData, setEffectiveData] = useState<CMSData | undefined>(cmsData);
  const { getSimData } = useSimulation();

  useEffect(() => {
    const applyOverrides = () => {
      const simPages = getSimData<any[]>(SimKey.PAGES);
      const simProjects = getSimData<any[]>(SimKey.PROJECTS);
      const simSettings = getSimData<any>(SimKey.SETTINGS);

      if (!simPages && !simProjects && !simSettings) {
        setEffectiveData(cmsData);
        return;
      }

      const next = { ...(cmsData || ({} as CMSData)) };

      if (simPages) {
        const homePage = simPages.find((p: any) => p.slug === 'index' || p.slug === 'home');
        if (homePage?.sections) {
          homePage.sections.forEach((section: any) => {
            if (section.type === 'HERO') next.hero = section;
            if (section.type === 'SKILLS_CLOUD') next.skills = section;
            if (section.type === 'EXPERIENCE_TIMELINE') next.experience = section;
          });
        }
      }

      if (simProjects) {
        next.projects = simProjects;
      }

      if (simSettings) {
        next.settings = simSettings;
      }

      setEffectiveData(next);
    };

    applyOverrides();
    // The useSimulation hook handles the subscription to storage events internally
  }, [cmsData, getSimData]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen selection:bg-brand-primary/30 selection:text-brand-primary transition-colors duration-500">
      <SEO />

      {/* Skip to Main Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-brand-primary focus:text-white dark:focus:text-black focus:rounded-full focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-primary z-50 origin-left"
        style={{ scaleX }}
      />

      <CustomCursor />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero cmsData={effectiveData?.hero} resumeUrl={effectiveData?.settings?.resumeUrl} profilePicture={effectiveData?.settings?.profilePicture} />
        <Projects cmsData={effectiveData?.projects} />
        <Skills cmsData={effectiveData?.skills} />
        <Experience cmsData={effectiveData?.experience} />
        <Contact
          settings={{
            location: effectiveData?.settings?.location,
            contactEmail: effectiveData?.settings?.contactEmail,
            contactNumber: effectiveData?.settings?.contactNumber
          }}
        />
      </main>

      <Footer />
      <AIAssistant />

      {/* Decorative Background Glows (Fixed position) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-50 dark:opacity-100" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-50 dark:opacity-100" />
    </div>
  );
}

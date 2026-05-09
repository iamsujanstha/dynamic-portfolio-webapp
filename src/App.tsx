'use client';

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

export default function App({ cmsData }: { cmsData?: CMSData }) {
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
        <Hero cmsData={cmsData?.hero} resumeUrl={cmsData?.settings?.resumeUrl} profilePicture={cmsData?.settings?.profilePicture} />
        <Projects cmsData={cmsData?.projects} />
        <Skills cmsData={cmsData?.skills} />
        <Experience cmsData={cmsData?.experience} />
        <Contact 
          settings={{
            location: cmsData?.settings?.location,
            contactEmail: cmsData?.settings?.contactEmail,
            contactNumber: cmsData?.settings?.contactNumber
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

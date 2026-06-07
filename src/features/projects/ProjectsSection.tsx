/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { ExternalLink, Github, Loader2, Minus, ArrowUpRight, Zap } from 'lucide-react';
import { fetchGitHubProjects } from '@/src/services/githubService';
import { PROJECTS as STATIC_PROJECTS, Project } from '@/src/core';
import { CMSData } from '@/src/app/page';
import Image from 'next/image';

const CATEGORIES = ['all', 'web', 'mobile', 'ai', 'design'];

const TAG_STYLES = [
  { text: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/20' },
  { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
];

export const ProjectsSection = ({ cmsData }: { cmsData?: CMSData['projects'] }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        if (cmsData && cmsData.length > 0) {
          const normalized = cmsData.map((p: any) => ({
            id: p._id || p.id,
            title: p.title,
            description: p.description,
            tags: p.tags || [],
            category: p.category || 'web',
            image: p.thumbnail || p.image,
            link: p.links?.live || p.url || p.link || '#',
            github: p.links?.github || p.github || '#'
          }));
          setProjects(normalized);
        } else {
          const data = await fetchGitHubProjects();
          if (data && data.length > 0) {
            setProjects(data);
          } else {
            setProjects(STATIC_PROJECTS);
          }
        }
      } catch (error) {
        setProjects(STATIC_PROJECTS);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [cmsData]);

  const filteredProjects = projects.filter(
    (p) => activeCategory === 'all' || p.category === activeCategory
  );

  // Triple projects for seamless loop
  const displayProjects = [...filteredProjects, ...filteredProjects, ...filteredProjects];

  return (
    <section id="projects" className="py-32 bg-bg-dark/40 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-brand-primary uppercase tracking-[0.5em] font-black">Archive.02</span>
              <div className="w-20 h-[1px] bg-brand-primary/20" />
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-text-main uppercase leading-none">
              Featured <br />
              <span className="italic text-transparent bg-clip-text bg-linear-to-r from-text-main to-text-main/20">Prototypes</span>
            </h2>
            <p className="text-text-main/40 max-w-sm font-light text-sm leading-relaxed">
              A curated selection of technical experiments, interface studies, and full-stack architecture.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center bg-bg-card/30 backdrop-blur-3xl border border-border-main p-1.5 rounded-2xl"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeCategory === cat
                  ? 'text-bg-dark'
                  : 'text-text-main/40 hover:text-text-main'
                  }`}
              >
                {activeCategory === cat && (
                  <motion.div
                    layoutId="active-category"
                    className="absolute inset-0 bg-brand-primary rounded-xl z-0"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat === 'ai' ? 'AI' : cat}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6 text-text-main/20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={40} />
          </motion.div>
          <p className="font-mono tracking-[0.5em] uppercase text-[10px]">Loading Core System...</p>
        </div>
      ) : (
        <div
          className="relative group/marquee"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex gap-8 overflow-hidden py-10 px-4 md:px-0">
            <motion.div
              className="flex gap-8"
              animate={!isHovered && activeCategory === 'all' ? {
                x: ["0%", "-33.333%"],
              } : {}}
              transition={{
                x: {
                  duration: Math.max(projects.length * 5, 6), // Increased multiplier and min duration for slower speed
                  repeat: Infinity,
                  ease: "linear",
                }
              }}
            >
              {displayProjects.map((project, idx) => (
                <ProjectCard key={`${project.id}-${idx}`} project={project} />
              ))}
            </motion.div>
          </div>

          <div className="absolute top-0 left-0 w-40 h-full bg-linear-to-r from-bg-dark to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-40 h-full bg-linear-to-l from-bg-dark to-transparent pointer-events-none z-10" />
        </div>
      )}
    </section>
  );
};

const normalizeImageSrc = (src?: string) => {
  if (!src) return undefined;
  if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) return src;
  return `https://${src}`;
};

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="relative group/card w-[320px] md:w-[450px] shrink-0 h-[500px]"
    >
      <motion.div
        className="h-full bg-bg-card/50 backdrop-blur-md border border-border-main rounded-[2rem] overflow-hidden flex flex-col p-8 md:p-10 transition-all duration-700 group-hover/card:border-brand-primary/40 group-hover/card:-translate-y-4 shadow-2xl shadow-transparent group-hover/card:shadow-brand-primary/5"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [smoothX, smoothY],
              ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(var(--brand-primary-rgb), 0.1), transparent 40%)`
            )
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-brand-primary uppercase tracking-[0.4em] font-black">{project.category}</span>
              <h3 className="text-2xl md:text-3xl font-display font-medium text-text-main tracking-tight leading-none group-hover/card:text-brand-primary transition-colors whitespace-normal">
                {project.title}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full border border-border-main flex items-center justify-center text-text-main/40 group-hover/card:bg-brand-primary group-hover/card:text-bg-dark transition-all duration-500">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="relative w-full h-40 md:h-48 mb-8 rounded-2xl overflow-hidden bg-bg-dark/40 border border-border-main/50">
            <Image
              src={normalizeImageSrc(project.image) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'}
              alt={project.title}
              fill
              className="object-cover opacity-40 group-hover/card:scale-105 group-hover/card:opacity-80 transition-all duration-1000 ease-out grayscale group-hover/card:grayscale-0"
              sizes="(max-width: 768px) 320px, 450px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-bg-card to-transparent/60 opacity-60" />

            <div className="absolute top-4 right-4 p-1 bg-bg-dark/80 backdrop-blur-md rounded-lg opacity-0 group-hover/card:opacity-100 transition-all transform translate-y-2 group-hover/card:translate-y-0">
              <Zap size={14} className="text-brand-primary" />
            </div>
          </div>

          <p className="text-text-main/50 text-xs md:text-sm font-light leading-relaxed mb-auto line-clamp-3 whitespace-normal">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-8 pt-4 border-t border-border-main/30 group-hover/card:opacity-0 transition-opacity duration-300">
            {project.tags.slice(0, 4).map((tag, i) => {
              const style = TAG_STYLES[i % TAG_STYLES.length];
              return (
                <span
                  key={tag}
                  className={`text-[7px] md:text-[8px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full border ${style.border} ${style.text} ${style.bg} backdrop-blur-sm whitespace-nowrap`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex gap-4 translate-y-full group-hover/card:translate-y-0 transition-transform duration-500 bg-bg-card/95 backdrop-blur-xl border-t border-border-main/30 z-20">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-bg-dark/80 border border-border-main text-text-main/60 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-bg-dark hover:border-brand-primary transition-all flex items-center justify-center gap-2"
          >
            <Github size={14} /> Source
          </a>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-brand-primary text-bg-dark rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            Preview <ExternalLink size={14} />
          </a>
        </div>
      </motion.div>
    </div>
  );
};



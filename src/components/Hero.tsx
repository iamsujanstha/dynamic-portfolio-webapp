/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { MousePointer2, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import { Button } from './ui/Button';

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-bg-dark">
      {/* Background Texture & Gradients */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(var(--text-main) 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-primary/5 blur-[120px]" />
      
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        {/* Left Side: Content */}
        <div className="flex flex-col items-start text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-[1px] bg-brand-primary" />
            <span className="text-brand-primary font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
              Senior Frontend Engineer
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-[12vw] lg:text-[8vw] font-display font-black leading-[0.8] tracking-tighter text-text-main mb-10 flex flex-col">
              <span className="flex items-center gap-4">
                SUJAN 
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: 'auto' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="hidden md:block h-[0.1em] bg-text-main/10 w-24" 
                />
              </span>
              <span className="text-transparent" style={{ WebkitTextStroke: '1px var(--text-main)' }}>SHRESTHA</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-text-main/40 text-lg md:text-xl max-w-lg mb-12 font-light leading-[1.6] italic serif"
          >
            Architecture-focused developer crafting high-performance digital experiences where <span className="text-text-main">Precision meets Performance.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center gap-6"
          >
            <a 
              href="#projects" 
              className="px-8 py-4 bg-text-main text-bg-dark font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary hover:text-white transition-all duration-500 rounded-xs shadow-xl shadow-brand-primary/5"
            >
              Selected Work
            </a>
            <a 
              href="/resume.pdf" 
              className="px-8 py-4 border border-border-main text-text-main font-black uppercase text-[10px] tracking-widest hover:bg-text-main hover:text-bg-dark transition-all duration-500 rounded-xs"
            >
              Download CV
            </a>
            <div className="flex items-center gap-6 md:pl-6 md:border-l border-border-main">
              <a href="https://github.com/iamsujanstha" target="_blank" rel="noopener noreferrer" className="text-text-main/30 hover:text-brand-primary transition-colors"><Github size={18} /></a>
              <a href="https://linkedin.com/in/tlsujank" target="_blank" rel="noopener noreferrer" className="text-text-main/30 hover:text-brand-primary transition-colors"><Linkedin size={18} /></a>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Creative Visual */}
        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -20, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              opacity: { duration: 1.2 },
              scale: { duration: 1.2 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative"
          >
            {/* The "Logo" Image Container */}
            <div className="relative w-[280px] md:w-[420px] aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-border-main shadow-2xl bg-bg-card group/img">
               <motion.img 
                 src="https://github.com/iamsujanstha.png" 
                 alt="Sujan Shrestha"
                 className="w-full h-full object-cover grayscale-50 group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000"
                 whileHover={{ scale: 1.05 }}
               />
               
               {/* Aesthetic internal frame */}
               <div className="absolute inset-4 border border-border-main rounded-[2rem] pointer-events-none" />
               <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Floating Decorative Assets */}
            <motion.div 
               animate={{ y: [0, 25, 0], x: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-6 -right-6 w-24 h-24 md:w-32 md:h-32 bg-brand-primary/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-border-main z-20"
            >
              <div className="text-center">
                <div className="text-[12px] font-black uppercase text-brand-primary tracking-tighter">Sj.</div>
                <div className="text-[7px] font-mono text-text-main/30 tracking-widest uppercase">Verified</div>
              </div>
            </motion.div>

            <motion.div 
               animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
               transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -bottom-8 -left-8 px-6 py-4 bg-bg-card backdrop-blur-2xl border border-border-main rounded-2xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
                <div className="flex flex-col leading-none">
                  <span className="text-text-main text-[10px] font-bold uppercase tracking-widest mb-1.5">Full-Stack Engineer</span>
                  <div className="flex gap-2">
                    <span className="w-3 h-[1px] bg-text-main/20" />
                    <span className="text-text-main/20 text-[8px] font-mono uppercase">2026 Batch</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Decorative Geometric Shapes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-border-main rounded-full pointer-events-none -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-border-main rounded-full pointer-events-none -z-10 animate-spin-slow opacity-20" />
        </div>
      </div>

      {/* Modern Scroll Indicator */}
      <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center gap-6 origin-right rotate-90 translate-y-1/2">
        <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-text-main/20 whitespace-nowrap">Scroll Down</span>
        <div className="w-24 h-[1px] bg-linear-to-r from-brand-primary to-transparent" />
      </div>
    </section>
  );
};


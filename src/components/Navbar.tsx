/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Code2, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for active section
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // More sensitive to the top-ish of the viewport
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    const sections = ['home', 'projects', 'skills', 'experience', 'contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const offset = 100; // Increased offset for better visibility
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Force set active section immediately for better UX
      setActiveSection(targetId);
    }

    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 w-full z-40 transition-all duration-300 py-4 px-6 md:px-12',
        isScrolled ? 'bg-bg-dark/80 backdrop-blur-lg border-b border-border-main py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-4 group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border-main transition-transform duration-500 group-hover:scale-110">
              <img 
                src="https://github.com/iamsujanstha.png" 
                alt="Sujan" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
            <div className="absolute -inset-1 border border-brand-primary/30 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tighter text-text-main transition-colors group-hover:text-brand-primary">
              &lt;Sujan /&gt;
            </span>
            <span className="text-[9px] font-mono text-text-main/30 tracking-[0.3em] uppercase mt-1">Engineer</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-bg-card/50 border border-border-main rounded-full">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black transition-all uppercase tracking-widest rounded-full",
                  isActive 
                    ? "bg-text-main text-bg-dark shadow-lg shadow-text-main/10" 
                    : "text-text-main/40 hover:text-text-main hover:bg-bg-card"
                )}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-6">
           <button
             onClick={toggleTheme}
             className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-text-main hover:bg-brand-primary/10 transition-all border-border-main"
             aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
           >
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           <a 
             href="#contact" 
             onClick={(e) => handleNavClick(e, '#contact')}
             className="px-6 py-3 bg-text-main text-bg-dark text-[10px] font-black rounded-full hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-bg-dark/10 uppercase tracking-widest"
           >
             Contact
           </a>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-text-main"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="text-text-main p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full glass-card p-10 flex flex-col items-center gap-8 border-t border-border-main md:hidden shadow-2xl"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "text-2xl font-display font-medium transition-colors relative",
                    isActive ? "text-brand-primary" : "text-text-main hover:text-brand-primary"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-primary rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

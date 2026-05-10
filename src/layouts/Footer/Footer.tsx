/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Code2, Github, Twitter, Linkedin, Heart, ExternalLink, ArrowUpRight, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export const Footer = ({
  firstName = 'SUJAN',
  lastName = 'SHRESTHA',
  githubUrl = 'https://github.com/iamsujanstha',
  linkedinUrl = 'https://linkedin.com/in/tlsujank',
  twitterUrl = '#',
  email = 'tlsujank.co@gmail.com'
}: {
  firstName?: string;
  lastName?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  email?: string;
}) => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: <Github size={18} />, href: githubUrl },
    { name: 'LinkedIn', icon: <Linkedin size={18} />, href: linkedinUrl },
    { name: 'Twitter', icon: <Twitter size={18} />, href: twitterUrl },
  ];

  return (
    <footer className="relative pt-32 pb-12 px-6 md:px-12 border-t border-border-main bg-linear-to-b from-transparent to-bg-dark/40 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Top Section: Branding & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-20 border-b border-border-main">
          {/* Left Side: Description */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                <Code2 size={20} />
              </div>
              <span className="text-xl font-display font-medium tracking-tight text-text-main">{firstName}.</span>
            </div>

            <p className="text-lg md:text-xl font-display font-light text-text-main/60 leading-relaxed italic max-w-md">
              "Focused on building high-performance, <span className="text-text-main font-semibold">scalable applications</span> where logic meets clean architecture and intuitive user experiences."
            </p>

            <p className="text-xs text-text-main/30 font-light leading-loose max-w-sm">
              Currently exploring the intersections of distributed systems and modern frontend paradigms. Available for collaborations that push technical boundaries.
            </p>
          </div>

          {/* Right Side: Navigation & Connect */}
          <div className="grid grid-cols-2 gap-12 lg:justify-items-end">
            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-mono text-text-main/30 uppercase tracking-[0.4em]">Directory</h4>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-text-main/60 hover:text-brand-primary transition-colors font-light flex items-center gap-2 group"
                  >
                    {link.name}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-mono text-text-main/30 uppercase tracking-[0.4em]">Connect</h4>
              <nav className="flex flex-col gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-main/60 hover:text-brand-primary transition-colors font-light flex items-center gap-3 group"
                  >
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">{social.icon}</span>
                    {social.name}
                  </a>
                ))}
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-text-main/60 hover:text-brand-primary transition-colors font-light flex items-center gap-3 group"
                >
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity"><Mail size={18} /></span>
                  Email
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal & Credits */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-text-main/30 text-[9px] uppercase tracking-[0.2em] font-medium">
            <p>&copy; {currentYear} {firstName} {lastName}. ALL RIGHTS RESERVED.</p>
            <span className="hidden md:block w-1 h-1 rounded-full bg-text-main/10" />
            <p className="flex items-center gap-2">
              PROPRIETARY ENGINE <span className="text-brand-primary/50 text-[7px] border border-brand-primary/20 px-1 rounded">V1.0</span>
            </p>
          </div>

          <div className="flex items-center gap-8">
            <p className="flex items-center gap-2 text-text-main/20 text-[9px] uppercase tracking-[0.3em]">
              Crafted with <Heart size={10} className="text-brand-secondary fill-brand-secondary/20" /> by {firstName}
            </p>
            <button
              onClick={handleScrollToTop}
              className="p-3 border border-border-main rounded-full text-text-main/30 hover:text-brand-primary hover:border-brand-primary transition-all group shadow-sm bg-bg-card/30"
              aria-label="Back to top"
            >
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ArrowUpRight size={16} className="-rotate-45" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

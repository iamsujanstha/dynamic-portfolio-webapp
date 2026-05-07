/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EXPERIENCE, EDUCATION } from '@/src/core';
import { Card } from '@/src/components/ui/Card';
import { motion } from 'motion/react';
import { GraduationCap, Briefcase } from 'lucide-react';

export const ExperienceSection = () => {
  return (
    <section id="experience" className="py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 italic text-text-main">CURRICULUM</h2>
            <p className="text-text-main/40 mb-12 font-light leading-relaxed">
              Advancing through the tech landscape, specializing in WCAG accessibility, performance optimization, and scalable monorepo architectures.
            </p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-12 glass-card rounded-3xl overflow-hidden group mb-12"
            >
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <h4 className="text-sm uppercase tracking-widest text-brand-primary font-bold mb-2">Total Impact</h4>
               <div className="text-6xl font-display font-bold mb-4 text-text-main">5+</div>
               <p className="text-text-main/50 italic font-display">Years of professional experience in frontend excellence across multiple regions.</p>
            </motion.div>

            {/* Education Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <GraduationCap className="text-brand-primary" size={24} />
                <h3 className="text-xl font-display font-bold text-text-main uppercase tracking-widest">Education</h3>
              </div>
              {EDUCATION.map((edu, idx) => (
                <motion.div 
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="pl-10 relative border-l border-border-main pb-4"
                >
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-primary" />
                  <h4 className="text-lg font-bold text-text-main">{edu.degree}</h4>
                  <p className="text-brand-primary/80 text-xs font-semibold uppercase tracking-wider mb-1">{edu.institution}</p>
                  <span className="text-[10px] text-text-main/40 uppercase tracking-widest">{edu.period}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-4 mb-12">
              <Briefcase className="text-brand-primary" size={24} />
              <h3 className="text-xl font-display font-bold text-text-main uppercase tracking-widest">Professional Journey</h3>
            </div>
            
            <div className="space-y-12">
              {EXPERIENCE.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-text-main group-hover:text-brand-primary transition-colors">{exp.role}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                            {exp.company}
                          </span>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 rounded-full border border-border-main bg-text-main/5 text-[10px] font-bold uppercase tracking-widest text-text-main/40">{exp.period}</span>
                    </div>

                    <ul className="space-y-4">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="flex gap-4 group/item">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0 group-hover/item:scale-150 transition-transform" />
                          <p className="text-text-main/60 font-light text-sm leading-relaxed">{desc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

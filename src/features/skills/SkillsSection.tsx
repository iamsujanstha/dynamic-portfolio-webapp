/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SKILLS } from '@/src/core';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-32 px-6 md:px-12 bg-text-main/5">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold italic text-text-main uppercase">Expertise</h2>
            <p className="text-text-main/40 mt-4 font-light max-w-md">
              A comprehensive toolkit honed through years of professional development and continuous learning.
            </p>
          </div>
          <div className="flex gap-4">
            {['frontend', 'backend', 'tools'].map((cat) => (
              <span key={cat} className="px-4 py-2 bg-text-main/5 border border-border-main rounded-full text-[10px] uppercase tracking-widest font-bold text-text-main/40">
                {cat}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SKILLS.map((skill, index) => {
            const IconComponent = (Icons as any)[skill.icon] || Icons.Circle;
            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                whileHover={{ y: -5 }}
                transition={{ 
                  delay: (index % 4) * 0.1,
                  duration: 0.5,
                  y: { type: 'spring', stiffness: 300 }
                }}
                className="group p-6 glass-card rounded-2xl hover:bg-brand-primary/[0.05] transition-all duration-300 border border-border-main hover:border-brand-primary/20"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 rounded-xl bg-text-main/5 flex items-center justify-center text-brand-primary"
                  >
                    <IconComponent size={20} />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-bold text-text-main tracking-tight">{skill.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-text-main/30 font-medium">{skill.category}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

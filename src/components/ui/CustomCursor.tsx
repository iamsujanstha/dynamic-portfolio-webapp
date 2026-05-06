/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const cursorX = useSpring(0, { damping: 20, stiffness: 200 });
  const cursorY = useSpring(0, { damping: 20, stiffness: 200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
      }}
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-brand-primary pointer-events-none z-50 mix-blend-difference hidden md:block"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-brand-primary rounded-full" />
    </motion.div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PropsWithChildren } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: boolean;
}

export const Card = ({ children, className, hoverEffect = true, ...props }: PropsWithChildren<CardProps>) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
      className={cn(
        'glass-card rounded-2xl overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

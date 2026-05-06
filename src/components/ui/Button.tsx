/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-bg-dark disabled:opacity-50 disabled:pointer-events-none active:scale-95';

    const variants = {
      primary: 'bg-brand-primary text-white dark:text-black hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      secondary: 'bg-brand-secondary text-white dark:text-black hover:bg-brand-secondary/90 shadow-[0_0_20px_rgba(52,211,153,0.2)]',
      outline: 'border border-border-main bg-text-main/5 hover:bg-text-main/10 hover:border-text-main/40',
      ghost: 'hover:bg-text-main/5 text-text-main/70 hover:text-text-main',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

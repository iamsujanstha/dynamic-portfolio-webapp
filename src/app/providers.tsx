'use client';

import { SessionProvider } from 'next-auth/react';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/src/providers/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HelmetProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </HelmetProvider>
    </SessionProvider>
  );
}

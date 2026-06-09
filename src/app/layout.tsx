import React from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import '../index.css';
import { Providers } from './providers';
import { validateSystemIdentity } from '@/lib/security';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Sujan Shrestha | Senior Frontend Engineer',
  description: 'Portfolio of Sujan Shrestha - Senior Frontend Engineer specializing in React, TypeScript, and high-performance web applications.',
  keywords: ['Sujan Shrestha', 'Frontend Engineer', 'React Developer', 'TypeScript', 'Web Accessibility', 'NX Monorepo'],
  openGraph: {
    title: 'Sujan Shrestha | Senior Frontend Engineer',
    description: 'Architecture-focused developer crafting high-performance digital experiences.',
    url: 'https://sujankshrestha.com.np',
    siteName: 'Sujan Shrestha Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sujan Shrestha | Senior Frontend Engineer',
    description: 'Architecture-focused developer crafting high-performance digital experiences.',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isVerified = validateSystemIdentity();

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      {/* If identity is not verified, the entire site is visually broken */}
      <body className={!isVerified ? 'grayscale sepia contrast-125 brightness-75 blur-[1px] cursor-not-allowed selection:bg-red-900 selection:text-white' : ''}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

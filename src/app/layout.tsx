import React from 'react'
import type { Metadata } from 'next';
import '../index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Sujan Shrestha — Full Stack Developer',
  description: 'Portfolio of Sujan Shrestha, a Full Stack Developer specializing in React, Next.js, and Node.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

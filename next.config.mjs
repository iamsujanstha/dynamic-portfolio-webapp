/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js to use src/ as the root for app/, pages/, and middleware.ts
  // This is required since the project uses the src/ directory layout.
  experimental: {
    // No special flags needed for srcDir in Next.js 14 — it's auto-detected
    // when src/app/ exists. But we keep this object for future use.
  },
  // Expose server-side env vars explicitly (they are available by default on
  // the server, but listing them here makes the intent clear).
  // Public vars would need the NEXT_PUBLIC_ prefix.
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Disable x-powered-by header
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      }
    ],
  },
};

export default nextConfig;

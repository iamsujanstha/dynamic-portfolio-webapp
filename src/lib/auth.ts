/**
 * @module lib/auth
 * @description NextAuth configuration — defines authentication providers,
 *              session strategy, and authorization callbacks.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  AUTH FLOW (TOTP)                                          │
 * │                                                            │
 * │  1. User enters email on /auth/signin                      │
 * │  2. pre-signin API checks if email is allowed              │
 * │  3. User enters 6-digit TOTP code from authenticator app   │
 * │  4. NextAuth calls authorize() below                       │
 * │  5. authorize() fetches the encrypted TOTP secret          │
 * │     • Bootstrap admin → from TOTP_SECRET env var           │
 * │     • DB user → from user.totpSecret (AES-256-GCM)        │
 * │  6. Decrypts secret → verifies token via otplib            │
 * │  7. Returns user object → JWT session created              │
 * │                                                            │
 * │  DUAL PROVIDER SUPPORT                                     │
 * │  • CredentialsProvider: Admin login with email + TOTP      │
 * │  • GoogleProvider: Guest/viewer login via OAuth             │
 * └─────────────────────────────────────────────────────────────┘
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/src/lib/db/mongodb';
import User, { UserRole } from '@/src/models/User';
import { verifyToken, decryptSecret } from '@/src/lib/totp';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        code: { label: 'Authenticator Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        try {
          await dbConnect();

          // ── Identify the User ─────────────────────────────────
          const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const envAdminUser = process.env.ADMIN_USERNAME || 'admin';

          let isBootstrap = false;
          if (credentials.email === envAdminEmail || credentials.email === envAdminUser) {
            isBootstrap = true;
          }

          // Build the authenticated user object
          const dbUser = await User.findOne({ email: credentials.email });
          let authenticatedUser = null;

          if (dbUser) {
            authenticatedUser = {
              id: dbUser._id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
            };
          } else if (isBootstrap) {
            authenticatedUser = {
              id: 'admin-bootstrap',
              name: 'System Admin',
              email: envAdminEmail,
              role: UserRole.ADMIN,
            };
          }

          if (!authenticatedUser) {
            return null;
          }

          // ── Verify TOTP Token ─────────────────────────────────
          let secret: string;

          if (isBootstrap) {
            // Bootstrap admin: plaintext secret from environment
            secret = process.env.TOTP_SECRET || '';
          } else {
            // DB user: fetch encrypted secret and decrypt
            const userWithSecret = await User.findOne({ email: credentials.email })
              .select('+totpSecret');
            secret = userWithSecret?.totpSecret
              ? decryptSecret(userWithSecret.totpSecret)
              : '';
          }

          if (!secret || !(await verifyToken(credentials.code, secret))) {
            throw new Error('Invalid authenticator code');
          }

          return authenticatedUser;
        } catch (error) {
          console.error('[Auth] Error during authorize:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();

        // Check if user exists
        let dbUser = await User.findOne({ email: user.email });

        // If not, create them with VIEWER role
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name || profile?.name || 'Google User',
            email: user.email,
            image: user.image,
            role: UserRole.VIEWER,
          });
        }

        // Attach role to the user object that gets passed to jwt callback
        user.role = dbUser.role;
        user.id = dbUser._id.toString();

        return true;
      }
      return true; // allow credentials sign in
    },
    async jwt({ token, user }) {
      // User is only passed on the initial sign in
      if (user) {
        token.role = user.role || UserRole.VIEWER;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

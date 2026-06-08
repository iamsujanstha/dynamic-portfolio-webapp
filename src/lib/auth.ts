import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/src/lib/db/mongodb';
import User, { UserRole } from '@/src/models/User';
import VerificationCode from '@/src/models/VerificationCode';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
        code: { label: "Verification Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          await dbConnect();
          console.log('Auth: DB connected successfully');

          // Normalize target email for bootstrap admin check
          const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
          const envAdminPass = process.env.ADMIN_PASSWORD || 'password123';

          let lookupEmail = credentials.email;
          let isBootstrap = false;
          if (
            (credentials.email === envAdminEmail || credentials.email === envAdminUser) &&
            credentials.password === envAdminPass
          ) {
            isBootstrap = true;
            lookupEmail = envAdminEmail;
          }

          // 1. Database Lookup (Primary)
          const user = await User.findOne({ email: credentials.email }).select('+password');
          console.log('Auth: User lookup result:', user ? 'User found' : 'User not found');

          let authenticatedUser = null;

          if (user) {
            const isMatch = await bcrypt.compare(credentials.password, user.password || '');
            if (isMatch) {
              authenticatedUser = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role
              };
            }
          }

          // 2. Check for Bootstrap Admin (Fallback)
          if (!authenticatedUser && isBootstrap) {
            authenticatedUser = {
              id: 'admin-bootstrap',
              name: 'System Admin',
              email: envAdminEmail,
              role: UserRole.ADMIN
            };
          }

          if (!authenticatedUser) {
            return null;
          }

          // Check if verification code is required (only for admins)
          if (authenticatedUser.role === UserRole.ADMIN) {
            if (!credentials.code) {
              throw new Error('Verification code is required');
            }

            // Find matching code in DB
            const codeRecord = await VerificationCode.findOne({
              email: lookupEmail,
              code: credentials.code
            });

            if (!codeRecord) {
              throw new Error('Invalid or expired verification code');
            }

            // Verify if expired manually as safety (10 minutes)
            const isExpired = Date.now() - codeRecord.createdAt.getTime() > 10 * 60 * 1000;
            if (isExpired) {
              await VerificationCode.deleteOne({ _id: codeRecord._id });
              throw new Error('Verification code has expired');
            }

            // Delete the used code
            await VerificationCode.deleteOne({ _id: codeRecord._id });
          }

          return authenticatedUser;
        } catch (error) {
          console.error('Auth: Error during authorize:', error);
          throw error;
        }
      }
    })
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
            role: UserRole.VIEWER
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

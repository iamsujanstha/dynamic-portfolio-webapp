import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/src/lib/db/mongodb';
import User, { UserRole } from '@/src/models/User';
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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Check for Bootstrap Admin (from .env)
        // This allows initial login before the DB is seeded
        const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
        const envAdminPass = process.env.ADMIN_PASSWORD || 'password123';

        if (
          (credentials.email === envAdminEmail || credentials.email === envAdminUser) && 
          credentials.password === envAdminPass
        ) {
          return {
            id: 'admin-bootstrap',
            name: 'System Admin',
            email: envAdminEmail,
            role: UserRole.ADMIN
          };
        }

        await dbConnect();

        // 2. Database Lookup
        // Find user by email and explicitly select password
        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) return null;

        const isMatch = await bcrypt.compare(credentials.password, user.password || '');
        if (isMatch) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          };
        }

        return null;
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

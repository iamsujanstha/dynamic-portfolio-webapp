import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import dbConnect from '@/lib/db/mongodb';
import User, { UserRole } from '@/models/User';

// Staff Engineer Tip: Separation of concerns. 
// We define authOptions separately for use in middleware or components.
export const authOptions: NextAuthOptions = {
  // Use MongoDB adapter to persist users and sessions
  adapter: MongoDBAdapter(
    // We pass the promise directly as expected by the adapter
    (async () => {
      const db = await dbConnect();
      return db.connection.getClient();
    })() as any
  ),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Look up user role from DB if not in token
        await dbConnect();
        const dbUser = await (User as any).findOne({ email: user.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page for better branding
  },
  // CRITICAL for AI Studio: Iframe cookie settings
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

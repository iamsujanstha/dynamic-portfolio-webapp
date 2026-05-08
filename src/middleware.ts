import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === 'ADMIN';

    // Authenticated user trying to access /admin but not an ADMIN → redirect
    if (req.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Allow the request through
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true = allow the middleware function to run.
      // Return false = redirect to signIn page (set in authOptions.pages).
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Only protect /admin routes — do NOT add /auth/* here or you'll get loops.
  matcher: ['/admin/:path*'],
};

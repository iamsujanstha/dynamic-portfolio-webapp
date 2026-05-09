import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = String(token?.role || '').toLowerCase();
    const isAuthorized = role === 'admin' || role === 'viewer';

    // Allow both Admin and Viewer to access CMS, but block others
    if (req.nextUrl.pathname.startsWith('/admin') && !isAuthorized) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

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

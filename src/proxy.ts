import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/quizathon(.*)', 
  '/libraries(.*)',
  '/api/trpc/(.*)'
]);

const isWebhookRoute = createRouteMatcher(['/api/users/webhook(.*)']);
const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  if (userId && (isAuthPage(req) || req.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
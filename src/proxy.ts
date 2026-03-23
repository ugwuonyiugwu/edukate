import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Protected and Public routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isWebhookRoute = createRouteMatcher(['/api/users/webhook(.*)']); // Add this

export default clerkMiddleware(async (auth, req) => {
  // 2. If it's the webhook, do NOTHING. Let the route handler take over.
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  // 3. Protect only the specific routes defined above
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 4. Redirect logged-in users away from auth pages
  const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
  if (userId && isAuthPage(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
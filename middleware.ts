import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isSignInRoute = createRouteMatcher(["/sign-in(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

/** Public sign-up flows under `/sign-up`, excluding Clerk task URLs we handle ourselves. */
function isPublicSignUpRoute(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/sign-up")) return false;
  if (path.startsWith("/sign-up/tasks")) return false;
  return true;
}

export default clerkMiddleware(async (auth, req) => {
  if (isSignInRoute(req) || isPublicSignUpRoute(req)) return;

  await auth.protect();

  const { userId, orgId } = await auth();
  if (userId && !orgId && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

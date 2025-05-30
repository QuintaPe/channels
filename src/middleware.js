import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { redirect } from "astro";

const isProtectedRoute = createRouteMatcher(["/"]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { userId, redirectToSignIn } = auth();
  
  if (isProtectedRoute(context.request) && !userId) {
    return context.redirect("/live");
  }
});
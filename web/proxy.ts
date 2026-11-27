import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "./lib/token-cookie";

// Optimistic check before a protected page renders: no cookie means not logged in.
// It does not verify the token. The API does that on every call (see lib/auth.ts).
export function proxy(request: NextRequest) {
  if (!request.cookies.has(TOKEN_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/profile"],
};

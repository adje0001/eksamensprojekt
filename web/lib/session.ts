import "server-only";
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./token-cookie";

// The JWT from the API lives in an httpOnly cookie: JavaScript in the browser cannot read it,
// so an XSS bug cannot steal it. sameSite "lax" stops other sites from sending it with forms.

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

// Only callable from a Server Action (Next.js cannot set cookies while rendering a page)
export async function setToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // same lifetime as the JWT itself (1 hour)
  });
}

export async function clearToken() {
  (await cookies()).delete(TOKEN_COOKIE);
}

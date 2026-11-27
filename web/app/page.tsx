import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "./actions";
import { buttonClass, cardClass } from "./ui/field";

// Start page. Needs login: proxy.ts redirects when there is no cookie, and
// getCurrentUser() redirects when the API rejects the token.
export default function Home() {
  return (
    <main className={cardClass}>
      <h1 className="text-2xl font-semibold">Chat app</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Welcome />
      </Suspense>
    </main>
  );
}

async function Welcome() {
  const user = await getCurrentUser();
  return (
    <>
      <p>
        Logged in as {user.firstName} {user.lastName}
      </p>
      <Link href="/profile" className="underline">
        Edit profile
      </Link>
      <form action={logout}>
        <button type="submit" className={buttonClass}>
          Log out
        </button>
      </form>
    </>
  );
}

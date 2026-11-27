import Link from "next/link";
import { Suspense } from "react";
import { cardClass, FormMessage } from "../ui/field";
import { LoginForm } from "./login-form";

// searchParams is request data, so the notice that reads it sits behind <Suspense>
// (required with cacheComponents). The rest of the page is prerendered.
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className={cardClass}>
      <h1 className="text-2xl font-semibold">Log in</h1>
      <Suspense>
        <Notice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
      <p className="text-sm">
        No account yet?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}

async function Notice({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  if (params.created) return <FormMessage message="Account created. Please log in." />;
  if (params.deleted) return <FormMessage message="Your account has been deleted." />;
  return null;
}

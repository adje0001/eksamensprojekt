import Link from "next/link";
import { cardClass } from "../ui/field";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className={cardClass}>
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <SignupForm />
      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { cardClass } from "../ui/field";
import { DeleteAccountButton, ProfileForm } from "./profile-form";

export default function ProfilePage() {
  return (
    <main className={cardClass}>
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Profile />
      </Suspense>
      <Link href="/" className="text-sm underline">
        Back
      </Link>
    </main>
  );
}

async function Profile() {
  const user = await getCurrentUser();
  return (
    <>
      <ProfileForm user={user} />
      <DeleteAccountButton />
    </>
  );
}

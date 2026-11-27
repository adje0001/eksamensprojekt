"use client";

import { useActionState } from "react";
import type { CurrentUser } from "@/lib/auth";
import { deleteAccount, updateProfile, type FormState } from "../actions";
import { buttonClass, Field, FormMessage } from "../ui/field";

export function ProfileForm({ user }: { user: CurrentUser }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfile, {});
  // After a submit, show what was sent. Before that, show the current profile.
  const values = state.values ?? user;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field label="First name" name="firstName" defaultValue={values.firstName} autoComplete="given-name" />
      <Field label="Last name" name="lastName" defaultValue={values.lastName} autoComplete="family-name" />
      <Field label="Email" name="email" type="email" defaultValue={values.email} autoComplete="email" />
      <FormMessage error={state.error} message={state.message} />
      <button type="submit" disabled={pending} className={buttonClass}>
        Save changes
      </button>
    </form>
  );
}

export function DeleteAccountButton() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(deleteAccount, {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // A last check, because deleting cannot be undone
        if (!window.confirm("Delete your account? This cannot be undone.")) event.preventDefault();
      }}
    >
      <FormMessage error={state.error} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-red-600 px-4 py-2 font-medium text-red-600 disabled:opacity-50"
      >
        Delete account
      </button>
    </form>
  );
}

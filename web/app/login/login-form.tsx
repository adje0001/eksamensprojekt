"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";
import { buttonClass, Field, FormMessage } from "../ui/field";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field label="Email" name="email" type="email" defaultValue={state.values?.email} autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      <FormMessage error={state.error} />
      <button type="submit" disabled={pending} className={buttonClass}>
        Log in
      </button>
    </form>
  );
}

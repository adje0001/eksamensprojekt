"use client";

import { useActionState } from "react";
import { signup, type FormState } from "../actions";
import { buttonClass, Field, FormMessage } from "../ui/field";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(signup, {});
  const values = state.values ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field label="First name" name="firstName" defaultValue={values.firstName} autoComplete="given-name" />
      <Field label="Last name" name="lastName" defaultValue={values.lastName} autoComplete="family-name" />
      <Field label="Email" name="email" type="email" defaultValue={values.email} autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" />
      <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
      <FormMessage error={state.error} />
      <button type="submit" disabled={pending} className={buttonClass}>
        Sign up
      </button>
    </form>
  );
}

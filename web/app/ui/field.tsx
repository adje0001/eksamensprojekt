// A labelled input, used by every form. The label's htmlFor links it to the input,
// which screen readers need (and which the E2E tests use to find fields).
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required
        className="rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
    </div>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error)
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  if (message)
    return (
      <p aria-live="polite" className="text-sm text-green-700">
        {message}
      </p>
    );
  return null;
}

export const buttonClass =
  "rounded bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";

export const cardClass = "mx-auto flex w-full max-w-sm flex-col gap-4 p-8";

"use client";

import { useFormStatus } from "react-dom";
import { callAgainAction } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-medium px-2.5 py-1 rounded-full border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? "Calling…" : "Call again"}
    </button>
  );
}

export default function CallAgainButton({ reminderId }: { reminderId: string }) {
  return (
    <form action={callAgainAction}>
      <input type="hidden" name="reminderId" value={reminderId} />
      <SubmitButton />
    </form>
  );
}

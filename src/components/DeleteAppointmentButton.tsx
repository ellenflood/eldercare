"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAppointmentAction } from "@/lib/actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? "Deleting…" : "Confirm delete"}
    </button>
  );
}

export default function DeleteAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-muted-foreground">Are you sure?</span>
      <form action={deleteAppointmentAction}>
        <input type="hidden" name="id" value={appointmentId} />
        <ConfirmButton />
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-muted-foreground hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}

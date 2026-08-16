import Link from "next/link";
import { Card, CardTitle } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { createPrescriptionAction, deletePrescriptionAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { getPrescriptions, getReminders } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function PrescriptionsPage() {
  const prescriptions = getPrescriptions();
  const reminders = getReminders();

  function doseHistory(prescriptionId: string) {
    return reminders
      .filter((r) => r.relatedType === "Prescription" && r.relatedId === prescriptionId)
      .sort((a, b) => b.dueTime.localeCompare(a.dueTime));
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Prescriptions</h1>

      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <Card key={rx.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/parent/prescriptions/${rx.id}`} className="font-medium hover:underline">
                  {rx.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rx.specialty} · {rx.dosage}
                  {rx.dosageUnit} · {rx.frequency} · since {formatDate(rx.startDate)}
                </p>
              </div>
              <form action={deletePrescriptionAction}>
                <input type="hidden" name="id" value={rx.id} />
                <button className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0">Delete</button>
              </form>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Recent doses</p>
              <ul className="space-y-1.5">
                {doseHistory(rx.id).slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{formatDate(r.dueTime)}</span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Add a prescription</CardTitle>
        <form action={createPrescriptionAction} className="grid sm:grid-cols-2 gap-3">
          <input name="name" placeholder="Medicine name" required className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          <input name="specialty" placeholder="Prescribing specialty" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          <input name="dosage" type="number" min={1} placeholder="Dosage" required className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          <input name="dosageUnit" placeholder="Unit (mg, ml...)" required className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          <select name="frequency" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button className="sm:col-span-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
            Add prescription
          </button>
        </form>
      </Card>
    </div>
  );
}

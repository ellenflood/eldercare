import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { deletePrescriptionAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { getPrescription, getReminders } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PrescriptionDetailPage({ params }: PageProps<"/parent/prescriptions/[id]">) {
  const { id } = await params;
  const prescription = getPrescription(id);
  if (!prescription) notFound();

  const doseHistory = getReminders()
    .filter((r) => r.relatedType === "Prescription" && r.relatedId === prescription.id)
    .sort((a, b) => b.dueTime.localeCompare(a.dueTime));

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
      <Link href="/parent/prescriptions" className="text-sm text-black/40 hover:underline">
        ← Back to prescriptions
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{prescription.name}</h1>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">{prescription.specialty}</p>
          </div>
          <form action={deletePrescriptionAction}>
            <input type="hidden" name="id" value={prescription.id} />
            <button className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0">Delete</button>
          </form>
        </div>

        <dl className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div>
            <dt className="text-black/40 dark:text-white/40">Dosage</dt>
            <dd className="font-medium">
              {prescription.dosage}
              {prescription.dosageUnit}
            </dd>
          </div>
          <div>
            <dt className="text-black/40 dark:text-white/40">Frequency</dt>
            <dd className="font-medium capitalize">{prescription.frequency}</dd>
          </div>
          <div>
            <dt className="text-black/40 dark:text-white/40">Start date</dt>
            <dd className="font-medium">{formatDate(prescription.startDate)}</dd>
          </div>
          <div>
            <dt className="text-black/40 dark:text-white/40">End date</dt>
            <dd className="font-medium">{prescription.endDate ? formatDate(prescription.endDate) : "Ongoing"}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-medium">Dose history</h2>
        <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">
          Every scheduled dose and whether it was confirmed taken.
        </p>

        {doseHistory.length === 0 ? (
          <p className="text-sm text-black/40 dark:text-white/40 py-6 text-center">No doses recorded yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10 mt-3">
            {doseHistory.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                <span className="text-sm">{formatDate(r.dueTime)}</span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

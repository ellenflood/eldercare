import Link from "next/link";
import { Card, CardTitle } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import DeleteAppointmentButton from "@/components/DeleteAppointmentButton";
import { createAppointmentAction } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";
import { getAppointments } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AppointmentsPage() {
  const appointments = getAppointments();

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>

      <Card>
        <ul className="divide-y divide-border">
          {appointments.map((a) => (
            <li key={a.id} className="py-3 flex items-center justify-between gap-3">
              <Link href={`/parent/appointments/${a.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.provider} · {formatDateTime(a.appointmentTime)}
                </p>
              </Link>
              <StatusBadge status={a.status} />
              <DeleteAppointmentButton appointmentId={a.id} />
            </li>
          ))}
          {appointments.length === 0 && (
            <li className="py-6 text-sm text-muted-foreground text-center">No appointments yet.</li>
          )}
        </ul>
      </Card>

      <Card>
        <CardTitle>Add an appointment</CardTitle>
        <form action={createAppointmentAction} className="grid sm:grid-cols-2 gap-3">
          <input name="name" placeholder="Appointment name" required className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2" />
          <input name="specialty" placeholder="Specialty" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          <input name="provider" placeholder="Provider" required className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm" />
          <input name="location" placeholder="Location" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2" />
          <input name="appointmentTime" type="datetime-local" required className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm sm:col-span-2" />
          <button className="sm:col-span-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
            Add appointment
          </button>
        </form>
      </Card>
    </div>
  );
}

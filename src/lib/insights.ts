import type { Appointment, Prescription, Reminder } from "@/lib/types";
import type { WearableAssessment } from "@/lib/wearable";

export function nextUpcomingAppointment(appointments: Appointment[], now: Date = new Date()): Appointment | undefined {
  return appointments
    .filter((a) => a.status === "Pending" && new Date(a.appointmentTime) >= now)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))[0];
}

export interface RefillDue {
  prescription: Prescription;
  dueTime: string;
}

/** Prescriptions with an unanswered dose reminder due in the next 7 days (excludes already-overdue doses, which surface as alerts instead). */
export function refillsDueThisWeek(
  prescriptions: Prescription[],
  reminders: Reminder[],
  now: Date = new Date(),
): RefillDue[] {
  const weekFromNow = new Date(now.getTime() + 7 * 86_400_000);
  const nextDueByPrescription = new Map<string, string>();

  for (const reminder of reminders) {
    if (reminder.relatedType !== "Prescription" || !reminder.relatedId) continue;
    if (reminder.status === "Answered") continue;
    const due = new Date(reminder.dueTime);
    if (due < now || due > weekFromNow) continue;
    const existing = nextDueByPrescription.get(reminder.relatedId);
    if (!existing || reminder.dueTime < existing) {
      nextDueByPrescription.set(reminder.relatedId, reminder.dueTime);
    }
  }

  return prescriptions
    .filter((p) => nextDueByPrescription.has(p.id))
    .map((p) => ({ prescription: p, dueTime: nextDueByPrescription.get(p.id)! }))
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
}

export function todayDoseAdherence(reminders: Reminder[], now: Date = new Date()): { taken: number; total: number } {
  const todayKey = now.toDateString();
  const todaysDoses = reminders.filter(
    (r) => r.relatedType === "Prescription" && new Date(r.dueTime).toDateString() === todayKey,
  );
  return { taken: todaysDoses.filter((r) => r.status === "Answered").length, total: todaysDoses.length };
}

export function combineWearableStatus(...assessments: WearableAssessment[]): WearableAssessment {
  const warning = assessments.find((a) => a.status === "warning");
  if (warning) return warning;
  return { status: "ok", message: "All wearable readings look normal." };
}

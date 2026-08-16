import parentsSeed from "@/mocks/parents.json";
import childrenSeed from "@/mocks/children.json";
import devicesSeed from "@/mocks/devices.json";
import deviceLogsSeed from "@/mocks/deviceLogs.json";
import documentsSeed from "@/mocks/documents.json";
import appointmentsSeed from "@/mocks/appointments.json";
import remindersSeed from "@/mocks/reminders.json";
import prescriptionsSeed from "@/mocks/prescriptions.json";
import type {
  Alert,
  AppDocument,
  Appointment,
  Child,
  Device,
  DeviceLog,
  EldercareData,
  Parent,
  Prescription,
  Reminder,
} from "@/lib/types";

function cloneSeed(): EldercareData {
  return {
    parents: structuredClone(parentsSeed) as Parent[],
    children: structuredClone(childrenSeed) as Child[],
    devices: structuredClone(devicesSeed) as Device[],
    deviceLogs: structuredClone(deviceLogsSeed) as DeviceLog[],
    documents: structuredClone(documentsSeed) as AppDocument[],
    appointments: structuredClone(appointmentsSeed) as Appointment[],
    reminders: structuredClone(remindersSeed) as Reminder[],
    prescriptions: structuredClone(prescriptionsSeed) as Prescription[],
    alerts: [],
  };
}

declare global {
  var __eldercareStore: EldercareData | undefined;
}

function getStore(): EldercareData {
  if (!globalThis.__eldercareStore) {
    globalThis.__eldercareStore = cloneSeed();
  }
  return globalThis.__eldercareStore;
}

export function resetStore(): void {
  globalThis.__eldercareStore = cloneSeed();
}

// --- Reads -----------------------------------------------------------------

export function getParent(): Parent {
  return getStore().parents[0];
}

export function getChild(): Child {
  return getStore().children[0];
}

export function getDevices(): Device[] {
  return getStore().devices;
}

export function getDeviceLogs(): DeviceLog[] {
  return [...getStore().deviceLogs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getDocuments(): AppDocument[] {
  return [...getStore().documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDocumentsForAppointment(appointmentId: string): AppDocument[] {
  return getStore()
    .documents.filter((d) => d.appointmentId === appointmentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDocument(id: string): AppDocument | undefined {
  return getStore().documents.find((d) => d.id === id);
}

export function getAppointments(): Appointment[] {
  return [...getStore().appointments].sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
}

export function getAppointment(id: string): Appointment | undefined {
  return getStore().appointments.find((a) => a.id === id);
}

export function getReminders(): Reminder[] {
  return [...getStore().reminders].sort((a, b) => a.dueTime.localeCompare(b.dueTime));
}

export function getReminder(id: string): Reminder | undefined {
  return getStore().reminders.find((r) => r.id === id);
}

export function getPrescriptions(): Prescription[] {
  return getStore().prescriptions;
}

export function getPrescription(id: string): Prescription | undefined {
  return getStore().prescriptions.find((p) => p.id === id);
}

/**
 * Alerts are derived, not stored: they're recomputed from the current
 * reminder/prescription state on every read. This is what makes the alerts
 * feed reactive during a live demo (mark a dose taken, or have the Twilio
 * webhook answer a call reminder, and the corresponding alert disappears on
 * the next render) while still guaranteeing the two alerts required by the
 * spec are present at t=0, since the seeded reminders already violate the
 * rules below.
 *
 * Severity table (per PRD): daily medicine missed = 3, weekly medicine
 * missed = 2, appointment missed = 5, unanswered urgent-care call = 5.
 * A missed general (non-appointment) call reminder isn't in that table;
 * severity 4 is this build's documented judgment call for that case.
 *
 * A CheckIn reminder answered with responseValue 0 ("urgent help needed")
 * raises severity-5 alert immediately, regardless of due time or status —
 * unlike the other rules here, this isn't about a *missed* reminder, it's
 * the parent actively flagging distress, so it can't wait for the standard
 * missed/unanswered check below.
 */
export function getAlerts(now: Date = new Date()): Alert[] {
  const store = getStore();
  const child = store.children[0];
  const nowIso = now.toISOString();
  const alerts: Alert[] = [];

  for (const reminder of store.reminders) {
    if (reminder.type === "CheckIn" && reminder.responseValue === 0) {
      alerts.push({
        id: `alert-${reminder.id}-urgent`,
        childId: child.id,
        type: "Reminder",
        name: `Urgent: ${reminder.name} — parent asked for help`,
        severity: 5,
        sourceType: "Reminder",
        sourceId: reminder.id,
        reminderId: reminder.id,
        createdAt: reminder.updatedAt,
        updatedAt: nowIso,
      });
      continue;
    }

    if (reminder.dueTime >= nowIso) continue;
    if (reminder.status === "Answered") continue;

    if (reminder.relatedType === "Prescription") {
      const prescription = store.prescriptions.find((p) => p.id === reminder.relatedId);
      const severity = prescription?.frequency === "weekly" ? 2 : prescription?.frequency === "monthly" ? 1 : 3;
      const label = reminder.status === "Deferred" ? "Dose deferred" : "Missed dose";
      alerts.push({
        id: `alert-${reminder.id}`,
        childId: child.id,
        type: "Prescriptions",
        name: `${label}: ${reminder.name}`,
        severity,
        sourceType: "Prescription",
        sourceId: prescription?.id ?? reminder.id,
        reminderId: reminder.id,
        createdAt: reminder.dueTime,
        updatedAt: nowIso,
      });
      continue;
    }

    const severity = reminder.relatedType === "Appointment" ? 5 : 4;
    alerts.push({
      id: `alert-${reminder.id}`,
      childId: child.id,
      type: "Reminder",
      name: `Missed call: ${reminder.name}`,
      severity,
      sourceType: "Reminder",
      sourceId: reminder.id,
      reminderId: reminder.id,
      createdAt: reminder.dueTime,
      updatedAt: nowIso,
    });
  }

  return alerts.sort((a, b) => b.severity - a.severity || b.createdAt.localeCompare(a.createdAt));
}

// --- Mutations ---------------------------------------------------------------

/**
 * Re-arms a Reminder as "just contacted again, awaiting a response" — pushes
 * its due time a few minutes out and resets status to Not Answered. This is
 * what clears a missed-dose/missed-call alert immediately when the child
 * clicks "Call again": it's not claiming the parent answered, only that a
 * fresh attempt is in flight, so the alert legitimately reappears if that
 * attempt also goes unanswered past the new window.
 */
export function placeFollowUpCall(reminderId: string): Reminder | undefined {
  const store = getStore();
  const reminder = store.reminders.find((r) => r.id === reminderId);
  if (!reminder) return undefined;
  const now = new Date();
  reminder.status = "Not Answered";
  reminder.dueTime = new Date(now.getTime() + 5 * 60_000).toISOString();
  reminder.updatedAt = now.toISOString();
  return reminder;
}

export function setReminderStatus(reminderId: string, status: Reminder["status"]): Reminder | undefined {
  const store = getStore();
  const reminder = store.reminders.find((r) => r.id === reminderId);
  if (!reminder) return undefined;
  reminder.status = status;
  reminder.updatedAt = new Date().toISOString();
  return reminder;
}

export function addPrescription(input: Omit<Prescription, "id" | "createdAt" | "updatedAt" | "parentId">): Prescription {
  const store = getStore();
  const now = new Date().toISOString();
  const prescription: Prescription = {
    ...input,
    id: `rx-${crypto.randomUUID()}`,
    parentId: store.parents[0].id,
    createdAt: now,
    updatedAt: now,
  };
  store.prescriptions.push(prescription);
  return prescription;
}

export function deletePrescription(id: string): void {
  const store = getStore();
  store.prescriptions = store.prescriptions.filter((p) => p.id !== id);
  store.reminders = store.reminders.filter((r) => !(r.relatedType === "Prescription" && r.relatedId === id));
}

export function addDocument(input: Omit<AppDocument, "id" | "createdAt" | "updatedAt" | "parentId">): AppDocument {
  const store = getStore();
  const now = new Date().toISOString();
  const document: AppDocument = {
    ...input,
    id: `doc-${crypto.randomUUID()}`,
    parentId: store.parents[0].id,
    createdAt: now,
    updatedAt: now,
  };
  store.documents.push(document);
  return document;
}

export function updateAppointmentStatus(id: string, status: Appointment["status"]): Appointment | undefined {
  const store = getStore();
  const appointment = store.appointments.find((a) => a.id === id);
  if (!appointment) return undefined;
  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  return appointment;
}

export function addAppointment(input: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "parentId" | "status">): Appointment {
  const store = getStore();
  const now = new Date().toISOString();
  const appointment: Appointment = {
    ...input,
    id: `appt-${crypto.randomUUID()}`,
    parentId: store.parents[0].id,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  };
  store.appointments.push(appointment);
  return appointment;
}

export function deleteAppointment(id: string): void {
  const store = getStore();
  store.appointments = store.appointments.filter((a) => a.id !== id);
  store.reminders = store.reminders.filter((r) => !(r.relatedType === "Appointment" && r.relatedId === id));
  for (const document of store.documents) {
    if (document.appointmentId === id) {
      document.appointmentId = null;
      document.updatedAt = new Date().toISOString();
    }
  }
}

/**
 * Applies a Twilio DTMF response to whatever the reminder is linked to.
 * Valid digits are type-dependent — see ALLOWED_DIGITS in the webhook route,
 * which rejects anything outside these sets before this function is called:
 *
 * - CheckIn: 0 = urgent help needed, 1-5 = wellbeing scale (1 = not well,
 *   5 = great). Any of these means the call was answered; the scale value
 *   itself is stored on responseValue for getAlerts to act on.
 * - Prescriptions: 1 = took it (Answered), 2 = didn't take it (Rejected,
 *   which still surfaces as a missed-dose alert), 3 = will take it later
 *   (Deferred).
 * - Everything else (Appointments, Documents): unchanged legacy behavior —
 *   digit "2" = Rejected, anything else = Answered, and digit "1" on an
 *   appointment-linked reminder also marks that appointment Attended.
 */
export function applyVoiceResponse(reminderId: string, digit: string): Reminder | undefined {
  const store = getStore();
  const reminder = store.reminders.find((r) => r.id === reminderId);
  if (!reminder) return undefined;

  const now = new Date().toISOString();
  const numericValue = Number(digit);
  reminder.responseValue = Number.isFinite(numericValue) ? numericValue : null;
  reminder.updatedAt = now;

  if (reminder.type === "CheckIn") {
    reminder.status = "Answered";
    return reminder;
  }

  if (reminder.type === "Prescriptions") {
    if (digit === "1") reminder.status = "Answered";
    else if (digit === "2") reminder.status = "Rejected";
    else if (digit === "3") reminder.status = "Deferred";
    return reminder;
  }

  if (digit === "2") {
    reminder.status = "Rejected";
  } else {
    reminder.status = "Answered";
  }

  if (reminder.relatedType === "Appointment" && reminder.relatedId) {
    const appointment = store.appointments.find((a) => a.id === reminder.relatedId);
    if (appointment && digit === "1") {
      appointment.status = "Attended";
      appointment.updatedAt = now;
    }
  }

  return reminder;
}

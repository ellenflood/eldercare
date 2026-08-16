"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addAppointment,
  addDevice,
  addDocument,
  addPrescription,
  deleteAppointment,
  deleteDevice,
  deletePrescription,
  getParent,
  getReminder,
  placeFollowUpCall,
  setReminderStatus,
  updateAppointmentStatus,
} from "@/lib/store";
import type { DocumentType, PrescriptionFrequency } from "@/lib/types";
import { startStudioExecution } from "@/lib/twilio";

export async function markReminderAnswered(reminderId: string) {
  setReminderStatus(reminderId, "Answered");
  revalidatePath("/", "layout");
}

/**
 * "Call again" from the Child dashboard's alerts feed. For a CheckIn-type
 * reminder (the daily check-in call), this places a real outbound call by
 * starting a Twilio Studio Flow execution — see src/lib/twilio.ts. For every
 * other alert type, no real-call integration is in scope here (per PRD.md),
 * so it falls back to locally re-arming the reminder. If the Twilio request
 * fails (missing env vars, network error), it also falls back so the button
 * still does something visible during a demo — see server logs to tell the
 * two cases apart.
 */
export async function callAgainAction(formData: FormData) {
  const reminderId = String(formData.get("reminderId") ?? "");
  if (!reminderId) return;

  const reminder = getReminder(reminderId);
  if (!reminder) return;

  if (reminder.type === "CheckIn") {
    const parent = getParent();
    const result = await startStudioExecution(parent.phone, { reminderId });
    if (!result.ok) {
      console.error(`Twilio Studio call not placed for ${reminderId}, falling back to local re-arm: ${result.error}`);
    }
  }

  placeFollowUpCall(reminderId);
  revalidatePath("/child");
}

export async function createPrescriptionAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const dosage = Number(formData.get("dosage") ?? 0);
  const dosageUnit = String(formData.get("dosageUnit") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "daily") as PrescriptionFrequency;

  if (!name || !dosageUnit || !Number.isFinite(dosage) || dosage <= 0) {
    return;
  }

  addPrescription({
    name,
    specialty: specialty || "General",
    dosage,
    dosageUnit,
    frequency,
    startDate: new Date().toISOString(),
    endDate: null,
  });

  revalidatePath("/parent/prescriptions");
  revalidatePath("/parent");
}

export async function deletePrescriptionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  deletePrescription(id);
  revalidatePath("/parent/prescriptions");
  revalidatePath("/parent");
  revalidatePath("/child");
}

export async function uploadDocumentAction(formData: FormData) {
  const type = String(formData.get("type") ?? "Others") as DocumentType;
  const dueDate = String(formData.get("dueDate") ?? "");
  const file = formData.get("file");

  const name = file instanceof File && file.name ? file.name : String(formData.get("name") ?? "").trim();
  if (!name) return;

  addDocument({
    name,
    type,
    link: "#",
    dueDate: type === "Bill" && dueDate ? new Date(dueDate).toISOString() : null,
    appointmentId: null,
    content: null,
  });

  revalidatePath("/parent/documents");
  revalidatePath("/parent");
}

const WEARABLE_BRAND_MODELS: Record<string, string> = {
  Apple: "Apple Watch Series 9",
  Garmin: "Garmin Venu 3",
  Oura: "Oura Ring Gen 4",
  Fitbit: "Fitbit Charge 6",
};

export async function connectDeviceAction(formData: FormData) {
  const brand = String(formData.get("brand") ?? "");
  const model = WEARABLE_BRAND_MODELS[brand];
  if (!model) return;

  addDevice({ type: "Wearable", brand, model });
  revalidatePath("/parent/wearables");
  revalidatePath("/parent");
}

export async function disconnectDeviceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  deleteDevice(id);
  revalidatePath("/parent/wearables");
  revalidatePath("/parent");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as "Pending" | "Attended" | "Didn't attend";
  if (!id || !status) return;
  updateAppointmentStatus(id, status);
  revalidatePath("/parent/appointments");
  revalidatePath(`/parent/appointments/${id}`);
  revalidatePath("/parent");
}

export async function createAppointmentAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const appointmentTime = String(formData.get("appointmentTime") ?? "");

  if (!name || !provider || !appointmentTime) return;

  const parsedTime = new Date(appointmentTime);
  if (Number.isNaN(parsedTime.getTime())) return;

  addAppointment({
    name,
    specialty: specialty || "General",
    provider,
    location: location || "TBD",
    appointmentTime: parsedTime.toISOString(),
  });

  revalidatePath("/parent/appointments");
  revalidatePath("/parent/calendar");
  revalidatePath("/parent");
  revalidatePath("/child");
}

export async function deleteAppointmentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  deleteAppointment(id);
  revalidatePath("/parent/appointments");
  revalidatePath("/parent/calendar");
  revalidatePath("/parent");
  revalidatePath("/child");
}

export async function completeSignupAction(formData: FormData) {
  const parent = getParent();

  const name = String(formData.get("name") ?? "").trim();
  const age = Number(formData.get("age") ?? 0);
  const condition = String(formData.get("condition") ?? "").trim();

  if (name) parent.name = name;
  if (Number.isFinite(age) && age > 0) parent.age = age;
  if (condition) parent.condition = condition;
  parent.updatedAt = new Date().toISOString();

  const rxName = String(formData.get("rxName") ?? "").trim();
  const rxDosage = Number(formData.get("rxDosage") ?? 0);
  const rxUnit = String(formData.get("rxUnit") ?? "").trim();
  const rxFrequency = String(formData.get("rxFrequency") ?? "daily") as PrescriptionFrequency;

  if (rxName && rxUnit && Number.isFinite(rxDosage) && rxDosage > 0) {
    addPrescription({
      name: rxName,
      specialty: "General",
      dosage: rxDosage,
      dosageUnit: rxUnit,
      frequency: rxFrequency,
      startDate: new Date().toISOString(),
      endDate: null,
    });
  }

  revalidatePath("/parent");
  revalidatePath("/parent/prescriptions");
  redirect("/parent");
}

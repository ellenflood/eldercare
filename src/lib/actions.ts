"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addDocument,
  addPrescription,
  deletePrescription,
  getParent,
  setReminderStatus,
  updateAppointmentStatus,
} from "@/lib/store";
import type { DocumentType, PrescriptionFrequency } from "@/lib/types";

export async function markReminderAnswered(reminderId: string) {
  setReminderStatus(reminderId, "Answered");
  revalidatePath("/", "layout");
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
  });

  revalidatePath("/parent/documents");
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

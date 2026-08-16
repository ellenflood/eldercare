export type Gender = "Female" | "Male" | "Other";

export interface Parent {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  email: string;
  phone: string;
  address: string;
  condition: string;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  gender: Gender;
  email: string;
  phone: string;
  address: string;
  role: "Admin";
  createdAt: string;
  updatedAt: string;
}

export type DeviceLogType = "HeartRate" | "SleepDuration";

export interface Device {
  id: string;
  parentId: string;
  type: string;
  brand: string;
  model: string;
  deviceId: string;
  createdAt: string;
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  type: DeviceLogType;
  value: string;
  createdAt: string;
}

export type DocumentType = "Visit Summary" | "Bill" | "Results" | "Others";

export interface VisitSummaryContent {
  provider: string;
  visitDate: string;
  reasonForVisit: string;
  vitals: Record<string, string>;
  assessment: string;
  plan: string[];
  followUp: string;
}

export interface BillLineItem {
  description: string;
  amount: number;
}

export interface BillContent {
  provider: string;
  payer: string;
  serviceDate: string;
  lineItems: BillLineItem[];
  insuranceAdjustment: number;
  amountDue: number;
}

export type ResultFlag = "Normal" | "High" | "Low";

export interface LabResultValue {
  label: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: ResultFlag;
}

export interface LabResultsContent {
  orderedBy: string;
  collectedDate: string;
  panelName: string;
  values: LabResultValue[];
}

export interface ImagingResultsContent {
  orderedBy: string;
  performedDate: string;
  studyName: string;
  findings: string;
  impression: string;
}

export type DocumentContent = VisitSummaryContent | BillContent | LabResultsContent | ImagingResultsContent;

export interface AppDocument {
  id: string;
  parentId: string;
  link: string;
  type: DocumentType;
  name: string;
  dueDate: string | null;
  appointmentId: string | null;
  content: DocumentContent | null;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = "Pending" | "Attended" | "Didn't attend";

export interface Appointment {
  id: string;
  parentId: string;
  status: AppointmentStatus;
  specialty: string;
  name: string;
  provider: string;
  location: string;
  appointmentTime: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderStatus = "Answered" | "Not Answered" | "Rejected";
export type ReminderType = "Prescriptions" | "Appointments" | "Documents" | "CheckIn";
export type ReminderRecipient = "Parent" | "Child" | "Both";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";
export type RelatedType = "Prescription" | "Appointment" | "Document" | "CheckIn";

export interface Reminder {
  id: string;
  parentId: string;
  status: ReminderStatus;
  type: ReminderType;
  callEnabled: boolean;
  dueTime: string;
  name: string;
  relatedType: RelatedType;
  relatedId: string | null;
  recipient: ReminderRecipient;
  recurrence: Recurrence;
  createdAt: string;
  updatedAt: string;
}

export type PrescriptionFrequency = "daily" | "weekly" | "monthly";

export interface Prescription {
  id: string;
  parentId: string;
  specialty: string;
  name: string;
  dosageUnit: string;
  dosage: number;
  frequency: PrescriptionFrequency;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AlertType = "Prescriptions" | "Appointments" | "Wearable" | "Documents" | "Reminder";
export type AlertSourceType = "Prescription" | "Appointment" | "Reminder" | "Document" | "Wearable";

export interface Alert {
  id: string;
  childId: string;
  type: AlertType;
  name: string;
  severity: number;
  sourceType: AlertSourceType;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EldercareData {
  parents: Parent[];
  children: Child[];
  devices: Device[];
  deviceLogs: DeviceLog[];
  documents: AppDocument[];
  appointments: Appointment[];
  reminders: Reminder[];
  prescriptions: Prescription[];
  alerts: Alert[];
}

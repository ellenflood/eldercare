# WithYou Platform — Build Spec (Demo v1)

## Goal Instruction

Build and deploy a demo-ready version of the WithYou platform described in this
document, inside this repository (`ellenflood/eldercare`), on top of the existing Next.js
(App Router) + TypeScript + Tailwind scaffold in `src/app`. Deploy via the existing
Vercel↔GitHub integration — pushing to `main` triggers deployment automatically; do not
create a new Vercel project or change `vercel.json`'s framework preset.

Build only the **Demo v1 Scope** below. The **Full PRD** section further down is reference
context for the long-term product — do not build features from it that are explicitly called
out as out-of-scope for v1.

This is a demo. Do not implement authentication security, HIPAA/compliance controls, data
encryption, audit logging, or production-grade error handling unless explicitly listed below.
Optimize for a working, believable demo over robustness.

---

## Demo v1 Scope

### Mock data (required, per original spec)
Store all seed/mock data as JSON fixtures in an independent folder (e.g. `/data` or
`/src/mocks`) — not a real database. The app reads/writes this data at runtime (in-memory or
file-backed) to reflect state changes made during the demo (e.g. marking a prescription taken).

Seed exactly:
- **One Parent** with a chronic condition, one **daily** prescription and one **weekly**
  prescription.
- **Dummy appointments**: at least one past (attended) and one upcoming (pending).
- **Dummy Apple Watch device data**: heart rate and sleep duration logs spanning several days.
- **One Child**, linked to the parent, with alerts already present in their feed at demo start:
  one "missed medicine" alert and one "missed voice call" alert — so the payoff is visible
  immediately without requiring live actions during the demo.

### Core screens
- **Parent dashboard**: summary of appointments, prescriptions, documents; a simple chart of
  daily heart rate and sleep duration from wearable data.
- **Child dashboard**: summary of parent's data, upcoming appointments, wearable snapshot,
  and an **alerts feed**.
- **Calendar**: merges appointments, bill due dates, and prescription refill dates in one view.
- **Appointments**: list + detail (time, date, location, provider, status).
- **Prescriptions**: list with dosage/frequency; parent can create/delete; shows adherence
  status per dose.
- **Documents**: upload + list (type, name, date). No parsing/OCR needed — file goes in,
  metadata shown.
- **Account**: simple profile view for the logged-in party.
- **Signup flow**: build the multi-step signup UI described in the Full PRD (parent info,
  conditions, prescriptions, wearable choice, invite) — but it writes to the mock data layer,
  not a real backend/auth provider.

### Auth (minimal)
No real account system. Provide a simple "View as Parent / View as Child" switcher to jump
straight into the seeded account for demo purposes. The signup flow above can exist as a UI
that, on completion, seeds a new mock record — it does not need to gate access.

### Alert generation (hardcoded rules, not a configurable engine)
Implement exactly two triggers:
1. A prescription's dose for the current period is not marked "taken" by the end of its
   window → generate an Alert referencing that Prescription, severity 3 (daily) or per the
   severity table below.
2. A Reminder's status remains "Not Answered" past its due time → generate an Alert
   referencing that Reminder, severity 5 if tied to an appointment reminder, else per table.

### Voice calls — integration contract
Twilio Voice API call initiation is being handled in a parallel workstream — **do not build
call-placing logic**. What this build must provide:
- A webhook endpoint (e.g. `POST /api/voice/webhook`) that accepts Twilio's DTMF response
  payload and updates the corresponding Reminder status (`Answered`/`Rejected`) and, where
  applicable, the linked Prescription's adherence log or Appointment/check-in state — matching
  the examples in the Full PRD (dial 1/2 for yes/no, dial 1/5 for urgent/great).
- Reminder records must carry enough of a reference (see Data Model Notes below) for the
  webhook handler to know which Prescription/Appointment/check-in a given call response
  applies to.

### Explicitly out of scope for v1
- Real Garmin/Oura/CGM/Fitbit integrations — only mocked Apple Watch data.
- Multiple parents per child or multiple children per parent — one of each is enough.
- The Roles object/system — hardcode a single implicit "Admin" role for the child; don't build
  a Roles table or permission system.
- SMS reply-to-text (explicitly future-state in the original PRD).
- Real push/SMS/email delivery of alerts to the child — in-app alerts feed is sufficient.
- Any compliance, consent, encryption, or audit-logging work.

---

## Data Model Notes (deltas from the Full PRD, needed for v1 to function)

The object list in the Full PRD below is the reference schema. Three small additions are
required for the demo's alert/adherence logic to actually work — implement these as part of
the objects, not as new top-level entities:

- **Reminder** needs a reference to what it concerns: add `relatedType`
  (`Prescription | Appointment | Document | CheckIn`) and `relatedId`. Also add `recipient`
  (`Parent | Child | Both`) and a simple `recurrence` field (`none | daily | weekly | monthly`)
  since the PRD requires both recurring and one-time reminders.
- **Alert** needs a reference back to its trigger: add `sourceType`
  (`Prescription | Appointment | Reminder | Document | Wearable`) and `sourceId`. Also extend
  the `Type` enum to include `Reminder` so a missed/unanswered call can produce a correctly
  typed alert (the original enum of Prescriptions/Appointments/Wearable/Documents has no slot
  for a missed call).
- **Prescription adherence**: rather than a single checkbox, generate one Reminder instance
  per dose occurrence (per its frequency) and treat that Reminder's status as the adherence
  record for that dose. This reuses the existing Reminder object instead of introducing a
  separate log table, while still giving full history.

Alert severity guide (per the Full PRD's example): daily medicine missed = 3, weekly medicine
missed = 2, appointment missed = 5, unanswered "urgent care" call response = 5.

---

## Full PRD (reference — long-term product scope)

We are building a web-based, and mobile-friendly, eldercare platform/concierge for adult
children to manage care for their parents remotely. The primary users of the platform will be
the children to check in on their parents. After initial account setup, the parents will
receive relevant notifications regularly via text but will not need to regularly maintain
information on the platform (they still should be able to login and upload/create data if they
prefer to).

### Requirements and features

- **Alert systems** via integration with health monitors and wearables, such as Garmin, Apple
  Watch, Oura, Continuous Glucose Monitors, etc.
  - Not a real-time dashboard visible to the child, but alerts that may indicate that the
    parent is in danger (or needs to take an action, like take insulin).
- **Calendar**
  - Upcoming appointments
  - Bill due dates
  - Prescription refill dates
- **Reminders sent to parents/children via voice call**
  - Recurring and one-time
  - Related to upcoming appointments, prescription refills, due bill dates
  - Customizable by both child and parent
  - Can be sent to parents, children, or both
  - Reminder sent to parents via voice call; they respond back on the same platform
  - Responses dialed during the call update platform information
  - Examples:
    - "Did you check in with your daughter/mom today? Dial 1 for yes or 2 for no."
    - "Did you take your medicines for today? Dial 1 for yes or 2 for no." → "Yes" →
      prescription marked taken.
    - "How do you feel today? Dial 1 for 'I need urgent care' or 5 for 'I'm great'."
    - "Your next doctor appointment is in 2 days."
- **Appointments**
  - Upcoming and past
  - Details: time, date, location, provider
- **Documents**: ability to upload any relevant documents.
  - Sources: upload to the portal; direct response to automated text messages (future state —
    starting with voice calls).
  - Types: bills with due dates, written prescriptions, appointment summaries, results (e.g.
    blood tests, scans).
- **Prescriptions**
  - Repository of medicines currently taken by the parent, their frequency, and dosage.
  - Start and end dates.
  - Checkbox for taking the prescription at the prescribed frequency.
  - Parents must be able to create or delete.

### Other requirements
The initial version must have mocked-up data stored directly in an independent folder within
the project. Create an initial parent with a hard condition taking a daily medicine and a
weekly one. Create dummy appointment data and dummy wearable data for an Apple Watch. They have
a kid who gets alerts whenever a medicine is missed or one of the voice calls goes unanswered.
Sign-up process, voice call, and dashboard reminder features are all required.

### Objects and data the platform must support

**Parent** — represents an elderly user that can have one or more children.
- Devices (one to many)
- Appointments (one to many)
- Reminders (one to many)
- Prescriptions (one to many)
- Documents (one to many)
- Name (string), Age (integer), Gender (string), Email (string), Phone number (string),
  Address (string)
- Updated at / Created at (timestamp)
- Unique parent ID (UPID)

**Child** — represents a user that can have one or more parents.
- Alerts (one to many)
- Roles (one)
- Name (string), Age (integer), Gender (string), Email (string), Phone number (string),
  Address (string)
- Updated at / Created at (timestamp)
- Unique child ID (UCID)

**Device** — a medical device or wearable used by a parent that reports data to the platform.
Can be added/deleted anytime by the parent.
- Device logs (one to many)
- Type (string), Brand (string), Model (string), ID (string)
- Created at (timestamp)

**Device Logs** — measurements for a specific variable taken by a wearable.
- Type (string) — `Heart rate | Sleep duration`
- Value (string)
- Created at (timestamp)

**Document** — a document (.pdf or .docx) with information related to the parent's healthcare.
- Link to the hosted document (string)
- Type (string) — `Bill | Results | Others`
- Due date (timestamp, bill-exclusive)
- Document name (string)
- Updated at / Created at (timestamp)

**Appointment** — a medical appointment for the parent.
- Status (string) — `Pending | Attended | Didn't attend`
- Specialty (string)
- Appointment time (timestamp)
- Appointment name (string)
- Updated at / Created at (timestamp)

**Reminders** — an in-platform reminder for the parent, possibly linked to an out-of-platform
interaction (voice call or text message). Can be created for Prescriptions, Appointments, and
Documents by either a child or a parent.
- Status (string) — `Answered | Not Answered | Rejected`
- Type (string) — `Prescriptions | Appointments | Documents`
- Call enabled (boolean)
- Reminder due time (timestamp)
- Reminder name (string)
- Updated at / Created at (timestamp)

**Prescription** — a medical prescription for the parent.
- Specialty (string)
- Prescription name (string)
- Dosage unit (string)
- Dosage (integer)
- Frequency (string) — `daily | weekly | monthly`
- Start date / End date (timestamp)
- Updated at / Created at (timestamp)

**Alerts** — an in-platform alert the children receive whenever a predefined condition is met
(e.g. a new Document of type Result is uploaded).
- Type (string) — `Prescriptions | Appointments | Wearable | Documents`
- Alert name (string)
- Alert severity (integer, 1–5) — e.g. daily medicine missed = 3, appointment missed = 5
- Updated at / Created at (timestamp)

**Roles** — a role a child can have. V1 has a single role: "Admin".

### Signup process
Signup can be done by either the child or the parent. Whichever party signs up must then invite
their parent or child to the account and share any pending information needed to complete the
profile.

**Parent signup fields**: Name, Age, Gender, Email, Phone number, Address, pre-existing medical
conditions (if any), current prescriptions (medicines + frequency), wearable/monitor linking
choice (Wearable: Garmin, Apple Watch, Oura, Fitbit; Physical monitors: Glucose monitor, Blood
Pressure, ECG, heart rate; or None), last and next doctor appointment dates, and an invite to
their child (email/phone).

**Child signup fields**: Name, Age, Gender, Email, Phone number, Address, and an invite to
their parent (email/phone).

### Platform experience

**Parent** sections: Dashboard (summary of appointments/prescriptions/documents + a visual of
historical daily heart rate and sleep duration from wearable data), Calendar, Appointments,
Prescriptions, Wearables, Documents, Account data.

**Child** sections: Dashboard (summary of parent's data, upcoming appointments, wearable data),
Alerts, Account data.

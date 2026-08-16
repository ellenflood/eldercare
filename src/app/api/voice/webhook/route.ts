import { NextResponse } from "next/server";
import { applyVoiceResponse, getReminder } from "@/lib/store";
import type { ReminderType } from "@/lib/types";

/**
 * Integration contract with the parallel Twilio Voice workstream: that
 * workstream places the call and points Twilio's webhook at this URL,
 * passing which Reminder the call concerns as a `reminderId` query param
 * (e.g. `/api/voice/webhook?reminderId=reminder-checkin-0815`). Twilio posts
 * the caller's DTMF digit as `Digits` in a form-encoded body. This handler
 * does not place calls — see PRD.md's "Voice calls" section.
 *
 * Which digits are valid depends on the reminder's type:
 * - CheckIn: 0 (urgent help needed) or 1-5 (wellbeing scale, 1 = not well
 *   ... 5 = great).
 * - Prescriptions: 1 (took it), 2 (didn't take it), or 3 (will take it
 *   later).
 * - Everything else keeps the original 1/2 yes-no convention.
 */
const ALLOWED_DIGITS: Partial<Record<ReminderType, Set<string>>> = {
  CheckIn: new Set(["0", "1", "2", "3", "4", "5"]),
  Prescriptions: new Set(["1", "2", "3"]),
};
const DEFAULT_ALLOWED_DIGITS = new Set(["1", "2"]);

function messageFor(type: ReminderType, digit: string): string {
  if (type === "CheckIn") {
    return digit === "0"
      ? "We've flagged this as urgent and let your family know right away."
      : "Thanks, that's been recorded.";
  }
  if (type === "Prescriptions") {
    if (digit === "1") return "Great, glad you took your medicine.";
    if (digit === "2") return "Thanks for letting us know, we'll flag this for your family.";
    return "Okay, we'll remind you again later.";
  }
  return digit === "2" ? "Got it, thanks for letting us know." : "Thanks, that's been recorded.";
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const reminderId = url.searchParams.get("reminderId") ?? String(formData.get("reminderId") ?? "");
  const digit = String(formData.get("Digits") ?? "");

  if (!reminderId || !digit) {
    return NextResponse.json({ error: "reminderId and Digits are required" }, { status: 400 });
  }

  const existing = getReminder(reminderId);
  if (!existing) {
    return NextResponse.json({ error: `Unknown reminderId: ${reminderId}` }, { status: 404 });
  }

  const allowedDigits = ALLOWED_DIGITS[existing.type] ?? DEFAULT_ALLOWED_DIGITS;
  if (!allowedDigits.has(digit)) {
    return NextResponse.json(
      {
        error: `Invalid response "${digit}" for a ${existing.type} reminder. Expected one of: ${[...allowedDigits].join(", ")}`,
      },
      { status: 400 },
    );
  }

  const reminder = applyVoiceResponse(reminderId, digit);
  if (!reminder) {
    return NextResponse.json({ error: `Unknown reminderId: ${reminderId}` }, { status: 404 });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${messageFor(reminder.type, digit)}</Say><Hangup/></Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

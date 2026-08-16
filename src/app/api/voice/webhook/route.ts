import { NextResponse } from "next/server";
import { applyVoiceResponse } from "@/lib/store";

/**
 * Integration contract with the parallel Twilio Voice workstream: that
 * workstream places the call and points Twilio's webhook at this URL,
 * passing which Reminder the call concerns as a `reminderId` query param
 * (e.g. `/api/voice/webhook?reminderId=reminder-checkin-0815`). Twilio posts
 * the caller's DTMF digit as `Digits` in a form-encoded body. This handler
 * does not place calls — see PRD.md's "Voice calls" section.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const reminderId = url.searchParams.get("reminderId") ?? String(formData.get("reminderId") ?? "");
  const digit = String(formData.get("Digits") ?? "");

  if (!reminderId || !digit) {
    return NextResponse.json({ error: "reminderId and Digits are required" }, { status: 400 });
  }

  const reminder = applyVoiceResponse(reminderId, digit);

  if (!reminder) {
    return NextResponse.json({ error: `Unknown reminderId: ${reminderId}` }, { status: 404 });
  }

  const message =
    digit === "2"
      ? "Got it, thanks for letting us know."
      : "Thanks, that's been recorded.";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${message}</Say><Hangup/></Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

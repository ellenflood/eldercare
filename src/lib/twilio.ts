/**
 * Server-only. Never import this from a Client Component — it reads Twilio
 * credentials from process.env, which must stay out of the browser bundle.
 * Set these on the Vercel project (Project Settings → Environment Variables),
 * not in .env.local — see .env.example for the names this expects.
 */

function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export interface StudioExecutionResult {
  ok: boolean;
  error?: string;
}

/** Starts a new execution of the configured Studio Flow — this is what actually places the outbound call. */
export async function startStudioExecution(to: string, parameters: Record<string, unknown>): Promise<StudioExecutionResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const flowSid = process.env.TWILIO_STUDIO_FLOW_SID;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !flowSid || !from) {
    return { ok: false, error: "Twilio environment variables are not configured on this deployment." };
  }

  const body = new URLSearchParams({
    To: toE164(to),
    From: toE164(from),
    Parameters: JSON.stringify(parameters),
  });

  try {
    const response = await fetch(`https://studio.twilio.com/v2/Flows/${flowSid}/Executions`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Twilio Studio execution failed (${response.status}):`, text);
      return { ok: false, error: `Twilio responded with ${response.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("Twilio Studio execution request threw:", error);
    return { ok: false, error: "Network error calling Twilio." };
  }
}

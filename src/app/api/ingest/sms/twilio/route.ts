import { supabaseAdmin } from "@/lib/supabase-admin";
import { extractCode, inferService, expiresIn } from "@/lib/extract";
import { validateRequest } from "twilio/lib/webhooks/webhooks";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);

  const twilioSig = req.headers.get("x-twilio-signature") ?? "";
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";

  // If you don't want Twilio at all, remove this endpoint + the env var.
  if (authToken) {
    const ok = validateRequest(
      authToken,
      twilioSig,
      req.url,
      Object.fromEntries(params.entries())
    );
    if (!ok) return new Response("Invalid signature", { status: 403 });
  }

  const body = params.get("Body") ?? "";
  const from = params.get("From") ?? null;
  const to = params.get("To") ?? null;

  const code = extractCode(body);
  const service = inferService(body);

  await supabaseAdmin.from("verification_codes").insert({
    channel: "sms",
    service,
    sender: from,
    recipient: to,
    body,
    code,
    expires_at: expiresIn(12)
  });

  // Twilio expects TwiML
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    status: 200,
    headers: { "content-type": "text/xml" }
  });
}

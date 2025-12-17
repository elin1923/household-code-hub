import { gmailClient } from "@/lib/gmail";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { extractCode, inferService, expiresIn } from "@/lib/extract";

export const runtime = "nodejs";

function decodeBase64Url(data: string) {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

async function extractPlainText(payload: any): Promise<string> {
  if (!payload) return "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const text = await extractPlainText(part);
      if (text) return text;
    }
  }

  return "";
}

export async function POST() {
  const gmail = gmailClient();

  const list = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread"
  });

  const messages = list.data.messages ?? [];
  let processed = 0;

  for (const m of messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: m.id!,
      format: "full"
    });

    const headers = full.data.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

    const subject = getHeader("Subject");
    const from = getHeader("From");

    const body = await extractPlainText(full.data.payload);
    const blob = `${subject}\n${body}`.trim();

    // Mark read even if empty so we don't loop forever
    await gmail.users.messages.modify({
      userId: "me",
      id: m.id!,
      requestBody: { removeLabelIds: ["UNREAD"] }
    });

    if (!blob) continue;

    const code = extractCode(blob);
    const service = inferService(blob);

    await supabaseAdmin.from("verification_codes").insert({
      channel: "email",
      service,
      sender: from || null,
      recipient: process.env.GMAIL_ADDRESS || null,
      subject: subject || null,
      body,
      code,
      expires_at: expiresIn(12)
    });

    processed++;
  }

  return Response.json({ processed, totalUnread: messages.length });
}

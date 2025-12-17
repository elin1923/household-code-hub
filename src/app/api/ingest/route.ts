import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const secret = req.headers.get("x-ingest-secret");
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    service,
    code,
    channel,
    sender
  } = await req.json();

  if (!service || !code) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000);

  const { error } = await supabaseAdmin
    .from("verification_codes")
    .insert({
      service,
      code,
      channel,
      sender,
      received_at: now.toISOString(),
      expires_at: expires.toISOString()
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
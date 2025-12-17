import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { email } = await req.json();
  const normalized = email.toLowerCase();

  // 1️⃣ Allowlist check
  const { data } = await supabaseAdmin
    .from("allowed_emails")
    .select("email")
    .eq("email", normalized)
    .single();

  if (!data) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // 2️⃣ Send OTP
  const { error } = await supabaseAdmin.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: false
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
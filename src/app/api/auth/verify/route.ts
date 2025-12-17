import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(req: Request) {
  const { email, token } = await req.json();

  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase(),
    token,
    type: "email"
  });

  if (error || !data.session) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
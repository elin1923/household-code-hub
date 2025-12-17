import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("verification_codes")
    .select("*")
    .gt("expires_at", now)
    .order("received_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
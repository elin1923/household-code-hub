import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = req.headers.get("x-ingest-secret");
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { from, subject, text } = await req.json();
  const body = `${subject}\n${text}`.toLowerCase();

  const match = body.match(/\b\d{4,8}\b/);
  if (!match) {
    return NextResponse.json({ ignored: true });
  }

  const code = match[0];

  const service =
    from.includes("netflix") ? "Netflix" :
    from.includes("google") ? "Google" :
    from.includes("apple") ? "Apple" :
    "Unknown";

  await fetch(`${process.env.BASE_URL}/api/codes/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-secret": process.env.INGEST_SECRET!
    },
    body: JSON.stringify({
      service,
      code,
      channel: "email",
      sender: from
    })
  });

  return NextResponse.json({ ok: true });
}
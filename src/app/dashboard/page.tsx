import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCloudflareUser } from "@/lib/cf-access";

export const runtime = "nodejs";

function isAllowed(email: string | null) {
  const allow = (process.env.HOUSEHOLD_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allow.length === 0) return true; // rely on Cloudflare Access policy only
  return email ? allow.includes(email.toLowerCase()) : false;
}

export default async function Dashboard() {
  const user = await getCloudflareUser();

  // If Cloudflare Access is configured, requests without auth never reach here.
  if (!user.email) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Unauthorized</h1>
        <p>This app is protected by Cloudflare Access. Please sign in.</p>
      </main>
    );
  }

  if (!isAllowed(user.email)) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Not allowed</h1>
        <p>{user.email} is authenticated, but not on the household allowlist.</p>
      </main>
    );
  }

  const nowIso = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("verification_codes")
    .select("*")
    .gt("expires_at", nowIso)
    .order("received_at", { ascending: false })
    .limit(60);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>DB error</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Verification Codes</h1>
        <div style={{ opacity: 0.75 }}>Signed in as {user.email}</div>
      </header>

      <p style={{ opacity: 0.7, marginTop: 10 }}>
        Ingestion endpoints:
        {" "}
        <code>/api/ingest/gmail</code>
        {" "}
        (POST),
        {" "}
        <code>/api/ingest/sms/twilio</code>
        {" "}
        (POST, optional)
      </p>

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {(data ?? []).map((c: any) => (
          <div key={c.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{c.service}</strong>
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 18 }}>
                {c.code ?? "—"}
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
              {String(c.channel).toUpperCase()} • {new Date(c.received_at).toLocaleString()}
            </div>
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", opacity: 0.8 }}>Details</summary>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.85, marginTop: 8 }}>
{JSON.stringify(
  {
    sender: c.sender,
    recipient: c.recipient,
    subject: c.subject,
    body: c.body
  },
  null,
  2
)}
              </pre>
            </details>
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <div style={{ opacity: 0.75 }}>No active codes yet. Ingest Gmail or SMS and refresh.</div>
        )}
      </div>
    </main>
  );
}

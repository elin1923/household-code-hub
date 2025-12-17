"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    setError("");
    const res = await fetch("/api/auth/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      setError("Email not authorized");
      return;
    }

    setSent(true);
  }

  async function verify() {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: code })
    });

    if (!res.ok) {
      setError("Invalid code");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Household Sign In</h1>

      {!sent ? (
        <>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendCode}>Send code</button>
        </>
      ) : (
        <>
          <input
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verify}>Verify</button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
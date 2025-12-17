"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type Code = {
  id: string;
  service: string;
  code: string | null;
  channel: string;
  received_at: string;
};

export default function Dashboard() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCodes() {
    setLoading(true);
    const res = await fetch("/api/codes");
    const json = await res.json();
    setCodes(json.data ?? []);
    setLoading(false);
  }

  // initial load
  useEffect(() => {
    loadCodes();
  }, []);

  // realtime refresh
  useEffect(() => {
    const channel = supabase
      .channel("verification_codes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "verification_codes" },
        () => loadCodes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verification Codes
          </h1>

          <button
            onClick={loadCodes}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 active:scale-[0.98]"
          >
            🔄 Refresh
          </button>
        </header>

        {/* Content */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading codes…</p>
        ) : codes.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-8 text-center text-gray-500">
            No active codes yet
          </div>
        ) : (
          <div className="grid gap-4">
            {codes.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">
                    {c.service}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.received_at).toLocaleTimeString()} ·{" "}
                    {c.channel.toUpperCase()}
                  </p>
                </div>

                <div className="text-2xl font-mono font-semibold tracking-widest text-gray-900">
                  {c.code ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
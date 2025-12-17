-- Paste into Supabase SQL Editor

create table if not exists verification_codes (
  id uuid primary key default gen_random_uuid(),
  channel text not null, -- 'sms' | 'email'
  service text not null,
  sender text,
  recipient text,
  subject text,
  body text not null,
  code text,
  received_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists verification_codes_received_at_idx on verification_codes (received_at desc);
create index if not exists verification_codes_expires_at_idx on verification_codes (expires_at);
create index if not exists verification_codes_service_idx on verification_codes (service);

alter table verification_codes enable row level security;

-- Since the app is protected by Cloudflare Access, we keep DB usage server-side with service_role.
-- This policy is optional because the service_role bypasses RLS anyway.
drop policy if exists "deny all client access" on verification_codes;
create policy "deny all client access"
on verification_codes
for all
using (false);

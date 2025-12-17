# Household Code Hub (Cloudflare Zero Trust + Supabase)

Auth is handled by Cloudflare Access. The app itself does not implement login.

## Setup

1) Copy env file:
- cp .env.local.example .env.local
- Fill in values.

2) Create Supabase table:
- Open Supabase -> SQL Editor
- Paste scripts/supabase.sql

3) Run dev:
- npm run dev

Open http://localhost:3000 (will redirect to /dashboard)

## Cloudflare Zero Trust (Custom Domain)
Goal: Put your custom domain in front of this app and require Access login.

### A) Local now (quick test): Cloudflare Tunnel
Install cloudflared, then:

cloudflared tunnel --url http://localhost:3000

This gives you a trycloudflare.com URL.

### B) Custom domain (recommended)
1) Add your domain to Cloudflare (nameservers)
2) Create a Tunnel in Cloudflare Zero Trust -> Networks -> Tunnels
3) Install cloudflared locally and login:
   cloudflared tunnel login
4) Create tunnel + route it to localhost:
   cloudflared tunnel create codehub
   cloudflared tunnel route dns codehub yourdomain.com
5) Configure tunnel ingress to http://localhost:3000

Then protect yourdomain.com with Access:
Zero Trust -> Access -> Applications -> Add -> Self-hosted
- Domain: yourdomain.com
- Policy: allow only household emails (Google login or One-time PIN)

Cloudflare will inject headers like:
- CF-Access-Authenticated-User-Email
- CF-Access-Jwt-Assertion

The dashboard reads these headers.

## Ingestion
- Gmail: POST /api/ingest/gmail (pulls unread emails, stores codes, marks read)
- Twilio inbound SMS (optional): POST /api/ingest/sms/twilio

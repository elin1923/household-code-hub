import { headers } from "next/headers";

export async function getCloudflareUser() {
  // Next.js 16+ dynamic headers API is async
  const h = await headers();

  // Cloudflare Access injects these headers for authenticated requests
  const email =
    h.get("cf-access-authenticated-user-email") ||
    h.get("Cf-Access-Authenticated-User-Email") ||
    null;

  const jwt =
    h.get("cf-access-jwt-assertion") ||
    h.get("Cf-Access-Jwt-Assertion") ||
    null;

  return { email, jwt };
}

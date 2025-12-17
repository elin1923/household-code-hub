export function extractCode(text: string): string | null {
  const m = text.match(/\b\d{4,8}\b/);
  return m ? m[0] : null;
}

export function inferService(blob: string): string {
  const rules: [string, RegExp[]][] = [
    ["Netflix", [/netflix/i]],
    ["Hulu", [/hulu/i]],
    ["Disney+", [/disney\+|disneyplus/i]],
    ["Max", [/hbomax|hbo max|\bmax\b/i]],
    ["Prime Video", [/amazon|prime video/i]],
    ["Apple", [/apple id|icloud/i]],
    ["Google", [/google|gmail|g\.co/i]],
    ["Microsoft", [/microsoft|outlook|live\.com/i]]
  ];

  for (const [name, patterns] of rules) {
    if (patterns.some((p) => p.test(blob))) return name;
  }
  return "Unknown";
}

export function expiresIn(minutes = 12): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

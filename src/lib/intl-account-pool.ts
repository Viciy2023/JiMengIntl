import environment from "@/lib/environment.ts";

export interface DreaminaCookieHeaderEntry {
  id: string;
  header: string;
  sessionid: string;
}

function parseJson<T>(value?: string, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function extractCookieValue(cookieHeader: string, name: string): string {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1]?.trim() || "";
}

function normalizeCookieHeader(raw: string, index: number): DreaminaCookieHeaderEntry | null {
  const header = String(raw || "").trim();
  if (!header) return null;
  const sessionid = extractCookieValue(header, "sessionid");
  if (!sessionid) return null;
  return {
    id: `dreamina-${index + 1}`,
    header,
    sessionid,
  };
}

export function getDreaminaApiKey(): string {
  return String(environment.envVars.DREAMINA_API_KEY || environment.envVars.INTL_API_KEY || "").trim();
}

export function getDreaminaCookieHeaderPool(): DreaminaCookieHeaderEntry[] {
  const multi = parseJson<string[]>(environment.envVars.DREAMINA_COOKIE_HEADERS, [])
    .map((header, index) => normalizeCookieHeader(header, index))
    .filter(Boolean) as DreaminaCookieHeaderEntry[];

  if (multi.length > 0) return multi;

  const single = normalizeCookieHeader(String(environment.envVars.DREAMINA_COOKIE_HEADER || ""), 0);
  return single ? [single] : [];
}

export function findDreaminaCookieHeaderBySessionid(sessionid: string): DreaminaCookieHeaderEntry | undefined {
  return getDreaminaCookieHeaderPool().find((item) => item.sessionid === sessionid);
}

export function getDreaminaSessionPool(): string[] {
  return getDreaminaCookieHeaderPool().map((item) => item.sessionid);
}

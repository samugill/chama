export type SharePayload = {
  title: string;
  keyword: string;
  minutes: number;
  strength: 1 | 2 | 3;
  steps: string[];
  createdAt: number;
};

export function encodeShare(obj: SharePayload) {
  const json = JSON.stringify(obj);
  const b64 = typeof window !== "undefined" ? btoa(encodeURIComponent(json)) : "";
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeShare(token: string): SharePayload | null {
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(b64));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function createShareUrl(payload: SharePayload) {
  const url = new URL(typeof window !== "undefined" ? window.location.href : "https://example.com");
  url.pathname = "/result";
  url.searchParams.set("share", encodeShare(payload));
  return url.toString();
}

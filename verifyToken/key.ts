const secret = Deno.env.get("JWT_SECRET") ?? "keyuan-jwt-hs512-secret";

/** Stable HMAC key for JWT sign/verify across restarts. Override with JWT_SECRET. */
export const key: CryptoKey = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(secret),
  { name: "HMAC", hash: "SHA-512" },
  false,
  ["sign", "verify"],
);

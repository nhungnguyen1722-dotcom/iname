const encoder = new TextEncoder();

export type SessionPayload = {
  sub: number;
  role: string;
  exp: number;
};

function bytesToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function encodePayload(payload: SessionPayload) {
  const bytes = encoder.encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const data = JSON.parse(new TextDecoder().decode(bytes)) as SessionPayload;
    if (!data || typeof data.sub !== "number" || typeof data.exp !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToHex(signature);
}

function safeEqual(a: string, b: string) {
  const left = hexToBytes(a);
  const right = hexToBytes(b);
  if (left.length !== right.length || left.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function createSessionToken(userId: number, role: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET is missing");
  const payload: SessionPayload = {
    sub: userId,
    role,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const body = encodePayload(payload);
  const signature = await hmac(secret, body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = await hmac(secret, body);
  if (!safeEqual(signature, expected)) return null;
  const payload = decodePayload(body);
  if (!payload || payload.exp < Date.now()) return null;
  return payload;
}

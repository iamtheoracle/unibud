/**
 * crypto.js — client-side AES-GCM field encryption for "encryption at rest".
 *
 * Sensitive values are encrypted before writing to the database and decrypted
 * after reading, so the stored data is ciphertext. Decrypt is *tolerant*:
 * values that are not prefixed with the sentinel are returned untouched, which
 * means existing plaintext records keep rendering while new writes are encrypted.
 *
 * Threat model: protects the data layer (DB compromise / DB admin inspection).
 * The passphrase is bundled in the client — this is the standard client-side
 * encryption trade-off; it is not a substitute for platform transport security.
 */

const ENC_PREFIX = "enc::";
const PASSPHRASE = "UNIBUD-REST-ENC-v1-7f3a9c2e1b8d4a6f";
const SALT = "unibud-static-salt-v1";

let _keyPromise = null;

async function getKey() {
  if (_keyPromise) return _keyPromise;
  _keyPromise = (async () => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(PASSPHRASE),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode(SALT), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  })();
  return _keyPromise;
}

function bytesToBase64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Encrypt a string value. Returns `enc::<iv>:<cipher>` (base64), or the
 * original value on any failure so writes never break.
 */
export async function encryptValue(plain) {
  if (plain == null) return plain;
  if (typeof plain !== "string") plain = String(plain);
  if (plain === "" || plain.startsWith(ENC_PREFIX)) return plain;
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plain)
    );
    return `${ENC_PREFIX}${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(cipher))}`;
  } catch {
    return plain;
  }
}

/**
 * Decrypt a value. Returns the original untouched if it is not a ciphertext
 * sentinel string (tolerant), so existing plaintext records keep working.
 */
export async function decryptValue(cipher) {
  if (cipher == null || typeof cipher !== "string" || !cipher.startsWith(ENC_PREFIX)) {
    return cipher;
  }
  try {
    const [ivb64, b64] = cipher.slice(ENC_PREFIX.length).split(":");
    const key = await getKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(ivb64) },
      key,
      base64ToBytes(b64)
    );
    return new TextDecoder().decode(plain);
  } catch {
    return cipher;
  }
}

/** Encrypt only the listed sensitive fields on a plain object (returns a new object). */
export async function encryptFields(obj, fields) {
  const out = { ...obj };
  for (const f of fields) {
    if (out[f] != null) out[f] = await encryptValue(out[f]);
  }
  return out;
}

/** Decrypt only the listed sensitive fields on a plain object (returns a new object). */
export async function decryptFields(obj, fields) {
  const out = { ...obj };
  for (const f of fields) {
    if (out[f] != null) out[f] = await decryptValue(out[f]);
  }
  return out;
}
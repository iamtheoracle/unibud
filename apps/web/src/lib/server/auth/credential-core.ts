import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const COST = 1 << 17;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 256 * 1024 * 1024;

export const PASSWORD_POLICY = {
  minimumCharacters: 12,
  maximumCharacters: 128,
  maximumUtf8Bytes: 1024
} as const;

export function validatePasswordInput(password: string): void {
  const characters = [...password].length;
  const bytes = Buffer.byteLength(password, "utf8");
  if (
    characters < PASSWORD_POLICY.minimumCharacters ||
    characters > PASSWORD_POLICY.maximumCharacters ||
    bytes > PASSWORD_POLICY.maximumUtf8Bytes
  ) {
    throw new Error("Password does not meet the password length policy.");
  }
}

/** Store this verifier only. Never persist or log the supplied password. */
export async function hashPassword(password: string): Promise<string> {
  validatePasswordInput(password);
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEMORY
  })) as Buffer;
  return `scrypt$ln=17,r=8,p=1$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

/** Invalid stored verifiers fail closed; callers should return generic login errors. */
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    validatePasswordInput(password);
    const match = /^scrypt\$ln=17,r=8,p=1\$([A-Za-z0-9_-]{22})\$([A-Za-z0-9_-]{86})$/.exec(encoded);
    if (!match) return false;
    const salt = Buffer.from(match[1], "base64url");
    const expected = Buffer.from(match[2], "base64url");
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = (await scrypt(password, salt, KEY_LENGTH, {
      N: COST,
      r: BLOCK_SIZE,
      p: PARALLELIZATION,
      maxmem: MAX_MEMORY
    })) as Buffer;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

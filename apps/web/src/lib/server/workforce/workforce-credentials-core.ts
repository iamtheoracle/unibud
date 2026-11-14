import { createHmac, randomBytes, randomInt } from "node:crypto";
import type { SqlPool } from "../database/account-context-core";
import { hashPassword, verifyPassword } from "../auth/credential-core.ts";

export type WorkforceRole = "staff" | "operator" | "admin";
export type WorkforceLoginRecord = {
  accountId: string;
  accountStatus: string;
  workforceStatus: string;
  passcodeHash: string;
};

function readHexKey(name: string, env: NodeJS.ProcessEnv = process.env): Buffer {
  const value = env[name]?.trim() ?? "";
  if (!/^(?:[0-9a-f]{2}){32,}$/i.test(value)) {
    throw new Error(name + " must contain at least 32 random bytes encoded as hex.");
  }
  return Buffer.from(value, "hex");
}

export function assertWorkforceKeySeparation(env: NodeJS.ProcessEnv = process.env): void {
  const names = [
    "UNIBUD_WORKFORCE_ACTIVATION_HMAC_KEY",
    "UNIBUD_WORKFORCE_PASSCODE_PEPPER",
    "UNIBUD_RATE_LIMIT_HMAC_KEY",
    "UNIBUD_IDENTITY_ENCRYPTION_KEY",
    "UNIBUD_IDENTITY_LOOKUP_HMAC_KEY"
  ] as const;
  const keys = names.map(name => {
    const value = env[name]?.trim() ?? "";
    if (!/^(?:[0-9a-f]{2}){32,}$/i.test(value)
        || (name === "UNIBUD_IDENTITY_ENCRYPTION_KEY" && value.length !== 64)) {
      throw new Error(name + " must be configured with valid independent key material.");
    }
    return Buffer.from(value, "hex");
  });
  for (let left = 0; left < keys.length; left += 1) {
    for (let right = left + 1; right < keys.length; right += 1) {
      if (keys[left]!.equals(keys[right]!)) {
        throw new Error("Workforce, identity and rate-limit secrets must be cryptographically distinct.");
      }
    }
  }
}

export function createWorkforceUsername(role: WorkforceRole): string {
  return `ub-${role}-${randomBytes(8).toString("hex")}`;
}

export function createWorkforceActivationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function workforceActivationDigest(
  username: string,
  code: string,
  key: Uint8Array = readHexKey("UNIBUD_WORKFORCE_ACTIVATION_HMAC_KEY")
): Buffer {
  if (!/^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(username)
      || !/^\d{6}$/.test(code) || key.byteLength < 32) {
    throw new Error("Invalid workforce activation credential.");
  }
  return createHmac("sha256", key)
    .update(`v1:unibud:workforce:activation:${username}:${code}`, "utf8")
    .digest();
}

export function workforceUsernameDigest(
  username: string,
  key: Uint8Array = readHexKey("UNIBUD_RATE_LIMIT_HMAC_KEY")
): Buffer {
  if (!/^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(username) || key.byteLength < 32) {
    throw new Error("Invalid workforce username.");
  }
  return createHmac("sha256", key)
    .update("unibud:workforce:username:v1:" + username, "utf8")
    .digest();
}

function passcodePrehash(
  username: string,
  passcode: string,
  pepper: Uint8Array
): string {
  if (!/^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(username)
      || !/^\d{6}$/.test(passcode) || pepper.byteLength < 32) {
    throw new Error("A six-digit workforce passcode and valid username-bound pepper are required.");
  }
  return createHmac("sha256", pepper)
    .update(`unibud:workforce:passcode:v1:${username}:${passcode}`, "utf8")
    .digest("hex");
}

export async function hashWorkforcePasscode(
  username: string,
  passcode: string,
  pepper: Uint8Array = readHexKey("UNIBUD_WORKFORCE_PASSCODE_PEPPER")
): Promise<string> {
  return hashPassword(passcodePrehash(username, passcode, pepper));
}

export async function verifyWorkforcePasscode(
  username: string,
  passcode: string,
  encoded: string,
  pepper: Uint8Array = readHexKey("UNIBUD_WORKFORCE_PASSCODE_PEPPER")
): Promise<boolean> {
  try {
    return await verifyPassword(passcodePrehash(username, passcode, pepper), encoded);
  } catch {
    return false;
  }
}

function asString(value: unknown): string {
  if (typeof value !== "string") throw new Error("Unexpected workforce authentication result.");
  return value;
}

export async function lookupWorkforceLogin(
  pool: SqlPool,
  username: string
): Promise<WorkforceLoginRecord | null> {
  if (!/^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(username)) return null;
  const client = await pool.connect();
  try {
    const result = await client.query<Record<string, unknown>>(
      "SELECT * FROM public.unibud_workforce_lookup_login($1)",
      [username]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      accountId: asString(row.account_id),
      accountStatus: asString(row.account_status),
      workforceStatus: asString(row.workforce_status),
      passcodeHash: asString(row.passcode_hash)
    };
  } finally {
    client.release();
  }
}

export async function consumeWorkforceLoginRateLimit(
  pool: SqlPool,
  username: string,
  now = new Date()
): Promise<boolean> {
  const digest = workforceUsernameDigest(username);
  const client = await pool.connect();
  try {
    const result = await client.query<{ allowed: boolean }>(
      "SELECT public.auth_consume_rate_limit('login',$1,$2,900,10,1800) AS allowed",
      [digest, now.toISOString()]
    );
    return result.rows[0]?.allowed === true;
  } finally {
    client.release();
  }
}

export async function recordWorkforceLogin(
  pool: SqlPool,
  username: string,
  outcome: "success" | "failure",
  requestId: string
): Promise<void> {
  const digest = workforceUsernameDigest(username);
  const client = await pool.connect();
  try {
    await client.query(
      "SELECT public.unibud_workforce_record_login($1,$2,$3,$4)",
      [digest, username, outcome, requestId]
    );
  } finally {
    client.release();
  }
}

export async function verifyWorkforcePasscodeForAccount(input: {
  pool: SqlPool;
  accountId: string;
  username: string;
  passcode: string;
}): Promise<boolean> {
  const record = await lookupWorkforceLogin(input.pool, input.username);
  if (!record || record.accountId !== input.accountId
      || record.accountStatus !== "active"
      || !["mfa_enrollment_required", "active"].includes(record.workforceStatus)) {
    return false;
  }
  return verifyWorkforcePasscode(input.username, input.passcode, record.passcodeHash);
}

export function workforceSecret(name: "UNIBUD_WORKFORCE_ACTIVATION_HMAC_KEY" | "UNIBUD_WORKFORCE_PASSCODE_PEPPER"): Buffer {
  return readHexKey(name);
}

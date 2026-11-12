import { createHash, createHmac, randomUUID } from "node:crypto";
import { hash, verify, argon2id } from "argon2";
import type { FlowPinRepository } from "./flow-pin-repository";

const PIN_PATTERN = /^[0-9]{6}$/;
const WEAK_PINS = new Set([
  "000000","111111","222222","333333","444444","555555","666666",
  "777777","888888","999999","123456","654321","123123","321321",
  "121212","212121","112233","332211","101010","010101"
]);

export type FlowPinVerificationResult =
  | { state: "verified" }
  | { state: "invalid" }
  | { state: "locked"; lockedUntil: string | null }
  | { state: "not_enrolled" }
  | { state: "unavailable" };

function validateNewPin(pin: string): void {
  const ascending = [...pin].every((digit, index, digits) => index === 0 || Number(digit) === Number(digits[index - 1]) + 1);
  const descending = [...pin].every((digit, index, digits) => index === 0 || Number(digit) === Number(digits[index - 1]) - 1);
  const repeated = new Set(pin).size === 1;
  if (!PIN_PATTERN.test(pin) || WEAK_PINS.has(pin) || ascending || descending || repeated) {
    throw new Error("Choose a six-digit transaction PIN that is not an obvious sequence or repeated pattern.");
  }
}

function createStepUpProof(
  accountId: string,
  sessionId: string,
  action: "pin_enroll" | "pin_recovery" | "webauthn_register",
  pinHashPhc: string
): { expiresEpoch: number; nonce: string; signature: string } {
  const rawKey = process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY?.trim() ?? "";
  if (!/^(?:[0-9a-f]{2}){32}$/i.test(rawKey)) {
    throw new Error("UNIBUD_FLOW_STEP_UP_HMAC_KEY must be exactly 32 random bytes encoded as hex.");
  }
  const expiresEpoch = Math.floor(Date.now() / 1000) + 60;
  const nonce = randomUUID();
  const payloadDigest = createHash("sha256").update(pinHashPhc, "utf8").digest("hex");
  const message = [
    "flow-pin-step-up:v1", accountId, sessionId, action,
    payloadDigest, String(expiresEpoch), nonce
  ].join(":");
  const signature = createHmac("sha256", Buffer.from(rawKey, "hex"))
    .update(message, "utf8")
    .digest("hex");
  return { expiresEpoch, nonce, signature };
}

async function hashPin(pin: string): Promise<string> {
  return hash(pin, {
    type: argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32
  });
}

export class FlowPinService {
  private readonly repository: FlowPinRepository;

  constructor(repository: FlowPinRepository) {
    this.repository = repository;
  }

  async enroll(input: {
    accountId: string;
    sessionId: string;
    pin: string;
    confirmation: string;
  }): Promise<boolean> {
    validateNewPin(input.pin);
    if (input.pin !== input.confirmation) throw new Error("Transaction PIN confirmation does not match.");
    const verifier = await hashPin(input.pin);
    const proof = createStepUpProof(input.accountId, input.sessionId, "pin_enroll", verifier);
    return this.repository.enroll(input.accountId, input.sessionId, verifier, proof);
  }

  async verify(input: {
    accountId: string;
    sessionId: string;
    pin: string;
  }): Promise<FlowPinVerificationResult> {
    const state = await this.repository.beginVerification(input.accountId, input.sessionId);
    if (!state.allowed && state.lockedUntil) return { state: "locked", lockedUntil: state.lockedUntil };
    if (!state.pinHashPhc) return { state: "not_enrolled" };
    if (!state.allowed) return { state: "unavailable" };

    let valid = false;
    try {
      valid = typeof input.pin === "string" &&
        input.pin.length <= 32 &&
        await verify(state.pinHashPhc, input.pin);
    } catch {
      valid = false;
    }

    if (valid) {
      const recorded = await this.repository.recordSuccess(input.accountId, input.sessionId);
      return recorded ? { state: "verified" } : { state: "locked", lockedUntil: null };
    }

    const failure = await this.repository.recordFailure(input.accountId, input.sessionId);
    return failure.lockedUntil
      ? { state: "locked", lockedUntil: failure.lockedUntil }
      : { state: "invalid" };
  }

  async recover(input: {
    accountId: string;
    sessionId: string;
    newPin: string;
    confirmation: string;
  }): Promise<boolean> {
    validateNewPin(input.newPin);
    if (input.newPin !== input.confirmation) throw new Error("Transaction PIN confirmation does not match.");
    const verifier = await hashPin(input.newPin);
    const proof = createStepUpProof(input.accountId, input.sessionId, "pin_recovery", verifier);
    return this.repository.recover(input.accountId, input.sessionId, verifier, proof);
  }
}

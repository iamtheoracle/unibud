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
  if (!PIN_PATTERN.test(pin) || WEAK_PINS.has(pin)) {
    throw new Error("Choose a six-digit transaction PIN that is not an obvious sequence or repeated pattern.");
  }
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
    return this.repository.enroll(input.accountId, input.sessionId, verifier);
  }

  async verify(input: {
    accountId: string;
    sessionId: string;
    pin: string;
  }): Promise<FlowPinVerificationResult> {
    const state = await this.repository.beginVerification(input.accountId, input.sessionId);
    if (!state.pinHashPhc) return { state: "not_enrolled" };
    if (!state.allowed) return { state: "locked", lockedUntil: state.lockedUntil };

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
    return this.repository.recover(input.accountId, input.sessionId, verifier);
  }
}

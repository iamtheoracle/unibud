import { createHmac, randomUUID } from "node:crypto";

export type FlowStepUpAction =
  | "pin_enroll"
  | "pin_recovery"
  | "webauthn_register"
  | "transaction_pin_authorize"
  | "transaction_webauthn_authorize";

export interface FlowStepUpProof {
  expiresEpoch: number;
  nonce: string;
  signature: string;
}

export function createFlowStepUpProof(
  accountId: string,
  sessionId: string,
  action: FlowStepUpAction,
  payloadDigest: Uint8Array
): FlowStepUpProof {
  if (payloadDigest.byteLength !== 32) {
    throw new Error("Flow step-up payload digest must be exactly 32 bytes.");
  }
  const rawKey = process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY?.trim() ?? "";
  if (!/^(?:[0-9a-f]{2}){32}$/i.test(rawKey)) {
    throw new Error("UNIBUD_FLOW_STEP_UP_HMAC_KEY must be exactly 32 random bytes encoded as hex.");
  }
  const expiresEpoch = Math.floor(Date.now() / 1000) + 60;
  const nonce = randomUUID();
  const message = [
    "flow-step-up:v1", accountId, sessionId, action,
    Buffer.from(payloadDigest).toString("hex"), String(expiresEpoch), nonce
  ].join(":");
  const signature = createHmac("sha256", Buffer.from(rawKey, "hex"))
    .update(message, "utf8")
    .digest("hex");
  return { expiresEpoch, nonce, signature };
}

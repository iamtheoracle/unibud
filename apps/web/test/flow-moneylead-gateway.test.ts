import test from "node:test";
import assert from "node:assert/strict";
import { UnconfiguredFlowMoneyLeadGateway } from "../src/lib/server/flow/flow-moneylead-gateway.ts";
import type { FlowMoneyLeadGateway } from "../src/lib/server/flow/flow-moneylead-gateway-contract.ts";

test("MoneyLead gateway fails closed until a verified adapter is installed", async () => {
  const gateway: FlowMoneyLeadGateway = new UnconfiguredFlowMoneyLeadGateway();
  await assert.rejects(
    gateway.submitAuthorizedInstruction({
      contractVersion: 1,
      paymentIntentId: "f0540000-0000-4000-8000-000000000101",
      idempotencyKey: "test-idempotency",
      detailsDigest: "00".repeat(32),
      authorizationReference: "auth-ref",
      authorizationMethod: "transaction_pin",
      authorizedAt: new Date().toISOString(),
      sourceAccountReference: "opaque-source",
      recipientReference: "opaque-recipient",
      amount: "1.0000",
      currency: "NGN",
      feeAmount: "0.0000",
      purposeCode: "member_transfer",
      authorizationAttestation: {
        keyId: "unconfigured",
        payload: new Uint8Array(),
        signature: new Uint8Array()
      }
    }),
    /not configured or verified/
  );
  await assert.rejects(
    gateway.lookupByIdempotencyKey("test-idempotency"),
    /not configured or verified/
  );
});

test("MoneyLead gateway port is limited to authorized instruction submit and idempotency lookup", () => {
  const contract = `../src/lib/server/flow/flow-moneylead-gateway-contract.ts`;
  const fs = require("node:fs");
  const source = fs.readFileSync(new URL(contract, import.meta.url), "utf8");
  assert.ok(source.includes("submitAuthorizedInstruction"));
  assert.ok(source.includes("lookupByIdempotencyKey"));
  assert.doesNotMatch(source, /getBalance|debitAccount|creditAccount|createAccount|settleFunds/i);
  assert.doesNotMatch(source, /outcome: "settled"/);
});

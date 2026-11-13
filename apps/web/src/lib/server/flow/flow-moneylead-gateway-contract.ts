export interface FlowMoneyLeadAuthorizationAttestation {
  keyId: string;
  payload: Uint8Array;
  signature: Uint8Array;
}

export interface FlowMoneyLeadAuthorizedInstruction {
  contractVersion: 1;
  paymentIntentId: string;
  idempotencyKey: string;
  detailsDigest: string;
  authorizationReference: string;
  authorizationMethod: "transaction_pin" | "webauthn";
  authorizedAt: string;
  sourceAccountReference: string;
  recipientReference: string;
  amount: string;
  currency: string;
  feeAmount: string;
  purposeCode: string;
  authorizationAttestation: FlowMoneyLeadAuthorizationAttestation;
}

export type FlowMoneyLeadAcknowledgement =
  | {
      outcome: "accepted";
      moneyLeadReference: string;
      acknowledgedAt: string;
      responseEvidence: Uint8Array;
    }
  | {
      outcome: "rejected";
      rejectionCode: string;
      acknowledgedAt: string;
      responseEvidence: Uint8Array;
    }
  | {
      outcome: "unknown";
      observedAt: string;
      responseEvidence?: Uint8Array;
    };

export interface FlowMoneyLeadGateway {
  submitAuthorizedInstruction(
    instruction: FlowMoneyLeadAuthorizedInstruction
  ): Promise<FlowMoneyLeadAcknowledgement>;

  lookupByIdempotencyKey(
    idempotencyKey: string
  ): Promise<FlowMoneyLeadAcknowledgement | null>;
}

export type FlowMoneyLeadAccountStatus =
  | "pending_kyc"
  | "pending_review"
  | "opening"
  | "active"
  | "restricted"
  | "closed"
  | "rejected";

export interface FlowMoneyLeadAccountSnapshot {
  contractVersion: 1;
  customerReference: string;
  accountReference: string;
  status: FlowMoneyLeadAccountStatus;
  currency: string;
  maskedAccountNumber: string | null;
  observedAt: string;
  evidenceReference: string;
  evidenceSignature: Uint8Array;
}

export type FlowMoneyLeadPaymentChannel =
  | "bank_transfer"
  | "ach"
  | "wire"
  | "internal_transfer"
  | "branch_cash"
  | "branch_transfer";

export type FlowMoneyLeadPaymentLifecycle =
  | "received"
  | "under_review"
  | "processing"
  | "awaiting_settlement"
  | "settled"
  | "returned"
  | "reversed"
  | "rejected";

export interface FlowMoneyLeadFinancialEvent {
  contractVersion: 1;
  eventId: string;
  eventType:
    | "account.issued"
    | "payment.incoming"
    | "payment.outgoing"
    | "payment.settled"
    | "payment.returned"
    | "payment.reversed";
  occurredAt: string;
  accountReference: string;
  paymentReference: string | null;
  direction: "incoming" | "outgoing" | "account";
  channel: FlowMoneyLeadPaymentChannel | null;
  lifecycle: FlowMoneyLeadPaymentLifecycle | null;
  amount: string | null;
  currency: string;
  settlementReference: string | null;
  branchReference: string | null;
  receiptReference: string | null;
  evidenceReference: string;
}

export interface FlowMoneyLeadSignedEventEnvelope {
  keyId: string;
  payload: Uint8Array;
  signature: Uint8Array;
  receivedAt: string;
}

export interface FlowMoneyLeadEventVerifier {
  verify(envelope: FlowMoneyLeadSignedEventEnvelope): Promise<FlowMoneyLeadFinancialEvent>;
}

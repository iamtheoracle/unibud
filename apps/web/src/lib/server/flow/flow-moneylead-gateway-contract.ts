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

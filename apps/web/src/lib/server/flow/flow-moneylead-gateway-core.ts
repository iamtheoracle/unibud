import type {
  FlowMoneyLeadAcknowledgement,
  FlowMoneyLeadAuthorizedInstruction,
  FlowMoneyLeadGateway
} from "./flow-moneylead-gateway-contract.ts";

export class UnconfiguredFlowMoneyLeadGateway implements FlowMoneyLeadGateway {
  async submitAuthorizedInstruction(
    _instruction: FlowMoneyLeadAuthorizedInstruction
  ): Promise<FlowMoneyLeadAcknowledgement> {
    void _instruction;
    throw new Error("MoneyLead transfer gateway is not configured or verified.");
  }

  async lookupByIdempotencyKey(
    _idempotencyKey: string
  ): Promise<FlowMoneyLeadAcknowledgement | null> {
    void _idempotencyKey;
    throw new Error("MoneyLead transfer gateway is not configured or verified.");
  }
}

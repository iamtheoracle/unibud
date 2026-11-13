import type {
  FlowMoneyLeadAcknowledgement,
  FlowMoneyLeadAccountSnapshot,
  FlowMoneyLeadAuthorizedInstruction,
  FlowMoneyLeadGateway
} from "./flow-moneylead-gateway-contract.ts";

export class UnconfiguredFlowMoneyLeadGateway implements FlowMoneyLeadGateway {
  async getAccountSnapshot(_accountReference: string): Promise<FlowMoneyLeadAccountSnapshot> {
    void _accountReference;
    throw new Error("MoneyLead account service is not configured or verified.");
  }

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

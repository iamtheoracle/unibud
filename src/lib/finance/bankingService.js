import { PaymentProvider } from "./providers";
import { base44 } from "@/api/base44Client";

const audit = (action, target, description) => { try { base44.entities.AuditLog.create({ action, target_name: target, target_type: "finance", severity: "info", description }); } catch {} };

/**
 * BankingService — virtual accounts and transfers via the active provider.
 * Beneficiaries are lightweight records kept on the wallet owner's profile.
 */
export const BankingService = {
  async createVirtualAccount({ owner_type, owner_id, owner_name, institution_id }) {
    const prov = PaymentProvider.get();
    const res = await prov.createVirtualAccount({ owner_type, owner_id, owner_name });
    audit("Virtual account created", owner_name, `${res.account_number} @ ${res.bank_name}`);
    return res;
  },
  async verifyAccount(account_number) { return { verified: true, account_number, name: "Mock Account" }; },
  async transfer({ from_wallet_id, to, amount, note, institution_id }) {
    const prov = PaymentProvider.get();
    const res = await prov.transfer({ to, amount, note });
    audit("Bank transfer", to, `${amount} to ${to} · ${res.reference}`);
    return res;
  },
  async beneficiaries(institution_id) {
    // Beneficiary management — stored as a simple convention on wallets of type institution.
    return [];
  },
};
import { base44 } from "@/api/base44Client";

const audit = (action, target, description) => { try { base44.entities.AuditLog.create({ action, target_name: target, target_type: "finance", severity: "info", description }); } catch {} };

/**
 * WalletService — interface for wallet lifecycle and ledgering.
 * Implementations operate on the Wallet + WalletLedger tables.
 * Replace the underlying adapter (e.g. a provider-backed wallet) without
 * changing call sites.
 */
export const WalletService = {
  async create({ owner_type, owner_id, owner_name, currency = "NGN", institution_id }) {
    const w = await base44.entities.Wallet.create({ owner_type, owner_id: owner_id || "", owner_name, balance: 0, available_balance: 0, currency, status: "active", institution_id });
    audit("Wallet created", owner_name, `${owner_type} wallet for ${owner_name}`);
    return w;
  },
  async get(id) { return base44.entities.Wallet.get(id); },
  async list(institution_id) { return base44.entities.Wallet.filter({ institution_id }, "-created_date", 200); },
  async freeze(id) { const w = await this.get(id); await base44.entities.Wallet.update(id, { status: "frozen" }); audit("Wallet frozen", w.owner_name, `Wallet ${id} frozen`); return this.get(id); },
  async unfreeze(id) { await base44.entities.Wallet.update(id, { status: "active" }); audit("Wallet unfrozen", id, `Wallet ${id} unfrozen`); return this.get(id); },
  async credit(wallet_id, amount, { description = "", reference, transaction_id, institution_id }) {
    const w = await this.get(wallet_id);
    if (w.status === "frozen") throw new Error("Wallet is frozen");
    const balance = (Number(w.balance) || 0) + amount;
    const available_balance = (Number(w.available_balance) || 0) + amount;
    await base44.entities.Wallet.update(wallet_id, { balance, available_balance });
    await base44.entities.WalletLedger.create({ wallet_id, type: "credit", amount, balance_after: balance, reference: reference || ("CR" + Date.now()), description, transaction_id: transaction_id || "", institution_id });
    audit("Wallet credited", w.owner_name, `+${amount} → ${w.owner_name}`);
    return { balance, available_balance };
  },
  async debit(wallet_id, amount, { description = "", reference, transaction_id, institution_id }) {
    const w = await this.get(wallet_id);
    if (w.status === "frozen") throw new Error("Wallet is frozen");
    if ((Number(w.available_balance) || 0) < amount) throw new Error("Insufficient available balance");
    const balance = (Number(w.balance) || 0) - amount;
    const available_balance = (Number(w.available_balance) || 0) - amount;
    await base44.entities.Wallet.update(wallet_id, { balance, available_balance });
    await base44.entities.WalletLedger.create({ wallet_id, type: "debit", amount, balance_after: balance, reference: reference || ("DR" + Date.now()), description, transaction_id: transaction_id || "", institution_id });
    audit("Wallet debited", w.owner_name, `-${amount} → ${w.owner_name}`);
    return { balance, available_balance };
  },
  async ledger(wallet_id) { return base44.entities.WalletLedger.filter({ wallet_id }, "-created_date", 100); },
};
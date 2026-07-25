import { base44 } from "@/api/base44Client";
import { PaymentProvider } from "./providers";

const audit = (action, target, description) => { try { base44.entities.AuditLog.create({ action, target_name: target, target_type: "finance", severity: "info", description }); } catch {} };

/**
 * CardService — virtual card lifecycle via the active provider.
 */
export const CardService = {
  async issue({ wallet_id, institution_id }) {
    const prov = PaymentProvider.get();
    const res = await prov.issueCard(wallet_id);
    const card = await base44.entities.Card.create({ wallet_id, masked_number: res.masked_number, type: "virtual", status: res.status || "active", daily_limit: 100000, monthly_limit: 500000, institution_id });
    audit("Card issued", res.masked_number, `Virtual card for wallet ${wallet_id}`);
    return card;
  },
  async list(institution_id) { return base44.entities.Card.filter({ institution_id }, "-created_date", 200); },
  async freeze(id) { await base44.entities.Card.update(id, { status: "frozen" }); audit("Card frozen", id, `Card ${id} frozen`); return base44.entities.Card.get(id); },
  async unfreeze(id) { await base44.entities.Card.update(id, { status: "active" }); return base44.entities.Card.get(id); },
  async replace(id) { const c = await base44.entities.Card.get(id); const prov = PaymentProvider.get(); const res = await prov.issueCard(c.wallet_id); await base44.entities.Card.update(id, { status: "replaced" }); const nc = await base44.entities.Card.create({ wallet_id: c.wallet_id, masked_number: res.masked_number, type: "virtual", status: "active", daily_limit: c.daily_limit, monthly_limit: c.monthly_limit, institution_id: c.institution_id }); audit("Card replaced", id, `Replaced with ${res.masked_number}`); return nc; },
  async setLimits(id, { daily_limit, monthly_limit }) { await base44.entities.Card.update(id, { daily_limit, monthly_limit }); return base44.entities.Card.get(id); },
};
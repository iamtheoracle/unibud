import { base44 } from "@/api/base44Client";
import { PaymentProvider } from "./providers";

const audit = (action, target, description) => { try { base44.entities.AuditLog.create({ action, target_name: target, target_type: "finance", severity: "info", description }); } catch {} };

/**
 * KYCService — identity verification via the active provider.
 */
export const KYCService = {
  async verifyIdentity({ owner_type, owner_id, owner_name, institution_id }) {
    const prov = PaymentProvider.get();
    const res = await prov.verifyKYC({ owner_type, owner_id, owner_name });
    const rec = await base44.entities.KYCRecord.create({ owner_type, owner_id: owner_id || "", owner_name, status: res.status, level: res.level || "tier1", institution_id });
    audit("KYC verified", owner_name, `${owner_type} ${res.status} (${res.level})`);
    return rec;
  },
  async verifyStudent(ctx) { return this.verifyIdentity({ ...ctx, owner_type: "student" }); },
  async verifyInstitution(ctx) { return this.verifyIdentity({ ...ctx, owner_type: "institution" }); },
  async complianceStatus(owner_id) { const list = await base44.entities.KYCRecord.filter({ owner_id }, "-created_date", 10); return list[0] || null; },
  async list(institution_id) { return base44.entities.KYCRecord.filter({ institution_id }, "-created_date", 200); },
};
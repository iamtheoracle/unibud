import { base44 } from "@/api/base44Client";
import { PaymentProvider } from "./providers";
import { WalletService } from "./walletService";

const audit = (action, target, description) => { try { base44.entities.AuditLog.create({ action, target_name: target, target_type: "finance", severity: "info", description }); } catch {} };
const ref = (p) => p + Date.now() + Math.floor(Math.random() * 1000);

/**
 * PaymentService — payment lifecycle backed by the active provider.
 * Creates a FinancialTransaction + PaymentAttempt, then verifies &
 * captures through the provider interface, ledgering wallets on capture.
 */
export const PaymentService = {
  async create({ amount, currency = "NGN", type, from_wallet_id, to_wallet_id, description, fee_id, institution_id }) {
    const reference = ref("TXN");
    const tx = await base44.entities.FinancialTransaction.create({ type, amount, currency, from_wallet_id: from_wallet_id || "", to_wallet_id: to_wallet_id || "", status: "pending", reference, fee_id: fee_id || "", receipt_no: "", description: description || "", institution_id });
    const prov = PaymentProvider.get();
    const attempt = await base44.entities.PaymentAttempt.create({ transaction_id: tx.id, provider: prov.id, amount, status: "pending", provider_reference: "", institution_id });
    audit("Payment created", reference, `${type} ${amount} ${currency} via ${prov.name}`);
    return { tx, attempt };
  },
  async verify(attempt_id) {
    const a = await base44.entities.PaymentAttempt.get(attempt_id);
    const prov = PaymentProvider.get();
    const res = await prov.verify(a.provider_reference || ("MOCK_" + attempt_id.slice(-6)));
    await base44.entities.PaymentAttempt.update(attempt_id, { status: res.verified ? "verified" : "failed", provider_reference: res.reference || a.provider_reference });
    audit("Payment verified", attempt_id, `Attempt ${attempt_id} → ${res.status}`);
    return res;
  },
  async capture(attempt_id, institution_id) {
    const a = await base44.entities.PaymentAttempt.get(attempt_id);
    const tx = await base44.entities.FinancialTransaction.get(a.transaction_id);
    const prov = PaymentProvider.get();
    const res = await prov.capture(a.provider_reference || ("MOCK_" + attempt_id.slice(-6)));
    if (tx.to_wallet_id) await WalletService.credit(tx.to_wallet_id, tx.amount, { description: `Payment ${tx.reference}`, reference: tx.reference, transaction_id: tx.id, institution_id });
    if (tx.from_wallet_id) { try { await WalletService.debit(tx.from_wallet_id, tx.amount, { description: `Payment ${tx.reference}`, reference: tx.reference, transaction_id: tx.id, institution_id }); } catch {} }
    await base44.entities.PaymentAttempt.update(attempt_id, { status: "captured" });
    const receipt_no = "RCP" + tx.reference.slice(-6);
    await base44.entities.FinancialTransaction.update(tx.id, { status: "completed", receipt_no });
    audit("Payment captured", tx.reference, `${tx.amount} ${tx.currency} captured via ${prov.name} · receipt ${receipt_no}`);
    return { ...res, receipt_no };
  },
  async cancel(attempt_id) {
    const a = await base44.entities.PaymentAttempt.get(attempt_id);
    await base44.entities.PaymentAttempt.update(attempt_id, { status: "cancelled" });
    if (a.transaction_id) await base44.entities.FinancialTransaction.update(a.transaction_id, { status: "cancelled" });
    audit("Payment cancelled", attempt_id, `Attempt ${attempt_id} cancelled`);
  },
  async refund(transaction_id, { amount, reason, institution_id }) {
    const tx = await base44.entities.FinancialTransaction.get(transaction_id);
    const rr = await base44.entities.RefundRequest.create({ transaction_id, amount: amount || tx.amount, status: "pending", reason: reason || "", approved_by: "", institution_id });
    audit("Refund requested", tx.reference, `Refund request for ${amount || tx.amount}`);
    return rr;
  },
};

/** RefundService — approval workflow + disbursement via provider. */
export const RefundService = {
  async list(institution_id) { return base44.entities.RefundRequest.filter({ institution_id }, "-created_date", 200); },
  async approve(id, approver) { await base44.entities.RefundRequest.update(id, { status: "approved", approved_by: approver }); audit("Refund approved", id, `Approved by ${approver}`); return base44.entities.RefundRequest.get(id); },
  async reject(id, approver) { await base44.entities.RefundRequest.update(id, { status: "rejected", approved_by: approver }); audit("Refund rejected", id, `Rejected by ${approver}`); return base44.entities.RefundRequest.get(id); },
  async disburse(id, institution_id) {
    const rr = await base44.entities.RefundRequest.get(id);
    if (rr.status !== "approved") throw new Error("Refund must be approved first");
    const tx = await base44.entities.FinancialTransaction.get(rr.transaction_id);
    const prov = PaymentProvider.get();
    const res = await prov.refund(tx.reference, rr.amount);
    // reverse the original ledger
    if (tx.to_wallet_id) { try { await WalletService.debit(tx.to_wallet_id, rr.amount, { description: `Refund ${tx.reference}`, reference: "RFD" + Date.now(), transaction_id: tx.id, institution_id }); } catch {} }
    if (tx.from_wallet_id) { try { await WalletService.credit(tx.from_wallet_id, rr.amount, { description: `Refund ${tx.reference}`, reference: "RFD" + Date.now(), transaction_id: tx.id, institution_id }); } catch {} }
    await base44.entities.RefundRequest.update(id, { status: "completed" });
    audit("Refund completed", tx.reference, `${rr.amount} disbursed via ${prov.label}`);
    return res;
  },
};
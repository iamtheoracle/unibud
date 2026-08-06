import { LayoutDashboard, Wallet, ArrowLeftRight, Receipt, Award, RotateCcw, FileBarChart, Settings } from "lucide-react";

export const FINANCE_MODULES = [
  { id: "dashboard", label: "Dashboard", group: "Overview", icon: LayoutDashboard, desc: "Total revenue, daily revenue, pending/failed payments, refund requests, wallet balances, outstanding fees and revenue trends." },
  { id: "reports", label: "Reporting", group: "Overview", icon: FileBarChart, desc: "Revenue, payment, wallet, refund, outstanding fees and scholarship reports — PDF, Excel, CSV." },
  { id: "wallets", label: "Wallets", group: "Money", icon: Wallet, desc: "Student, institution, staff, department and scholarship wallets — balance, available balance, ledger, status and currency." },
  { id: "transactions", label: "Transactions", group: "Money", icon: ArrowLeftRight, desc: "Transaction engine — deposits, tuition, fees, refunds, transfers. Receipts, ledger entries, audit records and timeline." },
  { id: "fees", label: "Fee Management", group: "Fees & Awards", icon: Receipt, desc: "Fee categories, session pricing, department pricing, installments, discounts, waivers and late fees." },
  { id: "scholarships", label: "Scholarships", group: "Fees & Awards", icon: Award, desc: "Providers, beneficiaries, awards, disbursement tracking and balance monitoring." },
  { id: "refunds", label: "Refunds", group: "Fees & Awards", icon: RotateCcw, desc: "Refund requests, approval workflow, history, status and audit trail." },
  { id: "settings", label: "Platform", group: "Platform", icon: Settings, desc: "Payment providers, virtual cards and KYC compliance — provider interfaces only, no live APIs." },
];

export const moduleById = (id) => FINANCE_MODULES.find((m) => m.id === id);
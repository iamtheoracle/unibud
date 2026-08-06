/**
 * Banking Capability Platform Specification
 *
 * Directive 6 (refined): The Bank is not defined by products first.
 * It is defined by core capabilities. Products (Wallet, Cards, Savings)
 * are built on those capabilities.
 *
 * This is an implementation document — it changes as the financial platform evolves.
 */

// ─── Core Banking Capabilities ───────────────────────────────────────────
// Every banking product is built from these reusable capabilities.
export const BANKING_CAPABILITIES = [
  {
    id: "ledger",
    label: "Ledger",
    description: "Immutable double-entry ledger — the foundation of all financial records",
    ownedBy: "oracle",
    criticality: "critical",
  },
  {
    id: "accounts",
    label: "Accounts",
    description: "Account management — student, institution, and merchant accounts",
    ownedBy: "oracle",
    criticality: "critical",
  },
  {
    id: "identity",
    label: "Identity (KYC)",
    description: "Know Your Customer — identity verification and compliance",
    ownedBy: "sentinel",
    criticality: "critical",
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Regulatory compliance, AML, and reporting",
    ownedBy: "sentinel",
    criticality: "critical",
  },
  {
    id: "transactions",
    label: "Transactions",
    description: "Transaction processing, history, and reconciliation",
    ownedBy: "forge",
    criticality: "critical",
  },
  {
    id: "settlement",
    label: "Settlement",
    description: "Fund settlement between accounts and external parties",
    ownedBy: "forge",
    criticality: "critical",
  },
  {
    id: "cards",
    label: "Cards",
    description: "Virtual and physical card issuance, management, and controls",
    ownedBy: "forge",
    criticality: "high",
  },
  {
    id: "rewards",
    label: "Rewards",
    description: "Reward points, cashback, and loyalty programs",
    ownedBy: "spark",
    criticality: "medium",
  },
  {
    id: "fx",
    label: "Foreign Exchange",
    description: "Multi-currency support and exchange rate management",
    ownedBy: "forge",
    criticality: "high",
  },
  {
    id: "risk",
    label: "Risk Management",
    description: "Risk scoring, exposure limits, and portfolio monitoring",
    ownedBy: "sentinel",
    criticality: "critical",
  },
  {
    id: "fraud",
    label: "Fraud Detection",
    description: "Real-time fraud detection and prevention",
    ownedBy: "sentinel",
    criticality: "critical",
  },
  {
    id: "limits",
    label: "Limits & Controls",
    description: "Transaction limits, spending controls, and configurable guardrails",
    ownedBy: "sentinel",
    criticality: "high",
  },
  {
    id: "statements",
    label: "Statements",
    description: "Account statements, transaction reports, and financial documents",
    ownedBy: "atlas",
    criticality: "medium",
  },
];

// ─── Banking Products (built on capabilities) ────────────────────────────
// Each product is a composition of core capabilities — not a standalone system.
export const BANKING_PRODUCTS = [
  {
    id: "wallet",
    label: "Wallet",
    description: "Premium digital wallet — the primary financial interface for users",
    capabilities: ["ledger", "accounts", "transactions", "rewards", "limits", "statements"],
    identity: "premium financial interface",
    ownedBy: "oracle",
  },
  {
    id: "student_accounts",
    label: "Student Accounts",
    description: "Banking accounts tailored for students",
    capabilities: ["ledger", "accounts", "identity", "transactions", "limits", "statements", "rewards"],
    identity: "student-friendly, growth-oriented",
    ownedBy: "oracle",
  },
  {
    id: "institution_accounts",
    label: "Institution Accounts",
    description: "Banking accounts for universities and institutions",
    capabilities: ["ledger", "accounts", "identity", "compliance", "transactions", "settlement", "statements", "risk"],
    identity: "institutional, compliance-focused",
    ownedBy: "oracle",
  },
  {
    id: "merchant_accounts",
    label: "Merchant Accounts",
    description: "Banking accounts for marketplace merchants and businesses",
    capabilities: ["ledger", "accounts", "identity", "transactions", "settlement", "statements", "risk", "fraud"],
    identity: "business-focused, analytics-driven",
    ownedBy: "oracle",
  },
  {
    id: "transfers",
    label: "Transfers",
    description: "P2P, institution, and external transfers",
    capabilities: ["ledger", "accounts", "transactions", "settlement", "fx", "fraud", "limits"],
    identity: "fast, secure, simple",
    ownedBy: "forge",
  },
  {
    id: "savings",
    label: "Savings",
    description: "Goal-based savings, interest accrual, and automated savings",
    capabilities: ["ledger", "accounts", "transactions", "rewards", "statements"],
    identity: "growth-focused, motivating",
    ownedBy: "spark",
  },
  {
    id: "cards",
    label: "Cards",
    description: "Virtual and physical card management",
    capabilities: ["cards", "ledger", "accounts", "transactions", "limits", "fraud"],
    identity: "premium, cardholder-focused",
    ownedBy: "forge",
  },
  {
    id: "qr_payments",
    label: "QR Payments",
    description: "Scan-to-pay for campus commerce and merchant transactions",
    capabilities: ["ledger", "accounts", "transactions", "fraud", "limits"],
    identity: "instant, frictionless",
    ownedBy: "forge",
  },
  {
    id: "tuition_payments",
    label: "Tuition Payments",
    description: "Tuition fee payment, installments, and schedules",
    capabilities: ["ledger", "accounts", "transactions", "settlement", "compliance", "statements"],
    identity: "structured, institutional",
    ownedBy: "oracle",
  },
  {
    id: "marketplace_escrow",
    label: "Marketplace Escrow",
    description: "Fund holding for marketplace transactions until delivery",
    capabilities: ["ledger", "accounts", "transactions", "settlement", "fraud", "risk", "limits"],
    identity: "trust-focused, transparent",
    ownedBy: "sentinel",
  },
  {
    id: "financial_analytics",
    label: "Financial Analytics",
    description: "Spending insights, financial health, and recommendations",
    capabilities: ["ledger", "transactions", "statements"],
    identity: "data-rich, advisory",
    ownedBy: "pulse",
  },
  {
    id: "rewards",
    label: "Rewards Program",
    description: "Cashback, points, and financial rewards",
    capabilities: ["rewards", "ledger", "accounts"],
    identity: "gamified, engaging",
    ownedBy: "spark",
  },
  {
    id: "refunds",
    label: "Refunds",
    description: "Refund processing and dispute resolution payouts",
    capabilities: ["ledger", "accounts", "transactions", "settlement", "compliance"],
    identity: "fair, transparent",
    ownedBy: "sentinel",
  },
];

// ─── Engineering Gates for Banking ───────────────────────────────────────
export const BANKING_ENGINEERING_PLAN = {
  phase1: {
    name: "Core Capability Platform",
    gates: ["Discovery", "Architecture", "Design", "Implementation", "Testing", "Security Review", "Performance Review", "Documentation", "Deployment", "Monitoring"],
    deliverable: "Core banking capabilities as independent, tested modules",
    owner: "forge",
    securedBy: "sentinel",
    note: "Every capability must pass Sentinel's security review — no shortcuts on financial systems",
  },
  phase2: {
    name: "Product Composition Layer",
    gates: ["Discovery", "Architecture", "Design", "Implementation", "Testing", "Security Review", "Accessibility Review", "Documentation", "Deployment", "Monitoring"],
    deliverable: "Banking products composed from core capabilities",
    owner: "orbit",
    securedBy: "sentinel",
  },
  phase3: {
    name: "Financial Intelligence & Analytics",
    gates: ["Architecture", "Implementation", "Testing", "Documentation", "Monitoring"],
    deliverable: "Financial analytics, spending insights, and financial health scoring",
    owner: "pulse",
  },
  phase4: {
    name: "Compliance & Audit Hardening",
    gates: ["Security Review", "Performance Review", "Documentation", "Monitoring"],
    deliverable: "Full regulatory compliance, AML, audit trail, and risk management",
    owner: "sentinel",
  },
};

// ─── Banking Product Identity ────────────────────────────────────────────
export const BANKING_IDENTITY = {
  rule: "The Bank must have a premium financial interface — distinct from every other UNIBUD product.",
  requirements: [
    "Its own navigation (financial-first, not social)",
    "Its own interactions (precise, transactional, trustworthy)",
    "Its own colors (premium, authoritative, financial)",
    "Its own motion (measured, confident, never playful)",
    "Its own typography (tabular numbers, financial hierarchy)",
    "Its own empty states (guide toward financial actions)",
    "Its own dashboards (spending insights, account health)",
  ],
  designPrinciple: "Every interaction must inspire trust. This is money.",
};
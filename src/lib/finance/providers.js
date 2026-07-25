// ─────────────────────────────────────────────────────────────
// Provider Interface — every external financial provider implements
// this contract. The application calls PaymentProvider.get() and
// never a specific provider directly, so providers are replaceable
// without touching business logic.
//
// Future providers: OnePipe, Strowallet, Dojah, 9PSB, Flutterwave,
// Paystack, Kora. Register them in PROVIDERS with an `impl` that
// satisfies this interface.
// ─────────────────────────────────────────────────────────────

const MOCK_PROVIDER = {
  key: "mock",
  label: "Mock Provider",
  async pay(ctx) { return { status: "verified", reference: "MOCK_" + Date.now(), message: "Mock verification successful" }; },
  async verify(reference) { return { status: "verified", verified: true, reference }; },
  async capture(reference) { return { status: "captured", reference }; },
  async refund(reference, amount) { return { status: "refunded", reference: "MOCKR_" + Date.now() }; },
  async transfer({ to, amount, note }) { return { status: "completed", reference: "MOCKT_" + Date.now() }; },
  async createVirtualAccount(owner) { return { account_number: "9PSB" + Math.floor(10000000 + Math.random() * 80000000).toString(), bank_name: "Mock Bank", status: "active" }; },
  async issueCard(walletId) { return { masked_number: "5399 88** **** " + Math.floor(1000 + Math.random() * 8999), status: "active" }; },
  async verifyKYC(owner) { return { status: "verified", level: "tier1" }; },
};

export const PROVIDERS = [
  { key: "mock", label: "Mock Provider", description: "Built-in mock adapter — no live API calls. Swap for OnePipe, Strowallet, Dojah, 9PSB, Flutterwave, Paystack or Koro without changing business logic.", active: true, impl: MOCK_PROVIDER },
  // { key: "onepipe", label: "OnePipe", description: "Nigerian payments aggregation", active: false, impl: ONEPIPE_PROVIDER },
  // { key: "strowallet", label: "Strowallet", description: "Virtual accounts & cards", active: false, impl: STROWALLET_PROVIDER },
  // { key: "paystack", label: "Paystack", description: "Card & bank payments", active: false, impl: PAYSTACK_PROVIDER },
  // { key: "flutterwave", label: "Flutterwave", description: "Payments & transfers", active: false, impl: FLUTTERWAVE_PROVIDER },
];

let active = MOCK_PROVIDER;

export const PaymentProvider = {
  /** Returns the active provider implementation. */
  get() { return active; },
  /** Switch the active provider by key (once a real impl is registered). */
  set(key) { const p = PROVIDERS.find((x) => x.key === key); if (p && p.impl) active = p.impl; },
  /** List available providers (UI metadata only — impls are not exposed). */
  list() { return PROVIDERS.map(({ impl, ...rest }) => rest); },
};
// Provider Adapters — mock/sandbox implementations of the service interfaces.
// Each adapter satisfies its group's contract. Real provider calls will be
// routed through backend functions (server-side) when secrets are configured;
// until then adapters return deterministic mock data. Adding a real provider
// = implement one adapter object and register it here — no business logic changes.


const lat = () => 20 + Math.floor(Math.random() * 90);
const ref = (p) => `${p}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

const banking = (id, name, version, bankName = "Mock Bank") => ({
  id, name, group: "banking", version,
  capabilities: ["virtual_accounts", "transfers", "balance", "beneficiaries", "verification"],
  health: async () => ({ ok: true, latency: lat(), message: `${name} reachable (mock)` }),
  pay: async () => ({ status: "verified", reference: ref("PAY"), message: `${name} mock pay` }),
  verify: async (r) => ({ verified: true, status: "verified", reference: r }),
  capture: async (r) => ({ status: "captured", reference: r }),
  refund: async (r, a) => ({ status: "refunded", reference: ref("RFD") }),
  transfer: async () => ({ status: "completed", reference: ref("TRF") }),
  createVirtualAccount: async () => ({ account_number: "9PSB" + Math.floor(1e7 + Math.random() * 8e7).toString(), bank_name: bankName, status: "active" }),
  verifyAccount: async (n) => ({ verified: true, account_number: n, name: "Mock Account" }),
  balance: async () => ({ balance: 0, currency: "NGN" }),
});

const kyc = (id, name, version) => ({
  id, name, group: "kyc", version,
  capabilities: ["nin", "bvn", "face_match", "liveness", "document", "aml", "compliance"],
  health: async () => ({ ok: true, latency: lat(), message: `${name} reachable (mock)` }),
  verifyKYC: async () => ({ status: "verified", level: "tier1" }),
  verifyNIN: async () => ({ verified: true, name: "Verified Citizen" }),
  verifyBVN: async () => ({ verified: true, name: "Verified Account" }),
  faceMatch: async () => ({ matched: true, score: 98 }),
  liveness: async () => ({ live: true, score: 99 }),
  verifyDocument: async () => ({ verified: true }),
  aml: async () => ({ clear: true }),
  compliance: async () => ({ status: "compliant", level: "tier1" }),
});

const walletCard = (id, name, version) => ({
  id, name, group: "wallet_card", version,
  capabilities: ["wallet_creation", "virtual_accounts", "virtual_cards", "physical_cards", "transfers", "card_controls"],
  health: async () => ({ ok: true, latency: lat(), message: `${name} reachable (mock)` }),
  createWallet: async () => ({ wallet_id: ref("WAL") }),
  createVirtualAccount: async () => ({ account_number: "9PSB" + Math.floor(1e7 + Math.random() * 8e7).toString(), bank_name: "Mock Bank" }),
  issueCard: async () => ({ masked_number: "5399 88** **** " + Math.floor(1000 + Math.random() * 8999), status: "active" }),
  issuePhysical: async () => ({ masked_number: "5399 88** **** " + Math.floor(1000 + Math.random() * 8999), status: "active" }),
  transfer: async () => ({ status: "completed", reference: ref("TRF") }),
  freezeCard: async () => ({ status: "frozen" }),
  unfreezeCard: async () => ({ status: "active" }),
});

const notification = (id, name, version, channels = ["email"]) => ({
  id, name, group: "notification", version, channels, capabilities: channels,
  health: async () => ({ ok: true, latency: lat(), message: `${name} reachable (mock)` }),
  sendEmail: async () => ({ messageId: ref("MSG"), status: "sent", channel: "email" }),
  sendSMS: async () => ({ messageId: ref("MSG"), status: "sent", channel: "sms" }),
  sendPush: async () => ({ messageId: ref("MSG"), status: "sent", channel: "push" }),
});

const storage = (id, name, version) => ({
  id, name, group: "storage", version,
  capabilities: ["upload", "signed_urls", "delete"],
  health: async () => ({ ok: true, latency: lat(), message: `${name} reachable (mock)` }),
  upload: async ({ key }) => ({ url: `https://cdn.mock/${key || ref("file")}` }),
  getSignedUrl: async (key) => ({ url: `https://cdn.mock/${key}?sig=mock` }),
  delete: async () => ({ deleted: true }),
});

const ai = (id, name, version, models = []) => ({
  id, name, group: "ai", version, capabilities: ["chat"],
  health: async () => ({ ok: true, latency: lat(), message: `${name} reachable (mock)` }),
  invoke: async ({ prompt, model }) => ({ content: `${name} mock response`, model: model || models[0]?.id, tokens: 128 }),
  models: async () => models,
});

export const ADAPTERS = [
  banking("mock_banking", "Mock Banking", "1.0.0"),
  banking("onepipe", "OnePipe", "1.0.0", "OnePipe"),
  banking("kora", "Kora", "1.0.0", "Kora"),
  banking("flutterwave", "Flutterwave", "1.0.0", "Flutterwave"),
  banking("paystack", "Paystack", "1.0.0", "Paystack"),
  kyc("mock_kyc", "Mock KYC", "1.0.0"),
  kyc("dojah", "Dojah", "1.0.0"),
  kyc("smile_id", "Smile ID", "1.0.0"),
  kyc("verifyme", "VerifyMe", "1.0.0"),
  walletCard("mock_wallet", "Mock Wallet & Card", "1.0.0"),
  walletCard("strowallet", "Strowallet", "1.0.0"),
  notification("mock_notification", "Mock Notification", "1.0.0", ["email", "sms", "push"]),
  notification("smtp", "SMTP", "1.0.0", ["email"]),
  notification("resend", "Resend", "1.0.0", ["email"]),
  notification("sendgrid", "SendGrid", "1.0.0", ["email"]),
  notification("termii", "Termii", "1.0.0", ["sms"]),
  notification("twilio", "Twilio", "1.0.0", ["sms"]),
  notification("fcm", "Firebase Cloud Messaging", "1.0.0", ["push"]),
  storage("mock_storage", "Mock Storage", "1.0.0"),
  storage("cloudinary", "Cloudinary", "1.0.0"),
  storage("s3", "AWS S3", "1.0.0"),
  storage("supabase", "Supabase Storage", "1.0.0"),
  ai("mock_ai", "Mock AI", "1.0.0", [{ id: "mock-1", label: "Mock Model" }]),
  ai("openai", "OpenAI", "1.0.0", [{ id: "gpt-4o-mini", label: "GPT-4o mini" }, { id: "gpt-4o", label: "GPT-4o" }]),
  ai("gemini", "Google Gemini", "1.0.0", [{ id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" }, { id: "gemini-3-pro", label: "Gemini 3 Pro" }]),
  ai("anthropic", "Anthropic", "1.0.0", [{ id: "claude-sonnet", label: "Claude Sonnet" }]),
  ai("local", "Local Model", "1.0.0", [{ id: "local-llama", label: "Local Llama" }]),
];

export const DEFAULTS = { banking: "mock_banking", kyc: "mock_kyc", wallet_card: "mock_wallet", notification: "mock_notification", storage: "mock_storage", ai: "mock_ai" };
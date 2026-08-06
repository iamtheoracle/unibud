// Provider Service Interfaces — the contracts every adapter implements.
// Business modules call these interfaces (via the registry) and NEVER
// a provider SDK directly. Adapters are swappable without code changes.
export const INTERFACES = {
  banking: { methods: ["pay", "verify", "capture", "refund", "transfer", "createVirtualAccount", "verifyAccount", "balance"], capabilities: ["virtual_accounts", "transfers", "balance", "beneficiaries", "verification"] },
  kyc: { methods: ["verifyKYC", "verifyNIN", "verifyBVN", "faceMatch", "liveness", "verifyDocument", "aml", "compliance"], capabilities: ["nin", "bvn", "face_match", "liveness", "document", "aml", "compliance"] },
  wallet_card: { methods: ["createWallet", "createVirtualAccount", "issueCard", "issuePhysical", "transfer", "freezeCard", "unfreezeCard"], capabilities: ["wallet_creation", "virtual_accounts", "virtual_cards", "physical_cards", "transfers", "card_controls"] },
  notification: { methods: ["sendEmail", "sendSMS", "sendPush"], capabilities: ["email", "sms", "push"] },
  storage: { methods: ["upload", "getSignedUrl", "delete"], capabilities: ["upload", "signed_urls", "delete"] },
  ai: { methods: ["invoke", "models"], capabilities: ["chat", "vision", "web"] },
};
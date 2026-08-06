export const SECRET_MAP = {
  paystack: "PAYSTACK_SECRET_KEY", flutterwave: "FLUTTERWAVE_SECRET_KEY", onepipe: "ONEPIPE_API_KEY", kora: "KORA_SECRET_KEY",
  dojah: "DOJAH_API_KEY", smile_id: "SMILE_ID_API_KEY", verifyme: "VERIFYME_API_KEY", strowallet: "STROWALLET_API_KEY",
  resend: "RESEND_API_KEY", sendgrid: "SENDGRID_API_KEY", smtp: "SMTP_PASSWORD", termii: "TERMII_API_KEY",
  twilio: "TWILIO_AUTH_TOKEN", fcm: "FCM_SERVER_KEY", cloudinary: "CLOUDINARY_API_KEY", s3: "AWS_ACCESS_KEY_ID",
  supabase: "SUPABASE_SERVICE_KEY", openai: "OPENAI_API_KEY", gemini: "GEMINI_API_KEY", anthropic: "ANTHROPIC_API_KEY",
};
export const secretFor = (key) => SECRET_MAP[key] || `${key.toUpperCase()}_API_KEY`;
export const GROUP_LABELS = { banking: "Banking & Payments", kyc: "Identity & KYC", wallet_card: "Wallet & Cards", notification: "Notifications", storage: "Storage", ai: "AI Engines" };
export const GROUP_ORDER = ["banking", "kyc", "wallet_card", "notification", "storage", "ai"];
export const nowIso = () => new Date().toISOString();
export const ago = (iso) => { if (!iso) return "—"; const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`; };
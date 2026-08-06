import type { SecurityCheckResult, SecurityService } from "./interface";

const SUSPICIOUS_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: "possible script injection", regex: /<script[\s>]/i },
  {
    label: "possible SQL injection",
    regex: /(\bunion\b.*\bselect\b|;\s*drop\s+table)/i,
  },
  {
    label: "urgent wire-transfer scam language",
    regex: /wire (transfer|money) immediately/i,
  },
  {
    label: "credential phishing language",
    regex: /verify your (password|account) (now|immediately)/i,
  },
];

/** Local heuristic security scanner. No network calls, no ML model. */
export class LocalSecurityService implements SecurityService {
  checkInput(text: string): SecurityCheckResult {
    const reasons = SUSPICIOUS_PATTERNS.filter((p) => p.regex.test(text)).map(
      (p) => p.label
    );
    return { safe: reasons.length === 0, reasons };
  }
}

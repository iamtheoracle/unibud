import type { PiiFinding, PrivacyService } from "./interface";

const PATTERNS: Array<{ type: PiiFinding["type"]; regex: RegExp }> = [
  { type: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: "phone", regex: /\+?\d[\d\s().-]{7,}\d/g },
  { type: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: "credit_card", regex: /\b(?:\d[ -]*?){13,16}\b/g },
];

/** Local, regex-based PII detection and redaction. No network calls. */
export class LocalPrivacyService implements PrivacyService {
  scanForPii(text: string): PiiFinding[] {
    const findings: PiiFinding[] = [];
    for (const { type, regex } of PATTERNS) {
      let match: RegExpExecArray | null;
      const re = new RegExp(regex);
      while ((match = re.exec(text)) !== null) {
        findings.push({ type, match: match[0], index: match.index });
        if (!re.global) break;
      }
    }
    return findings;
  }

  redact(text: string): string {
    let redacted = text;
    for (const { regex } of PATTERNS) {
      redacted = redacted.replace(new RegExp(regex), "[REDACTED]");
    }
    return redacted;
  }
}

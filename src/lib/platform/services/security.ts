/**
 * Platform Services — Security Service Interface
 *
 * The Security Service validates inputs, detects threats, manages
 * authentication state, and enforces platform security policies.
 *
 * Promoted from Spark's internal security service.
 * Underlying implementation: src/lib/spark/trust/security/
 */

export interface SecurityCheckResult {
  safe: boolean;
  reasons: string[];
}

export interface ThreatSignal {
  type: "injection" | "scam" | "phishing" | "bruteforce" | "spam_bot" | "unknown";
  confidence: number;
  detail?: string;
}

export interface SecurityService {
  /** Heuristic check on user-supplied input (messages, form fields) */
  checkInput(text: string): SecurityCheckResult;

  /** Detect threat signals from a request context */
  detectThreats(context: {
    ip?: string;
    userAgent?: string;
    userId?: string;
    action?: string;
  }): ThreatSignal[];

  /** Verify that a token (session, API key) is valid */
  verifyToken(token: string): { valid: boolean; reason?: string };
}

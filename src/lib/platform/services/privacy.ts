/**
 * Platform Services — Privacy Service Interface
 *
 * The Privacy Service scans for PII, enforces data minimisation,
 * and respects student privacy settings across all platform surfaces.
 *
 * Promoted from Spark's internal privacy service.
 * Underlying implementation: src/lib/spark/trust/privacy/
 */

export type PiiType = "email" | "phone" | "ssn" | "credit_card" | "id_number" | "address";

export interface PiiFinding {
  type: PiiType;
  match: string;
  index: number;
}

export interface PrivacyService {
  /** Scan text for PII and return findings */
  scanForPii(text: string): PiiFinding[];

  /** Redact detected PII from text */
  redact(text: string): string;

  /**
   * Check whether a student has consented to a specific data use.
   * Returns true when consent exists and has not been revoked.
   */
  hasConsent(userId: string, purpose: string): boolean;
}

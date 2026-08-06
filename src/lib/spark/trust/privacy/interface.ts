export interface PiiFinding {
  type: "email" | "phone" | "ssn" | "credit_card";
  match: string;
  index: number;
}

export interface PrivacyService {
  scanForPii(text: string): PiiFinding[];
  redact(text: string): string;
}

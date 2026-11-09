import "server-only";

import type { VerificationDelivery, VerificationPurpose, VerificationChannel } from "./verification-core";

export class HttpVerificationDelivery implements VerificationDelivery {
  private readonly endpoint: URL;
  private readonly token: string;

  constructor(endpoint: string, token: string) {
    const parsed = new URL(endpoint);
    if (!["https:","http:"].includes(parsed.protocol) || !parsed.hostname ||
        parsed.username || parsed.password) {
      throw new Error("Verification delivery endpoint must be a valid HTTP(S) URL without embedded credentials.");
    }
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      throw new Error("Production verification delivery requires HTTPS.");
    }
    if (!token || token.length < 32) {
      throw new Error("Verification delivery gateway token must contain at least 32 characters.");
    }
    this.endpoint = parsed;
    this.token = token;
  }

  static fromEnvironment(): HttpVerificationDelivery {
    const endpoint = process.env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim() ?? "";
    const token = process.env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim() ?? "";
    if (!endpoint || !token) {
      throw new Error("Verification delivery gateway is not configured.");
    }
    return new HttpVerificationDelivery(endpoint,token);
  }

  async deliver(input: {
    challengeId: string;
    channel: VerificationChannel;
    destination: string;
    code: string;
    purpose: VerificationPurpose;
    expiresAt: string;
  }): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      // Never include provider response bodies, destinations or codes in errors/logs.
      throw new Error("Verification delivery gateway rejected the request.");
    }
  }
}
